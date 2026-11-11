# Euclid workshop

A buildless, browser-only workshop for all 62 propositions of Euclid's Elements, Books I and II. Open `index.html`, or serve the folder with `python -m http.server 8000` and visit http://localhost:8000.

## GitHub Pages

Push these files to a GitHub repository. In **Settings → Pages**, choose **Deploy from a branch**, select the branch and **/ (root)**, and save. All asset paths are relative, so project and user Pages both work. No server, build, API keys, or dependencies are required. Optional Google Fonts fall back to system fonts offline.

## Interaction

The left two-thirds is a construction canvas; the right third is the proof ledger. Select tools in the bottom menus and click named points. Definition 1 marks nearby circle intersections. The hint button gives opt-in guidance. The statement input offers keyword-based format corrections without consulting the lesson or suggesting answers. Select a justification, then click a proof line. Undo covers construction and proof edits. Progress persists in localStorage when available.

## Scope of proof checking

The grader parses statements into typed logical objects and applies inference rules to earlier accepted premises and construction evidence. It does not match statements against a lesson answer list or require a particular sequence of intermediate steps. The hint routes are separate and are consulted only when a hint is requested.

The calculus supports segment and angle equality, inequalities, linear addition/subtraction, circle radii, SAS/SSS/two-angle-and-side congruence, parallel and perpendicular lines, collinearity, right angles, parallelograms, polygon areas, and squares of lengths. Earlier construction macros include angle/segment bisection, perpendiculars, parallels, triangle assembly, angle transfer, area application, and squares. Each of the 48 lessons has its own diagram, goals, and opt-in construction and proof guide. It checks proposition conclusions rather than completion of an expected proof checklist. For example, I.1 can finish with two justified radius equalities and an equilateral assertion; it does not require a redundant transitivity line.

Construction tools record incidence and orientation (circle membership, collinearity, same rays, betweenness, sidedness, and angle partitions). The checker uses those records, never display coordinates, as proof evidence. For later area and square statements a sparse symbolic polynomial kernel checks identities under established Euclidean constraints; it never substitutes displayed lengths or measured areas as proof. Deduction rules also implement derived Euclidean arguments, with earlier-proposition dependencies and inspectable outlines. These are trusted domain rules, rather than a foundational machine formalization of every step in Euclid. Some valid alternative proofs use the symbolic analytic kernel rather than Euclid's original synthetic route. Segment and angle addition, equal straight angles, and reflexivity are structural identities. This is a domain-specific Euclidean calculus, not an unrestricted natural-language or first-order theorem prover. Definitions and postulates outside the supported statement language remain available for reading, but do not automatically justify arbitrary claims. Earlier propositions are available when opening later lessons directly. I.1 assumes circle intersections and I.4 follows Euclid's superposition argument.

Run `python tests/run-browser-checks.py` on Windows with Edge installed. Use `--width 492 --height 844` to repeat at a narrow viewport. The checks execute the constructions and proof guides for I.6-I.48, retain the I.1-I.5 logic regressions, reject unsupported claims, and cover deletion, undo, navigation, and save compatibility. Open [tests/logic.html](tests/logic.html) for the original calculus and neutral-formatting checks.

