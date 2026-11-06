"""Run the proof-entry/reload regression in Firefox on Windows, using Marionette.

Uses Firefox's built-in automation protocol and Python's standard library.
An isolated profile keeps normal browser settings and saves untouched.
"""
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
page.write_text(source.replace('<head>', '<head>'+capture).replace(
    '</body>', '<script src="tests/tool-name-tests.js"></script><script src="tests/proof-entry-tests.js"></script></body>'), encoding='utf-8')

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
    command('WebDriver:SetWindowRect', {'width': 900, 'height': 600})
    command('WebDriver:Navigate', {'url': 'http://127.0.0.1:'+str(server.server_port)+'/'+page.name})
    report = ''
    for attempt in range(100):
        result = command('WebDriver:ExecuteScript', {
            'script': 'return document.querySelector("#qa-result")?.textContent||""',
            'args': [], 'sandbox': None, 'newSandbox': False})
        report = result.get('value', '')
        if report:
            break
        time.sleep(.2)
    passed = 'ALL CHECKS PASSED' in report and 'FAIL ' not in report
    print(report or 'FAILED: no test result was rendered.')
    (artifacts/'firefox-entry.json').write_text(json.dumps({
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
