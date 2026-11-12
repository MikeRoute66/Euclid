/* Short worked examples. Recognition exercises teach vocabulary; proof exercises
 * are checked with the same construction records and formal grader as Play. */
const TUTORIAL_LESSONS=(()=>{
 const lessons=[];
 const add=(ref,title,prompt,explanation,exercise)=>lessons.push({id:ref+'-'+lessons.filter(l=>l.ref===ref).length,ref,title,prompt,explanation,...exercise});
 const identify=(ref,title,prompt,explanation,scene,targets)=>add(ref,title,prompt,explanation,{kind:'identify',scene,targets});
 const classify=(ref,title,facts,answer,choices,scene,explanation)=>add(ref,title,'Read the given facts. Choose the matching description.',explanation,{kind:'classify',facts,answer,choices,scene});
 const proof=(ref,title,source,match,facts,explanation)=>add(ref,title,'Select '+ref+', then click the unfinished proof line.',explanation,{kind:'proof',source,match,facts});
 const construct=(ref,title,prompt,explanation,operation,targets)=>add(ref,title,prompt,explanation,{kind:'construct',operation,targets});
 construct('D1','Mark a circle intersection','The Point tool is selected. Click the upper crossing of the two circles.','The new point is recorded as lying on both circles. Looking close to a circle is not enough.','intersection',['intersection']);
 construct('D1','Mark a line intersection','The Point tool is selected. Click where the two straight lines cross.','The point belongs to both lines. This record can be used in later reasoning.','lineIntersection',['intersection']);
 construct('D1','Mark a line-circle intersection','The Point tool is selected. Click the right-hand crossing of the line and circle.','The new point is recorded on the line and the circle, so its distance from the center is a radius.','lineCircle',['intersection']);
 construct('D1','Record an existing circle point','The Point tool is selected. C is drawn on the circle but has not been marked on it. Click C.','C is now recorded on the circle. Its position alone did not provide that membership record.','circlePoint',['point:C']);
 construct('D1','Record a point on an arc','The Point tool is selected. Click C to record it on the upper semicircle arc.','The point is recorded on this particular arc and its carrier circle.','arcPoint',['point:C']);
 identify('D2','Length without breadth','Click the straight segment.','A geometric line has length. Its drawn thickness is only there to make it visible.','line',['edge:AB']);
 identify('D3','Ends of a line','Click the two endpoints of AB.','A and B are the endpoints. They are points, not short pieces of the line.','line',['point:A','point:B']);
 identify('D4','Straightness','Click the straight path from A to B.','The straight path lies evenly with its points. The bent path does not.','line',['edge:AB']);
 identify('D5','A surface','Click inside the shaded region.','A surface has length and breadth. It has no thickness.','surface',['face:ABCD']);
 identify('D6','Edges of a surface','Click an edge of the shaded surface.','The edges bounding this surface are lines.','surface',['anyEdge']);
 identify('D7','A plane surface','Click the flat shaded region.','A plane surface lies evenly with straight lines on it. This diagram represents one plane.','surface',['face:ABCD']);
 identify('D8','An angle','Click the colored angle between BA and BC.','The two rays meet at B. Their inclination is an angle.','angle',['angle:ABC']);
 identify('D8','An angle with a curved boundary','Click the colored region between the straight line and the curve at B.','Euclid\u2019s general plane-angle definition also includes angles with curved boundaries. The next definition singles out straight-sided angles.','curvedAngle',['angle:curved']);
 identify('D9','A rectilinear angle','Click the angle made by the two straight rays.','An angle bounded by straight lines is rectilinear.','angle',['angle:ABC']);
 proof('D10','Equal adjacent angles','1.11',/^CF is perpendicular/,'The construction and preceding proof give equal adjacent angles on AB.','Equal adjacent angles make each a right angle. The meeting lines are perpendicular.');
 proof('D10','A perpendicular gives right angles','1.13',/^angle ACE is right/,'CE is perpendicular to AB. A, C, and B lie on one straight line.','The angle between the perpendicular and either side of the line is right.');
 classify('D11','Recognize an obtuse angle','Given: angle ABC is greater than a right angle.','Obtuse',['Acute','Right','Obtuse'],'obtuse','An obtuse angle is greater than a right angle.');
 classify('D12','Recognize an acute angle','Given: angle ABC is less than a right angle.','Acute',['Acute','Right','Obtuse'],'angle','An acute angle is less than a right angle.');
 identify('D13','The boundary of a segment','Click an endpoint of AB.','The extremities of a segment are its endpoints. Here either A or B is a boundary point.','line',['eitherEndpoint']);
 identify('D13','The boundary of a region','Click an edge of the shaded region.','The boundary separates the region from what is outside it.','surface',['anyEdge']);
 identify('D13','A curved boundary','Click the circumference of the circle.','This curve is the boundary of the circular region. The center is not part of the boundary.','circle',['boundary:circle']);
 identify('D14','Enclosed by straight boundaries','Click the enclosed region.','The closed boundary encloses a figure. An open path would not enclose one.','surface',['face:ABCD']);
 identify('D14','Enclosed by a curved boundary','Click inside the circle.','A figure may have one curved boundary, as a circle does.','circle',['face:circle']);
 proof('D15','Radii of a constructed circle','1.1',/^AC = AB$/,'The circle centered at A was drawn through B. C was marked on that circle.','AB and AC are radii of the same recorded circle, so they are equal.');
 proof('D15','Radii after extending a line','1.2',/^BG = BC$/,'The circle centered at B passes through C. G is its recorded intersection with an extended line.','A radius may end at an intersection on an extension. BC and BG still belong to the same circle.');
 identify('D16','Find the center','Given: the circle was drawn with center O. Click O.','The center is the interior point from which all points of the circumference are equally distant.','circle',['point:O']);
 identify('D17','A diameter','Click the segment through O joining opposite points of the circle.','AB passes through the center and has both ends on the circle. It is a diameter.','circle',['edge:AB']);
 identify('D17','The two equal halves','Click either half of the disk divided by diameter AB.','A diameter divides the circle into two equal halves.','halves',['half:upperOrLower']);
 identify('D18','A semicircle','Click the upper half of the disk.','The upper arc and diameter AB bound a semicircle. Its center is O, the center of the full circle.','halves',['half:upper']);
 construct('D18','Draw a semicircle arc','The semicircle tool is selected. Center O and diameter AB are supplied. Click C to choose the upper side.','The recorded arc joins the diameter endpoints on the chosen side. The diameter and arc bound a semicircle.','semicircle',['point:C']);
 for(const [title,answer,scene] of [['Three straight sides','Triangle','triangle'],['Four straight sides','Quadrilateral','surface'],['More than four straight sides','Multilateral figure','pentagon']])classify('D19',title,'Count the straight sides of the enclosed figure.',answer,['Triangle','Quadrilateral','Multilateral figure'],scene,'A '+answer.toLowerCase()+' is named by the number of straight sides enclosing it.');
 classify('D20','Equilateral triangle','Given: AB = BC and BC = CA.','Equilateral',['Equilateral','Isosceles','Scalene'],'equilateral','All three sides are equal.');
 classify('D20','Isosceles triangle','Given: AB = AC, and BC differs from both.','Isosceles',['Equilateral','Isosceles','Scalene'],'isosceles','Exactly two sides are equal, as in Euclid\u2019s wording of the definition.');
 classify('D20','Scalene triangle','Given: AB, BC, and CA are pairwise unequal.','Scalene',['Equilateral','Isosceles','Scalene'],'triangle','No two sides are equal.');
 proof('D20','Prove a triangle equilateral','1.1',/^ABC is equilateral$/,'The earlier proof lines establish AC = AB and AC = BC.','The proved side equalities meet the definition of an equilateral triangle.');
 proof('D20','Use a constructed equilateral triangle','1.2',/^DA = DB$/,'An earlier construction placed equilateral triangle DAB on AB.','The construction record already establishes that DAB is equilateral. Its sides are equal without restating that fact first.');
 for(const [title,facts,answer,scene] of [
  ['Right-angled triangle','Given: angle ABC is right.','Right-angled','rightTriangle'],
  ['Obtuse-angled triangle','Given: angle ABC is obtuse.','Obtuse-angled','obtuseTriangle'],
  ['Acute-angled triangle','Given: all three angles are acute.','Acute-angled','equilateral']
 ])classify('D21',title,facts,answer,['Right-angled','Obtuse-angled','Acute-angled'],scene,'The given angle facts determine the triangle type. The appearance alone is not a proof.');
 for(const [title,facts,answer,scene] of [
  ['A square','Given: all four sides are equal and all four angles are right.','Square','square'],
  ['An oblong','Given: all four angles are right, but the sides are not all equal.','Oblong','surface'],
  ['A rhombus','Given: all four sides are equal, but the angles are not right.','Rhombus','rhombus'],
  ['A rhomboid','Given: opposite sides and opposite angles are equal; not all sides are equal and no angle is right.','Rhomboid','rhomboid'],
  ['Other quadrilaterals','Given: this four-sided figure is none of the other four types.','Trapezium','trapezium']
 ])classify('D22',title,facts,answer,['Square','Oblong','Rhombus','Rhomboid','Trapezium'],scene,answer==='Trapezium'?'Euclid calls the remaining quadrilaterals trapezia. This is broader than some modern uses of the word.':'The supplied side and angle facts give this classification: '+answer.toLowerCase()+'.');
 proof('D22','Recognize a proved square','1.46',/^ABGD is a square$/,'The proof has established four equal sides and four right angles.','Those properties establish a square. A shape that merely looks square would not be enough.');
 proof('D22','Equal sides of a square','1.47',/^AB = BF$/,'The construction record establishes square ABFG.','The sides of a recorded square are equal by its definition.');
 add('D22','Right angles of a square','Select D22, then click the unfinished proof line.','Each angle of an established square is right.',{kind:'proof',source:'1.47',match:/^AB = BF$/,replacement:'angle ABF is right',facts:'The construction record establishes square ABFG.'});
 classify('D23','What parallel means','Given: AB and CD lie in one plane and never meet in either direction, however far they are extended.','AB is parallel to CD',['AB is parallel to CD','AB is perpendicular to CD'],'parallel','Parallel lines must be coplanar and never meet. Merely failing to meet inside this drawing is not enough.');
 proof('D23','Use the same parallel support','1.44',/^MJ is parallel to AB$/,'The proof and construction have established parallel supports. The named segments lie on those same supports.','Renaming points on an established parallel support preserves its parallelism. The record, not the screen position, supplies the evidence.');
 construct('P1','Join two points','The join tool is selected. Click A, then B.','A straight segment is now recorded between the selected points. No length equality follows from joining alone.','line',['point:A','point:B']);
 construct('P2','Continue a line','The extend tool is selected. Click A, then B to continue AB beyond B.','The line continues straight beyond its second selected point. Extension alone does not make two lengths equal.','extend',['point:A','point:B']);
 construct('P3','Choose a center and radius','The circle tool is selected. Click O, then A.','The circle has center O and radius OA. A is recorded on its circumference.','circle',['point:O','point:A']);
 proof('P4','Compare right angles','1.13',/^angle ACE = right angle$/,'Angle ACE has already been proved right.','Every right angle equals a right angle. This postulate compares angles already known to be right.');
 proof('P4','Two established right angles','1.47',/^angle ABF = angle EBC$/,'ABFG and BCDE are constructed squares, so the two named angles are right.','The angles are equal because both are right angles.');
 proof('P5','Lines must meet','2.10',/^FB meets DI at J$/,'The preceding angle comparison shows that the interior angles on the meeting side total less than two right angles.','The fifth postulate guarantees that the extended lines meet on that side. It supplies an existence argument, not a measured intersection.');
 proof('P5','Angles across parallels','1.29',/^angle AGH = angle GHD$/,'AB and CD are given parallel. A transversal crosses them at G and H.','Euclid uses the fifth postulate in a contradiction argument to establish equality of these alternate angles.');
 proof('CN1','Equal lengths','1.1',/^AC = BC$/,'AC = AB and BC = BA have been established. AB and BA name the same segment.','Lengths equal to the same length equal one another.');
 proof('CN1','Equal angles','1.28',/^angle AGH = angle GHD$/,'The given angle EGB equals angle GHD. The preceding vertical-angle step gives EGB = AGH.','The two angles equal to angle EGB equal one another.');
 proof('CN1','Equal areas','2.5',/^area /,'The preceding proof establishes the area equalities shown in the facts.','Areas equal to one and the same area are equal to each other. Lengths and areas are different kinds of magnitude.');
 proof('CN2','Add lengths','1.20',/^BE = BA \+ AE$/,'A lies between B and E on the recorded straight line.','A whole segment is the sum of its adjacent parts. This addition records BE as BA plus AE.');
 add('CN2','Add equal lengths','Select CN2, then click the unfinished proof line.','Add the two given pairs of equal lengths to obtain equal totals.',{kind:'customProof',scene:'lengths',statement:'AB + EF = CD + GH',givens:['AB = CD','EF = GH'],facts:'Given: AB = CD and EF = GH.'});
 proof('CN2','Preserve an angle inequality','1.17',/^angle ACD \+ angle ACB >/,'Angle ACD has been proved greater than angle ABC. Add angle ACB to both.','Adding the same angle preserves the strict inequality.');
 proof('CN2','Add equal angles','1.29',/^angle EGB \+ angle BGH/,'The preceding step gives angle EGB = angle GHD. Add the same angle BGH to both.','Adding equal angles to equal angles gives equal totals.');
 proof('CN2','Add equal areas','1.35',/^area /,'Use the established area equalities in the preceding facts.','Adding the same area, or equal areas, to equal areas preserves equality.');
 proof('CN2','Double equal areas','1.41',/^2 area ABC = 2 area ABE$/,'Area ABC equals area ABE. Add each area to itself.','Repeated addition is still addition of equal areas.');
 proof('CN3','Subtract equal lengths','1.2',/^AL = BG$/,'DL = DG and DA = DB are proved. A lies between D and L; B lies between D and G.','Remove equal parts DA and DB from equal wholes DL and DG. The remaining lengths AL and BG are equal.');
 proof('CN3','Subtract equal angles','1.15',/^angle AEC = angle BED$/,'The preceding equality has the same angle AED added on both sides.','Remove angle AED from each equal total. The remaining vertical angles are equal.');
 proof('CN3','Subtract equal areas','1.35',/^area ADF - area CFG/,'Area ADF equals area BCE. Remove the same region CFG from both.','Removing equal areas from equal areas leaves equal remainders.');
 construct('CN4','Superpose two triangles','The coincidence tool is selected. Click A, then D to place ABC on DEF.','The given two side equalities and included-angle equality make corresponding vertices coincide.','superpose',['point:A','point:D']);
 proof('CN4','Coincident triangles','1.4',/is superposed/,'The given side and angle equalities justify the recorded superposition.','Coincidence establishes equality while preserving the correspondence A to D, B to E, and C to F.');
 proof('CN4','Coincident sides','1.4',/^BC = EF$/,'ABC has been justified as superposed on DEF.','Corresponding coincident sides are equal.');
 proof('CN4','Coincident angles','1.4',/ABC =.*DEF$/,'ABC has been justified as superposed on DEF.','Corresponding coincident angles are equal.');
 proof('CN4','Congruent figures','1.4',/is congruent/,'The superposition and equality of corresponding parts are established.','The whole triangles coincide, not merely one pair of sides.');
 add('CN5','A segment and its part','Select CN5, then click the unfinished proof line.','B lies strictly between A and C. AC contains AB and the nonzero remainder BC.',{kind:'customProof',scene:'part',facts:'Given: B lies strictly between A and C.',statement:'AC > AB',givens:[],ref:'CN5'});
 proof('CN5','An angle and its part','1.18',/^angle ABC > angle ABD$/,'BD lies strictly inside angle ABC, as recorded in the construction.','The whole angle ABC is greater than its proper part ABD.');
 classify('CN5','An area and its part','Given: rectangle ABFE is a proper part of rectangle ABCD, with a nonzero region left over.','area ABCD > area ABFE',['area ABCD > area ABFE','area ABCD = area ABFE'],'areaPart','The whole area exceeds its proper part. This is a vocabulary example; formal area proofs in Play use recorded partitions and area addition or subtraction.');
 identify('D2.1','The sides containing a rectangle','Given: ABCD is a rectangle. Click adjacent sides AB and BC.','The two sides forming a right angle contain the rectangle. Opposite sides would not specify its two dimensions.','surface',['edge:AB','edge:BC']);
 proof('D2.1','A rectangle as a product','2.1',/^area BGNC = AX\*BC$/,'BGNC is a constructed rectangle. Its adjacent sides are BG and BC, and BG = AX has been proved.','The rectangle is contained by BG and BC. Substitute the established equal length AX for BG.');
 proof('D2.1','A square as a squared length','2.2',/^area ABDE = AB\^2$/,'ABDE is a constructed square, so its adjacent sides both equal AB.','The area is contained by AB and AB, written AB squared.');
 identify('D2.2','Recognize a gnomon','A parallelogram is divided by parallels through a point on its diagonal. Click the shaded L-shaped union.','The gnomon is one parallelogram about the diagonal together with both complements. The other diagonal parallelogram is omitted.','gnomon',['face:gnomon']);
 proof('D2.2','Name a constructed gnomon','2.5',/is a gnomon$/,'The recorded diagonal and parallel divisions define one diagonal parallelogram and its two complements.','The six named boundary vertices enclose their union. It is the gnomon in Euclid\u2019s definition.');
 return lessons;
})();
