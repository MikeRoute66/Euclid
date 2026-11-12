"""Exercise the deployed backend with disposable accounts; never print credentials."""
import json,re,secrets,time,urllib.request,urllib.error
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor

root=Path(__file__).resolve().parents[1]
config=(root/'online-config.js').read_text(encoding='utf-8')
base=re.search(r'"url": "([^"]+)"',config).group(1)
key=re.search(r'"publishableKey": "([^"]+)"',config).group(1)
version=re.search(r'courseVersion: "([^"]+)"',config).group(1)
fixtures=json.loads((root/'.browser-check-release/ranked-fixtures.json').read_text(encoding='utf-8'))['fixtures']
results=[]
def call(body,token=None,path='/functions/v1/euclid-online',method='POST'):
    headers={'apikey':key,'Content-Type':'application/json','Origin':'https://mikeroute66.github.io'}
    if token:headers['Authorization']='Bearer '+token
    request=urllib.request.Request(base+path,data=json.dumps(body).encode() if body is not None else None,headers=headers,method=method)
    try:
        with urllib.request.urlopen(request,timeout=45) as response:return response.status,json.load(response)
    except urllib.error.HTTPError as error:return error.code,json.loads(error.read())
def check(ok,text):
    print(('PASS ' if ok else 'FAIL ')+text,flush=True);results.append(bool(ok))
    if not ok:raise AssertionError(text)
def start(stage,token):
    status,data=call({'action':'start','proposition':stage,'courseVersion':version},token)
    check(status==200,'Server starts a fresh '+stage+' attempt')
    return data
def finish(attempt,events,token):
    status,data=call({'action':'finish','attempt':attempt['id'],'events':events,'elapsedMs':1,'cursor':99999},token)
    loops=0
    while status==200 and data.get('pending'):
        loops+=1
        if loops>110:raise AssertionError('Validation did not finish')
        status,data=call({'action':'finish','attempt':attempt['id']},token)
    if status!=200: print('Submission response:',status,data,flush=True)
    check(status==200 and data.get('elapsedMs',0)>1,'Server validates the proof and ignores browser timing/checkpoints')
    return data

if '--check-other-device' in __import__('sys').argv:
    a=json.loads((root/'.browser-check-release/ranked-test-session.json').read_text(encoding='utf-8'))
    status,data=call({'refresh_token':a['session']['refresh_token']},path='/auth/v1/token?grant_type=refresh_token')
    check(status==200 and 'access_token' in data,'Signing out in the browser leaves the other device session usable')
    print('ALL CHECKS PASSED');raise SystemExit

accounts=[]
try:
    for _ in range(2):
        username='Qa_'+secrets.token_hex(5);password=secrets.token_urlsafe(24)
        status,data=call({'action':'register','username':username,'password':password})
        check(status==200 and 'session' in data,'Username/password registration succeeds')
        session=data['session'];accounts.append({'username':username,'password':password,'session':session})
    a,b=accounts;token=a['session']['access_token']
    credential_file=root/'.browser-check-release/ranked-test-session.json'
    credential_file.write_text(json.dumps(a),encoding='utf-8')
    status,_=call({'action':'login','username':a['username'],'password':'incorrect-password'})
    check(status==401,'Incorrect passwords are rejected')
    status,data=call({'action':'login','username':a['username'].lower(),'password':a['password']})
    check(status==200,'Usernames are case-insensitive at login')
    status,_=call({'action':'register','username':a['username'].upper(),'password':a['password']})
    check(status==400,'Usernames cannot be claimed again with different capitalization')
    status,_=call({'action':'start','proposition':'1.1','courseVersion':'obsolete'},token)
    check(status==409,'Obsolete course versions cannot start ranked attempts')
    first=start('1.1',token)
    status,_=call({'action':'finish','attempt':first['id'],'events':[],'completed':True,'elapsedMs':1},token)
    check(status==400,'A fabricated completion flag does not earn a score')
    status,_=call({'action':'finish','attempt':first['id'],'events':fixtures['1.1']},b['session']['access_token'])
    check(status==409,'A player cannot finish another player\'s attempt')
    status,_=call({'user_id':a['session']['user']['id'],'proposition':'1.1','course_version':version,'elapsed_ms':1},token,path='/rest/v1/best_times')
    check(status in [401,403],'Direct browser writes to leaderboard tables are denied')
    status,_=call({'p_user':a['session']['user']['id'],'p_attempt':first['id'],'p_received':'2026-01-01T00:00:00Z'},token,path='/rest/v1/rpc/finish_ranked_attempt')
    check(status in [401,403],'Browser tokens cannot invoke the privileged finish function')
    result=finish(first,fixtures['1.1'],token)
    repeated=finish(first,[],token)
    check(repeated['elapsedMs']==result['elapsedMs'],'Repeating a submission is idempotent')
    second=start('1.1',token);new=finish(second,fixtures['1.1'],token)
    check(new['bestMs']==min(result['elapsedMs'],new['elapsedMs']),'Only the player\'s fastest time is retained')
    for stage in ['1.4','1.27','1.45','2.1','2.9','2.10','2.14']:
        finish(start(stage,token),fixtures[stage],token)
    status,board=call({'action':'board','proposition':'1.1'})
    rows=[row for row in board['rows'] if row['username']==a['username']]
    check(status==200 and len(rows)==1 and rows[0]['elapsedMs']==new['bestMs'],'The shared leaderboard exposes one best time per player')
    check(all(set(row)=={'rank','username','elapsedMs'} for row in board['rows']),'Public leaderboard data contains no email or session credentials')
    print('ALL CHECKS PASSED',flush=True)
finally:
    # Browser tests can reuse the first account. A separate cleanup command removes both.
    p=root/'.browser-check-release/ranked-test-users.json'
    old=json.loads(p.read_text(encoding='utf-8')) if p.exists() else []
    p.write_text(json.dumps(list(set(old+[x['session']['user']['id'] for x in accounts]))),encoding='utf-8')
