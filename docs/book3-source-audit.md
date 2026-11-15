# Book III: propositions 1-7

This release installs a reviewed prefix of seven propositions. E3.8-37 are not exposed. It adds 11 readable Book III definitions, named given circles, the reusable E3.1 center tool, conditional proof clauses, and 69 total playable stages. Existing Book I/II records and reference identities stay compatible.

## Comparison with Euclid

| Proposition | Source route retained | Explicit details / label changes |
| --- | --- | --- |
| [E3.1](https://mathcs.clarku.edu/~djoyce/elements/bookIII/propIII1.html) | Bisect a chord; raise its perpendicular; bisect the circle crossings. A proposed off-bisector center gives equal radii, SSS, equal adjacent angles, and an impossible equality of unequal angles. | The source's final midpoint F is H here. J is the proposed center. The corollary that the center lies on the bisector is a required proof line. The last line spells out why that center must be the diameter midpoint. |
| [E3.2](https://mathcs.clarku.edu/~djoyce/elements/bookIII/propIII2.html) | Assume an exterior chord point; find the center; use equal radii and base angles, the exterior-angle comparison, and angle-to-side order. This contradicts radius equality and whole/part order. | The source's brief circumference case is expanded into its own conditional argument. Both alternatives must fail before the open chord is declared inside. The impossible incidence is schematic and exists only in its conditional context. |
| [E3.3](https://mathcs.clarku.edu/~djoyce/elements/bookIII/propIII3.html) | Equal chord halves and radii give SSS and a perpendicular. Conversely, radii give equal base angles; right angles and common EF give equal halves by E1.26. | Each direction has a separate condition. The bisection premise from the first direction is unavailable in the converse. |
| [E3.4](https://mathcs.clarku.edu/~djoyce/elements/bookIII/propIII4.html) | Suppose both noncentral chords are bisected; join the intersection to the center; E3.3 makes two unequal nested angles right, a contradiction. | Noncentral chords and the intersection are formal given lines. P4 and CN5 are explicit intermediate justifications. |
| [E3.5](https://mathcs.clarku.edu/~djoyce/elements/bookIII/propIII5.html) | Suppose a common center; join a shared circle point and take an arbitrary transversal. The two circles' radii force a proper part to equal its whole. | The common points are A and C. F and G are recorded transversal crossings; proposed center E is hypothetical. |
| [E3.6](https://mathcs.clarku.edu/~djoyce/elements/bookIII/propIII6.html) | The same common-center contradiction for touching circles. | Internal contact is drawn. Proposed center F and crossing names G/H replace the source's F and E/B labeling. The touching hypothesis is recorded separately from cutting. |
| [E3.7](https://mathcs.clarku.edu/~djoyce/elements/bookIII/propIII7.html) | Triangle inequalities give the longest/shortest bounds; ordered central angles and E1.24 compare the other distances; copy an angle, then use SAS to obtain a second equal distance; strict ordering excludes a third. | The copied ray first creates H; its recorded circle crossing I is the source's H. K is the third candidate. Ordered central rays are explicit rather than relying on the ambiguous phrase “nearer to the diameter.” Both extreme claims and the uniqueness conclusion are goals. |

These are expanded Euclidean teaching routes, not literal transcriptions or foundational machine formalizations. The universal endpoint arguments and E3.1's reflected off-bisector case are trusted domain lemmas with explicit premises, earlier dependencies, and right-click outlines. They use neither lesson goals nor hint recipes as inference rules.

## Circle knowledge and assumptions

Given circles have stable identities C1/C2, recorded membership, and optional given diameters. Their plotting center/radius is separate from mathematical center knowledge. The renderer and intersection tools use plotting parameters; the proof checker uses records. A point located at the plotted center is not automatically a known center. E3.1 constructs a center from three recorded circle points and creates a theorem-bound operation record.

`If <condition> then <statement>` is an implication. The checker makes a private context for that condition, accepts compatible earlier clauses in the same context, and checks its conclusion using the usual earlier propositions and circle rules. No hypothetical equality, radius, center, or incidence is accepted into the ordinary context. `If ... then contradiction` requires independently established incompatible equalities/strict inequalities. Dashed auxiliaries and the given text identify schematic hypothetical geometry.

Circle membership requires an authored given or a selected `given:C1` intersection record. A point merely drawn near the circumference is insufficient. Reversed segment names/equality direction work within conditions. All givens are supplied in every mode. Automatic statements and justifications use the same checked route and references as manual play.

## Verification

- `deno run tests/book3-rule-tests.js`: all seven proofs, moved drawing coordinates, unknown-center negatives, wrong references, missing contradictions/center records/membership, conditional leakage, E3.3's independent converse, and E3.7's universal-bound and uniqueness prerequisites.
- `python tests/run-firefox-entry-checks.py --suite book3 --width 390 --height 844`: all 112 practice/learning combinations through the real form, proof-line handlers, and Learning-mode actions; source proof validation, saved-state round trips, and geometry independence. Repeat at 900 by 800 for desktop.
- `python tests/run-firefox-entry-checks.py --suite book3manual --lesson 1 --width 900 --height 800`: native pointer/menu construction of the unknown center, including both circle intersections.
- The same native driver with `--lesson 7 --width 390 --height 844` checks the copied angle on the opposite side, its nearby circle crossing, all construction records, and the full proof against that manual geometry.
- The ranked replay suite now covers all 69 source routes and their batched validation. Existing Book I, entry, tutorial, and Book II checks remain release regressions.

All browser artifacts and detailed logs are kept in the ignored `.browser-check-release` directory. Book III expands the rule/course fingerprint; deploy the matching server verifier before publishing the updated client.

The prior published Book I/II verifier version is `c3e34a3317fa7c6ecc4a`; the final release is `425a0109a59cda8e4cdd` (via staging verifier `c6a0e080afa595bb5c6f`). Old accepted Book I/II inferences remain accepted (the isosceles-angle rule additionally recognizes equivalent ray names). The compatibility migration moves only their already verified best-time rows to the new version, preserving times, players, achievement timestamps, and underlying attempt records. This prevents adding Book III from clearing the existing leaderboard view.

The point tool also registers an existing point on a named given circle. Merely copying a length to an endpoint that visually coincides with the circumference does not supply membership; explicitly marking that endpoint does. This parity has both a positive replay test and an unmarked-endpoint negative.
