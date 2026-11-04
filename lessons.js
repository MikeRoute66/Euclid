/* Optional hint routes only. The logical grader does not read these recipes. */
const hintStep=(s,j,deps=[],needs=[])=>({s,j,deps,needs});
const LESSONS=[
{title:'An equilateral beginning',description:'On a given finite straight line, construct an equilateral triangle.',given:'AB is a given finite straight line.',points:{A:[280,325],B:[500,325]},edges:['AB'],hintSteps:[hintStep('AC = AB','D15',[],['circle:A:B','point:C']),hintStep('BC = BA','D15',[],['circle:B:A','point:C']),hintStep('AC = BC','CN1',['AC = AB','BC = BA']),hintStep('ABC is equilateral','D20',['AC = AB','AC = BC'],['edge:AC','edge:BC'])],hints:['A circle gives you equal distances from its center. Draw one centered at A through B, and another centered at B through A.','Use the point tool on the upper intersection to create C. Join A to C and B to C with Postulate 1.','Enter AC = AB and BC = BA, justifying each with Definition 15. Use Common notion 1 for AC = BC, then Definition 20 for ABC is equilateral.']},
{title:'Carry a length',description:'At a given point, place a straight line equal to a given straight line.',given:'A is the given point; BC is the given length.',points:{A:[300,300],B:[460,300],C:[540,220]},edges:['BC'],hintSteps:[hintStep('DA = DB','I1',[],['equilateral:D']),hintStep('BG = BC','D15',[],['circle:B:C','point:G']),hintStep('DL = DG','D15',[],['circle:D:G','point:L']),hintStep('AL = BG','CN3',['DA = DB','DL = DG'],['point:L','point:G']),hintStep('AL = BC','CN1',['AL = BG','BG = BC'],['edge:AL'])],hints:['Join A to B. Select Proposition I.1, then A and B, to build triangle DAB.','Extend D through B with Postulate 2. Draw the circle centered at B through C; mark its outer intersection G on the extension. Extend D through A.','Draw a circle centered at D through G. Mark its outer intersection L on DA. Equal radii give DL = DG; subtract DA = DB to get AL = BG, then AL = BC.']},
{title:'A measure of equality',description:'From the greater of two unequal straight lines, cut off a part equal to the less.',given:'AB is greater than CD.',points:{A:[180,300],B:[570,300],C:[230,160],D:[370,160]},edges:['AB','CD'],hintSteps:[hintStep('AE = CD','I2',[],['copy:E']),hintStep('AF = AE','D15',[],['circle:A:E','point:F']),hintStep('AF = CD','CN1',['AE = CD','AF = AE'])],hints:['Select Proposition I.2. Click A, then C and D, to copy length CD to AE.','Draw a circle centered at A through E. Use the point tool to mark its intersection F with AB.','AE = CD follows from I.2. AF = AE follows from Definition 15. Common notion 1 gives AF = CD.']},
{title:'The shape of congruence',description:'Prove that two sides and their included angle determine a triangle.',given:'AB = DE, AC = DF, and ∠BAC = ∠EDF.',points:{A:[140,330],B:[310,330],C:[240,160],D:[450,330],E:[620,330],F:[550,160]},edges:['AB','AC','BC','DE','DF','EF'],hintSteps:[hintStep('AB = DE','Given'),hintStep('AC = DF','Given'),hintStep('∠BAC = ∠EDF','Given'),hintStep('ABC is superposed on DEF','CN4',['AB = DE','AC = DF','∠BAC = ∠EDF'],['superpose']),hintStep('BC = EF','CN4',['ABC is superposed on DEF']),hintStep('∠ABC = ∠DEF','CN4',['ABC is superposed on DEF']),hintStep('∠ACB = ∠DFE','CN4',['ABC is superposed on DEF']),hintStep('ABC is congruent to DEF','CN4',['BC = EF','∠ABC = ∠DEF','∠ACB = ∠DFE'])],hints:['Add the three given equalities. Select the Given button in the proof panel and click each line.','Select Common notion 4 and drag A onto D to superpose the triangles. The equal sides and included angle make the vertices coincide.','Use CN4 to justify ABC is superposed on DEF, then the base and angle equalities, and finally ABC is congruent to DEF. This lesson follows Euclid’s superposition argument.']},
{title:'The bridge of asses',description:'Prove that the base angles of an isosceles triangle are equal, and so are the angles below the base.',given:'AB = AC. AB and AC may be extended beyond B and C.',points:{A:[400,100],B:[280,310],C:[520,310]},edges:['AB','AC','BC'],hintSteps:[hintStep('AB = AC','Given'),hintStep('AF = AG','I3',[],['equalExtensions']),hintStep('AFC is congruent to AGB','I4',['AB = AC','AF = AG'],['edge:FC','edge:GB']),hintStep('FC = GB','I4',['AFC is congruent to AGB']),hintStep('∠AFC = ∠AGB','I4',['AFC is congruent to AGB']),hintStep('∠ACF = ∠ABG','I4',['AFC is congruent to AGB']),hintStep('BF = CG','CN3',['AB = AC','AF = AG']),hintStep('BFC is congruent to CGB','I4',['BF = CG','FC = GB','∠AFC = ∠AGB']),hintStep('∠FBC = ∠GCB','I4',['BFC is congruent to CGB']),hintStep('∠BCF = ∠CBG','I4',['BFC is congruent to CGB']),hintStep('∠ABC = ∠ACB','CN3',['∠ACF = ∠ABG','∠BCF = ∠CBG'])],hints:['Extend A through B and A through C. Select I.3 and click A to mark equal distances AF and AG on these extensions. Join F to C and G to B.','Record AB = AC and AF = AG. The angle at A is shared, so I.4 gives AFC is congruent to AGB. Record FC = GB and the two corresponding angle equalities.','Subtract AB = AC from AF = AG to get BF = CG. I.4 now gives BFC is congruent to CGB. Record the exterior angles and ∠BCF = ∠CBG; subtract the last pair from ∠ACF = ∠ABG for the base angles.']}
];
LESSONS.forEach((lesson,i)=>{lesson.id=i+1;lesson.givens=i===3?['AB = DE','AC = DF','\u2220BAC = \u2220EDF']:i===4?['AB = AC']:i===2?['AB > CD']:[]});
// Book I references, paraphrased from Euclid's Elements. Numbering is preserved.
const REFERENCES={definitions:[
 ['Point','D1','A point has no parts. Click a constructed intersection to mark a point.','point'],
 ['Line','D2','A line has length but no breadth.'],
 ['Ends of a line','D3','The endpoints of a line are points.'],
 ['Straight line','D4','A straight line lies evenly with the points along it.'],
 ['Surface','D5','A surface has length and breadth only.'],
 ['Edges of a surface','D6','The boundaries of a surface are lines.'],
 ['Plane surface','D7','A plane surface lies evenly with the straight lines on it.'],
 ['Plane angle','D8','A plane angle is the inclination between two lines meeting in a plane, without forming a straight line.'],
 ['Rectilinear angle','D9','An angle formed by straight lines is a rectilinear angle.'],
 ['Right angle and perpendicular','D10','When a straight line meets another and makes equal adjacent angles, each is a right angle; the lines are perpendicular.'],
 ['Obtuse angle','D11','An obtuse angle exceeds a right angle.'],
 ['Acute angle','D12','An acute angle is smaller than a right angle.'],
 ['Boundary','D13','A boundary is the extremity of a thing.'],
 ['Figure','D14','A figure is enclosed by one or more boundaries.'],
 ['Circle','D15','A circle is a plane figure enclosed by a curve whose points are all equally distant from one interior point. All its radii are equal.'],
 ['Center of a circle','D16','The interior point specified in Definition 15 is the center.'],
 ['Diameter','D17','A diameter passes through the center and ends on the circumference in both directions; it divides the circle in half.'],
 ['Semicircle','D18','A semicircle is bounded by a diameter and its arc. It shares the center of the full circle.'],
 ['Rectilinear figures','D19','Straight lines enclose rectilinear figures: three sides make a trilateral figure, four a quadrilateral, and more than four a multilateral figure.'],
 ['Triangles classified by sides','D20','An equilateral triangle has three equal sides; an isosceles triangle has exactly two equal sides; a scalene triangle has three unequal sides.'],
 ['Triangles classified by angles','D21','A right-angled triangle has a right angle; an obtuse-angled triangle has an obtuse angle; an acute-angled triangle has three acute angles.'],
 ['Quadrilaterals','D22','A square has equal sides and right angles; an oblong has right angles without all sides equal; a rhombus has equal sides without right angles; a rhomboid has equal opposite sides and angles, without all sides equal or right angles. Other quadrilaterals are called trapezia.'],
 ['Parallel straight lines','D23','Parallel lines lie in the same plane and never meet, even when extended indefinitely in either direction.']
],postulates:[
 ['Join two points','P1','A straight segment can be drawn between any two points. Click its two endpoints.','line'],
 ['Extend a line','P2','A finite straight line can be continued in a straight line. Click its start, then the point to extend beyond.','extend'],
 ['Describe a circle','P3','A circle can be drawn with any center and radius. Click its center, then a circumference point.','circle'],
 ['Right angles','P4','Every right angle is equal to every other right angle.'],
 ['Parallel postulate','P5','If a transversal makes the interior angles on one side of two straight lines total less than two right angles, those lines, extended indefinitely, meet on that side.']
],notions:[
 ['Equality','CN1','Magnitudes equal to one and the same magnitude are equal to each other.'],
 ['Addition','CN2','Adding equal magnitudes to equal magnitudes gives equal totals.'],
 ['Subtraction','CN3','Removing equal magnitudes from equal magnitudes leaves equal remainders.'],
 ['Coincidence','CN4','Magnitudes that coincide are equal. In I.4, select this reference and drag A onto D.','superpose'],
 ['Whole and part','CN5','A whole is greater than any of its proper parts.']
],propositions:[
 ['Equilateral triangle','I1','Construct an equilateral triangle on a segment.','equilateral'],
 ['Transfer a length','I2','Click the destination, then the two endpoints of the source.','copy'],
 ['Cut off a length','I3','In I.5, click A to mark equal extensions.','cut'],
 ['Side?angle?side','I4','Two sides and the included angle determine congruence.']
]};
const GIVEN_REFERENCE=['Given','Given','A hypothesis stated in the problem.'];