Source reference: [Euclid’s Elements, Book I](https://www.euclids-elements.org/elements/books/bookI/).

The bottom reference menus start collapsed and open upward when clicked. Select an entry, click outside, press Escape, or click the category again to close. The reference palettes contain all 23 Book I definitions, all five postulates, and all five common notions, paraphrased with original numbering. The Given justification is a separate button in the proof panel.

Proof lines have Edit and Delete buttons. Delete renumbers the ledger and rechecks dependent lines; Undo restores the removed statement. Save retains the justification and rechecks every later line; Cancel or Escape discards the edit, and Undo restores a saved edit. Segment equalities accept reversed endpoints and either equality direction (for example, `AB = BC` matches `BC = BA`). Common notion 1 can also use a chain of earlier established equalities.

Right-click a tool to read its full name and reference in a dialog without selecting it. Keyboard users can use Shift+F10 or the context-menu key. Escape closes the dialog.

The hint button inspects the current construction and validated proof each time. It skips completed construction steps and proof statements, identifies missing justifications, and prompts for corrections or unfinished edits. Repeated clicks show the same next action until progress changes; there is no hint sequence to cycle through.

Triangle statements use sentences: `ABC is equilateral`, `ABC is congruent to DEF`, and `ABC is superposed on DEF`. Equilateral accepts all six vertex orders. Congruence and superposition accept simultaneous reorderings that preserve corresponding vertices, and either triangle first. A `triangle` prefix and a final period are optional. Existing function-style saved statements are converted automatically.

The main menu opens on startup and is available from Menu in the header. Continue resumes the last proposition; Jump to a proposition preserves existing work. Save point creates a named snapshot of progress across all installed books. Load save opens a list of the current autosave and named snapshots, each showing its proposition, proof-line count, and timestamp. These saves live in this browser on this device. Start fresh resets the current workshop after confirmation but keeps named save points.

Import file and Export file are separate options on the save-points screen for transferring versioned JSON files between browsers or devices. Loading either a save point or a file validates and regrades its contents before replacing current progress. Browser storage also remembers the last active proposition.

The book and proposition selectors and the searchable main-menu list cover E1.1-E1.48 and E2.1-E2.14. Earlier propositions are available as tools when studying a later proposition; current and later propositions cannot justify their own conclusions. Right-click a justified line to inspect its deduction or reference.


Construction provenance is saved with each proposition. Tools record line incidence, point order and orientation, and circle membership when those relationships are constructed. The proof checker does not read drawing coordinates. Every theorem tool has a checked operation contract; its recorded properties can be unpacked with definitions (for example D20 for sides of an E.1 triangle, and D22 for square properties). Circle equality requires endpoints recorded on the same circle, not points that happen to look equidistant. Use D1 to mark an intersection or explicitly mark an existing point on a circle; P3 records its defining endpoint. Merely joining an unrelated point does not establish circle membership.

Undo, autosave, named saves, and file export/import retain construction provenance. Older saves retain their existing theorem certificates; intersection incidences absent from those files must be marked explicitly again with D1. Initial incidence is an authored part of each lesson's diagram, not inferred from incidental alignment during grading. Browser checks cover all 48 propositions, all 13 theorem construction operations, removal of construction evidence, invalid tool inputs, and invariance under changes to display coordinates.


Canvas input uses screen-sized point targets and pointer capture with window-level move/release handling. Two-point construction tools accept either two clicks or a drag; E.4 superposition accepts dragging A onto D or clicking A then D. Drag previews do not alter proof evidence until release, and canceled gestures are discarded. Point labels are placed around the actual diagram in screen space, avoiding geometry, points, and other labels; dense layouts use free space with leader lines. Their size remains readable when the construction view scales or the window resizes.


The point tool uses the same intersection solver in every lesson, including the original first five. It snaps to line/line, circle/line, and circle/circle crossings using screen pixels and records their incident objects; a nearby existing point does not prevent selecting a closer intersection. Original guided constructions retain their expected point names.

Justifications are checked by rule: P4 compares established right angles, E.15 requires vertical-angle evidence, and CN2/CN3 require addition/subtraction of established equal magnitudes. More involved area arguments use Deduction with the accompanying explanation. D20 can unpack a recorded E.1 construction directly; an explicit equilateral proof line is optional when the tool already established that property.


Hints describe the next geometric action and the reasoning for a proof statement without reference indices, menu names, or instructions naming the correct tool. Learners choose the tool or justification themselves. Point names, mathematical quantities, and proof-line numbers remain so the action is unambiguous. This applies to construction, proof, editing, and correction hints throughout both books.


Proof entries automatically capitalize labels belonging to the current construction while preserving ordinary words and the text cursor. For example, `ab = ac` becomes `AB = AC`, and `abcd is a square` becomes `ABCD is a square`. The same normalization applies to edited lines and loaded saves.


The arcade menu offers Continue, New game, Load game, Save game, Stage select, and Options. Options are saved in this browser:

- Skip construction supplies the finished diagram while retaining a backup of the manual drawing.
- Skip proof supplies proof statements. Their justifications are still required.
- Skip justifications checks whether statements follow automatically, rejecting unsupported statements without assigning reference answers to the saved lines.
- Skip proof together with Skip justifications gives construction-only practice. Skipping all three gives a finished-diagram review mode.
- Show hints and Larger point labels control guidance and diagram readability.

Practice clears are labeled separately from full proofs. Switching off supplied construction or proof restores the manual work; switching back resumes practice progress. Exported save files retain both sets of work. Construction-only completion checks actual recorded artifacts rather than point coordinates or names alone. The supplied constructions and proofs, all eight practice-toggle combinations, and automatic statement checking are covered by browser regression checks. The expansion suite also checks both Learning settings for each combination.

## Books II and III expansion

Book I has 48 stages and Book II has 14. Choose a book in the header or use Stage select. References use E1.1 and E2.1 notation; the reference menus group definitions and earlier propositions by book. Book II adds the contained rectangle and gnomon definitions, length products, selected semicircles, and reusable constructions for E2.11 and E2.14. Its teaching routes follow Euclid's geometric area and right-triangle arguments. See [the Book II source audit](docs/book2-source-audit.md) for scope and explicit elaborations.

Products accept `AB*CD` or `rectangle contained by AB and CD`. A squared length uses `AB^2`; a polygon area uses `area ABCD`. These terms share area dimension and can be combined in equalities. Geometry and construction records establish their meaning; displayed measurements cannot prove them.

Version 2 saves use stable book-qualified identities and still import version 1 files. New exports require this version of the workshop; older published clients cannot read the new format. Existing Book I progress and manual/practice backups are retained. The semicircle's selected side, diameter evidence, and intersection membership survive save round trips.

Run `python tests/run-browser-checks.py --suite books --width 900 --height 600` for Book II migration, logical-rule, construction, and all 16 practice configurations. `--mask 0` through `--mask 7` select skip-toggle combinations; `--learning 0` or `--learning 1` selects Learning mode. `--report .browser-check-release/results.json` records case results and a source fingerprint. Run the default suite for Book I regressions and `--suite angles` for angle/color/highlight checks across both books.

Book III remains planned and is not listed as a playable book. See [the expansion plan](docs/expansion.md).

Book II release validation: all 224 practice-mode cases passed, with Book I regressions, 7,328 angle/color/highlight checks, and compact viewport checks. See [the validation record](docs/book2-validation.json).

For proof-entry and autosave-reload regressions, run `python tests/run-browser-checks.py --suite entry`. Run the same checks in Firefox with `python tests/run-firefox-entry-checks.py`; it uses Firefox's built-in Marionette protocol and an isolated profile, with no additional Python dependencies.

Options includes independent Show definition names, Show postulate names, Show common notion names, and Show proposition names toggles. Turning one off hides that category?s hover/focus names, selection instructions, proof-reference names, and full-reference previews; its reference codes remain visible. These preferences persist in this browser.

On mobile, Construction and Proof occupy separate full-width panels. Swipe left to see the proof and right to return to construction, or use the panel buttons. Drags beginning at named construction points keep operating the selected tool. Proof drafts remain intact when switching panels. Each tool category opens a compact vertical list that scrolls above its own button. Desktop keeps both panels side by side.

In mobile Proof view, the statement form stays below the scrolling ledger. The app follows the visual viewport when the on-screen keyboard opens or pans the page, compacts headers while typing, and restores them when the keyboard closes. Tool popups clear the form, and Add keeps the input focused. Mobile regression checks include keyboard-sized viewports, editing, and native Firefox resizing.

Sound effects are on by default and can be muted in Options. A short low beep confirms a correct next tool, a successful construction, or a valid applied justification. A dry click marks an incorrect choice or rejected use. Partial point selections, navigation, redraws, imports, and automatically supplied construction remain silent. Sounds are synthesized locally without audio-file downloads.

If sound is silent, Options > Test sound makes a direct playback attempt and shows the audio status. Audio is initialized on a trusted tap, click, or keypress; pending feedback waits for startup instead of expiring after 300 ms. The latest pending sound is cancelled when muted.

Every tool selection now gives feedback, including attempts to choose unavailable definitions or propositions (which remain blocked). Submitting or editing a proof statement checks whether it follows independently of assigning its manual justification: correct statements beep and incorrect or malformed ones click. Clicking a proof row without assigning a reference checks its statement too.

The rejection sound is a quiet 25 ms burst of filtered noise with a fast decay, giving a non-tonal click. Options > Test click previews it separately from the confirmation beep.
