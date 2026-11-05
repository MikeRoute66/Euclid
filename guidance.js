// Presentation labels deliberately leave saved rule identifiers unchanged.
function displayReference(text){return String(text??'').replace(/\bI\.?([0-9]+)\b/g,'E.$1')}
const LESSON_ARGUMENTS={
6:'Temporary assumption for contradiction. Suppose AB were longer than AC. Only under that assumption, a point X on AB could satisfy XB = AC. The hypothetical triangles XBC and ACB would have two equal sides and equal included angles, making a proper part equal to the whole. This is impossible. Interchanging AB and AC excludes the other inequality. These hypothetical points are local to the argument; do not add them to the actual diagram or cite them as established construction facts.',
7:'Join the proposed apices C and D in the construction. Under the temporary assumption that they are distinct, AC = AD makes ACD isosceles and BC = BD makes BCD isosceles. Their equal base angles, together with the same-side hypothesis, would make a whole angle equal to a proper part. This contradiction excludes distinct apices; the conclusion is C = D.',
16:'The construction bisects AC at E and records EF = EB using the circle centered at E, with B,E,F collinear. Equal vertical angles at E and the equal side pairs make ABE and CFE congruent, so angle ECF equals angle BAC. CF lies inside angle ACD, making the exterior angle greater. For the second comparison, BC is bisected at G and GH = GA is recorded by the circle centered at G. Triangles ABG and HCG give angle BCH = angle ABC. The extension of AC through C forms the vertical exterior angle containing BCH, so angle ACD is also greater than angle ABC.',
17:'The earlier line says angle ABC is smaller than angle ACD. Add angle ACB to both. The other earlier line identifies angle ACD + angle ACB as two right angles. Substitution gives the required strict inequality.',
18:'The construction cuts AD from AC with AD = AB and joins BD. Triangle ABD is isosceles, so angle ABD = angle BDA. In the constructed triangle BDC, angle BDA is an exterior angle and exceeds angle BCD, which is angle ACB. Since angle ABC contains angle ABD, angle ABC > angle ACB.',
19:'If AC = AB, the equal-base-angle property of an isosceles triangle would give angle ABC = angle ACB, contradicting the given strict inequality. If AC < AB, the greater-side comparison would give angle ABC < angle ACB, also a contradiction. The remaining possibility is AC > AB.',
20:'The construction includes all three comparisons. For AB + AC > BC, D lies beyond A on BA and the circle centered at A records AD = AC; CD is drawn. Isosceles triangle ACD gives angle ACD = angle CDA, and angle BCD is greater than angle BDC, hence BD > BC. Substitute BD = BA + AC. For AB + BC > AC, use E beyond B on CB with BE = BA and join AE. For AC + BC > AB, use F beyond C on AC with CF = CB and join BF. Apply the same isosceles-angle and greater-angle comparison to each recorded auxiliary triangle.',
21:'The construction extends BD to E on AC. In ABE, AB + AE > BE. Add EC and use BE = BD + DE and AC = AE + EC. In DEC, DE + EC > DC; combining gives AB + AC > BD + DC. For the angle comparison, the exterior angle BDC of DEC exceeds DEC, and the exterior angle DEC of ABE exceeds BAC. Combine these strict inequalities.',
24:'The construction copies angle EDF to ray AG inside BAC, transfers AC to AH, and records AI = AH = AC at the circle intersection I on AG. BI and CI are drawn. The two given side pairs and the copied included angle make ABI congruent to DEF, hence BI = EF. Triangle ACI is isosceles. Its base angles, the position of AI inside BAC, and the angle comparison in BCI give BC > BI. Substitute BI = EF.',
25:'The included angles cannot be equal: matching two sides and their included angle would imply BC = EF. The angle BAC cannot be smaller: the comparison of bases opposite unequal included angles with the two triangles interchanged would imply BC < EF. Both contradict BC > EF, leaving angle BAC > angle EDF.',
27:'Temporary assumption for contradiction: suppose AB and CD meet at a point X when extended on one side of GH. X is a hypothetical point, not a missing construction point. Triangle XGH would then have an exterior angle equal to an opposite interior angle, by the given alternate-angle equality. An exterior angle must be strictly greater, so that meeting is impossible. The same argument excludes a meeting on the other side. Therefore AB and CD never meet and are parallel. Do not try to mark X in the actual diagram; its existence is precisely what this argument disproves.',
36:'The construction joins AH and BG to form connecting parallelogram ABGH. It shares base AB and the same parallels with ABCD, and shares base GH and the same parallels with EFGH. Each original parallelogram therefore has the same area as ABGH, so their areas are equal.',
37:'The construction completes ABC to parallelogram ABCF and ABD to parallelogram ABDH. CF and DH lie on the line CD, parallel to AB. The parallelograms share base AB and lie between the same parallels, so their areas are equal. Each original triangle is half its corresponding constructed parallelogram. Halves of equal areas are equal.',
38:'The construction completes ABC to parallelogram BCAH and DEF to parallelogram EFDJ. Their bases BC and EF are equal, and their opposite sides AH and DJ lie on the line AD, parallel to the bases. The constructed parallelograms therefore have equal areas. Each original triangle is half its parallelogram, so the triangle areas are equal.',
39:'CE is constructed through C parallel to AB. Temporary assumption for contradiction: suppose D were off that parallel. One side of triangle ABD would then meet the parallel at a hypothetical X. Triangles ABX and ABC would have equal areas, while one of ABX and ABD would be a proper part of the other. This contradicts the given equal areas. Thus D lies on CE and CD is parallel to AB. X belongs only to the temporary assumption; do not add it to the actual construction.',
40:'AG is constructed through A parallel to BC. Temporary assumption for contradiction: suppose D were off that parallel. Its intersection with a side of DEF would produce a hypothetical replacement triangle on EF with the same area as ABC. That replacement would be a proper part or enlargement of DEF, contradicting the equal areas. Thus D lies on AG and AD is parallel to BC. The replacement triangle exists only inside the temporary assumption and is not an actual construction step.',
41:'Draw diagonal AC. A diagonal bisects the parallelogram, so area ABCD = 2 area ABC. Triangles ABC and ABE share base AB, and C and E lie on a line parallel to AB, so area ABC = area ABE. Substitute this equality in the doubled area.',
42:'BG = GC makes area ABG = area AGC, since they share the altitude from A. Thus area ABC = 2 area AGC. Parallelogram GCKL and triangle AGC share base GC and the parallels GC and KL, so the parallelogram has twice the area of the triangle: area GCKL = 2 area AGC. Equate the two doubled areas.',
44:'In the large parallelogram cut by diagonal MN, BIJK and ABQP are complementary parallelograms. Complements about the same diagonal have equal areas. The earlier construction line gives area BIJK = area CDE. Substitute to obtain area ABQP = area CDE.',
48:'The construction raises AD perpendicular to AC, copies AB to AE, and uses the circle centered at A to record AF = AE = AB, with F on AD opposite B. CF is drawn, forming right triangle FAC. Its squares give FC^2 = AF^2 + AC^2 = AB^2 + AC^2 = BC^2, hence FC = BC. Triangles FAC and BAC have three equal corresponding sides, so angle BAC = angle FAC. The latter is right by the recorded perpendicular construction.'
};
const AREA_ARGUMENTS={
35:'The drawn sides form end triangles ADF and BCE on the common top line. Opposite parallelogram sides give AD = BC and AF = BE; the parallels give equal included angles, so these triangles have equal areas. Both parallelograms lie inside the same outer trapezoid ABED. Removing ADF leaves ABEF; removing BCE leaves ABCD. Subtracting equal triangles from that same outer area gives area ABCD = area ABEF.',
43:'Diagonal AC halves the whole parallelogram and each smaller parallelogram through E. Start with area ABC = area ACD. Subtract the equal triangles AGE and AEF, then subtract the equal triangles EHC and ECK. The remainders are exactly GBHE and FEKD.',
45:'The two applied parallelograms have areas ABC and ACD. They adjoin along KJ, so their combined outer figure HILM has their summed area. Diagonal AC also divides ABCD into ABC and ACD. Add the two established area equalities to equate the whole figures.',
47:'The constructed line AJ meets BC at K and DE at L, dividing square BCDE into rectangles BKLE and KCDL. AE, CF, AD, and BH are drawn. The square sides give AB = BF and BE = BC, and the included angles ABE and FBC are equal (each adds the same angle to a right angle). Matching two sides and their included angle equates triangles ABE and FBC. The rectangle and square are each twice the area of the corresponding triangle, so the rectangle adjacent to B has the same area as square ABFG. Repeat on the C side with square ACHI. Adding the two rectangle areas gives the whole square BCDE, so BC^2 = AB^2 + AC^2. This conclusion needs the full area argument. A single addition step would require the intermediate area equalities to be established first.'
};
function proofStepReason(lesson,step){
 const precise=lateBookStepReason(lesson,step);if(precise)return precise;
 if(lesson.id===45&&step.j==='I14')return 'The preceding line proves that the adjacent angles add to two right angles. Their outer rays are on opposite sides of the shared ray, so they form one straight line. This alignment must be proved before treating the two pieces as one parallelogram.';
 if(lesson.id===47&&step.j==='I14')return 'One angle is right by the hypothesis and the other is right by a constructed square. Their established sum is two right angles, and the outer rays lie on opposite sides. Therefore the named points lie on one straight line.';
 if(lesson.id===47&&step.j==='I41')return 'Identify the common base of this parallelogram and triangle. Use the established collinearity to put the third vertex on the opposite parallel. The parallelogram has twice the triangle area.';
 if(lesson.id===47&&step.j==='Logic'&&/area .*\^2/.test(step.s))return 'This figure is a constructed square. Its area is the square of the length of its side; write that same magnitude using squared-length notation.';

 if(lesson.id===13)return 'Use the constructed perpendicular CE at C. The definition of a right angle divides the straight angle ACB into two right angles. Whether CD is that perpendicular or falls to either side of it, adding the adjacent parts gives angle ACD + angle DCB = 2 right angles.';
 if(lesson.id===14&&step.j!=='Given')return 'Use the recorded extension of AC straight through C. The straight-angle sum makes the angles from CA to CB and from CB to this extension sum to two right angles. Subtract the shared angle ACB from that sum and from the given sum. The remaining angles coincide, so CD is the straight extension of AC and A,C,D are collinear.';
 if(step.j==='Given')return 'This is a hypothesis in the proposition: '+step.s+'. Record it before using it as a premise.';
 if(lesson.id===27&&step.j==='I16')return LESSON_ARGUMENTS[27];
 if(step.j==='Logic')return LESSON_ARGUMENTS[lesson.id]||AREA_ARGUMENTS[lesson.id];

 if(step.j==='I4'&&!/is congruent/.test(step.s))return 'Corresponding sides and angles of the triangles already established as congruent are equal. Match the vertices in the recorded correspondence.';
 if(/^I/.test(step.j)){let ref=REFERENCES.propositions.find(r=>r[1]===step.j);return ref[2]+' Apply this result to the constructed points and earlier premises to obtain '+step.s+'.';}
 const reasons={D15:'Both segments are radii of the same constructed circle, so their lengths are equal.',D22:'A square has all four sides equal and all four angles right. Establish those properties for the named quadrilateral before applying this definition.',D10:'The two adjacent angles are equal and together form a straight angle. Each is therefore right; their common line is perpendicular to the straight line.',CN1:'Substitute the equal quantities established on earlier lines: quantities equal to the same quantity are equal to one another.',CN2:'Add the equal quantities established earlier. The adjacent pieces form the whole segment, angle, or area in this statement.',CN3:'Subtract the same quantity, or previously established equal quantities, from the two equal wholes. The remainders are equal.',D20:'An equilateral triangle has three equal sides. Use the property established by its construction, or the side equalities already proved.',CN4:lesson.id<=5?'Superposition makes corresponding vertices coincide. The sides and angles that coincide are equal.':lesson.id===8?'The three given pairs of sides coincide under superposition. The uniqueness of an apex on the same side of a base excludes a second apex on the same side of the common base, so all corresponding vertices and angles coincide.':'The two given angle pairs fix the shape. Under a temporary assumption of unequal sides, a larger corresponding side would allow cutting off a hypothetical smaller triangle; matching two sides and their included angle and the exterior-angle comparison then contradict the second equal angle. Thus the corresponding side lengths and triangles coincide.',P5:'With the stated parallel lines, unequal alternate angles would make the same-side interior angles less than two right angles on one side. The lines would then have to meet on the side with the smaller interior sum, contradicting parallelism. The alternate angles are therefore equal, and adjacent straight angles give the supplementary sum.'};
 return reasons[step.j]||('Check which constructed property or earlier result establishes '+step.s+'. The justification must account for the entire statement.');
}

