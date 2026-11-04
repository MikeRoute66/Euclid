"""Run the dependency-free browser checks in Microsoft Edge on Windows."""
import argparse
import html
from pathlib import Path
import re
import shutil
import subprocess
import uuid

parser = argparse.ArgumentParser()
parser.add_argument('--width', type=int, default=1280)
parser.add_argument('--height', type=int, default=800)
args = parser.parse_args()
workspace = Path(__file__).resolve().parents[1]
edge = Path('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe')
if not edge.exists():
    raise SystemExit('Microsoft Edge was not found at its standard Windows location.')
identifier = uuid.uuid4().hex
page = workspace / ('.qa-' + identifier + '.html')
profile = workspace / ('.browser-check-' + identifier)
passed = True
try:
    source = (workspace / 'index.html').read_text(encoding='utf-8')
    page.write_text(source.replace('</body>', '<script src="tests/book1-tests.js"></script></body>'), encoding='utf-8')
    for target in [page, workspace / 'tests/logic.html']:
        result = subprocess.run([
            str(edge), '--headless', '--no-sandbox', '--disable-gpu',
            '--disable-software-rasterizer', '--no-first-run',
            '--user-data-dir=' + str(profile),
            '--window-size=' + str(args.width) + ',' + str(args.height),
            '--virtual-time-budget=15000', '--dump-dom', target.as_uri(),
        ], capture_output=True, encoding='utf-8', errors='replace', timeout=90)
        match = re.search(r'<pre id="(?:qa-result|results)">(.*?)</pre>', result.stdout, re.S)
        report = html.unescape(match.group(1)) if match else 'FAILED: no test result was rendered.'
        print(target.name + '\n' + report.encode('ascii', errors='replace').decode())
        passed = passed and 'ALL CHECKS PASSED' in report and 'FAIL ' not in report
finally:
    # Both paths are generated here, and must resolve strictly inside this checkout.
    for target in [page, profile]:
        target.resolve().relative_to(workspace)
        if target.is_file():
            target.unlink()
        elif target.is_dir():
            shutil.rmtree(target, ignore_errors=True)
raise SystemExit(0 if passed else 1)
