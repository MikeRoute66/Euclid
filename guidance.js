// Presentation labels deliberately leave saved rule identifiers unchanged.
function displayReference(text){return String(text??'').replace(/\bI\.?([0-9]+)\b/g,'E.$1')}
function hintFeedback(error){return String(error||'Check the premises and the construction evidence.').replace(/\b(?:CN|[DEIP])\.?\s*\d+\b/g,'the selected justification')}
function hintProofAction(statement,line){return (line>=0?'Use Edit on line '+(line+1)+' to enter: ':'Add the statement: ')+statement+'. '+(settings.skipJustifications?'Justification is automatic.':'Choose a justification. Click '+(line>=0?'that proof line':'the new proof line')+'.')}

// These explanations describe the current line, not the whole lesson's ending.
const LATE_STEP_REASONS={
38:{
 'area BCAH = area DEFJ':'The completed parallelograms stand on the given equal bases BC and EF. Their opposite sides AH and DJ lie on AD, parallel to the common base line.',
 'area ABC = area ABH':'Diagonal AB divides parallelogram BCAH into triangles ABC and ABH of equal area.',
 'area DEF = area DFJ':'Diagonal DF divides parallelogram DEFJ into triangles DEF and DFJ of equal area.',
 '2 area ABC = area BCAH':'Add the two equal halves ABC and ABH. Together they form the completed parallelogram BCAH.',
 '2 area DEF = area DEFJ':'Add the two equal halves DEF and DFJ. Together they form the completed parallelogram DEFJ.',
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
 'FC = BC':'The squared lengths are equal. Lengths cannot be negative, so the lengths are equal.',
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

// Short teaching prompts. Full derivations remain in proof inspection.
function proofStepReason(lesson,step){
 const n=lesson.id,j=step.j,s=step.s,ast=BookOneLogic.parse(s);
 if(j==='Given')return 'This is given. You can use it in later lines.';
 const closedProofs={
  6:'Assume the sides differ. A cutoff and two equal sides with their included angle would make a smaller triangle equal to the whole. That is impossible. The sides must be equal. Imagine the cut point; do not draw it.',
  7:'If C and D differed, the two isosceles triangles would have equal base angles. A whole angle would then equal a smaller part of itself. That is impossible, so C = D.',
  14:'Imagine a different straight continuation. Its angle sum is also two right angles. Subtract the shared angle. A whole angle cannot equal a smaller part, so the continuations must match.',
  19:'Equal sides would give equal opposite angles. The reverse side order would reverse the angle order. Both contradict the given comparison. So AC > AB.',
  25:'Equal angles would give equal bases. A smaller angle BAC would give a smaller base BC. Both contradict BC > EF.',
  26:'Imagine cutting the longer side to match the shorter one. Two equal sides and their included angle would make an exterior angle equal to an opposite interior angle. That is impossible, so BC = EF. Do not draw the imagined cut point.',
  27:'Suppose the lines met at X. Triangle XGH would have an exterior angle equal to an opposite interior angle. That is impossible on either side. X is imagined, not a missing construction point. Do not draw X.',
  29:'Suppose the alternate angles differed. The angles on one side would add to less than two right angles. The lines would have to meet, but they are parallel. So the alternate angles are equal.',
  39:'Suppose D lay off the parallel through C. The rule for triangles on the same base would make a triangle equal in area to a smaller part. That is impossible. Imagine the extra point; do not draw it.',
  40:'Suppose D lay off the parallel through A. The rule for triangles on equal bases would make a triangle equal in area to a smaller part. That is impossible. Imagine the extra point; do not draw it.'
 };
 if([6,7,14,19,25,27,39,40].includes(n)||n===26&&s==='BC = EF'||n===29&&j==='P5')return closedProofs[n];
 if(n===34&&s==='area ABC = area CDA')return 'Use AB = CD, the common side AC, and BAC = DCA. The matching triangles have equal areas.';
 const specific=step.r||lateBookStepReason(lesson,step);
 const plain=text=>text.replace(/preceding/g,'previous').replace(/established/g,'proved').replace(/Substitute/g,'Use').replace(/substitute/g,'use').replace(/proper part/g,'smaller part').replace(/auxiliary/g,'extra').replace(/right-triangle identity/g,'right triangle equation').replace(/vertex correspondence/g,'point order').replace(/quantities/g,'amounts').replace(/Identify/g,'Find').replace(/identify/g,'find').replace(/obtain/g,'get').replace(/exactly /g,'').replace(/strict inequality/g,'comparison').replace(/the recorded /g,'the ').replace(/The recorded /g,'The ').replace(/common positive factor two/g,'factor two').replace(/corresponding/g,'matching').replace(/preserving their recorded vertex correspondence/g,'keeping the same vertex order');
 if(specific&&specific.split(/\s+/).length<=38)return plain(specific);
 if(ast?.kind==='congruence'&&j==='I4'){
  const pairs={5:s.includes('AFC')?'AF = AG, AC = AB, and the common angle at A':'BF = CG, FC = GB, and angle BFC = angle CGB',10:'CA = CB, the common side CD, and the equal angles at C',16:s.includes('ABE')?'AE = CE, EB = EG, and the equal vertical angles at E':'AH = JH, BH = CH, and the equal vertical angles at H',24:'AB = DE, AC = DH, and angle BAC = angle EDH',26:'AB = DE, BC = EF, and angle ABC = angle DEF',33:'AB = DC, the common side BC, and angle ABC = angle BCD',35:'AD = BC, DF = CE, and angle ADF = angle BCE'};
  return pairs[n]?'Use '+pairs[n]+'.':'Use two equal side pairs and the equal angle between them.';
 }
 if(ast?.kind==='congruence'&&j==='I8')return 'Match all three pairs of equal sides. A shared side counts too.';
 if(j==='P5'&&ast?.kind==='intersection')return 'The angles on this side add to less than two right angles. The lines must meet on that side.';
 const reasons={
  D15:'These segments are radii of the same circle.',D20:'An equilateral triangle has three equal sides.',D10:'The adjacent angles are equal and sit on a straight line. Both are right angles.',D22:'A square has four equal sides and four right angles.',D23:'Use the lines already known to be parallel.',
  P4:'These are right angles. All right angles are equal.',CN1:'Both amounts equal the same amount. So they equal each other.',CN2:ast?.kind==='gt'?'Add the same length or angle to both sides.':'Add the equal parts, or join adjacent parts to make the whole.',CN3:'Subtract the same part, or equal parts, from the equal wholes.',CN4:'The matching parts coincide, so they are equal.',CN5:'The whole is greater than the part.',
  I1:'This triangle was built with three equal sides.',I2:'The copied segment equals the given length.',I3:'The cutoff made these segments equal.',I4:'Use the matching parts of the triangles you compared.',I5:'Equal sides give equal opposite base angles.',I8:'Use the matching parts of the triangles you compared.',I9:'The angle bisector splits the angle into two equal angles.',I10:'The midpoint splits the segment into two equal parts.',I11:'Use the perpendicular raised at the point on the line.',I13:'These adjacent angles sit on a straight line. Their sum is two right angles.',I15:'These angles are vertically opposite at the crossing.',I16:'An exterior angle is greater than either opposite interior angle.',I19:'The greater angle faces the greater side.',I20:'Two sides of a triangle together are longer than the third.',I23:'Use the angle you copied in the construction.',I26:'Use the two equal angle pairs and the shared side.',I27:'The alternate angles are equal, so the lines are parallel.',I29:'One line crosses two parallel lines. Match the alternate or corresponding angles.',I30:'Both lines are parallel to the same third line. They are parallel to each other.',I31:'Use the parallel drawn in the construction.',I33:'The original segments are equal and parallel. The lines joining their matching ends are equal and parallel too.',I34:'Use the opposite sides or angles, or the diagonal halves, of this parallelogram.',I35:'The parallelograms share a base and lie between the same parallels. Their areas are equal.',I36:'The parallelograms have equal bases and lie between the same parallels. Their areas are equal.',I37:'The triangles share a base and lie between the same parallels. Their areas are equal.',I38:'The triangles have equal bases and lie between the same parallels. Their areas are equal.',I41:'The triangle and parallelogram share a base and lie between the same parallels. The parallelogram has twice the area.',I43:'These are the leftover parallelograms beside the same diagonal. Their areas are equal.',I42:'Use the area or angle of the parallelogram you constructed.',I44:'Use the area or angle of the parallelogram you constructed.',I46:'Use the square built on this side.'
 };
 if(reasons[j])return reasons[j];
 if(ast?.kind==='shape')return 'Both pairs of opposite sides are parallel. This makes a parallelogram.';
 if(ast?.kind==='right')return 'This angle equals an angle already proved right.';
 if(ast?.kind==='gt')return 'Use the earlier comparisons. Replace equal lengths or angles, or combine the comparisons.';
 if(ast?.kind==='eq'&&ast.left[0].kind==='length'&&ast.right[0].kind==='length')return 'The squared lengths are equal. Lengths cannot be negative, so the lengths are equal.';
 if(ast?.kind==='eq'&&[...ast.left,...ast.right].some(t=>t.kind==='area')&&[...ast.left,...ast.right].some(t=>t.kind==='square'))return 'This is a square. Its area is its side length squared.';
 return 'Use the earlier equalities. Replace equal amounts or cancel the same factor on both sides.';
}
