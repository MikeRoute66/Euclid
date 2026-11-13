# Tutorial coverage

The tutorial currently has 83 examples across all 25 installed definitions, five postulates, and five common notions. It covers distinct vocabulary and supported operations, rather than every possible application of an axiom. Each example practices one small operation. Every example first requires opening one of the actual bottom reference menus and selecting its tool, then using the diagram, choosing a classification, or clicking a proof line. Tool-menu navigation adds clicks to the original one/two-action exercises.

| References | Examples |
| --- | --- |
| D1 | Circle-circle, line-line, line-circle intersections; explicit membership of an existing circle point or arc point |
| D2–D7 | Line, endpoints, straightness, surface, surface edges, plane surface |
| D8–D9 | Straight-sided and curved plane angles; rectilinear angles |
| D10–D12 | Equal adjacent angles give perpendicularity; perpendicularity gives right angles; obtuse and acute vocabulary |
| D13–D14 | Point, straight, and curved boundaries; figures enclosed by straight or curved boundaries |
| D15–D18 | Recorded equal radii, including an extended-line intersection; center; diameter and equal halves; semicircle recognition and actual recorded arc construction |
| D19 | Triangle, quadrilateral, multilateral figure |
| D20 | Equilateral, isosceles, scalene; equilateral from proved side equalities; equal sides from a recorded equilateral construction |
| D21 | Right-, obtuse-, and acute-angled triangles |
| D22 | Square, oblong, rhombus, rhomboid, remaining quadrilaterals; establish a square; recover its equal sides and right angles |
| D23 | Meaning of parallel; rename segments on recorded parallel supports |
| P1–P3 | Join points, extend beyond the second point, draw a circle with chosen center and radius |
| P4 | A right angle equals a right angle; compare two established right angles |
| P5 | Existence of a meeting point from the interior-angle bound; Euclid's alternate-angle argument for parallels |
| CN1 | Transitivity for lengths, angles, areas |
| CN2 | Segment partition; add equal lengths; preserve an angle inequality; add angles or areas; double equal areas |
| CN3 | Subtract equal lengths, angles, areas |
| CN4 | Actual triangle superposition; justify coincidence; corresponding sides, angles, whole triangles |
| CN5 | Proper part of a segment, angle, area |
| D2.1 | Identify adjacent containing sides; rectangle as a product, including substitution of a proved equal length; square as a squared length |
| D2.2 | Identify the correct gnomon union; formally name one from its recorded partition |

Vocabulary examples supply their side/angle/containment facts explicitly. They do not claim that the formal grammar accepts every classification, or that a picture proves its own properties. In particular, the whole-area comparison is a recognition exercise; the current Play grader establishes area results through recorded partitions and addition/subtraction.

Proof examples copy an existing source route's validated prefix and its actual constructed geometry, then leave one statement unjustified. Both the supplied prefix and target must pass the production formal grader. All geometry construction examples use the existing construction functions and check that the requested record was actually created. The semicircle example supplies center and diameter as setup, leaving only the side selection to the player.

The tutorial has its own full-screen dialog, keyboard-accessible geometry targets, searchable catalog, retry/next controls, and completion key `euclid-tutorial-v1`. During an example, the original workshop toolbox is temporarily moved into the dialog, retaining its actual category buttons, upward popups, mobile scrolling lists, hover names, and full-reference inspection. The proof dropdown and automatically selected construction tools have been removed. Tool selection is routed into tutorial state, and the toolbox is returned to its original parent and selection display on exit or return to the catalog. Tutorial tool names are available for instruction without changing the player’s saved name-visibility settings. Ranked recording remains isolated. Temporary tool execution restores the workshop's globals in `finally` and suppresses ordinary rendering and ranked recording. No tutorial geometry, statement, or completion flag is saved into a proposition. Successful examples schedule advancement with `setTimeout(..., 500)`. Retry, catalog navigation, manual Next, dialog exit (including Escape), and starting another example cancel the pending timer. Finishing the last example returns to the catalog after the same delay.

The arcade menu now offers Play and Tutorial in place of Continue / Load game / Save game / New game. Automatic practice persistence remains. The retired file/save-point UI has been removed; compatibility validation helpers remain for local-data regressions. Existing browser progress and historical checkpoint data are not erased.

The terminology follows [Euclid's triangle classifications](https://mathcs.clarku.edu/~djoyce/elements/bookI/defI20.html), [the common notions](https://mathcs.clarku.edu/~djoyce/elements/bookI/cn.html), and [the Book II definitions](https://mathcs.clarku.edu/~djoyce/elements/bookII/defII.html). In particular, Euclid's wording of isosceles uses exactly two equal sides, and his gnomon includes a diagonal parallelogram and both complements, not an arbitrary L shape.

## Verification

`python tests/run-firefox-entry-checks.py --suite tutorial --width 390 --height 844` exercises every example, checks all formal proof contexts, rejects actions before tool selection and wrong references, verifies isolation and completion storage, checks the half-second advancement and timer cancellation, and uses native browser taps to open the real bottom menu, scroll to/select a tool, justify a proof line, and exit. Repeat at `--width 1280 --height 800` for desktop. Screenshots are written under the ignored `.browser-check-release/` directory.

The existing entry/reload and Book I suites cover the simplified menu and surviving autosave compatibility. No mathematical rules or course-version fingerprint were changed for this feature.
