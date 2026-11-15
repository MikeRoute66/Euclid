/* Book III, first reviewed release. A conditional is an implication, not a
 * permanent assumption. Hypothetical points are drawn as dashed auxiliaries. */
const BOOK_THREE_DEFINITIONS=[
 ['Equal circles','D3.1','Circles are equal when their diameters, or their radii, are equal.'],
 ['A tangent to a circle','D3.2','A straight line touches a circle when it meets it but does not cut it, even when continued.'],
 ['Circles touching','D3.3','Circles touch when they meet without cutting one another.'],
 ['Equally distant chords','D3.4','Chords are equally distant from the center when their perpendicular distances from it are equal.'],
 ['A more distant chord','D3.5','The chord with the greater perpendicular distance from the center is more distant.'],
 ['A segment of a circle','D3.6','A circular segment is bounded by a chord and its arc.'],
 ['An angle of a segment','D3.7','An angle of a segment is bounded by its straight chord and its curved circumference. It is not an ordinary straight-sided angle.'],
 ['An angle in a segment','D3.8','Join a point on the arc to the two chord endpoints. The angle between those straight lines is an angle in the segment.'],
 ['An angle standing on an arc','D3.9','An angle stands on the arc cut off by the two lines forming that angle.'],
 ['A sector','D3.10','A sector is bounded by two radii and the arc they cut off.'],
 ['Similar circular segments','D3.11','Circular segments are similar when their angles in the segments are equal.']
];
const BOOK_THREE_BUILD_MODES={'E3.1':'circleCenter'};
const BOOK_THREE_LESSONS=(()=>{
 const build=(ref,inputs,text,outputs=[],extra={})=>({ref,inputs,outputs,text,...extra});
 const cross=(name,supports,text,extra={})=>build('D1',[],text,[name],{supports,...extra});
 const circle=(id,members,center=[400,270],radius=180,diameters=[])=>({id,members,plot:{center,radius},diameters});
 const proof=rows=>rows.map(([s,j,why])=>({s,j,why}));
 const conditional=(condition,rows)=>rows.map(([s,j,why])=>['If '+condition+' then '+s,j,why]);
 const lesson=(p,data)=>({id:62+p,book:3,proposition:p,key:'3.'+p,source:'https://mathcs.clarku.edu/~djoyce/elements/bookIII/propIII'+p+'.html',hintSteps:[],requireConstruction:true,incidence:[],givens:[],...data});
 const c='J is the center of circle C1';
 const first=lesson(1,{
  title:'Find the center of a circle',description:'Find the center of the given circle C1. Its drawing center is not a proof premise.',given:'A, B, C lie on circle C1. Dashed J represents an arbitrary proposed center off the perpendicular bisector.',
  points:{A:[256,378],B:[544,378],C:[580,270],J:[500,270]},edges:['AB'],hypotheticalPoints:['J'],givenCircles:[circle('C1',['A','B','C'])],
  givens:['A is on circle C1','B is on circle C1','C is on circle C1'],
  construction:[build('I10',['A','B'],'Bisect the chord AB at D.',['D']),build('I11',['A','B','D'],'Raise the perpendicular at D.',['E']),build('P2',['D','E'],'Continue the perpendicular across the circle.'),cross('F',['DE','given:C1'],'Mark the upper circle crossing F.'),cross('G',['DE','given:C1'],'Mark the other crossing G.'),build('I10',['F','G'],'Bisect the diameter FG at H.',['H']),build('P1',['J','A'],'Join the hypothetical center J to A.'),build('P1',['J','B'],'Join J to B.'),build('P1',['J','D'],'Join J to D.')],
  proofGuide:proof([
   ['AD = DB','I10','D is the constructed midpoint.'],
   ...conditional(c,[['JA = JB','D15','Under this assumption both are radii.'],['angle ADJ = angle JDB','I8','Use the equal chord halves, common DJ, and equal radii.'],['DJ is perpendicular to AB','D10','The adjacent angles are equal.'],['angle JDB is right','D10','It is an angle at the perpendicular.'],['angle EDB is right','D10','DE was constructed perpendicular to AB.'],['angle EDB = angle JDB','P4','Both would be right.'],['angle EDB > angle JDB','CN5','The smaller angle lies strictly inside the other.'],['contradiction','Logic','A strict part cannot equal its whole.']]),
   ['The center of circle C1 lies on DE','Logic','The proposed center cannot lie off the bisector; the reflected case is the same.'],
   ['FH = HG','I10','H is the midpoint of the circle crossings.'],['H is the center of circle C1','Logic','The center on this diameter must be its midpoint.']
  ]),goals:['The center of circle C1 lies on DE','H is the center of circle C1']
 });
 const outside='E is outside circle C1 on chord AB',on='E is on circle C1 on chord AB';
 const chordArgument=[['DA = DB','D15','These are radii.'],['angle DAE = angle DBE','I5','The equal radii form an isosceles triangle.'],['angle DEB > angle DAE','I16','The exterior angle exceeds the opposite interior angle.'],['angle DEB > angle DBE','CN1','Replace the equal base angle.'],['DB > DE','I19','The greater angle has the greater opposite side.']];
 const second=lesson(2,{
  title:'A chord stays inside its circle',description:'Prove that the interior of a chord lies inside the circle.',given:'A, B, C lie on C1. Dashed E is a hypothetical counterexample on chord AB; its conditional incidence is schematic.',
  points:{A:[256,378],B:[544,378],C:[580,270],E:[400,160]},edges:['AB'],hypotheticalPoints:['E'],givenCircles:[circle('C1',['A','B','C'])],givens:['A is on circle C1','B is on circle C1','C is on circle C1'],
  construction:[build('E3.1',['A','B','C'],'Find the center D.',['D'],{circle:'C1'}),build('P1',['D','A'],'Join DA.'),build('P1',['D','B'],'Join DB.'),build('P1',['D','E'],'Join the hypothetical point E to D.'),build('P1',['A','E'],'Join A to the hypothetical point E.'),build('P1',['E','B'],'Join E to B.'),build('P2',['D','E'],'Continue DE to the circumference.'),cross('F',['DE','given:C1'],'Mark its upper circle crossing F.')],
  proofGuide:proof([['D is the center of circle C1','E3.1','The center was found by the earlier construction.'],...conditional(outside,[...chordArgument,['DB = DF','D15','Both are radii.'],['DF > DE','CN1','Substitute the equal radius.'],['DE > DF','CN5','Under the exterior-point assumption, F is between D and E.'],['contradiction','Logic','The two strict inequalities oppose one another.']]),...conditional(on,[...chordArgument,['DB = DE','D15','In this case E is assumed on the circle.'],['contradiction','Logic','The same length would be both equal and greater.']]),['AB lies inside circle C1','Logic','Neither an exterior nor a circumference point can occur in the open chord.']]),goals:['AB lies inside circle C1']
 });
 const bisect='AF = FB',perpendicular='CD is perpendicular to AB';
 const third=lesson(3,{
  title:'A diameter and a bisected chord',description:'Prove both directions: the line through the center bisects a noncentral chord exactly when it is perpendicular to it.',given:'C and D are diameter endpoints. F is the intersection of diameter CD and noncentral chord AB. Each direction has its own conditional assumption.',
  points:{A:[256,378],B:[544,378],C:[400,90],D:[400,450],F:[400,378]},edges:['AB','CD'],incidence:['AFB','CFD'],givenCircles:[circle('C1',['A','B','C','D'],[400,270],180,['CD'])],givens:['CD is a diameter of circle C1','A is on circle C1','B is on circle C1','AB is a noncentral chord of circle C1','AB meets CD at F'],
  construction:[build('E3.1',['A','B','C'],'Find the center E.',['E'],{circle:'C1'}),build('P1',['E','A'],'Join EA.'),build('P1',['E','B'],'Join EB.'),build('P1',['E','F'],'Join EF.')],
  proofGuide:proof([['E is the center of circle C1','E3.1','Find the center.'],...conditional(bisect,[['EA = EB','D15','Radii of one circle are equal.'],['angle AFE = angle BFE','I8','Use the equal halves, common EF, and equal radii.'],['EF is perpendicular to AB','D10','Equal adjacent angles are right.'],['CD is perpendicular to AB','D10','EF lies on the diameter CD.']]),...conditional(perpendicular,[['EA = EB','D15','The radii are equal independently of the new assumption.'],['angle EAF = angle EBF','I5','Use the equal radii.'],['angle AFE is right','D10','The assumed perpendicular makes this a right angle.'],['angle BFE is right','D10','The other adjacent angle is right too.'],['angle AFE = angle BFE','P4','Right angles are equal.'],['AF = FB','I26','The triangles have two equal angles and common EF.']])]),goals:['If AF = FB then CD is perpendicular to AB','If CD is perpendicular to AB then AF = FB']
 });
 const both='AE = EC and BE = ED',q=Math.sqrt(28350)/Math.sqrt(2),x=Math.sqrt(180*180-60*60);
 const fourth=lesson(4,{
  title:'Intersecting noncentral chords',description:'Prove that two intersecting noncentral chords cannot bisect one another.',given:'AC and BD are noncentral chords intersecting at E.',
  points:{A:[400-x,330],B:[445-q,315+q],C:[400+x,330],D:[445+q,315-q],E:[430,330]},edges:['AC','BD'],incidence:['AEC','BED'],givenCircles:[circle('C1',['A','B','C','D'])],givens:['A is on circle C1','B is on circle C1','C is on circle C1','D is on circle C1','AC is a noncentral chord of circle C1','BD is a noncentral chord of circle C1','AC meets BD at E'],
  construction:[build('E3.1',['A','B','C'],'Find the center F.',['F'],{circle:'C1'}),build('P1',['F','E'],'Join the center to the chord intersection.')],
  proofGuide:proof([['F is the center of circle C1','E3.1','Find the center before comparing the chords.'],...conditional(both,[['angle FEA is right','E3.3','The center line would bisect AC.'],['angle FEB is right','E3.3','The same line would bisect BD.'],['angle FEA = angle FEB','P4','Both would be right.'],['angle FEB > angle FEA','CN5','One is a strict angular part of the other.'],['contradiction','Logic','Unequal nested angles cannot both be right.']]),['AC and BD do not bisect each other','Logic','Discharge the simultaneous bisection assumption.']]),goals:['AC and BD do not bisect each other']
 });
 const h=Math.sqrt(180*180-75*75),shared='E is the center of circle C1 and E is the center of circle C2';
 const fifth=lesson(5,{
  title:'Cutting circles have different centers',description:'Show that two distinct cutting circles cannot share a center.',given:'C1 and C2 cut at A and C. Dashed E is a proposed common center; EZ is an arbitrary transversal.',
  points:{A:[355,270+h],B:[100,270],C:[355,270-h],D:[610,270],E:[340,270],Z:[550,200]},edges:['EZ'],hypotheticalPoints:['E'],givenCircles:[circle('C1',['A','B','C'],[280,270]),circle('C2',['A','C','D'],[430,270])],givens:['Circle C1 cuts circle C2 at A and C'],
  construction:[build('P1',['E','C'],'Join the proposed common center to C.'),build('P2',['E','Z'],'Continue the arbitrary transversal.'),cross('F',['EZ','given:C1'],'Mark its forward crossing with C1.'),cross('G',['EZ','given:C2'],'Mark its forward crossing with C2.')],
  proofGuide:proof([...conditional(shared,[['EC = EF','D15','These would be radii of C1.'],['EC = EG','D15','These would be radii of C2.'],['EF = EG','CN1','They equal the same segment EC.'],['EG > EF','CN5','F lies strictly between E and G.'],['contradiction','Logic','A proper part would equal its whole.']]),['Circle C1 and circle C2 have different centers','Logic','No common center is possible.']]),goals:['Circle C1 and circle C2 have different centers']
 });
 const contact='F is the center of circle C1 and F is the center of circle C2';
 const sixth=lesson(6,{
  title:'Touching circles have different centers',description:'Show that two distinct touching circles cannot share a center.',given:'C1 and C2 touch internally at C. Dashed F is a proposed common center; FZ is an arbitrary transversal.',
  points:{A:[100,270],B:[280,90],C:[460,270],D:[370,180],E:[370,360],F:[320,270],Z:[350,100]},edges:['FZ'],hypotheticalPoints:['F'],givenCircles:[circle('C1',['A','B','C'],[280,270]),circle('C2',['C','D','E'],[370,270],90)],givens:['Circle C1 touches circle C2 at C'],
  construction:[build('P1',['F','C'],'Join the proposed common center to C.'),build('P2',['F','Z'],'Continue the transversal.'),cross('G',['FZ','given:C2'],'Mark its upper crossing with the smaller circle.'),cross('H',['FZ','given:C1'],'Mark its upper crossing with the larger circle.')],
  proofGuide:proof([...conditional(contact,[['FC = FH','D15','These would be radii of C1.'],['FC = FG','D15','These would be radii of C2.'],['FG = FH','CN1','They would equal the same common radius.'],['FH > FG','CN5','G is a proper interior point of FH.'],['contradiction','Logic','The equal radii would be unequal whole and part.']]),['Circle C1 and circle C2 have different centers','Logic','Discharge the common-center assumption.']]),goals:['Circle C1 and circle C2 have different centers']
 });
 const p=(degrees)=>[400+180*Math.cos(degrees*Math.PI/180),270-180*Math.sin(degrees*Math.PI/180)];
 const seventh=lesson(7,{
  title:'Distances from an off-center point',description:'Compare distances from an interior point on a diameter, and prove that only two circle points have any one intermediate distance.',given:'AD is a diameter of C1. F lies between its center and D. B, C, G lie in that order on one semicircle; K represents an arbitrary third candidate on the other side.',
  points:{A:p(180),B:p(125),C:p(65),D:p(0),F:[470,270],G:p(25),K:p(-120)},edges:['AD','FB','FC','FG','FK'],incidence:['AFD'],givenCircles:[circle('C1',['A','B','C','D','G','K'],[400,270],180,['AD'])],givens:['AD is a diameter of circle C1','F lies inside circle C1','F is not the center of circle C1','B is on circle C1','C is on circle C1','G is on circle C1','K is on circle C1'],
  construction:[build('E3.1',['A','B','C'],'Find the center E.',['E'],{circle:'C1'}),build('P1',['E','B'],'Join EB.'),build('P1',['E','C'],'Join EC.'),build('P1',['E','G'],'Join EG.'),build('P1',['E','F'],'Join EF.'),build('I23',['G','E','F','E','F'],'Copy the angle to the other side of EF.',['H']),build('P2',['E','H'],'Continue the copied ray to the circle.'),cross('I',['EH','given:C1'],'Mark its crossing I on the other semicircle.',{beyond:'EH'}),build('P1',['F','I'],'Join FI.'),build('P1',['E','I'],'Join EI.'),build('P1',['E','K'],'Join EK.')],
  proofGuide:proof([
   ['E is the center of circle C1','E3.1','Find the center.'],['EB + EF > BF','I20','Apply the triangle inequality.'],['EA = EB','D15','The radii are equal.'],['AF = AE + EF','CN2','E lies between A and F.'],['AF > FB','CN1','Substitute the equal radius and the whole segment.'],['EB = EC','D15','Compare radii.'],['angle BEF > angle CEF','CN5','The ordered central rays give a strict angle containment.'],['FB > FC','I24','Equal adjacent sides and a greater included angle give a greater base.'],['EC = EG','D15','These are also radii.'],['angle CEF > angle GEF','CN5','Use the next pair of ordered rays.'],['FC > FG','I24','Apply the same hinge argument.'],['GF + FE > EG','I20','Apply the triangle inequality at G.'],['EG = ED','D15','The radii are equal.'],['ED = EF + FD','CN2','F lies between E and D.'],['FG > FD','CN3','Subtract EF from the strict inequality after substituting ED.'],['AF is longest from F to circle C1','Logic','The arbitrary triangle comparison applies to every non-diameter endpoint.'],['FD is shortest from F to circle C1','Logic','The other triangle comparison applies to every such endpoint.'],['angle GEF = angle FEI','I23','The angle was copied to the other side.'],['EG = EI','D15','Both endpoints are recorded on C1.'],['FG = FI','I4','Use the equal radii, common EF, and copied included angle.'],['EK = EI','D15','The third candidate also lies on C1.'],['angle KEF > angle IEF','CN5','The remaining candidate has a strictly different central direction.'],['FK > FI','I24','The same strict hinge comparison excludes equality.'],...conditional('FK = FG',[['FK = FI','CN1','Substitute the established equal distance FI.'],['contradiction','Logic','The strict comparison excludes this supposed third equal segment.']]),['Only G and I on circle C1 are at distance FG from F','Logic','On each side, the strict ordering permits at most one endpoint.']
  ]),goals:['AF is longest from F to circle C1','FD is shortest from F to circle C1','FB > FC','FC > FG','FG = FI','Only G and I on circle C1 are at distance FG from F']
 });
 return [first,second,third,fourth,fifth,sixth,seventh];
})();
