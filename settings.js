const SETTINGS_KEY='euclid-workshop-settings-v1';
const PRACTICE_MODES=['Full challenge','Review','Construction practice','Justification practice','Construction and justifications','Statement practice','Proof practice','Statements and construction'];
const DEFAULT_SETTINGS={skipConstruction:false,skipProof:false,skipJustifications:false,showHints:true,learningMode:false,largeLabels:false,showDefinitionNames:true,showPostulateNames:true,showCommonNotionNames:true,showPropositionNames:true};
let settings={...DEFAULT_SETTINGS};try{let stored=JSON.parse(localStorage.getItem(SETTINGS_KEY)||'{}');for(let key of Object.keys(settings))if(typeof stored[key]==='boolean')settings[key]=stored[key]}catch{}
let buildingPractice=false;
function toolNamesVisible(reference){
 const id=EuclidBooks.runtimeRule(Array.isArray(reference)?reference[1]:reference);
 const group=Object.keys(REFERENCES).find(group=>REFERENCES[group].some(r=>r[1]===id));
 const key={definitions:'showDefinitionNames',postulates:'showPostulateNames',notions:'showCommonNotionNames',propositions:'showPropositionNames'}[group];
 return !key||settings[key];
}
function constructionGeometry(value){return structuredClone(Object.fromEntries(['points','edges','rays','circles','arcs','facts','topology'].map(key=>[key,key==='arcs'?(value[key]||[]):value[key]])))}
const INTERSECTION_SUPPORTS={22:{K:['circle:GI','circle:HJ']},42:{K:['CJ','AI'],L:['GH','AI']},44:{M:['AL','KJ'],N:['MB','IJ'],P:['NO','AL'],Q:['NO','BK']},46:{G:['DE','BF']}};
function sameConstructionInputs(operation,left,right){
 const pair=s=>[...s].sort().join(''),angle=s=>s[1]+pair(s[0]+s[2]);
 function key(v){
  if(['equilateral','midpoint'].includes(operation))return pair(v.join(''));
  if(operation==='copy')return v[0]+pair(v[1]+v[2]);
  if(operation==='cut')return v[0]+v[1]+pair(v[2]+v[3]);
  if(operation==='bisectAngle')return angle(v);
  if(operation==='perpendicular')return pair(v[0]+v[1])+v[2];
  if(operation==='parallel')return v[0]+pair(v[1]+v[2]);
  if(operation==='copyAngle')return angle(v.slice(0,3))+v.slice(3).join('');
  if(operation==='sss')return [0,2,4].map(i=>pair(v[i]+v[i+1])).join(':')+v.slice(6).join('');
  if(['equalArea','figureArea','applyArea'].includes(operation)){let applied=operation==='applyArea',size=operation==='figureArea'?4:3;return (applied?v.slice(0,2).join(''):'')+BookOneLogic.polygonKey(v.slice(applied?2:0,applied?5:size).join(''))+angle(v.slice(applied?5:size,applied?8:size+3))+(applied?'':v.slice(-2).join(''))}
  return v.join('');
 }
 return key(left)===key(right);
}
function matchesConstructionSupport(value,name,support){
 const point=value.points[name];if(!point)return false;
 if(support.startsWith('arc:'))return !!EuclidCurves.arc(value,support.slice(4))?.points.includes(name);
 if(support.startsWith('circle:')){let [a,b]=support.slice(7),circle=value.circles.find(c=>c.a===a&&c.b===b);return !!circle&&EuclidConstruction.radius(value,circle,name)}
 return EuclidLogic.diagram(value).collinear(support[0],support[1],name);
}
function constructionProgress(value,lesson){
 const edge=(a,b)=>EuclidLogic.diagram(value).drawn(a,b),circle=(a,b,n)=>value.circles.some(c=>c.a===a&&c.b===b&&(!n||EuclidConstruction.radius(value,c,n))),fact=s=>value.facts.includes(s);
 let checks;
 if(lesson.id===1)checks=[circle('A','B'),circle('B','A'),circle('A','B','C')&&circle('B','A','C'),edge('A','C'),edge('B','C')];
 else if(lesson.id===2)checks=[edge('A','B'),fact('equilateral:D')||fact('equilateral:D:A:B')||fact('equilateral:D:B:A'),value.rays.includes('DB'),circle('B','C'),circle('B','C','G')&&EuclidLogic.diagram(value).between('D','B','G'),value.rays.includes('DA'),circle('D','G'),circle('D','G','L')&&EuclidLogic.diagram(value).between('D','A','L'),edge('A','L')];
 else if(lesson.id===3)checks=[fact('copy:E')||fact('copy:A:E:C:D'),circle('A','E'),circle('A','E','F')&&EuclidLogic.diagram(value).between('A','F','B')];
 else if(lesson.id===4)checks=[fact('superpose:ABC:DEF')||fact('superpose')];
 else if(lesson.id===5)checks=[value.rays.includes('AB'),value.rays.includes('AC'),fact('equalExtensions')||fact('cut:A:F:A:G'),edge('F','C'),edge('G','B')];
 else checks=(lesson.construction||[]).map(task=>{
  if(task.ref==='P1')return edge(...task.inputs);
  if(task.ref==='P2')return value.rays.includes(task.inputs.join(''))&&task.outputs.every(n=>value.points[n]&&EuclidLogic.diagram(value).between(...task.inputs,n));
  if(task.ref==='P3')return circle(...task.inputs);
  if(task.ref==='D18')return (value.arcs||[]).some(a=>{let c=EuclidCurves.circle(value,a.circleId);let side=EuclidConstruction.turn(value,task.inputs[1],task.inputs[2],task.inputs[3]);return c?.a===task.inputs[0]&&(a.start===task.inputs[1]&&a.end===task.inputs[2]&&a.side===side||a.start===task.inputs[2]&&a.end===task.inputs[1]&&a.side===-side)});
  if(task.ref==='D1'){let name=task.outputs[0]||task.inputs[0],supports=task.supports||(lesson.id===12?['circle:CA','AB']:INTERSECTION_SUPPORTS[lesson.id]?.[name]),d=EuclidLogic.diagram(value);return !!supports&&supports.every(s=>matchesConstructionSupport(value,name,s))&&(!task.beyond||d.between(task.beyond[0],task.beyond[1],name))&&(!task.within||d.between(task.within[0],name,task.within[1]))}
  return value.facts.some(raw=>{if(!raw.startsWith('book:'))return false;try{let c=JSON.parse(raw.slice(5));return EuclidConstruction.certificate(c,value.points)&&[task,...(task.alternatives||[])].some(candidate=>c.rule===Number(candidate.ref.slice(1))&&sameConstructionInputs(c.operation,c.inputs,candidate.inputs)&&JSON.stringify(c.outputs)===JSON.stringify(candidate.outputs))&&(!task.beyond||EuclidLogic.diagram(value).between(task.beyond[0],task.beyond[1],c.outputs[0]))}catch{return false}});
 });
 return {complete:checks.every(Boolean),done:checks.filter(Boolean).length,total:checks.length,checks};
}
function suppliedConstruction(lessonIndex){
 const previous={index,state,tool,picks,history,buildingPractice};
 try{
  buildingPractice=true;index=lessonIndex;state=fresh();tool=null;picks=[];history=[];
  const use=(id,...names)=>{tool=Object.values(REFERENCES).flat().find(r=>r[1]===id);picks=[];names.forEach(choosePoint)};
  const intersection=(supports,beyond,within)=>{
   let candidates=bookOneIntersections().filter(q=>supports.every(s=>{if(s.startsWith('arc:'))return q.supports?.includes(s);if(s.startsWith('circle:')){let [a,b]=s.slice(7);return Math.abs(distance(q,state.points[a])-distance(state.points[a],state.points[b]))<.001}let [a,b]=[state.points[s[0]],state.points[s[1]]];return Math.abs((b[0]-a[0])*(q[1]-a[1])-(b[1]-a[1])*(q[0]-a[0]))<.001}));
   if(beyond)candidates=candidates.filter(q=>{let a=state.points[beyond[0]],b=state.points[beyond[1]],v=[b[0]-a[0],b[1]-a[1]];return (q[0]-a[0])*v[0]+(q[1]-a[1])*v[1]>v[0]*v[0]+v[1]*v[1]});
   if(within)candidates=candidates.filter(q=>distance(q,state.points[within[0]])<distance(state.points[within[0]],state.points[within[1]])&&distance(q,state.points[within[1]])<distance(state.points[within[0]],state.points[within[1]]));
   let q=candidates.sort((a,b)=>a[1]-b[1])[0];if(!q)throw Error('The supplied construction could not locate an intersection.');bookOneMark(q,supports);
  };
  if(index===0){use('P3','A','B');use('P3','B','A');intersection(['circle:AB','circle:BA']);use('P1','A','C');use('P1','B','C')}
  else if(index===1){use('P1','A','B');use('I1','A','B');use('P2','D','B');use('P3','B','C');intersection(['DB','circle:BC'],'DB');use('P2','D','A');use('P3','D','G');intersection(['DA','circle:DG'],'DA');use('P1','A','L')}
  else if(index===2){use('I2','A','C','D');use('P3','A','E');intersection(['AB','circle:AE'],null,'AB')}
  else if(index===3){tool=REFERENCES.notions.find(r=>r[1]==='CN4');superposeTriangles()}
  else if(index===4){use('P2','A','B');use('P2','A','C');use('I3','A');use('P1','F','C');use('P1','G','B')}
  else for(let task of LESSONS[index].construction||[]){if(task.ref==='D1'&&task.inputs.length){tool=REFERENCES.definitions.find(r=>r[1]==='D1');task.inputs.forEach(choosePoint)}else if(task.ref==='D1')intersection(task.supports||INTERSECTION_SUPPORTS[LESSONS[index].id][task.outputs[0]],task.beyond,task.within);else use(task.ref,...task.inputs)}
  if(!constructionProgress(state,LESSONS[index]).complete)throw Error('The supplied construction is incomplete.');
  return constructionGeometry(state);
 }finally{({index,state,tool,picks,history,buildingPractice}=previous)}
}
function ensurePracticeConstruction(){
 if(settings.skipConstruction&&state.manualConstruction&&!constructionProgress(state,LESSONS[index]).complete)Object.assign(state,suppliedConstruction(index));
 if(settings.skipConstruction&&!state.manualConstruction){let supplied=state.practiceConstruction&&constructionProgress(state.practiceConstruction,LESSONS[index]).complete?state.practiceConstruction:suppliedConstruction(index);delete state.practiceConstruction;state.manualConstruction=constructionGeometry(state);Object.assign(state,supplied)}
 if(!settings.skipConstruction&&state.manualConstruction){let original=state.manualConstruction;state.practiceConstruction=constructionGeometry(state);delete state.manualConstruction;Object.assign(state,original)}
}
// Hypotheses are supplied premises, independent of the selected practice mode.
function proofWithHypotheses(lines,lesson){
 const givens=lesson.givens||[];
 if(!givens.length)return lines;
 const value={...state,lines:[]},context=lesson.id<=5?EuclidLogic.context(value,lesson):BookOneLogic.context(value,lesson);
 const parse=lesson.id<=5?BookOneLogic.baseParse:BookOneLogic.parse;
 return [...givens.map(s=>({s:readableStatement(s),j:'Given'})),...lines.filter(line=>{let ast=parse(line.s);return !ast||!context.check(ast,'Given').ok})];
}
function ensurePracticeProof(){
 if(settings.skipProof&&!state.manualProof){let original=state.lines;state.manualProof=original.map(l=>({s:l.s,j:l.j}));state.lines=state.practiceProof||(LESSONS[index].proofGuide||LESSONS[index].hintSteps).map(step=>({s:step.s,j:original.find(l=>l.s===step.s)?.j||null}));delete state.practiceProof}
 if(!settings.skipProof&&state.manualProof){state.practiceProof=state.lines.map(l=>({s:l.s,j:l.j}));state.lines=state.manualProof;delete state.manualProof}
 if(settings.skipProof){
  const guide=LESSONS[index].proofGuide||LESSONS[index].hintSteps;
  state.lines=proofWithHypotheses(guide.map(step=>state.lines.find(line=>line.s===readableStatement(step.s))||{s:readableStatement(step.s),j:null}),LESSONS[index]);
 }
}
const AUTOMATIC_PROOF_CACHE=new WeakMap();
function inferredProof(value,lesson){
 const geometry=JSON.stringify([lesson,LESSONS.map(EuclidBooks.key),value.points,value.edges,value.rays,value.circles,value.arcs,value.facts,value.topology]),inputs=value.lines.map(l=>[l.s,l.j]),signature=geometry+'\0'+JSON.stringify(inputs);
 const cached=AUTOMATIC_PROOF_CACHE.get(value),fields=['autoJustification','valid','error','dependencies','reason','derivation','sourcePropositions'];
 const factCount=c=>(c.facts||c.accepted).length;
 const intact=cached&&factCount(cached.context)===cached.accepted&&factCount(cached.result.context)===cached.graded;
 if(intact&&cached.signature===signature){value.lines.forEach((line,i)=>{for(let field of fields)line[field]=structuredClone(cached.lines[i][field])});return cached.result}
 // An unchanged prefix has already been inferred and independently graded.
 // Keep its private inference context and grade the appended suffix only.
 // Changes to earlier input or geometry rebuild both contexts.
 const append=intact&&cached.geometry===geometry&&inputs.length>=cached.inputs.length&&cached.inputs.every((v,i)=>v[0]===inputs[i][0]&&v[1]===inputs[i][1]);
 const start=append?cached.inputs.length:0,copy=append?cached.copy:structuredClone(value);
 if(append)copy.lines.push(...structuredClone(value.lines.slice(start)));
 const context=append?cached.context:lesson.id<=5?EuclidLogic.context(copy,lesson):BookOneLogic.context(copy,lesson),parse=lesson.id<=5?BookOneLogic.baseParse:BookOneLogic.parse;
 const available=Object.values(REFERENCES).flat().map(r=>r[1]).filter(r=>!/^I/.test(r)||Number(r.slice(1))<lesson.id);
 const references=['Given',...available.filter(r=>/^I/.test(r)),...available.filter(r=>!/^I/.test(r)),'Logic'];
 // Teaching routes may nominate a displayed source, but only the independent
 // formal checker can validate it against this construction and earlier lines.
 const teachingContext=lesson.id<=5?BookOneLogic.context(copy,lesson):context;
 const teachingKey=s=>teachingContext.key(BookOneLogic.parse(s));
 for(let line of copy.lines.slice(start)){
  let ast=parse(line.s);
  if(!ast){line.j=null;continue}
  const route=lesson.proofGuide||lesson.hintSteps,taught=(route.find(step=>norm(step.s)===norm(line.s))||route.find(step=>teachingKey(step.s)===teachingKey(line.s)))?.j;
  const taughtValid=taught&&context.check(ast,taught).ok?taught:null;
  let reference=[...new Set(['Given',...(taughtValid?[taughtValid]:[]),...(context.preferredReferences?.(ast)||[]),...context.sourceReferences(ast),...(line.autoJustification?[line.autoJustification]:[]),...references])].find(r=>r===taughtValid||context.check(ast,r,true).ok);
  if(ast&&reference==='Logic'&&taughtValid!=='Logic'){
   let result=context.check(ast,'Logic'),argument=result.derivation;
   if(argument&&argument.name!=='Symbolic Euclidean deduction')reference=[...argument.dependencies].reverse().map(EuclidBooks.dependencyRule).find(r=>context.check(ast,r).ok)||reference;
  }
  line.j=reference||null;if(reference)context.accept(ast,reference);
 }
 let result=EuclidLogic.grade(copy,lesson);for(let [i,line] of value.lines.entries()){line.autoJustification=copy.lines[i].j;for(let field of ['valid','error','dependencies','reason','derivation','sourcePropositions'])line[field]=copy.lines[i][field];if(!line.valid&&parse(line.s))line.error='This statement does not follow from the construction and earlier established statements.'}
 const outcome={...result,complete:copy.lines.length>0&&result.complete};
 AUTOMATIC_PROOF_CACHE.set(value,{signature,geometry,inputs,copy,context,accepted:factCount(context),graded:factCount(result.context),result:outcome,lines:value.lines.map(line=>Object.fromEntries(fields.map(field=>[field,structuredClone(line[field])])))});
 return outcome;
}
function practiceMode(){return settings.skipProof?(settings.skipJustifications?(settings.skipConstruction?'Review':'Construction practice'):(settings.skipConstruction?'Justification practice':'Construction and justifications')):settings.skipConstruction?(settings.skipJustifications?'Statement practice':'Proof practice'):settings.skipJustifications?'Statements and construction':'Full challenge'}
function evaluatePractice(){
 ensurePracticeConstruction();ensurePracticeProof();
 let result=(settings.skipJustifications?inferredProof(state,LESSONS[index]):EuclidLogic.grade(state,LESSONS[index])).complete;
 if(settings.skipProof&&settings.skipJustifications)return constructionProgress(state,LESSONS[index]).complete;
 return result&&(!settings.skipProof||constructionProgress(state,LESSONS[index]).complete);
}
function savedProgressComplete(value,lesson){
 const mode=value.completionMode;
 if(['Construction practice','Review'].includes(mode))return constructionProgress(value,lesson).complete;
 let complete=(['Statement practice','Statements and construction'].includes(mode)?inferredProof(value,lesson):EuclidLogic.grade(value,lesson)).complete;
 return complete&&(!['Justification practice','Construction and justifications'].includes(mode)||constructionProgress(value,lesson).complete);
}
function applyPracticeDisplay(completed){
 const modified=settings.skipConstruction||settings.skipProof||settings.skipJustifications;
 state.completionMode=modified?practiceMode():'Full challenge';
 const automatedProof=settings.skipProof&&settings.skipJustifications;
 document.querySelector('.proof').hidden=false;document.querySelector('.workspace').classList.remove('construction-only');
 $('#lineform').hidden=settings.skipProof;
 $('#given-tool').hidden=$('#logic-tool').hidden=settings.skipJustifications;$('#hint').hidden=settings.learningMode||!settings.showHints;
 updateLearningGuidance();
 document.querySelector('.proofnote').textContent=automatedProof?'Proof statements are supplied and their justifications are checked automatically. Complete the construction to establish them.':settings.skipProof?'Proof statements are supplied. Choose a reference, then click a line to justify it.':settings.skipJustifications?'Write formal statements. Their reasoning is checked automatically; justifications are not required.':'Write a formal statement, then select a reference below and click its line to justify it.';
 let progress=constructionProgress(state,LESSONS[index]);$('#practice-status').hidden=!modified;
 $('#practice-status').textContent=practiceMode()+' - '+(settings.skipConstruction&&automatedProof?'Finished diagram supplied for review.':automatedProof?(progress.total?progress.done+' / '+progress.total+' construction steps':'No drawing required for this stage.')+(completed?' Stage clear.':''):settings.skipProof?'Statements supplied. Justify each line.':settings.skipConstruction?'Diagram supplied. Write the proof.':'Justifications checked automatically.');
 $('#practice-next').hidden=!(automatedProof&&completed&&index<LESSONS.length-1);
 $('#practice-next').onclick=()=>load(index+1);
}
function updateSettings(){
 const previous={...settings};
 for(let key of Object.keys(DEFAULT_SETTINGS)){let control=document.querySelector('[data-setting="'+key+'"]');if(control)settings[key]=control.checked}
 try{localStorage.setItem(SETTINGS_KEY,JSON.stringify(settings))}catch{}
 tool=null;picks=[];if(previous.skipProof!==settings.skipProof)resetLineForm();if(['skipConstruction','skipProof','skipJustifications'].some(k=>previous[k]!==settings[k]))history=[];render();renderTools();$('#settings-mode').textContent=practiceMode();
}
function showSettings(){
 $('#main-menu').classList.add('options-open');
 $('#menu-home').hidden=$('#save-points-view').hidden=true;$('#settings-view').hidden=false;$('#save-status').textContent='';
 for(let key of Object.keys(settings))document.querySelector('[data-setting="'+key+'"]').checked=settings[key];$('#settings-mode').textContent=practiceMode();$('#settings-view input').focus();
}
function installSettings(){
 $('#settings-menu').onclick=showSettings;$('#back-from-settings').onclick=()=>{showMenuHome();$('#settings-menu').focus()};
 document.querySelectorAll('[data-setting]').forEach(input=>input.onchange=updateSettings);
 $('#reset-settings').onclick=()=>{for(let key of Object.keys(DEFAULT_SETTINGS))document.querySelector('[data-setting="'+key+'"]').checked=DEFAULT_SETTINGS[key];updateSettings()};
}

