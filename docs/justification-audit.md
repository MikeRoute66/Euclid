# Justification provenance and named-rule audit

## Automatic selection

The automatic checker prefers hypotheses and matching recorded construction propositions, then the proposition responsible for an earlier triangle congruence, then applicable earlier propositions, definitions/common notions, and explicit deduction. Every candidate is checked against the current construction and preceding accepted proof lines. The teaching route may nominate a source for an equivalent expected statement, but the formal checker independently validates it; the route supplies no premises.

E.45 now cites E.42 for the first constructed component and E.44 for the adjoining application, then explicitly uses E.29/E.14 for both outer straight lines and E.34/E.30/E.33 for equal, parallel endpoint joins. Older valid two-E.44 drawings retain their original sources. Construction-source metadata is retained in manual and automatic grading and shown by right-click proof inspection. Manual answers remain separate from automatic answers when practice settings change.

Common Notion 1 now uses posted equality premises rather than silently importing unposted construction certificate equalities. Parallel-line transitivity is checked by E.30, not by Common Notion 1. E.44's supplied proof explicitly posts its constructed angle equality before using equality transitivity. E.30 now includes its actual transversal and angle-based proof.

## Named rules

General symbolic algebra is reserved for the explicit Deduction rule and arithmetic decomposition in common notions. A named proposition must satisfy its own geometric conditions:

| Rule | Required conditions |
| --- | --- |
| E.27 | Drawn lines/transversal and an established alternate-angle equality. |
| E.28 | Established corresponding-angle equality or supplementary same-side interior angles. |
| E.29 / parallel postulate | Two distinct established parallels, a drawn transversal, and the appropriate angle orientation. |
| E.30 | Two established parallel pairs sharing a third distinct line. |
| E.32 | A proper drawn triangle and either its three-angle sum or its exterior-angle sum on a recorded extension. |
| E.33 | Equal parallel source segments, corresponding end direction, and drawn joining segments. |
| E.34 | Actual opposite sides/angles of a parallelogram, or its two triangle halves about a drawn diagonal. |
| E.35 / E.36 | Parallelograms on the same / equal collinear bases, with opposite bases on a common parallel line. |
| E.37 / E.38 | Triangles on the same / equal collinear bases and apices on a common parallel. |
| E.39 / E.40 | Posted triangle area equality, same / equal collinear bases, and apices on the same side. |
| E.41 | A 2:1 area relation, a shared base, and the triangle apex on the parallelogram's opposite parallel. |
| E.43 | Actual complement parallelograms about one drawn diagonal, verified through recorded incidences and the enclosing parallelogram. |
| E.47 | Three squared side terms in the Pythagorean arrangement and an already established right angle in the proper triangle. |
| E.48 | A proper triangle and a previously established Pythagorean square identity. |

Construction propositions remain tied to their matching operation certificates. Exterior-angle, side/angle-order, hinge, straight-line, and triangle-angle-bound predicates also validate their coefficients. Derived proofs record earlier-proposition dependencies; generic symbolic deductions retain their construction and earlier-proof proposition sources.

## Verification

Browser regressions check positive and negative applications, including true statements that must be rejected under an unrelated theorem. E.45's construction sources and its essential E.29, E.14, and E.30 references are asserted. All 48 supplied constructions and proof guides, automatic justifications, practice-mode combinations, save/load restoration, and independence from moved display coordinates are exercised by the integration suite.

Primary statements were checked against the Clark University edition of Euclid's Elements, Book I, especially [E.33](https://mathcs.clarku.edu/~djoyce/elements/bookI/propI33.html), [E.35](https://mathcs.clarku.edu/~djoyce/elements/bookI/propI35.html), [E.38](https://mathcs.clarku.edu/~djoyce/elements/bookI/propI38.html), [E.41](https://mathcs.clarku.edu/~djoyce/elements/bookI/propI41.html), and [E.43](https://mathcs.clarku.edu/~djoyce/elements/bookI/propI43.html).

The construction-consequence audit in [construction-consequences-audit.md](construction-consequences-audit.md) documents the removal of automatically inferred alignment/transitivity and the expanded proof steps across the area and square propositions.


## Named sources for compound arguments

Validated compound arguments accept an earlier proposition explicitly used in their derivation as the manual reference. Automatic justification selects a validated named source when available; the complete argument stays in right-click proof inspection. A proposition mentioned only in a generic symbolic constraint set is not sufficient for this alias. Current and future propositions remain unavailable, and every premise and construction prerequisite is still checked.

E.27 now names and accepts E.16 for its contradiction argument. E.28's vertical-angle step uses E.15. Known given-line incidences are restored from the lesson in older topology records, so missing saved intersection records do not block that step. No new incidence is inferred from display coordinates.

## Guidance respects automatic justifications

Learning mode and the hint button previously called the manual grader while generating Book I guidance. That overwrote valid automatic results on manually entered proof lines whose manual reference remained empty. Guidance now uses the same automatic/manual grading selection as the active practice mode. The regression submits `angle EGB = Angle AGH` through the E.28 form with Learning mode and Skip justifications enabled, requests another hint, and verifies E.15 remains valid and visible.

The later [E.38-E.48 source and mode audit](late-book-audit.md) adds the complete practice matrix, selected-support intersection records, and the repaired E.48 missing-premise case.

The [E1?E40 source audit](source-book-audit.md) documents the restored argument sequences and stricter distinction between vertical-angle equality, substitution, and closed contradiction arguments.
