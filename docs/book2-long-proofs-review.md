# Review of the longest Book II proofs

Reviewed the seven longest installed Book II teaching routes against Euclid's
arguments in Joyce's edition and Heath's translation. The comparison includes
constructions, intermediate figures, argument order, and cited propositions.
Line counts below include the automatically supplied hypotheses.

| Proposition | App lines | Comparison with Euclid |
| --- | ---: | --- |
| [E2.8](https://mathcs.clarku.edu/~djoyce/elements/bookII/propII8.html) | 64 | Preserves both groups of four equal regions, equal-base comparisons with E1.36, complements with E1.43, the gnomon, and restoration of the remaining square. Side equalities and arithmetic substitutions are expanded. |
| [E2.10](https://mathcs.clarku.edu/~djoyce/elements/bookII/propII10.html) | 60 | Preserves the interior-angle bound and Postulate 5, the vertical-angle step E1.15, the two isosceles-triangle arguments, and all four applications of E1.47. |
| [E2.9](https://mathcs.clarku.edu/~djoyce/elements/bookII/propII9.html) | 54 | Preserves the equal perpendicular, half-right angles, E1.6 side equalities, opposite-side substitution E1.34, and all four applications of E1.47. |
| [E2.7](https://mathcs.clarku.edu/~djoyce/elements/bookII/propII7.html) | 49 | Preserves equal complements, adding the same small square, doubling the resulting rectangle, identifying the gnomon, and adding the remaining square. It first repeats 27 supporting lines from the E2.4 diagram proof. |
| [E2.4](https://mathcs.clarku.edu/~djoyce/elements/bookII/propII4.html) | 39 | Preserves the diagonal/parallel angle comparison, E1.5 and E1.6, proof that the diagonal regions are squares, equal complements E1.43, and assembly of the four areas. The second small-square argument is written out. |
| [E2.5](https://mathcs.clarku.edu/~djoyce/elements/bookII/propII5.html) | 36 | Preserves complements E1.43, adding the common corner, equal-base comparison E1.36, the gnomon, and adding the missing square. The diagonal side-length lemma is established earlier than the source's use of it. |
| [E2.6](https://mathcs.clarku.edu/~djoyce/elements/bookII/propII6.html) | 31 | Preserves E1.36 followed by E1.43, adding the common rectangle, interpreting the gnomon, and restoring the square on the half. The implicit side-length and area-identification steps are explicit. |

## Findings

No change of the main geometric argument or missing essential cited theorem was
found in these seven routes. They are expanded formal teaching routes, not
line-for-line transcriptions. Some supporting lemmas are proved before Euclid
uses them, and arithmetic steps stated together in the text become separate
statements requiring individual justification.

The extra length is particularly noticeable in E2.7. Euclid reuses properties of
the square's diagonal partition. The app instead repeats the 27-line prelude
establishing the two smaller squares. The underlying result appears explicitly
as a corollary in some editions; [Mendell's translation and note](https://web.calstatela.edu/faculty/hmendel/Ancient%20Mathematics/Euclid/Euclid%20II/Euclid%202.4/Euclid.2.4.html)
distinguish its status as a scholion from its use in E2.5–8. Exposing that
construction-grounded result as a reusable corollary could shorten later routes.
The current extra derivation is mathematically legitimate. Simply deleting
those premises without supporting the corollary in the grader would leave gaps.

For E2.9 and E2.10, the longer proof is not caused by choosing a different method:
Euclid himself proves half-right angles and equal sides before comparing the
Pythagorean expressions. The app additionally posts angle sums, subtractions,
equal square magnitudes, doubling, and substitutions as separate lines. Its
`Logic` steps here express scalar consequences of established equalities; they
do not replace the geometric proof with an expansion of the final polynomial.

## Label correspondence

Auxiliary tool outputs consume letters, so different names alone do not signal a
different construction. A square is also drawn on the opposite side of the
given line, which is an equivalent reflection.

| Route | Euclid/Joyce labels | App labels |
| --- | --- | --- |
| E2.9 | E, F, G | F, H, J |
| E2.9 | Final comparison segment AF | AH |
| E2.10 | E, F, G | F, I, J |
| E2.10 | Final comparison segment AG | AJ |
| E2.8 | Extended endpoint D; lower-left corner E | E; G |
| E2.8 | G, K, M, N on the upper internal horizontal | T, O, Q, R |
| E2.8 | O, Q, R, P on the lower internal horizontal | K, I, U, L |
| E2.8 | H, L on the bottom side | M, S |

In E2.8, this sends Euclid's first four regions CK, KD, GR, RN to
CBOT, BERO, TOUI, ORLU. The second four regions AG, MQ, QL, RF become
ACTQ, QTIK, IUSM, ULFS. The restored corner OH becomes KIMG. Both groups of
four and the missing square therefore correspond to Euclid's actual dissection.
Joyce's O/Q placements are consistent with this mapping; the previous audit
note claiming otherwise has been corrected.

## Scope and validation

The comparison used the proposition texts and diagrams, and the corresponding
passages in [Heath's Book II, transcribed by Wilkins](https://www.maths.tcd.ie/~dwilkins/Euclid/Elements_Heath1925/BooksItoIV_PDF/EuclidElementsBookIIPropositions.pdf).
The two apparent slips in that transcription—the repeated half-angle label in
E2.9 and the initial equal-square sentence in E2.10—are resolved by their
surrounding arguments and Joyce's text. The app already uses the correct angles
and the square on the perpendicular leg in those places.

The seven construction/proof routes were also replayed through the independent
formal checker. That confirms their supported logical validity; it is separate
from, and does not substitute for, this source comparison. This review changes
documentation only. Expected proof steps, grading rules, guidance, and the
ranked course version are unchanged.
