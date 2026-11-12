# Accounts and ranked play

The GitHub Pages site remains static. The Euclid Supabase project supplies password authentication, persistent browser sessions, and shared per-proposition leaderboards.

Players create a public username and a password in **Menu > Player / Sign in**. Usernames are case-insensitive and unique. Supabase Auth stores and verifies passwords; the app stores refresh/access tokens through the official Supabase JavaScript client, not passwords. Signing out uses `scope: 'local'` so another device stays signed in. Accounts use internal, non-delivering email identifiers; no player email is collected and email password recovery is not enabled. Players should retain their passwords.

**Menu > Options > Ranked mode** is the only ranked entry control. Enabling it turns off all skips, Learning mode, hints, tool-name previews, and correctness sounds, and locks those controls. Label size remains adjustable. Returning to play starts a fresh attempt. Practice progress and prior options are kept separately and restored when Ranked mode is turned off, including after a reload. Tutorial examples are isolated from practice and never submit ranked scores. Reloading, starting over, or changing propositions starts a new timed attempt; menus and other tabs do not pause the timer. Starting a new attempt also supersedes an older attempt on another device for that player.

## Score acceptance

**Menu > Leaderboards** opens a dedicated scrollable viewer for every proposition with current-version entries, in book/proposition order. Each board shows the top 100 players. Click its heading to hide or show its entries, or use Show all / Hide all. These visibility choices stay in this browser across refreshes and visits; they never remove scores. No sign-in is required to view times.

- The database records start time. Finish time is captured on the server after the submitted payload arrives, before proof validation, so validation latency does not inflate the result.
- The browser records tool selection, point/mark operations, superposition, statements, edits, justification, deletion, and Undo. The server rebuilds geometry with the production construction tools. It ignores submitted completion flags, durations, certificates, and purported checkpoint positions.
- The production formal proof checker validates the resulting proof against construction records and earlier established lines. Verification runs in small batches to fit Edge Function CPU limits. Only server-stored, previously checked prefixes may be reused. The initial proof snapshot and receipt time are immutable for that submission.
- Database functions serialize attempt creation/completion, enforce ownership and expiry, and atomically replace a best time only when the new time is faster. Repeated submissions are idempotent. Attempts expire after six hours.
- Database tables and privileged functions deny browser-role writes. The Edge Function verifies each session with Supabase Auth and only returns public usernames, ranks, and times on the leaderboard. Browser configuration contains only a publishable key. Service credentials remain in the function environment.
- Scores are associated with the course/grader version. UI-only changes do not change the version; changes to construction or mathematical rules can start a new leaderboard version. Older records remain stored.

This is a server-validated casual leaderboard. A browser app cannot prove that a player did not consult another page or automate otherwise valid actions.

## Deployment

The CLI is authenticated and linked locally to the owner's Euclid project. Never commit CLI credentials, `.env` files, or service keys. Only `online-config.js` (public project URL/key and course version) belongs in the static site.

1. With Python, run `python scripts/build-ranked-runtime.py` after changing mathematical rules or construction tools. Commit both the generated runtime and updated `online-config.js`.
2. Apply new migrations with `supabase db query --remote --file supabase/migrations/FILE.sql --yes`, in filename order. These migrations create application-owned objects and do not erase player data. The first four migrations have already been applied.
3. Deploy with `supabase functions deploy euclid-online --use-api --no-verify-jwt --yes`. This endpoint has public account/leaderboard actions, so gateway JWT verification is disabled; protected actions explicitly validate user tokens in the handler.
4. Commit and push the static app to GitHub Pages. Deploy the corresponding function before publishing a changed course version. Existing clients must refresh if their version differs.

The bundled browser auth client is Supabase JS 2.119.0; its license is in `vendor/SUPABASE-LICENSE.txt`. The local CLI and Deno test executable are ignored under `.local-tools/`.

## Verification

- `deno run --allow-write=.browser-check-release tests/ranked-server-tests.js .browser-check-release/ranked-fixtures.json` replays and validates source proofs for all 62 propositions, checks batched/full-grader agreement, and rejects forged facts, missing construction provenance, invalid references, and invalid point names.
- `python tests/ranked-api-tests.py` tests the deployed backend using disposable accounts. It checks account uniqueness, passwords, ownership, denied direct writes, untrusted timing, idempotence, fastest-only records, public data boundaries, and representative proofs including E2.9, E2.10, and E2.14.
- `python tests/run-firefox-entry-checks.py --suite ranked --width 390 --height 844` uses those disposable credentials in an isolated Firefox profile. It checks real login, reload persistence, ranked settings, construction/proof events, best-time display, practice restoration, ranked reload, mobile panel switching, and logout.
- Run `python tests/cleanup-ranked-test-users.py` when finished. It removes only the generated QA accounts and their scores, then removes the local credential fixture.
- `python tests/run-firefox-entry-checks.py --suite leaderboard --width 390 --height 844` checks the viewer with all 62 populated boards, independent collapse, remembered visibility, scrolling, safe username rendering, empty results, and refresh failures using mocked board responses.
- `python tests/leaderboard-api-tests.py` checks the deployed public snapshot and compares each populated board with the individual leaderboard endpoint without creating accounts or changing scores.
- Existing entry, mobile, audio, and Book I regression suites remain available.
