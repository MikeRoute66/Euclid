# Books II and III implementation

The target is all 99 propositions, with Euclid's constructions, proof routes,
justifications, cases, and corollaries. Book II ships as a complete book before
Book III. Unfinished lessons must not appear as public stages.

## Current state

- The working tree installs 48 Book I and 14 Book II lessons (62 stages).
  Book II passed all 224 practice-mode cases against one unchanged source
  fingerprint, plus Book I, visual, save, and compact viewport checks. Results
  are recorded in `book2-validation.json`. Book III has no implemented lessons yet.
- Book-qualified presentation: E1.1, E2.1, E3.1. Definitions have qualified public
  identities, with legacy Book I references adapted to its existing calculus.
- Version 2 exports and autosaves use stable `book.proposition` progress keys,
  qualified proof references and theorem certificates. Version 1 imports remain
  supported. Manual/practice proof and construction backups are migrated too.
- Typed length products share area dimension with squares and polygon areas.
  `rectangle contained by AB and CD` and `AB*CD` parse identically. The rectangle
  definition requires drawn sides, established parallels, a right angle, and
  proved side substitutions. Product terms highlight the actual rectangles whose
  areas have been established equal to those products. Coordinate measurements
  never establish equality.
- Authored initial incidence can be supplied per lesson; it no longer requires
  editing the Book I layout-number table for new lessons.
- Navigation and source links follow the selected book. Book selection appears
  when multiple books are installed; the proposition selector lists that book.

The internal Book I calculus still uses legacy `I1`–`I48` references and numeric
construction certificate rules. `EuclidBooks` is their persistence/presentation
adapter. New theorem rules must use book-qualified identities and explicit
cross-book ordering rather than extracting a number from a string.

## Source review

`books-2-3-sources.json` indexes proposition paragraph locations, mathematical
labels, attached proposition references, and the presence of separate corollaries for all 51 new propositions.
The importer excludes the modern Guide commentary. Refresh explicitly with
`python tests/import-euclid-sources.py`; network access is not part of regression
tests. An entry marked pending is not a verified lesson or a grader rule.

Lessons E2.1-E2.8 use the original area partitions. E2.9-E2.10 use the source right-triangle arguments, and E2.11-E2.13 use their source division and perpendicular constructions. Additional explicit
parallel-transitivity and right-angle lines expand reasoning left implicit in
the source. They do not replace its area arguments with algebraic expansions.
Point names differ where auxiliary ray points consume automatic labels. In
E2.1 the source's isolated length A is represented by the segment AX.

## Next implementation work

1. Book II is complete: all fourteen lessons, E2.11/E2.14 reusable tools, and
   selected semicircles passed the release audit. Preserve this regression
   baseline while adding Book III. E2.13 keeps its original acute-triangle scope.
2. Book I compatibility and save migration passed. Keep existing save points
   and lesson progress readable throughout future book releases.
3. Add Book III circle identities, unknown centers, arc identities, cyclic order,
   tangency and contact, circular segments/sectors, and curvilinear angles.
   Keep drawing parameters separate from mathematical knowledge of a center.
4. Implement and source-audit all 37 Book III lessons and their earlier-theorem
   construction tools. E3.16/E3.31 curved-angle claims must not become ordinary
   numerical angle claims. Hypothetical geometry stays scoped to contradictions.
5. Complete both books' neutral format help, grammar documentation, geometry
   highlighting, compact reference grouping, and final release documentation.

## Book III implementation order

Implement the following groups in proposition order. They are development
milestones; publish Book III only when the whole book passes its release gates.

| Propositions | Main work |
| --- | --- |
| E3.1-E3.10 | Find an unknown center; chords, perpendiculars, distance comparisons, and limits on circle intersections. |
| E3.11-E3.19 | Internal/external circle contact, chord distances, tangents, and the special curved-angle claims in E3.16. |
| E3.20-E3.26 | Central and inscribed angles, cyclic quadrilaterals, circular segments, and reconstructing a circle from a segment. |
| E3.27-E3.34 | Equal arcs/chords/angles, arc bisection, semicircle cases, tangent-chord angles, and constructing circular segments. |
| E3.35-E3.37 | Products of intersecting chord/secant segments, tangent-square identities, and the converse tangent construction. |

Before writing each group, extract every source case, converse, corollary,
auxiliary construction, and earlier dependency. Keep temporary assumptions
inside contradiction proofs scoped: they must not become permanent facts.
Implement reusable construction tools when their propositions become available,
especially E3.1, E3.17, E3.25, E3.30, E3.33, and E3.34.

## Shared model and interface requirements

- Use E1.1, E2.1, and E3.1 throughout navigation, justifications, saves, and
  reference dialogs. Group definitions by book; keep postulates and common
  notions shared. A theorem can only use earlier propositions.
- Give circles stable identities independent of named centers. Hidden drawing
  parameters must never establish that a point is the center. Record membership,
  diameter, arc choice/order, contact, and sidedness as mathematical evidence.
- Represent circular segments, sectors, and curved angles explicitly. Distinguish
  a circular segment from a straight segment and an angle of a segment from an
  angle in a segment. Do not model a curved angle as a numeric zero-degree angle.
