# Book I proof/construction audit

The construction is the actual diagram. Points introduced only under a temporary, ultimately rejected assumption do not belong to it. They must not supply permanent incidence, metric, or congruence facts. The current proof language checks contradiction arguments as derived rules; it does not expose editable assumption blocks.

E.27 is the clearest example: an assumed meeting point X of the two lines would form triangle XGH. The given alternate-angle equality contradicts the exterior-angle theorem in that triangle. The meeting assumption is rejected on both sides. X cannot be constructed consistently with the hypotheses. Guidance and proof inspection now explicitly identify the hypothetical scope; the grader rejects statements naming X as an actual point.

## Findings across all 48 propositions

| Propositions | Audit result |
| --- | --- |
| E.1-5 | Existing circles, intersections, copied lengths, equal extensions, and superposition already supply the proof figures. |
| E.6 | The cut-off subtriangle exists only under the false unequal-side assumption. Clarified its hypothetical scope. |
| E.7 | Added CD between the two proposed apices; the distinct-apex assumption is explicitly temporary. |
| E.8 | No missing actual figure. The superposition/alternative-apex argument is hypothetical. |
| E.9-12 | Existing bisector, midpoint, perpendicular, and circle records supply all proof figures. |
| E.13 | Added the perpendicular CE used to divide the straight angle. |
| E.14 | Added the extension of AC used in the straight-angle comparison. |
| E.15 | Both intersecting lines and their intersection are already given. |
| E.16 | Added both midpoints, median extensions, equal-radius intersections, joining lines, and the extension of AC used by the exterior-angle proof. |
| E.17 | Uses the exterior-angle result as an earlier theorem; no need to repeat its auxiliary construction. |
| E.18 | Added AD cut equal to AB and the join BD. |
| E.19 | Equal/shorter-side alternatives are temporary assumptions; no actual auxiliary figure. |
| E.20 | Added the extensions, circle intersections, and joins for each of the three inequalities. |
| E.21 | Added the extension of BD and its intersection E with AC. |
| E.22-23 | Existing circle intersections and copied-angle triangle already supply the proof figures. |
| E.24 | Added the copied interior ray, copied radius, circle intersection, and joins BI and CI. Adjusted the initial diagram so the copied smaller angle visibly lies inside the larger angle. |
| E.25-26 | Unequal-angle/unequal-side alternatives are hypothetical; existing triangles supply the actual figure. |
| E.27 | The meeting-point triangle is hypothetical; clarified guidance and inspected argument. No actual intersection is required. |
| E.28-30 | Existing transversals/parallel lines suffice. E.29's assumed intersection is hypothetical. |
| E.31-34 | Existing constructed parallel, joins, and diagonals supply the proof figures. |
| E.35 | Corrected the explanation to use the end triangles ADF and BCE, whose sides are already present, rather than wrongly named triangles. |
| E.36 | Added AH and BG to form connecting parallelogram ABGH. |
| E.37 | Added the parallels, intersections, and joins completing ABCF and ABDH. |
| E.38 | Added the parallels, intersections, and joins completing BCAH and EFDJ. |
| E.39-40 | Added the actual comparison parallel. Distinguished the contradiction-only replacement intersection/triangle from that actual line. |
| E.41 | Added diagonal AC. |
| E.42 | Added AG, needed for the half-triangle area comparison. |
| E.43-46 | Required diagonals, complement figures, and adjoining parallelograms already exist in the given figure or construction steps. |
| E.47 | Added the parallel partition, its intersections with the opposite square sides, and AE, CF, AD, BH for both triangle comparisons. |
| E.48 | Added the perpendicular, copied length, recorded circle intersection F, and CF, forming actual right triangle FAC. |

The comparison proofs in E.16, E.18, E.24, and E.48 now expose their auxiliary equalities, angle comparisons, or triangle congruences as proof lines. E.48 explicitly establishes equal squares before applying the nonnegative-root rule for segment lengths.

## Enforcement and verification

Lessons with newly required actual auxiliaries require complete construction records before their compound deductions or completion are accepted. Intersection requirements check recorded line/circle incidence and, where needed, which extension or segment contains the point. An existing point with the expected letter alone is insufficient. Hints use those same checks, rather than skipping a construction merely because its output point exists.

The supplied-construction practice mode executes the same tools and intersection tasks. Hypothetical objects are never supplied as actual geometry. Existing save data is retained; older proofs with missing real auxiliaries require those steps when revisited.

Browser regressions exercise every proposition's actual construction and proof, automatic construction and justification modes, independence from displayed coordinates, rejection of missing auxiliary records, and non-leakage of E.27's hypothetical point.

## Primary references checked

- [Euclid E.27](https://mathcs.clarku.edu/~djoyce/elements/bookI/propI27.html): the meeting point is introduced under the negation of the conclusion.
- [Euclid E.16](https://mathcs.clarku.edu/~djoyce/elements/bookI/propI16.html): actual midpoint, equal extension, and joins are required.
- [Euclid E.48](https://mathcs.clarku.edu/~djoyce/elements/bookI/propI48.html): an actual perpendicular equal to the given side and its joining line form the comparison triangle.
