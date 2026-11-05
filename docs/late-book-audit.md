# E.38-E.48: source and practice-mode audit

Scope: E.38 through E.48 inclusive (eleven propositions). Compare arguments with Euclid, not merely with the app's existing answer recipes.

## Reproducible checks

```
python tests/run-browser-checks.py
python tests/run-browser-checks.py --suite late
python tests/run-browser-checks.py --suite late --phase construction
python tests/run-browser-checks.py --suite late --lesson 47 --width 820 --height 640
```

The late-book mode suite covers all eight combinations of Skip construction, Skip proof, and Skip justifications, with Learning mode both off and on: 176 full mode cases. Each checks hypotheses, proof visibility, completion, source labels, hint stability, save/load, and the viewport. Manually entered false statements must fail, and automatic feedback must never ask for a manual reference.

It also enters each proof through the actual input form with manual and automatic justifications, one line at a time with Learning mode enabled, then moves all display coordinates and rechecks the formal proof.

The construction phase executes the tools in each of the four modes requiring manual construction, with Learning mode both off and on: 88 additional construction cases. It checks current hints, selected intersections, completion and proof acceptance, then removes essential hypotheses or construction certificates. An unchanged-looking picture must not supply a missing premise.

## Findings and corrections

| Proposition | Source comparison and result |
| --- | --- |
| [E.38](https://mathcs.clarku.edu/~djoyce/elements/bookI/propI38.html) | The two completed parallelograms are equal by E.36, their diagonals give equal halves by E.34, and equal doubles give equal halves. Replaced the repeated whole-proof explanation with the particular completion, diagonal, doubling, or cancellation needed now. Completing the second parallelogram on the reflected side is an equivalent variant of Euclid's completion. |
| [E.39](https://mathcs.clarku.edu/~djoyce/elements/bookI/propI39.html) | Retained the comparison-parallel and proper-part contradiction using E.37. Clarified that the replacement vertex exists only under the temporary contrary assumption. Removing the equal-area premise must fail. |
| [E.40](https://mathcs.clarku.edu/~djoyce/elements/bookI/propI40.html) | Retained the corresponding contradiction using E.38. The app explicitly requires collinear equal bases and a common side of that line. Clarified the hypothetical triangle; removing equal bases must fail. |
| [E.41](https://mathcs.clarku.edu/~djoyce/elements/bookI/propI41.html) | Verified the actual diagonal half and the same-base triangle equality, followed by doubling/substitution. Guidance now distinguishes those operations. Labels/base orientation differ from the source; the argument is the same. |
| [E.42](https://mathcs.clarku.edu/~djoyce/elements/bookI/propI42.html) | The midpoint, copied angle, common parallels, equal-base triangles (E.38), and double-area comparison (E.41) are explicit. Guidance uses the recorded equal bases and constructed parallel, instead of an unproved measurement of altitude. |
| [E.43](https://mathcs.clarku.edu/~djoyce/elements/bookI/propI43.html) | Verified the outer diagonal halves and the two pairs of inner halves. Replaced the same subtraction story at every line with the actual pair currently subtracted. |
| [E.44](https://mathcs.clarku.edu/~djoyce/elements/bookI/propI44.html) | Added the missing extensions of JI, LA, and KB. Added the E.29 supplementary-angle sum, strict proper-part comparison, substitution, and fifth-postulate meeting step. The enclosing figure is MJNP and its diagonal is MN, not MB. MB is a segment of that diagonal. Only after those checks does the complement argument use E.43. |
| [E.45](https://mathcs.clarku.edu/~djoyce/elements/bookI/propI45.html) | The default construction now starts with the free E.42 parallelogram, then applies E.44 to its opposite side. Kept explicit E.29/E.14 alignments and added Euclid's E.34 equal-side comparisons and E.33 endpoint joins before the outer parallelogram conclusion. Existing sound two-E.44 constructions remain supported. |
| [E.46](https://mathcs.clarku.edu/~djoyce/elements/bookI/propI46.html) | Verified all four equal sides and all four right angles before the square definition. Guidance now explains the specific opposite-angle substitution or subtraction. The app transfers the length with E.2 on the perpendicular ray instead of Euclid's E.3 cutoff; this is a valid earlier construction, not an assumption that one right corner defines a square. |
| [E.47](https://mathcs.clarku.edu/~djoyce/elements/bookI/propI47.html) | Verified both E.14 alignments, the two correctly matched SAS comparisons, all four common-base/common-parallel double-area applications, the rectangle sum, and square-area notation. Each area comparison now names its actual common base and the proved alignment that puts the triangle vertex on the opposite parallel. |
| [E.48](https://mathcs.clarku.edu/~djoyce/elements/bookI/propI48.html) | Found a genuine missing-premise acceptance: marking F on the auxiliary perpendicular/circle also recorded its accidental screen alignment with original AB. That exposed the original right angle without its hypothesis. Intersection records now retain only the selected supports, and legacy extra incidences are removed. Removing the Pythagorean premise now fails. Guidance separately explains the auxiliary square identity, equal squares, nonnegative roots, SSS, and final angle substitution. The extra length-copy/circle steps implement the same equal-leg comparison as Euclid. |

## Shared fixes

- [Definition 22](https://mathcs.clarku.edu/~djoyce/elements/bookI/defI22.html) is restricted to its actual square properties. Identifying a general parallelogram from opposite parallel pairs is an explicit deduction, not a fabricated numbered definition. This correction applies to every lesson, not only the late-book guides.
- Elementary cancellation, square-area notation, squaring equal lengths, and substitution into an established right angle use the posted premises directly instead of re-running a whole geometric theorem. E.48 explicitly posts the equal leg squares and their equal sums before comparing hypotenuses.
- A marked intersection carries its selected line/circle supports. It does not add incidence with unrelated objects at the same displayed coordinates. Saved guided intersections recover their intended supports from existing construction records and lose legacy incidental line memberships. This repair uses no display measurements in the grader.
- Supplementary/strict angle comparisons are formal deductions from posted premises and recorded ray order. The fifth-postulate meeting rule requires the proved strict interior-angle sum and the recorded intersection on the correct side; it cannot cite mere screen intersection as proof.
- Joining an E.42 parallelogram to an E.44 application must prove the same outer alignments as joining two E.44 applications. The structural legacy-alignment filter now handles both patterns.
- Shared-edge cancellation and zero-area collinear triangles are checked as formal oriented-area identities, without metric-coordinate solving. Incidence closure is cached against the recorded construction and accepted proof steps. Strict self-comparisons are rejected immediately.
- Automatic proof results are cached by all proof inputs, lesson data, geometry records, and topology. Repeated guidance/rendering reuses the same validated result; changes to premises or construction invalidate it. The cache is not saved and supplies no mathematical premises.
- Right-click inspection retains the full arguments. Source labels, manual references, and automatic references remain subject to the same validation.

## Save behavior

Existing manual work is retained. E.45 accepts the older two-E.44 construction certificates as an alternative to the new default. Supplied proofs synchronize to the corrected steps. Supplied drawings missing the newly explicit extensions are regenerated while retaining their manual backup. Older manual E.44 drawings with otherwise correct geometry need the additional extensions; the earlier inward E.44 layout still requires undoing/restarting that construction. A proof relying on an accidental extra incidence may need a valid deduction in its place. Older manual parallelogram lines citing Definition 22 should be rejustified with Deduction; the statements and manual choices are retained for review.

## Validation result

All 176 mode cases and all 88 manual-construction cases passed, together with the complete 48-proposition browser/logic regressions. The E.47 mode matrix also passed at an 820 by 640 window size. E.44/E.45 drawings were inspected visually, including separation of the given figure from the constructed result in E.45.
