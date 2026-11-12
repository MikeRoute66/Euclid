"""Remove only QA accounts explicitly recorded by ranked-api-tests.py."""
import json,re,subprocess
from pathlib import Path
root=Path(__file__).resolve().parents[1]
file=root/'.browser-check-release/ranked-test-users.json'
if file.exists():
    ids=json.loads(file.read_text(encoding='utf-8'))
    if not all(isinstance(x,str) and re.fullmatch(r'[0-9a-f-]{36}',x) for x in ids):raise ValueError('Invalid QA account IDs')
    if ids:
        sql="delete from auth.users where id in ("+','.join("'"+x+"'::uuid" for x in ids)+") and raw_user_meta_data->>'username' ~ '^Qa_[a-f0-9]{10}$'"
        result=subprocess.run([str(root/'.local-tools/supabase/supabase.exe'),'db','query','--remote',sql,'--yes'],cwd=root,capture_output=True,text=True,encoding='utf-8')
        if result.returncode:raise RuntimeError('QA cleanup failed; credentials retained for retry.')
    for target in [file,root/'.browser-check-release/ranked-test-session.json']:
        target.resolve().relative_to(root/'.browser-check-release')
        target.unlink(missing_ok=True)
print('Removed the recorded QA accounts, their leaderboard entries, and local credential fixtures.')
