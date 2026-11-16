"""Run the proof-entry/reload regression in Firefox on Windows, using Marionette.

Uses Firefox's built-in automation protocol and Python's standard library.
An isolated profile keeps normal browser settings and saves untouched.
"""
import argparse
import http.server
import json
import os
from pathlib import Path
import re
import shutil
import socket
import subprocess
import threading
import time
import uuid

root = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--suite',choices=['entry','ranked','leaderboard','tutorial','semicircle','book3','book3manual','book3view','learningtools'],default='entry')
parser.add_argument('--lesson',type=int,choices=range(1,8),default=1)
parser.add_argument('--width',type=int,default=900)
parser.add_argument('--height',type=int,default=600)
options = parser.parse_args()
candidates = [Path(os.environ.get(name, 'C:/Program Files'))/'Mozilla Firefox/firefox.exe'
              for name in ['ProgramFiles', 'ProgramFiles(x86)']]
firefox = next((p for p in candidates if p.is_file()), None)
if not firefox:
    package = subprocess.run(['powershell', '-NoProfile', '-Command',
                              '(Get-AppxPackage Mozilla.Firefox).InstallLocation'],
                             capture_output=True, text=True, timeout=20).stdout.strip()
    firefox = Path(package)/'VFS/ProgramFiles/Firefox Package Root/firefox.exe'
if not firefox.is_file():
    raise SystemExit('Firefox was not found. Install Firefox before running this check.')

identifier = uuid.uuid4().hex
profile = root/('.browser-check-firefox-'+identifier)
page = root/('.qa-firefox-'+identifier+'.html')
artifacts = root/'.browser-check-release'
artifacts.mkdir(exist_ok=True)
profile.mkdir()
with socket.socket() as reserve:
    reserve.bind(('127.0.0.1', 0))
    port = reserve.getsockname()[1]
(profile/'user.js').write_text('user_pref("marionette.port",'+str(port)+');\n'
                              'user_pref("browser.shell.checkDefaultBrowser",false);')
capture = '<script>window.PROOF_ENTRY_ERRORS=[];addEventListener("error",e=>PROOF_ENTRY_ERRORS.push(e.error?.stack||e.message));</script>'
source = (root/'index.html').read_text(encoding='utf-8')
if options.suite=='ranked':
    account=json.loads((artifacts/'ranked-test-session.json').read_text(encoding='utf-8'))
    capture+='<script>window.RANK_TEST_ACCOUNT='+json.dumps({'username':account['username'],'password':account['password']})+';</script>'
    tests='<script src="tests/ranked-browser-tests.js"></script>'
elif options.suite=='leaderboard':
    tests='<script src="tests/leaderboard-browser-tests.js"></script>'
elif options.suite=='tutorial':
    tests='<script src="tests/tutorial-browser-tests.js"></script>'
elif options.suite=='semicircle':
    tests='<script src="tests/semicircle-browser-tests.js"></script>'
elif options.suite=='book3':
    tests='<script src="tests/book3-browser-tests.js"></script>'
elif options.suite=='book3manual':
    capture+='<script>window.MANUAL_BOOK3='+str(options.lesson)+';</script>'
    tests='<script src="tests/book3-manual-tests.js"></script>'
elif options.suite=='book3view':
    tests='<script>addEventListener("load",()=>{document.querySelector("#continue-menu").click();const node=document.createElement("pre");node.hidden=true;node.id="qa-result";node.textContent="ALL CHECKS PASSED";document.body.append(node)});</script>'
elif options.suite=='learningtools':
    tests='<script src="tests/learning-tool-preview-tests.js"></script>'
else:
    tests='<script src="tests/tool-name-tests.js"></script><script src="tests/mobile-layout-tests.js"></script><script src="tests/feedback-tests.js"></script><script src="tests/proof-entry-tests.js"></script>'
page.write_text(source.replace('<head>','<head>'+capture).replace('</body>',tests+'</body>'),encoding='utf-8')

class QuietServer(http.server.ThreadingHTTPServer):
    def handle_error(self, request, client_address):
        pass  # Firefox can close speculative HTTP connections while quitting.

class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(root), **kwargs)

    def log_message(self, *args):
        pass

