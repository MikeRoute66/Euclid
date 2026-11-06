"""Run the dependency-free browser checks in Microsoft Edge on Windows."""
import argparse
import html
import hashlib
import json
from pathlib import Path
import re
import shutil
import subprocess
import uuid

parser = argparse.ArgumentParser()
parser.add_argument('--report',help='Write case results and source fingerprint to a workspace JSON file')
parser.add_argument('--width', type=int, default=1280)
parser.add_argument('--height', type=int, default=800)
parser.add_argument('--suite', choices=['book1', 'late', 'angles', 'source', 'books', 'entry'], default='book1')
parser.add_argument('--phase', choices=['modes', 'construction'], default='modes')
parser.add_argument('--lesson', type=int, choices=range(1, 100))
parser.add_argument('--learning',type=int,choices=[0,1],help='Run one Learning setting in the books suite')
parser.add_argument('--mask',type=int,choices=range(8),help='Run one practice-toggle combination in the books suite')
parser.add_argument('--start',type=int,default=1)
parser.add_argument('--end',type=int,default=40)
args = parser.parse_args()
workspace = Path(__file__).resolve().parents[1]
edge = Path('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe')
if not edge.exists():
    raise SystemExit('Microsoft Edge was not found at its standard Windows location.')
identifier = uuid.uuid4().hex
page = workspace / ('.qa-' + identifier + '.html')
profile = workspace / ('.browser-check-' + identifier)
passed = True
case_reports = []
finished = False
def fingerprint():
    files = sorted([*workspace.glob('*.js'), workspace/'index.html', workspace/'style.css', *workspace.glob('tests/*.js'), *workspace.glob('tests/*.py'), workspace/'docs/books-2-3-sources.json'])
    digest = hashlib.sha256()
    for file in files:
        digest.update(str(file.relative_to(workspace)).encode())
        digest.update(b'\0')
        digest.update(file.read_bytes())
    return digest.hexdigest()
source_fingerprint = fingerprint()
try:
    source = (workspace / 'index.html').read_text(encoding='utf-8')
    lessons = [args.lesson] if args.lesson else list(range(args.start, args.end+1)) if args.suite == 'source' else list(range(38, 49))
    targets = lessons if args.suite in ['late','source'] else [None] if args.suite in ['angles','books','entry'] else [None, 'logic']
    book_stages = {int(i): f'E{b}.{p}' for file in workspace.glob('book[23]-lessons.js') for i,b,p in re.findall(r'id:\s*(\d+),book:\s*(\d+),proposition:\s*(\d+)', file.read_text(encoding='utf-8'))}
    if args.suite == 'books':
        selected = [args.lesson] if args.lesson else sorted(book_stages)
        if any(i not in book_stages for i in selected):
            raise SystemExit('The selected expansion lesson is not implemented.')
        masks = [args.mask] if args.mask is not None or args.phase == 'construction' else list(range(8))
        learning_values = [args.learning] if args.learning is not None or args.phase == 'construction' else [0,1]
        targets = [(i, mask, learning) for i in selected for mask in masks for learning in learning_values]
    for lesson in targets:
        book_mask = args.mask
        book_learning = args.learning
        if isinstance(lesson, tuple):
            lesson, book_mask, book_learning = lesson
        if lesson == 'logic':
            target = workspace / 'tests/logic.html'
        else:
            script = ('<script>window.AUDIT_LESSON=' + str(lesson) + ';window.AUDIT_PHASE=' + repr(args.phase) + '</script><script src="tests/' + 'late-book-tests.js' + '"></script>') if args.suite in ['late','source'] else '<script src="tests/' + ('books-tests.js' if args.suite == 'books' else 'angle-tests.js' if args.suite == 'angles' else 'proof-entry-tests.js' if args.suite == 'entry' else 'book1-tests.js') + '"></script>'
            if args.suite == 'books':
                dependencies = {r['key']: r['dependencies'] for r in json.loads((workspace / 'docs/books-2-3-sources.json').read_text(encoding='utf-8'))['propositions']}
                script = '<script>window.SOURCE_DEPENDENCIES=' + json.dumps(dependencies) + '</script>' + script
                script = '<script>window.AUDIT_LESSON=' + str(lesson or 0) + ';window.AUDIT_PHASE=' + repr(args.phase) + ';window.AUDIT_MASK=' + str(book_mask if book_mask is not None else -1) + ';window.AUDIT_LEARNING=' + str(book_learning if book_learning is not None else -1) + '</script>' + script
            source = (workspace / 'index.html').read_text(encoding='utf-8')
            if args.suite == 'entry':
                source = source.replace('<head>','<head><script>window.PROOF_ENTRY_ERRORS=[];addEventListener("error",e=>PROOF_ENTRY_ERRORS.push(e.error?.stack||e.message));</script>')
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
        print((('E.' + str(lesson)) if args.suite in ['late','source'] else book_stages[lesson] + ' mask=' + str(book_mask) + ' learning=' + str(book_learning) if args.suite == 'books' else target.name) + '\n' + report.encode('ascii', errors='replace').decode(), flush=True)
        case_passed = 'ALL CHECKS PASSED' in report and 'FAIL ' not in report
        case_reports.append({'lesson':lesson,'mask':book_mask,'learning':book_learning,'passed':case_passed,'report':report})
        passed = passed and case_passed
    finished = True
finally:
    if args.report:
        report_path = (workspace / args.report).resolve()
        report_path.relative_to(workspace)
        report_path.parent.mkdir(parents=True, exist_ok=True)
        report_path.write_text(json.dumps({'suite':args.suite,'width':args.width,'height':args.height,'phase':args.phase,'sourceFingerprint':source_fingerprint,'unchanged':fingerprint()==source_fingerprint,'finished':finished,'passed':passed and finished,'cases':case_reports},indent=2),encoding='utf-8')
    # Both paths are generated here, and must resolve strictly inside this checkout.
    for target in [page, profile]:
        target.resolve().relative_to(workspace)
        if target.is_file():
            target.unlink()
        elif target.is_dir():
            shutil.rmtree(target, ignore_errors=True)
raise SystemExit(0 if passed else 1)