function hintFeedback(error){return String(error||'Check the premises and the construction evidence.').replace(/\b(?:CN|[DEIP])\.?\s*\d+\b/g,'the selected justification')}
function hintProofAction(statement,line){return (line>=0?'Use Edit on line '+(line+1)+' to enter: ':'Add the statement: ')+statement+'. '+(settings.skipJustifications?'Its reasoning will be checked automatically.':'Then choose a justification that matches the reasoning and click '+(line>=0?'that proof line':'the new proof line')+'.')}

// These explanations describe the current line, not the whole lesson's ending.
const LATE_STEP_REASONS={
38:{
 'area BCAH = area EFDJ':'The completed parallelograms stand on the given equal bases BC and EF. Their opposite sides AH and DJ lie on AD, parallel to the common base line.',
 'area ABC = area ABH':'Diagonal AB divides parallelogram BCAH into triangles ABC and ABH of equal area.',
 'area DEF = area DEJ':'Diagonal DE divides parallelogram EFDJ into triangles DEF and DEJ of equal area.',
 '2 area ABC = area BCAH':'Add the two equal halves ABC and ABH. Together they form the completed parallelogram BCAH.',
 '2 area DEF = area EFDJ':'Add the two equal halves DEF and DEJ. Together they form the completed parallelogram EFDJ.',
 '2 area ABC = 2 area DEF':'Both doubled triangle areas equal the two parallelogram areas already proved equal. Substitute those equalities.',
 'area ABC = area DEF':'The preceding equality equates twice each triangle area. Cancel the common positive factor two; no new geometric theorem is needed.'
},
39:{'CD is parallel to AB':'Use the constructed comparison parallel CE. Suppose D were off CE: under that temporary assumption, a side of triangle ABD would meet CE at a hypothetical X. The common-base triangle ABX would equal ABC, and hence ABD, although one of ABX and ABD would be a proper part of the other. This is impossible. Thus D lies on CE and CD is parallel to AB. X is local to the contradiction, not an actual point to construct.'},
40:{'AD is parallel to BC':'Use the constructed comparison parallel AG. Suppose D were off AG. Under that assumption the line through A parallel to BC would meet a side of DEF at a hypothetical X. The equal-base triangle XEF would equal ABC and hence DEF, although one is a proper part of the other. Reject that assumption: D lies on AG, so AD is parallel to BC. The hypothetical replacement triangle is not an actual construction object.'},
41:{
 'area ABC = area CDA':'The drawn diagonal AC bisects the given parallelogram ABCD.',
 'area ABC = area ABE':'Triangles ABC and ABE share base AB. Their vertices C and E lie on DC, the opposite parallel to AB.',
 'area ABCD = 2 area ABC':'Add triangles ABC and CDA along their drawn common diagonal. Their equal areas make the whole twice ABC.',
 '2 area ABC = 2 area ABE':'Add the established equality of ABC and ABE to itself.',
 'area ABCD = 2 area ABE':'Replace twice ABC in the preceding whole-area equality by the equal quantity twice ABE.'
},
42:{
 'BG = GC':'Use the recorded bisection of BC at G.',
 'angle HGC = angle DEF':'Use the angle copied at G onto the base ray GC.',
 'angle LGC = angle DEF':'L lies on the same ray from G as H, so angle LGC is the copied angle HGC.',
 'area ABG = area AGC':'The triangles share vertex A and have equal bases BG and GC on BC. The constructed line AI through A is parallel to BC.',
 'area ABC = 2 area AGC':'AG divides ABC into ABG and AGC. Add their established equal areas.',
 'area GCKL = 2 area AGC':'The parallelogram and triangle share base GC. Vertex A lies on the opposite line KL, so the parallelogram is twice the triangle.',
 'area GCKL = area ABC':'Both areas were proved equal to twice the area of AGC. Equate them by substitution.'
},
43:{
 'area ABC = area ACD':'Diagonal AC halves the outer parallelogram ABCD.',
 'area AGE = area AEF':'Diagonal AE halves the smaller parallelogram AGEF.',
 'area EHC = area ECK':'Diagonal EC halves the smaller parallelogram EHCK.',
 'area ABC - area AGE = area ACD - area AEF':'Subtract the equal triangle areas AGE and AEF from the equal outer triangle areas.',
 'area GBHE = area FEKD':'From those equal remainders subtract the remaining equal triangles EHC and ECK. The pieces left are exactly the two complements GBHE and FEKD.'
},
44:{
 'angle AMJ + angle MJI = 2 right angles':'MJ crosses the established parallels AM and IJ. These are the same-side interior angles, so their sum is two right angles.',
 'angle AMJ > angle BMJ':'Ray MB lies strictly inside angle AMJ. Angle BMJ is a proper part of angle AMJ.',
 'angle BMJ + angle MJI < 2 right angles':'Add angle MJI to the strict comparison just established. Replace angle AMJ + angle MJI by the proved sum of two right angles.',
 'MB meets JI at N':'The interior-angle sum is strictly less than two right angles on the side toward B and I. The two extended lines therefore meet on that side; N is their recorded intersection.',
 'area ABQP = area BIJK':'The enclosing parallelogram is MJNP, with diagonal MN through B. BIJK and ABQP are its two complements about that diagonal, so their areas are equal.',
 'area ABQP = area CDE':'Replace area BIJK in the complement equality by the equal area of the given triangle CDE.',
 'angle ABQ = angle KBI':'AB and BI are opposite rays, as are BQ and BK. The two named angles are vertical angles at B.',
 'angle ABQ = angle FGH':'Combine the vertical-angle equality with the recorded equality between the copied angle KBI and the given angle FGH.'
},
45:{
 'angle KHI = angle MKJ':'Both constructed angles equal the given angle EFG.',
 'angle KHI + angle HKJ = 2 right angles':'HK crosses the opposite parallels HI and KJ of the first parallelogram. Its same-side interior angles are supplementary.',
 'angle KHI + angle HKJ = angle MKJ + angle HKJ':'Add the same angle HKJ to the equality of KHI and MKJ.',
 'angle HKJ + angle JKM = 2 right angles':'Substitute the just-established equality of angle sums into the known supplementary sum. Angle JKM is the reverse naming of MKJ.',
 'angle MKJ = angle KJI':'After proving H,K,M collinear, MK and IJ lie on opposite parallel sides of the first parallelogram. KJ is the transversal, giving these equal alternate angles.',
 'angle MKJ + angle KJL = 2 right angles':'KJ crosses the opposite parallels KM and JL of the second parallelogram. The named same-side interior angles are supplementary.',
 'angle MKJ + angle KJL = angle KJI + angle KJL':'Add the same angle KJL to the preceding alternate-angle equality.',
 'angle IJK + angle KJL = 2 right angles':'Substitute that equality of sums into the supplementary sum. IJK is the reverse naming of KJI.',
 'HI = KJ':'Opposite sides of the first parallelogram HIJK are equal.',
 'KJ = ML':'Opposite sides of the second parallelogram KJLM are equal.',
 'HI = ML':'Both outer sides have been proved equal to the shared side KJ.',
 'HM = IL':'HI and ML are equal and parallel, with the same direction. Their corresponding endpoint joins HM and IL are therefore equal.',
 'HM is parallel to IL':'Use those same equal, parallel sides HI and ML. The joins of their corresponding endpoints HM and IL are parallel.',
 'area HILM = area ABCD':'The proved alignments make HILM the union of HIJK and KJLM. Add their established areas ABC and ACD; the given diagonal AC splits ABCD into those triangles.',
 'angle MHI = angle EFG':'The proved alignment H,K,M makes HM the same ray as HK. Thus MHI is the constructed angle KHI, already equal to EFG.'
},
46:{
 'AD = AB':'Use the length-copy construction that placed D on the perpendicular ray AC with AD equal to AB.',
 'angle DAB is right':'D lies on the perpendicular ray AC raised at A. Thus AD is perpendicular to AB.',
 'angle DAB + angle ABG = 2 right angles':'AB crosses the opposite parallels AD and BG of the proved parallelogram. Its same-side interior angles are supplementary.',
 'angle ABG = right angle':'The supplementary sum is two right angles and DAB is one right angle. Subtract that known right angle.',
 'angle GDA = right angle':'The opposite angles GDA and ABG have already been proved equal. Substitute the right angle for ABG.',
 'angle BGD = right angle':'The opposite angles BGD and DAB have already been proved equal. Substitute the right angle for DAB.',
 'BG = AB':'BG equals DA as an opposite side, and DA equals AB by construction. Combine the equalities.',
 'ABGD is a square':'All four sides have been proved equal, and all four angles have been proved right. Apply the full definition of a square.'
},
47:{
 'angle CAB + angle BAG = 2 right angles':'Both adjacent angles are established right angles: one belongs to the given triangle and one to square ABFG. Add those equalities.',
 'angle BAC + angle CAI = 2 right angles':'Add the right angle from the triangle to the adjacent right angle from square ACHI.',
 'angle ABE = angle FBC':'Add the common angle ABC to the equal right angles EBC and ABF. The recorded ray order identifies the resulting whole angles ABE and FBC.',
 'ABE is congruent to FBC':'AB equals BF, BE equals BC, and the included angles ABE and FBC were proved equal. Match A to F, B to B, and E to C.',
 'area BKLE = 2 area ABE':'The rectangle BKLE and triangle ABE share base BE. Vertex A lies on the opposite parallel KL.',
 'area ABFG = 2 area FBC':'The square and triangle share base BF. The proved alignment C,A,G puts C on the opposite parallel AG.',
 '2 area ABE = 2 area FBC':'Add the established equality of the two congruent triangle areas to itself.',
 'area BKLE = area ABFG':'Each area equals twice one of the two triangle areas already proved equal. Substitute those equalities.',
 'angle ACD = angle BCH':'Add the common angle ACB to the equal right angles BCD and ACH. The recorded ray order gives the named whole angles.',
 'ACD is congruent to HCB':'AC equals CH, CD equals CB, and the included angles ACD and HCB were proved equal. Match A to H, C to C, and D to B.',
 'area KCDL = 2 area ACD':'The rectangle KCDL and triangle ACD share base CD. Vertex A lies on the opposite parallel KL.',
 'area ACHI = 2 area BCH':'The square and triangle share base CH. The proved alignment B,A,I puts B on the opposite parallel AI.',
 '2 area ACD = 2 area BCH':'Add the established equality of the second pair of congruent triangle areas to itself.',
 'area KCDL = area ACHI':'Each area equals twice one of the second pair of equal triangle areas. Substitute those equalities.',
 'area BCDE = area ABFG + area ACHI':'KL divides square BCDE into the two rectangles BKLE and KCDL. Add the two rectangle-to-square area equalities already proved.',
 'area ABFG + area ACHI = AB^2 + AC^2':'Add the two established square-area notation identities. Each square area equals the square of its own side.',
 'BC^2 = AB^2 + AC^2':'The area of BCDE equals BC squared and also the sum of the other square areas. Replace those areas by the squared-side expressions already established.'
},
48:{
 'AF^2 = AB^2':'AF and AB were proved equal as lengths. Square those equal quantities to obtain equal squared lengths.',
 'AF^2 + AC^2 = AB^2 + AC^2':'Add the same squared length AC squared to both sides of the established equality AF squared = AB squared.',
 'AF = AE':'F is a marked intersection of ray AD with the circle centered at A through E. AF and AE are recorded radii of that circle.',
 'AF = AB':'Both AF and AB equal the constructed length AE. Combine those equalities.',
 'angle FAC is right':'F lies on the raised perpendicular AD to AC, so angle FAC is right.',
 'FC^2 = AF^2 + AC^2':'Apply the established right-triangle square identity to the constructed right triangle FAC, whose hypotenuse is FC.',
 'FC^2 = BC^2':'Substitute AF = AB into the auxiliary right-triangle identity. The given identity expresses BC squared as the same sum.',
 'FC = BC':'The preceding line establishes equal squares of segment lengths. Lengths are nonnegative, so their nonnegative square roots are equal.',
 'FAC is congruent to BAC':'AF = AB, AC is common, and FC = BC. Match F to B, A to A, and C to C using all three side pairs.',
 'angle FAC = angle BAC':'The congruent triangles FAC and BAC have corresponding angles at A equal.',
 'angle BAC is right':'FAC is already right and has been proved equal to BAC. Substitute that equality.'
}
};
function lateBookStepReason(lesson,step){
 if(lesson.id<38||lesson.id>48)return null;
 let exact=LATE_STEP_REASONS[lesson.id]?.[step.s];if(exact)return exact;
 if(step.j==='Given')return 'This statement is supplied as a hypothesis. Use it as an established premise: '+step.s+'.';
 if(step.j==='I14')return 'The preceding angle sum is two right angles. The outer rays lie on opposite sides of their common ray, so the three named points lie on one straight line.';
 if(step.j==='I30')return 'Use the two already established parallel pairs with a common third line. The two distinct outer lines are parallel: '+step.s+'.';
 if(step.j==='Logic'&&/is a parallelogram/.test(step.s))return 'Verify both pairs of opposite parallel sides of the named quadrilateral before calling it a parallelogram: '+step.s+'.';
 if(step.j==='D23')return 'Use an established parallel pair, relabeling only along recorded or proved straight lines: '+step.s+'.';
 if(step.j==='I31')return 'Use the parallel drawn through the selected point in the construction: '+step.s+'.';
 if(step.j==='I42'||step.j==='I44')return 'Read this property from the earlier area-construction record for the named parallelogram: '+step.s+'.';
 if(step.j==='I11')return 'Use the recorded perpendicular raised at the point on the given line: '+step.s+'.';
 if(step.j==='I2')return 'Use the recorded length copy from the named source segment to the new segment: '+step.s+'.';
 if(step.j==='I46')return 'Use the square constructed on the named side. Its sides and right angles are guaranteed by that construction: '+step.s+'.';
 if(step.j==='I34')return 'In the established parallelogram, opposite sides and opposite angles are equal; a drawn diagonal also gives equal triangle halves. Use the part named in '+step.s+'.';
 if(step.j==='D22' || step.j==='D10')return 'Use the equal-side or right-angle property already established by the named construction: '+step.s+'.';
 if(step.j==='P4')return 'Identify the named angles as right angles using the hypothesis, perpendicular, or recorded square, then equate those right angles: '+step.s+'.';
 if(step.j==='I4'||step.j==='I8')return 'Take the corresponding part of the earlier congruent triangles, preserving their recorded vertex correspondence: '+step.s+'.';
 if(step.j==='Logic'&&/area .*\^2/.test(step.s))return 'The named figure is a recorded square. Express its area as the square of its side length: '+step.s+'.';
 return null;
}
