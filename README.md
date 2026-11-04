# Euclid workshop

A buildless, browser-only introduction to Euclid Book I, propositions 1–5. Open `index.html`, or serve the folder with `python -m http.server 8000` and visit http://localhost:8000.

## GitHub Pages

Push these files to a GitHub repository. In **Settings → Pages**, choose **Deploy from a branch**, select the branch and **/ (root)**, and save. All asset paths are relative, so project and user Pages both work. No server, build, API keys, or dependencies are required. Optional Google Fonts fall back to system fonts offline.

## Interaction

The left two-thirds is a construction canvas; the right third is the proof ledger. Select tools in the bottom menus and click named points. Definition 1 marks nearby circle intersections. The hint button gives opt-in guidance. The statement input offers keyword-based format corrections without consulting the lesson or suggesting answers. Select a justification, then click a proof line. Undo covers construction and proof edits. Progress persists in localStorage when available.

## Scope of proof checking

The grader parses statements into typed logical objects and applies inference rules to earlier accepted premises and construction evidence. It does not match statements against a lesson answer list or require a particular sequence of intermediate steps. The hint routes are separate and are consulted only when a hint is requested.

The calculus supports symmetric segment and angle equality, transitivity, linear addition/subtraction, circle-radius equality, the definition of equilateral triangles, certified I.1?I.3 constructions, SAS congruence, corresponding parts, and superposition. It checks proposition conclusions rather than completion of an expected proof checklist. For example, I.1 can finish with two justified radius equalities and an equilateral assertion; it does not require a redundant transitivity line.

Coordinates supply incidence (circle membership, collinearity, same rays, betweenness, and angle partitions), not numerical length/angle comparisons as proof. Segment and angle addition, equal straight angles, and reflexivity are structural identities. This is a domain-specific Euclidean calculus, not an unrestricted natural-language or first-order theorem prover. Definitions and postulates outside the supported statement language remain available for reading, but do not automatically justify arbitrary claims. Earlier propositions are available when opening later lessons directly. I.1 assumes circle intersections and I.4 follows Euclid's superposition argument.

Open [tests/logic.html](tests/logic.html) in a browser to run the logic and neutral-formatting regression suite. It covers all five propositions, alternative proofs, recipe independence, algebraic inferences, incorrect justifications, and unsupported conclusions.

Source reference: [Euclid’s Elements, Book I](https://www.euclids-elements.org/elements/books/bookI/).

The bottom reference menus start collapsed and open upward when clicked. Select an entry, click outside, press Escape, or click the category again to close. The reference palettes contain all 23 Book I definitions, all five postulates, and all five common notions, paraphrased with original numbering. The Given justification is a separate button in the proof panel.

Proof lines have an Edit button. Save retains the justification and rechecks every later line; Cancel or Escape discards the edit, and Undo restores a saved edit. Segment equalities accept reversed endpoints and either equality direction (for example, `AB = BC` matches `BC = BA`). Common notion 1 can also use a chain of earlier established equalities.

Right-click a tool to read its full name and reference in a dialog without selecting it. Keyboard users can use Shift+F10 or the context-menu key. Escape closes the dialog.

The hint button inspects the current construction and validated proof each time. It skips completed construction steps and proof statements, identifies missing justifications, and prompts for corrections or unfinished edits. Repeated clicks show the same next action until progress changes; there is no hint sequence to cycle through.

Triangle statements use sentences: `ABC is equilateral`, `ABC is congruent to DEF`, and `ABC is superposed on DEF`. Equilateral accepts all six vertex orders. Congruence and superposition accept simultaneous reorderings that preserve corresponding vertices, and either triangle first. A `triangle` prefix and a final period are optional. Existing function-style saved statements are converted automatically.

The main menu opens on startup and is available from Menu in the header. Continue resumes the last proposition; Jump to a proposition preserves existing work. Download save file exports all five propositions as versioned JSON; Load save file validates the file before replacing progress. Start fresh clears the workshop after confirmation. Browser storage also remembers the last active proposition.
