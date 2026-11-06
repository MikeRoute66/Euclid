"""Refresh the implementation audit's source index, not runtime answer data.

Only indexes the proposition before the modern Guide commentary. Captures
references attached to each proof paragraph so source order is not lost. The
checked-in index stores locations and mathematical labels, not copied prose.
Run explicitly when reviewing the source; browser tests use the checked-in file.
"""
from concurrent.futures import ThreadPoolExecutor
from html import unescape
from pathlib import Path
import json
import re
from urllib.request import urlopen
from urllib.parse import urljoin

ROOT = 'https://mathcs.clarku.edu/~djoyce/elements/'
ROMAN = {1: 'I', 2: 'II', 3: 'III'}


def plain(markup):
    markup = re.sub(r'<(?:script|style)\b[^>]*>.*?</(?:script|style)>', '', markup, flags=re.S | re.I)
    return ' '.join(unescape(re.sub(r'<[^>]+>', ' ', markup)).split())


def reference(url):
    match = re.search(r'book(I{1,3})/propI{1,3}(\d+)\.html', url)
    return f'E{len(match[1])}.{match[2]}' if match else None


def fetch(item):
    book, number = item
    roman = ROMAN[book]
    url = f'{ROOT}book{roman}/prop{roman}{number}.html'
    with urlopen(url, timeout=30) as response:
        html = response.read().decode('utf-8')
    statement = re.search(r'<div class="statement">(.*?)</div>', html, re.S | re.I)
    end = re.search(r'<div class="qed">', html, re.I)
    if not statement or not end:
        raise ValueError(f'Cannot identify proposition boundaries: {url}')
    body = html[statement.end():end.start()]
    steps, pending = [], []
    for part in re.split(r'(<div class="just">.*?</div>)', body, flags=re.S | re.I):
        if re.match(r'<div class="just">', part, re.I):
            pending = list(dict.fromkeys(filter(None, (reference(urljoin(url, link)) for link in re.findall(r'href=["\']?([^"\' >]+)', part, re.I)))))
        else:
            paragraphs = [plain(p) for p in re.split(r'<p\b[^>]*>', part, flags=re.I)]
            for paragraph in filter(None, paragraphs):
                steps.append({'paragraph': len(steps) + 1,
                              'labels': sorted(set(re.findall(r'\b[A-Z]{1,26}\b', paragraph))),
                              'references': pending})
                pending = []
    dependencies = list(dict.fromkeys(r for step in steps for r in step['references']))
    # Corollaries are separate source claims and must be explicitly reviewed;
    # they must never be silently folded into the primary proposition.
    tail = re.split(r'<a\s+name=["\']?guide\b', html[end.end():], maxsplit=1, flags=re.I)[0]
    corollary = re.search(r'<h[12]>Corollary</h[12]>(.*)', tail, re.S | re.I)
    return {'key': f'{book}.{number}', 'source': url,
            'title': f'Proposition E{book}.{number}', 'sourceSteps': steps,
            'dependencies': dependencies,
            'hasCorollary': bool(corollary),
            'auditStatus': 'pending'}


if __name__ == '__main__':
    requests = [(book, number) for book, count in [(2, 14), (3, 37)] for number in range(1, count + 1)]
    with ThreadPoolExecutor(max_workers=6) as executor:
        lessons = list(executor.map(fetch, requests))
    out = {'description': 'Source index for implementation review. Pending entries are not verified lessons.',
           'source': ROOT, 'propositions': lessons}
    target = Path(__file__).resolve().parents[1] / 'docs' / 'books-2-3-sources.json'
    target.write_text(json.dumps(out, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'Indexed {len(lessons)} propositions in {target.name}')
