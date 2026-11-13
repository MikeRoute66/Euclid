# Tutorial coverage

The tutorial currently has 28 practical lessons. Each lesson performs a supported construction or justifies a formal proof statement. Foundational vocabulary stays in the reference menus; it no longer receives an exercise merely to cover every definition. In particular, point marking remains because it records incidence, whereas clicking a surface, identifying an endpoint, locating an already specified center, and classifying a pictured figure have been removed.

Every lesson uses the actual bottom reference menus. Correct completion advances after 500 ms. Different intersections or kinds of magnitude do not create extra lessons. Separate lessons remain for different operations or logical directions, such as establishing an equilateral triangle versus using its equal sides, or physically superposing triangles versus applying coincidence in a proof.

| References | Practical actions |
| --- | --- |
| D1 | Mark an intersection and record its membership |
| D10 | Justify perpendicular lines or a right angle |
| D15 | Justify equality of recorded radii |
| D18 | Construct a semicircle using center, diameter endpoints, and side marker |
| D20 | Establish an equilateral triangle; use its equal sides |
| D22 | Establish a square; use its equal sides and right angles |
| D23 | Justify parallelism when naming segments on established parallel supports |
| P1-P4 | Join, extend, draw a circle, compare established right angles |
| P5 | Justify that lines meet; use the alternate-angle argument for parallels |
| CN1 | Justify transitive equality |
| CN2 | Express a whole as adjacent parts; add equal magnitudes; preserve an inequality under addition |
| CN3 | Subtract equal magnitudes |
| CN4 | Superpose triangles; justify coincidence; use corresponding coincident parts |
| CN5 | Justify a whole being greater than a proper part |
| D2.1 | Express a rectangle by its containing sides |
| D2.2 | Justify a gnomon from its recorded diagonal and partition |

All 25 definitions remain available in the menus, including those without a tutorial exercise. Stable IDs preserve completion for retained lessons; retired IDs are filtered out, and an unavailable resume target moves to an available lesson. Old proposition progress is untouched.

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