function practiceInstruction(){
 if(tool&&!toolNamesVisible(tool))return 'Selected: '+displayReference(tool[1])+'.';
 if(tool){if(settings.skipJustifications&&!tool[3])return 'Justifications are checked automatically in this mode.';return displayReference(toolText())}
 if(settings.skipConstruction)return settings.skipProof?(settings.skipJustifications?'Finished construction supplied for review.':'Choose references to justify the supplied statements.'):'Construction supplied. Work on the proof.';
 return settings.skipProof&&!settings.skipJustifications?'Build the figure, then justify the supplied statements.':'Select a construction tool below to begin.';
}

function updateLearningGuidance(){
 const panel=$('#learning-guidance');panel.hidden=!settings.learningMode;
 if(settings.learningMode)AngleVisual.decorate($('#learning-instructions'),displayReference(nextHint()),LESSONS[index]);
}

function proofInspectionBody(line,reference){
 let body=line.derivation?['Earlier propositions: '+line.derivation.dependencies.map(EuclidBooks.dependencyRule).join(', '),...line.derivation.steps]:[line.reason||referenceName(reference),'Earlier proof lines: '+(line.dependencies||[]).join(', ')];
 if(line.sourcePropositions?.length)body.push('Source propositions: '+line.sourcePropositions.map(displayReference).join(', '));
 return body;
}
