"""Read-only smoke check of the deployed public leaderboard snapshot."""
import json,re,urllib.request
from pathlib import Path

config=(Path(__file__).resolve().parents[1]/'online-config.js').read_text(encoding='utf-8')
url=re.search(r'"url": "([^"]+)"',config).group(1)
key=re.search(r'"publishableKey": "([^"]+)"',config).group(1)
def call(body):
    request=urllib.request.Request(url+'/functions/v1/euclid-online',data=json.dumps(body).encode(),
        headers={'apikey':key,'Content-Type':'application/json','Origin':'https://mikeroute66.github.io'})
    with urllib.request.urlopen(request,timeout=45) as response:return json.load(response)

snapshot=call({'action':'boards'})
assert set(snapshot)=={'courseVersion','boards'}
keys=[b['proposition'] for b in snapshot['boards']]
assert keys==sorted(set(keys),key=lambda s:tuple(map(int,s.split('.'))))
for board in snapshot['boards']:
    assert set(board)=={'proposition','rows'} and 0<len(board['rows'])<=100
    for i,row in enumerate(board['rows']):
        assert set(row)=={'rank','username','elapsedMs'} and row['rank']==i+1 and row['elapsedMs']>0
    assert board['rows']==call({'action':'board','proposition':board['proposition']})['rows']
print('PASS Public snapshot returns only populated boards in proposition order with public score fields')
print('PASS Populated boards agree with individual leaderboard responses ('+str(len(keys))+' boards)')
print('ALL CHECKS PASSED')
