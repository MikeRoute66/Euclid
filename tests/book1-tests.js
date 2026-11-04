addEventListener('load',()=>{
 const results=[];let failures=0;const operations=new Set();
 const check=(ok,message)=>{if(!ok){failures++;results.push('FAIL '+message)}else results.push('PASS '+message)};
 function lineIntersection(a,b){let p=state.points[a[0]],q=state.points[a[1]],r=state.points[b[0]],s=state.points[b[1]],u=[q[0]-p[0],q[1]-p[1]],v=[s[0]-r[0],s[1]-r[1]],cross=(x,y)=>x[0]*y[1]-x[1]*y[0],t=cross([r[0]-p[0],r[1]-p[1]],v)/cross(u,v);return [p[0]+t*u[0],p[1]+t*u[1]]}
 try{
  $('#continue-menu').click();saved={};
  check(LESSONS.length===48,'All 48 Book I propositions present');check(REFERENCES.propositions.length===48,'All proposition references present');
  for(let i=5;i<48;i++){
   try{
    load(i);state=fresh();render();let lesson=LESSONS[i];
    for(let task of lesson.construction||[]){
     if(/^I/.test(task.ref)&&Number(task.ref.slice(1))>=lesson.id)throw Error('Construction uses future theorem '+task.ref);
     tool=Object.values(REFERENCES).flat().find(r=>r[1]===task.ref);picks=[];
     if(task.ref==='D1'&&task.inputs.length)task.inputs.forEach(choosePoint);
     else if(task.ref==='D1'){
      let supports=task.text.match(/\b[A-Z]{2}\b/g)||[],coordinate;
      if(supports.length>=2)coordinate=lineIntersection(supports[0],supports[1]);
      else {let circles=state.circles.slice(-2),candidates=bookOneIntersections().filter(p=>circles.every(c=>Math.abs(distance(p,state.points[c.a])-distance(state.points[c.a],state.points[c.b]))<.001));coordinate=candidates.sort((a,b)=>a[1]-b[1])[0]}
      if(!coordinate||!coordinate.every(Number.isFinite))throw Error('No indicated intersection: '+task.text);bookOneMark(coordinate);
     }else task.inputs.forEach(choosePoint);
     if(task.outputs.some(n=>!state.points[n]))throw Error('Construction failed: '+task.ref+' '+task.text+' '+$('#instruction').textContent);
    }
    for(let step of lesson.proofGuide){
     EuclidLogic.grade(state,lesson);let hint=bookOneHint();
     check(hint.includes('complete')||(hint.includes('Reasoning:')&&hint.includes('click ')),'E.'+lesson.id+' actionable hint for '+step.s);
     check(proofStepReason(lesson,step)?.length>60,'E.'+lesson.id+' explains '+step.s);
     state.lines.push({s:step.s,j:step.j});
    }
    state.lines=lesson.proofGuide.map(r=>({s:r.s,j:r.j}));let result=EuclidLogic.grade(state,lesson),bad=state.lines.flatMap((l,n)=>l.valid?[]:[(n+1)+'. '+l.s+' ['+l.j+'] '+l.error]);
    check(result.complete,'I.'+lesson.id+' construction and proof'+(bad.length?' — '+bad.join('; '):!result.goalReached?' — conclusion missing':''));
    for(let raw of state.facts.filter(f=>f.startsWith('book:'))){let record=JSON.parse(raw.slice(5));operations.add(record.operation);check(EuclidConstruction.certificate(record,state.points),'E.'+lesson.id+' validates '+record.operation+' contract');let isolated=structuredClone(state);isolated.lines=[];let withRecord=BookOneLogic.context(isolated,lesson).check(BookOneLogic.parse(record.claims[0]),'I'+record.rule).ok;isolated.facts=[];let withoutRecord=BookOneLogic.context(isolated,lesson).check(BookOneLogic.parse(record.claims[0]),'I'+record.rule).ok;check(withRecord&&!withoutRecord,'E.'+lesson.id+' '+record.operation+' requires its construction certificate')}
    let positions=structuredClone(state.points);for(let [k,n] of Object.keys(state.points).entries())state.points[n]=[17*k*k+3,11*k+7];
    check(EuclidLogic.grade(state,lesson).complete===result.complete,'E.'+lesson.id+' proof is independent of displayed coordinates');state.points=positions;let legacy=structuredClone(state);delete legacy.topology;EuclidConstruction.initialize(legacy,lesson);if(!lesson.construction.some(t=>t.ref==='D1'))check(EuclidLogic.grade(legacy,lesson).complete===result.complete,'E.'+lesson.id+' replays older construction certificates');

   }catch(error){check(false,'I.'+(i+1)+' '+error.message)}
  }
  check(referenceName('I1').startsWith('E.1'),'Proof justifications use E labels');
  check(displayReference('I1, I.48 and point I')==='E.1, E.48 and point I','Display labels preserve geometry names');
  check([...$('#chapters select').options].every(o=>o.textContent.startsWith('E.')),'Every navigation label uses E');
  load(5);state=fresh();state.lines=[{s:LESSONS[5].proofGuide[0].s,j:'Given'},{s:'AB = AC',j:null}];render();check(bookOneHint().includes('line 2')&&bookOneHint().includes('Deduction above the proof')&&bookOneHint().includes('Suppose AB'),'Pending deduction receives its argument and precise action');
  load(1);state=fresh();tool=REFERENCES.propositions[0];choosePoint('A');choosePoint('B');check(nextHint().includes('Select P2'),'E.2 hint recognizes the E.1 construction record');state.lines=[{s:'AD = DB',j:'D20'},{s:'BDA is equilateral',j:'D20'}];render();check(state.lines.every(l=>l.valid),'E.1 tool immediately supports D20 side equality and reordered triangle');
  let snapshotDocument=saveDocument();restoreSave(snapshotDocument);check(state.lines.every(l=>l.valid),'E.1 construction memory survives save and load');
  load(8);state=fresh();tool=REFERENCES.propositions[0];choosePoint('A');choosePoint('B');let apex=Object.keys(state.points).at(-1);state.lines=[{s:'A'+apex+' = B'+apex,j:'D20'}];render();check(state.lines[0].valid,'Later lessons extract equilateral sides with D20');
  state.facts=[];render();check(!state.lines[0].valid,'Equal-looking triangle without its construction record is rejected');
  load(0);state=fresh();state.points.C=[state.points.A[0],state.points.A[1]+distance(state.points.A,state.points.B)];EuclidConstruction.point(state,'C');state.edges.push('AC');tool=REFERENCES.postulates.find(r=>r[1]==='P3');choosePoint('A');choosePoint('B');state.lines=[{s:'AB = AC',j:'D15'}];render();check(!state.lines[0].valid,'Coincidental endpoint on a circle is not radius evidence');
  tool=REFERENCES.postulates.find(r=>r[1]==='P1');choosePoint('A');choosePoint('C');render();check(!state.lines[0].valid,'Joining a coincidental point does not manufacture radius membership');tool=REFERENCES.definitions.find(r=>r[1]==='D1');choosePoint('C');check(state.lines[0].valid,'Explicit point-on-circle construction records membership');$('#undo').click();check(!state.lines[0].valid,'Undo removes radius construction evidence');tool=REFERENCES.definitions.find(r=>r[1]==='D1');choosePoint('C');
  let radiusSave=saveDocument();restoreSave(radiusSave);check(state.lines[0].valid,'Circle membership survives save/load');$('#undo').click();
  let recorded=structuredClone(state.topology);state.topology.circles=[];render();check(!state.lines[0].valid,'Removing radius membership removes its proof support');state.topology=recorded;
  load(47);state=fresh();state.points={A:[0,0],B:[100,0],C:[100,100],D:[0,100],E:[250,100],F:[350,100]};state.edges=['AB','BC','CD','DA','EF'];EuclidConstruction.initialize(state,LESSONS[47]);tool=REFERENCES.propositions[44];['A','B','C','D','A','B','C','E','F'].forEach(choosePoint);let figureRecord=state.facts.find(f=>f.startsWith('book:'));check(!!figureRecord&&EuclidConstruction.certificate(JSON.parse(figureRecord.slice(5)),state.points),'Figure-area construction has a valid contract');operations.add('figureArea');
  let figureState=structuredClone(state);for(let [k,n] of Object.keys(state.points).entries())state.points[n]=[k*13,k*k*9];state.lines=JSON.parse(figureRecord.slice(5)).claims.map(s=>({s,j:'I45'}));render();check(state.lines.every(l=>l.valid),'Figure-area claims depend on their record, not display positions');state=figureState;
  check(operations.size===13,'Every theorem construction type exercised');
  load(47);state=fresh();tool=REFERENCES.propositions[45];choosePoint('A');choosePoint('B');let square=JSON.parse(state.facts.find(f=>f.startsWith('book:')).slice(5)),polygon=square.claims[0].slice(0,4);state.lines=[{s:polygon[1]+polygon[2]+' = '+polygon[2]+polygon[3],j:'D22'},{s:'angle '+polygon.slice(1,4)+' is right',j:'D22'}];render();check(state.lines.every(l=>l.valid),'Square construction exposes every side and right angle through D22');
  load(47);state=fresh();state.points={A:[0,0],B:[100,0],C:[100,100],D:[0,100]};state.edges=['AB','BC','CD','DA'];EuclidConstruction.initialize(state,LESSONS[47]);state.lines=[{s:'ABCD is a square',j:'D22'},{s:'AB is parallel to CD',j:'D23'},{s:'angle ABC is right',j:'D10'}];render();check(state.lines.every(l=>!l.valid),'A square-looking free drawing supplies no square, parallel, or right-angle premise');state.points.E=[50,0];EuclidConstruction.point(state,'E');state.lines=[{s:'angle AEC + angle CEB = 2 right angles',j:'I13'}];render();check(!state.lines[0].valid,'Coincidental collinearity supplies no straight-angle premise');
  state.topology={version:1,lines:[],turns:{},directions:{},circles:[]};state.lines=[{s:'area ABC = area ACD',j:'CN2'}];render();check(!state.lines[0].valid,'Missing orientation records cannot collapse areas to zero');
  let forged=structuredClone(square);forged.rule=1;check(!EuclidConstruction.certificate(forged,state.points),'Construction certificate rejects a mismatched proposition');forged=structuredClone(square);forged.claims[0]='ABC is equilateral';check(!EuclidConstruction.certificate(forged,state.points),'Construction certificate rejects an unrelated claim');
  load(34);state=fresh();state.lines=[{s:'area ABCD = area ABEF',j:'CN2'}];EuclidLogic.grade(state,LESSONS[34]);check(!state.lines[0].valid,'Equal-looking area is not a proof without parallel premises');
  load(35);state=fresh();state.lines=LESSONS[35].givens.slice(0,2).map(s=>({s,j:'Given'}));state.lines.push({s:'area ABCD = area EFGH',j:'Logic'});EuclidLogic.grade(state,LESSONS[35]);check(!state.lines.at(-1).valid,'Equal-base premise is required for area equality');
  load(46);state=fresh();state.lines=[{s:'BC^2 = AB^2 + AC^2',j:'CN2'}];EuclidLogic.grade(state,LESSONS[46]);check(!state.lines[0].valid,'Right-looking diagram does not prove Pythagoras');
  state.lines=[{s:'angle BAC is right',j:'Given'},{s:'BC^2 = AB^2 + AC^2',j:'I37'}];EuclidLogic.grade(state,LESSONS[46]);check(!state.lines[1].valid,'Unrelated area theorem cannot justify a squares identity');
  load(25);state=fresh();let ambiguous={...LESSONS[25],givens:['AB = DE','AC = DF','angle ABC = angle DEF']};state.lines=ambiguous.givens.map(s=>({s,j:'Given'}));state.lines.push({s:'ABC is congruent to DEF',j:'CN4'});EuclidLogic.grade(state,ambiguous);check(!state.lines.at(-1).valid,'Ambiguous side-side-angle is not a congruence rule');
  check(!BookOneLogic.parse('angle ABA = angle ABA'),'Degenerate angle syntax rejected');
  load(27);state=fresh();let supplemental={...LESSONS[27],givens:['angle BGH + angle GHD = 2 right angles']};state.lines=[{s:supplemental.givens[0],j:'Given'},{s:'AB is parallel to CD',j:'I27'}];EuclidLogic.grade(state,supplemental);check(state.lines.at(-1).valid,'Second parallel-test case uses supplementary interior angles');
  check(suggestStatementFormat('XY parallel ZW').text==='XY is parallel to ZW','Parallel format help preserves user lines');
  check(suggestStatementFormat('PQRS square').text==='PQRS is a square','Square format help preserves user vertices');
  check(suggestStatementFormat('area PQR equals 2 area STU').text==='area PQR = 2 area STU','Area format help preserves quantities');
  load(0);state=fresh();state.points.C=[390,325-110*Math.sqrt(3)];state.circles=[{a:'A',b:'B'},{a:'B',b:'A'}];state.edges.push('AC','BC');EuclidConstruction.intersection(state,'C');state.lines=[{s:'AC = AB',j:'D15'},{s:'BC = AB',j:'D15'},{s:'ABC is equilateral',j:'D20'}];render();
  check(state.completed,'Original first proposition still works');let before=state.lines.length;$('#lines .delete-line').click();check(state.lines.length===before-1&&!state.completed,'Delete removes a premise and rechecks dependent proof');$('#undo').click();check(state.lines.length===before&&state.completed,'Undo restores deleted premise');beginEdit(2);deleteProofLine(0);check(editingLine===1,'Delete renumbers an active editor');deleteProofLine(1);check(editingLine===null,'Delete closes editor for deleted line');
  function invalidConstruction(rule,inputs,message){load(47);state=fresh();tool=REFERENCES.propositions.find(r=>r[1]===rule)||REFERENCES.postulates.find(r=>r[1]===rule);render();let before=JSON.stringify(state);inputs.forEach(choosePoint);check(JSON.stringify(state)===before,message)}
  invalidConstruction('I1',['A','A'],'Equilateral tool rejects identical endpoints');invalidConstruction('I2',['A','B','B'],'Length-copy tool rejects zero source');invalidConstruction('I10',['A','A'],'Midpoint tool rejects identical endpoints');invalidConstruction('I9',['A','B','A'],'Angle-bisector tool rejects a degenerate angle');invalidConstruction('I11',['A','B','C'],'E.11 rejects an outside point');invalidConstruction('I12',['A','B','A'],'E.12 rejects a point on its line');invalidConstruction('I31',['A','A','B'],'Parallel tool rejects a point on its reference line');invalidConstruction('P3',['A','A'],'Circle tool rejects zero radius');invalidConstruction('I46',['A','A'],'Square tool rejects zero side');
  load(47);state=fresh();tool=REFERENCES.propositions[11];['A','B','C'].forEach(choosePoint);let perpendicularRecord=state.facts.find(f=>f.startsWith('book:'));check(!!perpendicularRecord&&EuclidConstruction.certificate(JSON.parse(perpendicularRecord.slice(5)),state.points),'E.12 records the outside-point perpendicular construction');state.lines=[{s:JSON.parse(perpendicularRecord.slice(5)).claims[0],j:'D10'}];render();check(state.lines[0].valid,'D10 unpacks a recorded perpendicular construction');
  load(47);let doc=saveDocument();restoreSave(doc);check(index===47,'Save/load accepts proposition 48');check($('#chapters select').options.length===48,'Header navigation handles 48 propositions');check(document.body.scrollWidth===document.body.clientWidth&&document.body.scrollHeight===document.body.clientHeight,'Expanded workshop fits the viewport');
  openMainMenu();$('#jump-search').value='pythagorean';$('#jump-search').dispatchEvent(new Event('input'));check([...$('#jump-options').children].filter(b=>!b.hidden).some(b=>b.textContent.startsWith('E.47')),'Main-menu search locates I.47');$('#continue-menu').click();
 }catch(error){check(false,error.stack)}
 results.push(failures?'FAILED '+failures+' checks':'ALL CHECKS PASSED');let pre=document.createElement('pre');pre.id='qa-result';pre.textContent=results.join('\n');document.body.replaceChildren(pre);document.body.style.cssText='display:block;height:auto;overflow:auto;white-space:pre-wrap';
});
