const output=[];
function assert(value,message){if(!value)throw Error(message);output.push('PASS '+message)}
function fixture(i){
 let s={points:structuredClone(LESSONS[i].points),edges:[...LESSONS[i].edges],rays:[],circles:[],facts:[],lines:[]};
 if(i===0){s.points.C=[390,325-110*Math.sqrt(3)];s.edges.push('AC','BC');s.circles=[{a:'A',b:'B'},{a:'B',b:'A'}]}
 if(i===1){let D=[380,300-80*Math.sqrt(3)],r=Math.sqrt(12800),factor=(160+r)/160;s.points.D=D;s.points.G=[460+(460-D[0])*r/160,300+(300-D[1])*r/160];s.points.L=[D[0]+(300-D[0])*factor,D[1]+(300-D[1])*factor];s.edges.push('AB','DA','DB','AL');s.rays=['DB','DA'];s.circles=[{a:'B',b:'C'},{a:'D',b:'G'}];s.facts=['equilateral:D:A:B']}
 if(i===2){s.points.E=[180,160];s.points.F=[320,300];s.edges.push('AE');s.circles=[{a:'A',b:'E'}];s.facts=['copy:A:E:C:D']}
 if(i===3)s.facts=['superpose:ABC:DEF'];
 if(i===4){s.points.F=[208,436];s.points.G=[592,436];s.edges.push('BF','CG','FC','GB');s.rays=['AB','AC'];s.facts=['cut:A:F:A:G']}
 EuclidConstruction.initialize(s,LESSONS[i]);
 for(let n of Object.keys(s.points))EuclidConstruction.intersection(s,n);
 return s;
}
function grade(s,i){return EuclidLogic.grade(s,LESSONS[i])}
function lines(...pairs){return pairs.map(([s,j])=>({s,j}))}
try{
 for(let i=0;i<5;i++){
  let s=fixture(i);s.lines=LESSONS[i].hintSteps.map(r=>({s:r.s,j:r.j}));let result=grade(s,i);
  assert(result.complete,'Reference derivation I.'+(i+1)+' — '+s.lines.filter(l=>!l.valid).map(l=>l.s+': '+l.error).join('; '));
  let distorted=structuredClone(s);Object.keys(distorted.points).forEach((n,k)=>distorted.points[n]=[k*17,k*k*23]);assert(grade(distorted,i).complete,'Original proposition '+(i+1)+' ignores display coordinates');
  let lesson={...LESSONS[i],hintSteps:[]};assert(EuclidLogic.grade(s,lesson).complete,'Grader independent of hint route I.'+(i+1));
 }
 let s=fixture(0);s.lines=lines(['BA = BC','D15'],['AB = CA','D15'],['BCA is equilateral','D20']);assert(grade(s,0).complete,'Shorter reordered proof, with no prescribed transitivity line');
 s.lines=lines(['AB = BC','D15'],['CA = BA','D15'],['CA = CB','CN1'],['CAB is equilateral','D20']);assert(grade(s,0).complete,'Equivalent length notation and triangle permutation');
 s.lines=lines(['AC = BC','D15']);assert(!grade(s,0).complete&&!s.lines[0].valid,'Different circles do not justify equality of their radii');
 s=fixture(0);s.lines=lines(['ABC is equilateral','D20']);assert(!grade(s,0).complete,'No conclusion from an unproved drawing');
 s.lines=lines(['AC = AB','D15'],['AC = BC','CN1'],['BC = BA','D15']);grade(s,0);assert(!s.lines[1].valid,'Later lines cannot justify earlier lines');
 s=fixture(0);s.circles=[];s.lines=lines(['AB = BC','D15']);grade(s,0);assert(!s.lines[0].valid,'Equal-looking lengths require construction evidence');
 s=fixture(4);s.lines=lines(['AB = AC','Given'],['AF = AG','I3'],['ACF is congruent to ABG','I4'],['BCF is congruent to CBG','I4']);grade(s,4);assert(s.lines[2].valid&&!s.lines[3].valid,'SAS derives new correspondence but not unsupported second congruence');
 s=fixture(4);s.lines=lines(['AB = AC','Given'],['ACB is congruent to ABC','I4'],['\u2220ABC = \u2220ACB','I4'],['\u2220FBC = \u2220GCB','CN3']);assert(grade(s,4).complete,'Alternate direct SAS proof of I.5, without auxiliary proof checklist');
 s=fixture(4);s.lines=lines(['AB = AC','Given'],['AB = AF','CN1']);grade(s,4);assert(!s.lines[1].valid,'Unrelated equality is rejected');
 s=fixture(3);s.lines=lines(['AB = DE','Given'],['AC = DF','Given'],['\u2220BAC = \u2220EDF','Given'],['CBA is superposed on FED','CN4'],['DEF is congruent to ABC','CN4']);assert(grade(s,3).complete,'Superposition preserves correspondence and needs no prescribed parts lines');
 s.lines=lines(['AB = DE','Given'],['AC = DF','Given'],['\u2220BAC = \u2220EDF','Given'],['ABC is congruent to DFE','CN4']);grade(s,3);assert(!s.lines.at(-1).valid,'Incorrect correspondence rejected');
 s=fixture(0);s.lines=lines(['ABC is congruent to CBA','I4']);grade(s,0);assert(!s.lines[0].valid,'Future proposition cannot prove an earlier proposition');
 let algebra={points:{A:[0,0],B:[10,0],C:[0,5],D:[10,5],E:[0,10],F:[4,10],G:[0,15],H:[4,15]},edges:[],rays:[],circles:[],facts:[],lines:lines(['AB = CD','Given'],['EF = GH','Given'],['AB + EF = CD + GH','CN2'],['AB - EF = CD - GH','CN3'],['AB + EF = CD - GH','CN3'])};
 EuclidLogic.grade(algebra,{id:5,givens:['AB = CD','EF = GH']});assert(algebra.lines[2].valid&&algebra.lines[3].valid&&!algebra.lines[4].valid,'Addition and subtraction use linear inference, not literal answer matching');
 algebra.lines=lines(['AB = CD','Given'],['EF = GH','Given'],['AB - EF = CD - GH','CN2']);EuclidLogic.grade(algebra,{id:5,givens:['AB = CD','EF = GH']});assert(!algebra.lines[2].valid,'Subtraction is not accepted with an addition justification');
 algebra.lines=lines(['AB = CD','Given'],['EF = GH','Given'],['AB + EF = CD + GH','CN1']);EuclidLogic.grade(algebra,{id:5,givens:['AB = CD','EF = GH']});assert(!algebra.lines[2].valid,'Transitivity cannot silently perform addition');
 assert(!EuclidLogic.parse('AB = angle ABC'),'Lengths and angles cannot be equated');
 assert(suggestStatementFormat('QRS equilaterl').text==='QRS is equilateral','Formatter corrects keyword spelling, retaining user vertices');
 assert(suggestStatementFormat('congruent XYZ UVW').text==='XYZ is congruent to UVW','Formatter preserves user correspondence');
 assert(suggestStatementFormat('BC equals AB').text==='BC = AB','Formatter preserves equality order');
 assert(suggestStatementFormat('XY + ZW equals QR - ST').text==='XY + ZW = QR - ST','Formatter preserves whole user expressions without choosing an answer');
 assert(suggestStatementFormat('angle XYZ equals angle UVW').text==='\u2220XYZ = \u2220UVW','Formatter preserves user angle names');
 assert(!suggestStatementFormat('AB = CD'),'No suggestions for already formatted statements, regardless of truth');
 assert(!suggestStatementFormat(''),'No unsolicited suggestions');
 assert(suggestStatementFormat('equilateral').text==='[triangle] is equilateral'&&!suggestStatementFormat('equilateral').insertable,'Missing names use placeholders, never lesson answers');
 const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
 assert(capitalizeGeometryLabels('ab = ac',alphabet)==='AB = AC','Geometric segments capitalize automatically');
 assert(capitalizeGeometryLabels('area abcd = 2 area efgh',alphabet)==='area ABCD = 2 area EFGH','Area labels capitalize while words and quantities stay unchanged');
 assert(capitalizeGeometryLabels('abcd is a square',alphabet)==='ABCD is a square','Point A is distinct from the article a');
 assert(capitalizeGeometryLabels('2ab = 2ac',alphabet)==='2AB = 2AC','Coefficients do not prevent label capitalization');
 assert(capitalizeGeometryLabels('is = an',alphabet)==='IS = AN','Word-like labels still capitalize in mathematical positions');
 assert(capitalizeGeometryLabels('a = b',alphabet)==='A = B','Individual point labels capitalize');
 assert(capitalizeGeometryLabels('this is a bad proof',alphabet)==='this is a bad proof','Ordinary prose is preserved');
 output.push('ALL CHECKS PASSED');
}catch(e){output.push('FAILED '+e.stack)}
document.querySelector('#results').textContent=output.join('\n');
