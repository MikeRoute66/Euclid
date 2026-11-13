# Tutorial coverage

The tutorial currently has 46 examples across all 25 installed definitions, five postulates, and five common notions. It covers distinct vocabulary and supported operations, rather than every possible application of an axiom. Each example practices one small operation. Every example first requires opening one of the actual bottom reference menus and selecting its tool, then using the diagram, choosing a classification, or clicking a proof line. Tool-menu navigation adds clicks to the original one/two-action exercises.

Different intersections, different magnitude types, and different members of a classification are examples of the same concept. They no longer get separate lessons. Separate lessons remain for different operations or logical directions, such as recognizing a diameter versus using its bisection property, establishing an equilateral triangle versus using its equal sides, or physically superposing triangles versus applying coincidence in a proof. Stable lesson IDs preserve completion for retained concepts; removed IDs are filtered out, and a removed resume target moves to an available lesson.

| References | Concepts practiced |
| --- | --- |
| D1 | Mark a point and record its membership; one example covers line, circle, and arc intersections |
| D2-D9 | Line, endpoints, straightness, surface, surface edges, plane surface, plane angle, rectilinear angle |
| D10-D12 | Equal adjacent angles give perpendicularity; perpendicularity gives right angles; obtuse and acute vocabulary |
| D13-D14 | Recognize a boundary; recognize an enclosed figure, regardless of straight or curved edges |
| D15-D18 | Equal recorded radii; center; diameter and equal halves; recognize a semicircle; construct one using the full center/endpoints/side-marker input sequence |
| D19-D21 | Classify a straight-sided figure; prove equilateral from side equalities; use its equal sides; classify a triangle by angles |
| D22-D23 | Establish a square; use its equal sides; use its right angles; rename segments on an established parallel support |
| P1-P4 | Join, extend, draw a circle, compare established right angles |
| P5 | Prove that lines meet; use Euclid's alternate-angle argument for parallels |
| CN1 | Transitivity; one representative example applies equally to lengths, angles, and areas |
| CN2 | Adjacent parts sum to the whole; add equal magnitudes; preserve an inequality when adding the same magnitude |
| CN3 | Subtract equal magnitudes; one representative length example |
| CN4 | Superpose triangles; justify coincidence; use corresponding coincident parts |
| CN5 | A whole exceeds its proper part; one representative segment example |
| D2.1-D2.2 | Express a rectangle by its containing sides, with a square as the same product with equal factors; identify the gnomon union |

Vocabulary examples supply their side/angle/containment facts explicitly. They do not claim that the formal grammar accepts every classification, or that a picture proves its own properties. Changing the depicted object is not treated as another use case. The full reference and short explanation still describe the other members of each classification and the other kinds of magnitude.

Proof examples copy an existing source route's validated prefix and its actual constructed geometry, then leave one statement unjustified. Both the supplied prefix and target must pass the production formal grader. All geometry construction examples use the existing construction functions and check that the requested record was actually created. The semicircle example supplies a circle with a recorded diameter, but requires all four manual selections: center O, endpoints A and B, and side marker C. This is one construction operation with four point inputs; the tutorial no longer preselects its first three inputs.

The tutorial has its own full-screen dialog, keyboard-accessible geometry targets, searchable catalog, retry/next controls, and completion key `euclid-tutorial-v1`. During an example, the original workshop toolbox is temporarily moved into the dialog, retaining its actual category buttons, upward popups, mobile scrolling lists, hover names, and full-reference inspection. The proof dropdown and automatically selected construction tools have been removed. Tool selection is routed into tutorial state, and the toolbox is returned to its original parent and selection display on exit or return to the catalog. Tutorial tool names are available for instruction without changing the player’s saved name-visibility settings. Ranked recording remains isolated. Temporary tool execution restores the workshop's globals in `finally` and suppresses ordinary rendering and ranked recording. No tutorial geometry, statement, or completion flag is saved into a proposition. Successful examples schedule advancement with `setTimeout(..., 500)`. Retry, catalog navigation, manual Next, dialog exit (including Escape), and starting another example cancel the pending timer. Finishing the last example returns to the catalog after the same delay.

The arcade menu now offers Play and Tutorial in place of Continue / Load game / Save game / New game. Automatic practice persistence remains. The retired file/save-point UI has been removed; compatibility validation helpers remain for local-data regressions. Existing browser progress and historical checkpoint data are not erased.

The terminology follows [Euclid's triangle classifications](https://mathcs.clarku.edu/~djoyce/elements/bookI/defI20.html), [the common notions](https://mathcs.clarku.edu/~djoyce/elements/bookI/cn.html), and [the Book II definitions](https://mathcs.clarku.edu/~djoyce/elements/bookII/defII.html). In particular, Euclid's wording of isosceles uses exactly two equal sides, and his gnomon includes a diagonal parallelogram and both complements, not an arbitrary L shape.

## Verification

`python tests/run-firefox-entry-checks.py --suite tutorial --width 390 --height 844` exercises every example, checks all formal proof contexts, rejects actions before tool selection and wrong references, verifies isolation and completion storage, checks the half-second advancement and timer cancellation, and uses native browser taps to open the real bottom menu, scroll to/select a tool, justify a proof line, and exit. Repeat at `--width 1280 --height 800` for desktop. Screenshots are written under the ignored `.browser-check-release/` directory.

The existing entry/reload and Book I suites cover the simplified menu and surviving autosave compatibility. No mathematical rules or course-version fingerprint were changed for this feature.

## Manual E2.14 check

`python tests/run-firefox-entry-checks.py --suite semicircle --width 390 --height 844` performs the entire E2.14 construction using native Firefox menu clicks and pointer actions. No supplied construction or Learning-mode action is invoked. It selects the semicircle tool and clicks M, E, L, I; extends HI; marks N on the recorded arc; joins MN; and constructs the final square. It checks the arc and intersection records and validates the source proof against the manually produced construction. Repeat with `--width 900 --height 800` for desktop.

The semicircle tool itself passed this manual-input check. The actual defect was in `bookOneHint`: output-free tasks were only handled for joining, extending, and circle drawing, so the semicircle task was silently skipped. The fallback now describes every output-free construction task and lists its inputs in order. Both Learning-mode guidance and the normal hint dialog are checked at that point. No mathematical rules or construction provenance requirements changed.
