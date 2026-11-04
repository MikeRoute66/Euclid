# Euclid workshop

A buildless, browser-only workshop for all 48 propositions of Euclid's Elements, Book I. Open `index.html`, or serve the folder with `python -m http.server 8000` and visit http://localhost:8000.

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

The main menu opens on startup and is available from Menu in the header. Continue resumes the last proposition; Jump to a proposition preserves existing work. Save point creates a named snapshot of progress in all 48 propositions. Load save opens a list of the current autosave and named snapshots, each showing its proposition, proof-line count, and timestamp. These saves live in this browser on this device. Start fresh resets the current workshop after confirmation but keeps named save points.

Import file and Export file are separate options on the save-points screen for transferring versioned JSON files between browsers or devices. Loading either a save point or a file validates and regrades its contents before replacing current progress. Browser storage also remembers the last active proposition.

The header proposition selector and the searchable main-menu list cover E.1-E.48. Earlier propositions are available as tools when studying a later proposition; current and later propositions cannot justify their own conclusions. Right-click a justified line to inspect its deduction or reference.


Construction provenance is saved with each proposition. Tools record line incidence, point order and orientation, and circle membership when those relationships are constructed. The proof checker does not read drawing coordinates. Every theorem tool has a checked operation contract; its recorded properties can be unpacked with definitions (for example D20 for sides of an E.1 triangle, and D22 for square properties). Circle equality requires endpoints recorded on the same circle, not points that happen to look equidistant. Use D1 to mark an intersection or explicitly mark an existing point on a circle; P3 records its defining endpoint. Merely joining an unrelated point does not establish circle membership.

Undo, autosave, named saves, and file export/import retain construction provenance. Older saves retain their existing theorem certificates; intersection incidences absent from those files must be marked explicitly again with D1. Initial incidence is an authored part of each lesson's diagram, not inferred from incidental alignment during grading. Browser checks cover all 48 propositions, all 13 theorem construction operations, removal of construction evidence, invalid tool inputs, and invariance under changes to display coordinates.
