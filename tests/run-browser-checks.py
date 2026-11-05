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
parser.add_argument('--suite', choices=['book1', 'late', 'angles'], default='book1')
parser.add_argument('--phase', choices=['modes', 'construction'], default='modes')
parser.add_argument('--lesson', type=int, choices=range(38, 49))
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
    lessons = [args.lesson] if args.lesson else list(range(38, 49))
    targets = lessons if args.suite == 'late' else [None] if args.suite == 'angles' else [None, 'logic']
    for lesson in targets:
        if lesson == 'logic':
            target = workspace / 'tests/logic.html'
        else:
            script = ('<script>window.AUDIT_LESSON=' + str(lesson) + ';window.AUDIT_PHASE=' + repr(args.phase) + '</script><script src="tests/late-book-tests.js"></script>') if args.suite == 'late' else '<script src="tests/' + ('angle-tests.js' if args.suite == 'angles' else 'book1-tests.js') + '"></script>'
            page.write_text(source.replace('</body>', script + '</body>'), encoding='utf-8')
            target = page
        result = subprocess.run([
            str(edge), '--headless', '--no-sandbox', '--disable-gpu',
            '--disable-software-rasterizer', '--no-first-run',
            '--user-data-dir=' + str(profile),
            '--window-size=' + str(args.width) + ',' + str(args.height),
            '--virtual-time-budget=15000', '--dump-dom', target.as_uri(),
        ], capture_output=True, encoding='utf-8', errors='replace', timeout=300)
        match = re.search(r'<pre id="(?:qa-result|results)">(.*?)</pre>', result.stdout, re.S)
        report = html.unescape(match.group(1)) if match else 'FAILED: no test result was rendered.'
        print((('E.' + str(lesson)) if args.suite == 'late' else target.name) + '\n' + report.encode('ascii', errors='replace').decode(), flush=True)
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
