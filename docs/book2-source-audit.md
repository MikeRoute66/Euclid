# Book II source audit

Reviewed against [Heath's Book II, transcribed by Wilkins](https://www.maths.tcd.ie/~dwilkins/Euclid/Elements_Heath1925/BooksItoIV_PDF/EuclidElementsBookIIPropositions.pdf)
and the linked Joyce proposition pages in the lesson data. This review compares
the constructions and argument order; acceptance by the grader is a separate
check. Labels change when the interactive tools create auxiliary ray points.

| Lesson | Source argument preserved | Formal elaboration |
| --- | --- | --- |
| E2.1 | Raise and cut a perpendicular; draw parallels; partition one rectangle into three; identify products. | The isolated given length becomes AX. Parallel transitivity, right angles, and each area substitution are explicit. |
| E2.2 | Split the square on the whole into two rectangles; identify their adjacent sides. | The square properties and area substitutions are posted separately. |
| E2.3 | Construct the square on one part; extend it to a rectangle on the whole; add its two pieces. | The two product identifications remain separate from area addition. |
| E2.4 | Use the diagonal, parallel angles, isosceles angles and their converse; establish the smaller squares; equate complements; add four areas. | Opposite-side and right-angle facts implicit in the second small square are expanded. |
| E2.5 | Equate complements, add the same corner, compare equal-base parallelograms, identify the gnomon, then restore the missing square. | The diagonal square's equal lengths and the missing square's sides are proved explicitly. |
| E2.6 | Compare equal-base parallelograms, equate complements, add the common region, identify the gnomon, and restore the square on the half. | The external-cut configuration remains distinct from E2.5. |
| E2.7 | Add the same small square to equal complements; obtain two equal rectangles; double one; add the other small square. | Earlier diagonal-partition side/angle lemmas are expanded before the new area argument. The result is not obtained by expanding a polynomial. |
| E2.8 | Extend by a copy of the selected part; use two groups of four equal areas, equal-base comparisons and complements; identify the gnomon; add the missing square. | Equal side/row lengths are expanded from diagonal-partition lemmas. The two groups of four are retained. |
| E2.9 | Construct the half-length perpendicular and parallels; establish the half-right angles and isosceles triangles; compare the two Pythagorean expressions. | Halving equal angles and substituting equal square magnitudes use explicit arithmetic deductions. |
| E2.10 | Establish the interior-angle bound and invoke the fifth postulate; use vertical/parallel angles and the two Pythagorean expressions. | The intersection is not justified by its appearance. Opposite angles may be named using further points on their recorded rays. |
| E2.11 | Construct the two squares and midpoint; apply E2.6 and E1.47; cancel the common squared length; remove a common rectangle. | Perpendicular uniqueness from E1.14 establishes the cut point on the given line. The auxiliary square is placed toward that line. |
| E2.12 | Extend the side, drop the perpendicular, apply E2.4, add the perpendicular's square, and substitute the two E1.47 identities. | The final equality states the exact excess by twice the rectangle. |
| E2.13 | For an acute triangle, drop the internal perpendicular; apply E2.7, add its square, and substitute the two E1.47 identities. | All three acute-angle hypotheses are visible. Broader acute-angle variants are not silently assigned this proposition as their justification. |
| E2.14 | Reduce the figure to a rectangle; copy the short side beyond the long side; bisect; describe the semicircle; use E2.5 and E1.47; cancel and construct the final square. | The circle is first drawn as a carrier, then its selected semicircle is recorded. Radii depend on the arc's diameter and intersection records. |

The ordinary E2.14 route uses the E1.45 tool's 2:1 rectangle, so the source's
already-square preliminary rectangle does not occur in this construction
strategy. Choosing that nonsquare rectangle is valid for every positive given
area. The reusable E2.14 tool also accepts an already-square input, triangles,
and simple nonconvex polygons; it rejects crossing and degenerate boundaries.

The workshop relabels E2.8 because its construction tools introduce auxiliary
points. Joyce's diagram is consistent: O is the left endpoint of the lower
internal horizontal, and Q is its intersection with the diagonal. An earlier
version of this audit incorrectly claimed those labels were inconsistent.
Several transcription slips in the Heath PDF are resolved from the surrounding
argument, including the repeated half-angle name in E2.9 and the equal-square
sentence in E2.10. The posted equations use the equal perpendicular leg, not the
hypotenuse, in the latter sentence.

The source index's dependency checks ensure that each explicitly cited earlier
proposition appears in the teaching route or construction. They do not replace
this argument review. Domain rules remain trusted Euclidean schemas rather than
a foundational machine formalization of the entire text.

See the [long-proof comparison](book2-long-proofs-review.md) for the detailed
review of E2.4–E2.10, including source-to-workshop label mappings and the reason
the workshop requires more individual proof lines.