server = QuietServer(('127.0.0.1', 0), QuietHandler)
threading.Thread(target=server.serve_forever, daemon=True).start()
log = (artifacts/'firefox-entry-browser.log').open('w')
process = subprocess.Popen([str(firefox), '--headless', '--no-remote', '--marionette',
                            '--profile', str(profile)], stdout=log, stderr=log,
                           creationflags=subprocess.CREATE_NO_WINDOW)
connection = None
buffer = b''
message_id = 0

def receive():
    global buffer
    while b':' not in buffer:
        chunk = connection.recv(4096)
        if not chunk:
            raise EOFError('Firefox closed the automation connection.')
        buffer += chunk
    size, payload = buffer.split(b':', 1)
    size = int(size)
    while len(payload) < size:
        chunk = connection.recv(65536)
        if not chunk:
            raise EOFError('Firefox closed the automation connection.')
        payload += chunk
    buffer = payload[size:]
    return json.loads(payload[:size])

def command(name, args):
    global message_id
    message_id += 1
    payload = json.dumps([0, message_id, name, args]).encode()
    connection.sendall(str(len(payload)).encode()+b':'+payload)
    response = receive()
    if response[1] != message_id or response[2]:
        raise RuntimeError(str(response))
    return response[3]

def evaluate(script):
    return command('WebDriver:ExecuteScript', {
        'script': 'return window.eval(arguments[0])', 'args': [script],
        'sandbox': None, 'newSandbox': False})['value']