- Extend the typed statement language and neutral format help for these objects.
  Reject unsupported conclusions even when they match a lesson's target.
- Derive Learning mode, current-step hints, automatic proof entry, and automatic
  justification from the same reviewed route, while testing them independently
  against Euclid. Keep hints short and omit tool index answers.
- Preserve the compact, scrolling-free layout and collapsed tool palettes. New
  figures must support readable labels, colored proof angles/color aliases,
  and temporary 110% hover highlighting. Full arguments stay on right-click.

## Acceptance and release sequence

1. Source audit: compare each proof and justification with Euclid independently
   of the app's grader. Document expanded implicit steps and textual differences.
2. Rule tests: use arbitrary labels and unrelated diagrams; remove premises or
   construction records; move drawing coordinates; try incorrect references,
   future theorems, and circular evidence. The results must remain logical.
3. Interaction tests: enter/edit/delete actual proof lines, assign manual
   justifications, complete constructions with mouse/touch input, and verify
   hints advance only when their required work is complete.
4. Practice matrix: all eight skip-toggle combinations with Learning on/off:
   224 Book II cases and 592 Book III cases. Automatic proof remains visible;
   skipping proof still requires justifications unless that toggle is off too.
5. Persistence/UI: round-trip old and new saves, preserve named save points,
   navigate between books, inspect dialogs/menus, and check compact viewports.
6. Regression and deployment: rerun Book I, freeze the tested source revision,
   commit and deploy a complete book to GitHub Pages, then check the live site.

Completion means 99 playable propositions, all 13 new definitions, reviewed
source routes, validated reusable tools, and the complete regression evidence.
Do not equate a successful automatic playthrough with a faithful proof.

Sources: [Book II](https://mathcs.clarku.edu/~djoyce/elements/bookII/bookII.html)
and [Book III](https://mathcs.clarku.edu/~djoyce/elements/bookIII/bookIII.html).

## Release gates

Every new proposition must pass all eight skip-toggle combinations with Learning
mode both on and off, real form entry/manual justification, source-aligned auto
justification, current-step hints, save round trips, and viewport checks. Include
missing-premise/record and wrong-reference negatives plus invariance under moved
display coordinates. Book I regressions must continue to pass. Recheck touch and
trackpad input, imports of older saves, right-click arguments, named color aliases,
and 10% hover highlighting for every new geometry type.

Do not publish a book based solely on its grader accepting its own teaching data.
Source review and negative inference tests are separate requirements.

## Diagram-label correction in E2.8

The Joyce diagram places Q on the left boundary and O on the diagonal at the
second horizontal. Its proof requires Q at the diagonal intersection: QR and RP
are the equal adjacent widths, and MQ and QL are complements. The lesson follows
those geometric roles with its own consistent labels. Its eight regions are
compared by equal-base parallelograms and diagonal complements, as in the proof.
Source: https://mathcs.clarku.edu/~djoyce/elements/bookII/propII8.html

The books test runner accepts `--lesson 56 --mask 0` to check one practice-toggle
combination with both Learning settings. This allows the longer source proofs to
be tested in separate browser processes; all eight masks remain required.

## New inference checks

Gnomons use six boundary vertices. The definition verifies the enclosing
parallelogram, the removed corner parallelogram, and the recorded diagonal
through the inner corner. A missing diagonal or scrambled perimeter is rejected.
E1.34 now resolves angle ray points through recorded incidence instead of
requiring every named point to be a parallelogram corner. Opposite-ray
substitution is covered by a negative test.

E2.9 and E2.10 follow the right-triangle and Pythagorean routes. E2.10 includes
an explicit interior-angle inequality and a P5 intersection statement. Removing
the angle bound prevents P5 from justifying an already drawn intersection.

For long lessons, `--learning 0` or `--learning 1` selects one Learning setting.
The default books suite now splits each lesson into separate browsers for every
mask and Learning setting; all sixteen settings remain part of the suite.

## E2.11 construction details

The auxiliary square uses an authored `toward` point to choose its side.
This affects placement only; its certificate remains the ordinary validated
square construction. The vertex on AB is established from two perpendiculars
at A using a general E1.14 consequence, rather than inferred from pixels.
The proof retains E2.6, E1.47, and subtraction of the common rectangle.

## Source scope of E2.13

The Heath text enunciates an acute-angled triangle and demonstrates the internal
foot case. The lesson retains all three acute-angle hypotheses. The theorem
checker requires those established hypotheses and a recorded perpendicular.
It does not silently attribute the wider acute-angle generalization (including
an obtuse opposite base angle or a right triangle) to this literal proposition.
Primary text: https://www.maths.tcd.ie/~dwilkins/Euclid/Elements_Heath1925/BooksItoIV_PDF/EuclidElementsBookIIPropositions.pdf

## Grading performance

Linear inference separates magnitude dimensions. Repeated grading restores
computed flags, and append-only manual and automatic proof work reuses its validated prefix when the
construction, lesson, and installed references are unchanged. Changes to an
accepted line or construction evidence rebuild the context. Regression tests
cover changed justifications, restored invalid suffixes, tampered validity
flags, externally modified contexts, and removal of essential construction records. Hints reuse the validated
context instead of creating one for every expected line.