passed = False
try:
    for attempt in range(100):
        try:
            connection = socket.create_connection(('127.0.0.1', port), timeout=1)
            break
        except OSError:
            time.sleep(.2)
    if not connection:
        raise RuntimeError('Firefox automation did not start.')
    connection.settimeout(60)
    receive()  # Protocol greeting.
    session = command('WebDriver:NewSession', {'capabilities': {}})
    command('WebDriver:SetWindowRect', {'width': options.width, 'height': options.height})
    command('WebDriver:Navigate', {'url': 'http://127.0.0.1:'+str(server.server_port)+'/'+page.name})
    if options.suite in ['semicircle','book3manual']:
        for _ in range(100):
            if evaluate('!!window.SEMICIRCLE_QA'):break
            time.sleep(.1)
        def click_element(selector):
            element=command('WebDriver:FindElement',{'using':'css selector','value':selector})['value']
            command('WebDriver:ElementClick',{'id':element['element-6066-11e4-a52e-4f735466cecf']})
        def click_position(point):
            actions=[{'type':'pointerMove','duration':0,'x':round(point[0]),'y':round(point[1]),'origin':'viewport'},{'type':'pointerDown','button':0},{'type':'pointerUp','button':0}]
            command('WebDriver:PerformActions',{'actions':[{'type':'pointer','id':'manual-mouse','parameters':{'pointerType':'mouse'},'actions':actions}]})
        tasks=evaluate('LESSONS[index].construction')
        for step,task in enumerate(tasks):
            if task['ref']=='D18':
                evaluate("SEMICIRCLE_QA.check(/semicircle/i.test(nextHint())&&nextHint().includes('M, E, L, I'),'Guidance names the semicircle and all four manual inputs')")
                evaluate('settings.learningMode=false;render()')
                click_element('#hint')
                evaluate("SEMICIRCLE_QA.check(/semicircle/i.test($('#modalbody').textContent)&&$('#modalbody').textContent.includes('M, E, L, I'),'The normal hint button also teaches all semicircle inputs')")
                click_element('#closemodal')
                evaluate('settings.learningMode=true;render()')
            group='definitions' if task['ref'].startswith('D') else 'postulates' if task['ref'].startswith('P') else 'propositions'
            click_element('[data-tab="'+group+'"]')
            click_element('#tools [data-reference="'+task['ref']+'"]')
            if task['ref']=='D1' and not task['inputs'] and options.suite=='book3manual':
                expression="(()=>{const task="+json.dumps(task)+",d=EuclidLogic.diagram(state);let candidates=bookOneIntersections().filter(p=>task.supports.every(s=>p.supports?.includes(s)));if(task.beyond){const a=state.points[task.beyond[0]],b=state.points[task.beyond[1]],v=[b[0]-a[0],b[1]-a[1]];candidates=candidates.filter(p=>(p[0]-a[0])*v[0]+(p[1]-a[1])*v[1]>v[0]*v[0]+v[1]*v[1])}const hit=candidates.sort((a,b)=>a[1]-b[1])[0];if(!hit)throw Error('No requested circle crossing');const m=$('#canvas').getScreenCTM();return [m.a*hit[0]+m.c*hit[1]+m.e,m.b*hit[0]+m.d*hit[1]+m.f]})()"
                click_position(evaluate(expression))
            elif task['ref']=='D1' and not task['inputs']:
                point=evaluate("(()=>{const d=EuclidLogic.diagram(state),hit=bookOneIntersections().find(p=>p.supports?.includes('arc:a1')&&p.supports.includes('HI')&&p[1]<state.points.I[1]);if(!hit)throw Error('No upper arc crossing');const m=$('#canvas').getScreenCTM();return [m.a*hit[0]+m.c*hit[1]+m.e,m.b*hit[0]+m.d*hit[1]+m.f]})()")
                click_position(point)
            else:
                for name in task['inputs']:
                    point=evaluate("(()=>{const p=state.points["+json.dumps(name)+"],m=$('#canvas').getScreenCTM();return [m.a*p[0]+m.c*p[1]+m.e,m.b*p[0]+m.d*p[1]+m.f]})()")
                    click_position(point)
            evaluate('SEMICIRCLE_QA.check(constructionProgress(state,LESSONS[index]).checks['+str(step)+'], '+json.dumps('Manual construction step '+str(step+1)+': '+task['ref'])+')')
        import base64
        (artifacts/('manual-'+options.suite+'-'+str(options.lesson)+'-'+str(options.width)+'.png')).write_bytes(base64.b64decode(command('WebDriver:TakeScreenshot',{})['value']))
        if options.suite=='semicircle':evaluate("SEMICIRCLE_QA.check(EuclidCurves.valid(state)&&state.arcs.length===1&&state.arcs[0].points.includes('N'),'The manually drawn semicircle records the intersection N')")
        evaluate("SEMICIRCLE_QA.check(constructionProgress(state,LESSONS[index]).complete,'The entire construction is achievable through manual pointer input');state.lines=[...(LESSONS[index].givens||[]).map(s=>({s,j:'Given'})),...LESSONS[index].proofGuide.map(s=>({s:s.s,j:s.j}))];render();SEMICIRCLE_QA.check(state.completed&&state.lines.every(l=>l.valid),'The manual construction supports the complete source proof');SEMICIRCLE_QA.check(PROOF_ENTRY_ERRORS.length===0,'No uncaught errors in manual construction');SEMICIRCLE_QA.finish()")
    report = ''
    for attempt in range(1800 if options.suite=='book3' else 900 if options.suite in ['ranked','tutorial'] else 100):
        result = command('WebDriver:ExecuteScript', {
            'script': 'return document.querySelector("#qa-result")?.textContent||""',
            'args': [], 'sandbox': None, 'newSandbox': False})
        report = result.get('value', '')
        if report:
            break
        time.sleep(.2)
    if options.suite=='entry' and options.width <= 800 and options.height > 600 and 'ALL CHECKS PASSED' in report and 'FAIL ' not in report:
        evaluate('document.querySelector("#qa-result").remove();Object.assign(settings,DEFAULT_SETTINGS,{skipConstruction:true,skipJustifications:true});load(EuclidBooks.position("2.1"));state.lines=LESSONS[index].proofGuide.slice(0,9).map(s=>({s:s.s,j:null}));render();setMobileWorkspaceView("proof");document.querySelector("#statement").focus();')
        command('WebDriver:SetWindowRect', {'width': options.width, 'height': 480})
        time.sleep(.3)
        actual = json.loads(evaluate('JSON.stringify({typing:document.body.classList.contains("mobile-proof-typing"),input:document.querySelector("#statement").getBoundingClientRect().toJSON(),ledger:document.querySelector(".proofbody").clientHeight,height:visualViewport.height,top:visualViewport.offsetTop,focused:document.activeElement.id})'))
        assert actual['typing'] and actual['focused'] == 'statement'
        assert actual['input']['bottom'] <= actual['height']+actual['top']+1 and actual['ledger'] >= 150
        command('WebDriver:SetWindowRect', {'width': options.width, 'height': options.height})
        time.sleep(.3)
        assert not evaluate('document.body.classList.contains("mobile-proof-typing")')
        report = report.replace('ALL CHECKS PASSED', 'PASS native Firefox resize automatically opens and closes compact proof layout\nALL CHECKS PASSED')
    if options.suite=='entry' and 'ALL CHECKS PASSED' in report and 'FAIL ' not in report:
        evaluate('document.querySelector("#qa-result")?.remove();openMainMenu();showSettings();let audioToggle=document.querySelector("[data-setting=soundEffects]");audioToggle.checked=true;audioToggle.dispatchEvent(new Event("change",{bubbles:true}));window.scheduledSounds=0;window.scheduledSoundTypes=[];for(let [method,type] of [["createOscillator",null],["createBufferSource","buffer"]]){const create=AudioContext.prototype[method];AudioContext.prototype[method]=function(){const node=create.call(this),start=node.start.bind(node);node.start=(...args)=>{window.scheduledSounds++;window.scheduledSoundTypes.push(type||node.type);return start(...args)};return node};}')
        element = command('WebDriver:FindElement', {'using': 'css selector', 'value': '#test-sound'})['value']
        command('WebDriver:ElementClick', {'id': element['element-6066-11e4-a52e-4f735466cecf']})
        for attempt in range(30):
            audio = json.loads(evaluate('JSON.stringify({status:Feedback.status(),scheduled:window.scheduledSounds})'))
            if audio['status'] == 'Audio ready.' and audio['scheduled'] > 0:
                break
            time.sleep(.1)
        assert audio['status'] == 'Audio ready.' and audio['scheduled'] == 1, audio
        report = report.replace('ALL CHECKS PASSED', 'PASS trusted Firefox Test sound click starts audio and schedules an audible tone\nALL CHECKS PASSED')
        preview = command('WebDriver:FindElement', {'using': 'css selector', 'value': '#test-click'})['value']
        command('WebDriver:ElementClick', {'id': preview['element-6066-11e4-a52e-4f735466cecf']})
        assert evaluate('window.scheduledSounds') == 2 and evaluate('window.scheduledSoundTypes.at(-1)') == 'buffer'
        report = report.replace('ALL CHECKS PASSED', 'PASS Test click previews the noise click separately from the beep\nALL CHECKS PASSED')
        evaluate('document.querySelector("#resume-menu").click();Object.assign(settings,DEFAULT_SETTINGS);saved={};load(0);window.scheduledSounds=0;window.scheduledSoundTypes=[];')
        for number, reference in enumerate([*['D'+str(i) for i in range(2,24)], 'D2.1', 'D2.2'], 1):
            if evaluate('tab') != 'definitions':
                menu = command('WebDriver:FindElement', {'using': 'css selector', 'value': '[data-tab="definitions"]'})['value']
                command('WebDriver:ElementClick', {'id': menu['element-6066-11e4-a52e-4f735466cecf']})
            button = command('WebDriver:FindElement', {'using': 'css selector', 'value': '#tools [data-reference="'+reference+'"]'})['value']
            command('WebDriver:ElementClick', {'id': button['element-6066-11e4-a52e-4f735466cecf']})
            assert evaluate('window.scheduledSounds') == number, reference+' did not schedule exactly one sound'
            assert evaluate('window.scheduledSoundTypes.at(-1)') == 'buffer', reference+' did not use the rejection click'
        report = report.replace('ALL CHECKS PASSED', 'PASS trusted Firefox clicks on every irrelevant or unavailable definition schedule rejection audio\nALL CHECKS PASSED')
        evaluate('closeTools();Object.assign(settings,DEFAULT_SETTINGS,{skipConstruction:true});load(EuclidBooks.position("2.1"));setMobileWorkspaceView("proof");window.scheduledSounds=0;window.scheduledSoundTypes=[];')
        statements = [
            ('area BGNC = area BGLD + area DLME + area EMNC', 'triangle'),
            ('not a statement', 'buffer'),
            ('BG = AX', 'triangle'),
        ]
        for number, (statement, tone) in enumerate(statements, 1):
            if number == 3:
                edit = command('WebDriver:FindElement', {'using': 'css selector', 'value': '#lines .proofline:last-child .edit-line'})['value']
                command('WebDriver:ElementClick', {'id': edit['element-6066-11e4-a52e-4f735466cecf']})
            evaluate('document.querySelector("#statement").value='+json.dumps(statement))
            submit = command('WebDriver:FindElement', {'using': 'css selector', 'value': '#lineform button[type="submit"]'})['value']
            command('WebDriver:ElementClick', {'id': submit['element-6066-11e4-a52e-4f735466cecf']})
            assert evaluate('window.scheduledSounds') == number, statement
            assert evaluate('window.scheduledSoundTypes.at(-1)') == tone, statement
        report = report.replace('ALL CHECKS PASSED', 'PASS trusted Firefox proof submissions and edits schedule the correct confirmation or rejection sound\nALL CHECKS PASSED')
    if options.suite=='learningtools' and 'ALL CHECKS PASSED' in report and 'FAIL ' not in report:
        evaluate("document.querySelector('#qa-result').hidden=true;Object.assign(settings,DEFAULT_SETTINGS,{learningMode:true,soundEffects:false});saved={};load(0);window.previewBefore=JSON.stringify(state);window.previewUndo=history.length")
        rect=evaluate("(()=>{const r=document.querySelector('#learning-guidance').getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]})()")
        command('WebDriver:PerformActions',{'actions':[{'type':'pointer','id':'preview-mouse','parameters':{'pointerType':'mouse'},'actions':[{'type':'pointerMove','duration':0,'x':round(rect[0]),'y':round(rect[1]),'origin':'viewport'},{'type':'pointerDown','button':2},{'type':'pointerUp','button':2}]}]})
        assert evaluate("document.querySelector('#modal').open&&document.querySelector('#modalbody').textContent.includes('P3')&&JSON.stringify(state)===previewBefore&&history.length===previewUndo")
        report=report.replace('ALL CHECKS PASSED','PASS A native Firefox right-click shows P3 without performing the construction\nALL CHECKS PASSED')
    if options.suite in ['book3','book3view'] and 'ALL CHECKS PASSED' in report and 'FAIL ' not in report:
        import base64
        evaluate('document.querySelector("#qa-result").hidden=true')
        evaluate("Object.assign(settings,DEFAULT_SETTINGS,{soundEffects:false});saved={};load(EuclidBooks.position('3.1'));setMobileWorkspaceView('construction')")
        (artifacts/('book3-unknown-center-'+str(options.width)+'.png')).write_bytes(base64.b64decode(command('WebDriver:TakeScreenshot',{})['value']))
        evaluate("Object.assign(settings,DEFAULT_SETTINGS,{soundEffects:false,learningMode:true,skipConstruction:true,skipJustifications:true});saved={};load(EuclidBooks.position('3.2'));state.lines.push(...LESSONS[index].proofGuide.slice(0,4).map(s=>({s:s.s,j:s.j})));render();setMobileWorkspaceView('construction')")
        (artifacts/('book3-circles-'+str(options.width)+'.png')).write_bytes(base64.b64decode(command('WebDriver:TakeScreenshot',{})['value']))
        evaluate("const l=LESSONS[index],colors=AngleVisual.catalog(l);window.book3ColorPass=AngleVisual.resolve('If E is outside circle C1 on chord AB then '+colors[0].color+' = '+colors[1].color,l).includes('then angle ');window.book3HoverBefore=JSON.stringify(state);document.querySelectorAll('#lines .proofline')[4].dispatchEvent(new MouseEvent('mouseenter'))")
        assert evaluate("book3ColorPass&&!!document.querySelector('.given-circle.proof-highlight')&&!!document.querySelector('.edge.proof-highlight')")
        evaluate("document.querySelectorAll('#lines .proofline')[4].dispatchEvent(new MouseEvent('mouseleave'))")
        assert evaluate('JSON.stringify(state)===book3HoverBefore')
        evaluate("setMobileWorkspaceView('proof')")
        (artifacts/('book3-proof-'+str(options.width)+'.png')).write_bytes(base64.b64decode(command('WebDriver:TakeScreenshot',{})['value']))
        report=report.replace('ALL CHECKS PASSED','PASS Unknown-center/circle/proof layouts captured; conditional color aliases and circle/line hover work without altering records\nALL CHECKS PASSED')
    if options.suite=='tutorial' and 'ALL CHECKS PASSED' in report and 'FAIL ' not in report:
        evaluate('document.querySelector("#tutorial-menu").click();document.querySelector("[data-lesson=\\"D15-0\\"]").click();')
        import base64
        screenshot=command('WebDriver:TakeScreenshot', {})['value']
        (artifacts/('tutorial-'+str(options.width)+'.png')).write_bytes(base64.b64decode(screenshot))
        menu=command('WebDriver:FindElement', {'using':'css selector','value':'#tutorial-toolbox [data-tab="definitions"]'})['value']
        command('WebDriver:ElementClick', {'id':menu['element-6066-11e4-a52e-4f735466cecf']})
        assert evaluate('!document.querySelector("#toolpopup").hidden&&document.querySelector("#toolpopup").getBoundingClientRect().bottom<=innerHeight')
        screenshot=command('WebDriver:TakeScreenshot', {})['value']
        (artifacts/('tutorial-menus-'+str(options.width)+'.png')).write_bytes(base64.b64decode(screenshot))
        tool=command('WebDriver:FindElement', {'using':'css selector','value':'#tools [data-reference="D15"]'})['value']
        command('WebDriver:ElementClick', {'id':tool['element-6066-11e4-a52e-4f735466cecf']})
        assert evaluate('Tutorial.selected()==="D15"&&document.querySelector("#toolpopup").hidden')
        line=command('WebDriver:FindElement', {'using':'css selector','value':'#tutorial-proof-line'})['value']
        command('WebDriver:ElementClick', {'id':line['element-6066-11e4-a52e-4f735466cecf']})
        assert evaluate('document.querySelector("#tutorial-status").classList.contains("correct")')
        close=command('WebDriver:FindElement', {'using':'css selector','value':'#tutorial-close'})['value']
        command('WebDriver:ElementClick', {'id':close['element-6066-11e4-a52e-4f735466cecf']})
        assert evaluate('!document.querySelector("#tutorial-dialog").open&&document.querySelector("#main-menu").open')
        evaluate("sessionStorage.setItem('tutorial-migration-check','1');const old=JSON.parse(localStorage.getItem('euclid-tutorial-v1'));old.last='D2-0';old.completed.push('D2-0');localStorage.setItem('euclid-tutorial-v1',JSON.stringify(old))")
        command('WebDriver:Refresh', {})
        for _ in range(100):
            if evaluate('typeof Tutorial!=="undefined"&&document.querySelector("#main-menu").open'):break
            time.sleep(.1)
        evaluate('document.querySelector("#tutorial-menu").click();document.querySelector("#tutorial-resume").click()')
        assert evaluate('document.querySelector("#tutorial-title").textContent.includes("Mark a point")&&document.querySelector("#tutorial-progress").textContent.startsWith(Tutorial.lessons.length+" / "+Tutorial.lessons.length)')
        evaluate('document.querySelector("#tutorial-close").click();sessionStorage.removeItem("tutorial-migration-check")')
        report=report.replace('ALL CHECKS PASSED','PASS Native Firefox taps open a bottom menu, scroll to/select a tool, justify a line, and exit to the main menu\nPASS Reload removes retired completion IDs and recovers from a retired resume target\nALL CHECKS PASSED')
    passed = 'ALL CHECKS PASSED' in report and 'FAIL ' not in report
    print(report or 'FAILED: no test result was rendered.')
    (artifacts/('firefox-'+options.suite+'.json')).write_text(json.dumps({
        'browser': 'Firefox', 'version': session.get('capabilities', {}).get('browserVersion'),
        'passed': passed, 'checks': len(re.findall(r'^PASS ', report, re.M)),
        'report': report}, indent=2), encoding='utf-8')
finally:
    if connection:
        try:
            command('Marionette:Quit', {'flags': ['eForceQuit']})
        except (OSError, EOFError, RuntimeError):
            pass
        connection.close()
    if process.poll() is None:
        process.terminate()
    process.wait(timeout=15)
    server.shutdown()
    log.close()
    # Both generated paths must remain inside this checkout before cleanup.
    for target in [page, profile]:
        target.resolve().relative_to(root)
        if target.is_file():
            target.unlink()
        elif target.is_dir():
            shutil.rmtree(target, ignore_errors=True)
raise SystemExit(0 if passed else 1)
