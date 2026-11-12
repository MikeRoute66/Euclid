// These override browser rendering; all geometry and proof rules above are unchanged.
function render(){}
function renderTools(){}
function clearCanvasGesture(){}
function hideToolName(){}
function closeTools(){}
function replay(key,events){
 index=EuclidBooks.position(key);
 if(index<0||!Array.isArray(events)||events.length>2000)throw Error('Invalid attempt.');
 state=fresh();history=[];tool=null;picks=[];buildingPractice=false;
 const integer=n=>Number.isInteger(n)&&n>=0&&n<state.lines.length;
 const references=[...Object.values(REFERENCES).flat(),{0:'Given',1:'Given'},{0:'Deduction',1:'Logic'}];
 for(const event of events){
  if(!event||typeof event!=='object')throw Error('Invalid action.');
  if(event.kind==='select'){
   const ref=references.find(r=>r[1]===event.reference);
   if(!ref||!referenceAvailable(ref))throw Error('Unavailable reference.');
   tool=ref;picks=[];
  }else if(event.kind==='point'){
   if(!tool||typeof event.name!=='string'||!/^[A-Z]$/.test(event.name)||!Object.hasOwn(state.points,event.name))throw Error('Invalid point.');
   choosePoint(event.name);
  }else if(event.kind==='mark'){
   if(tool?.[3]!=='point'||!Array.isArray(event.coordinate)||event.coordinate.length!==2||!event.coordinate.every(n=>Number.isFinite(n)&&Math.abs(n)<=10000))throw Error('Invalid intersection.');
   // Never accept asserted topology or certificates from the browser.
   bookOneMark(event.coordinate);
  }else if(event.kind==='superpose'){
   if(index!==3||tool?.[1]!=='CN4')throw Error('Invalid superposition.');
   superposeTriangles();
  }else if(event.kind==='statement'){
   if(typeof event.statement!=='string'||!event.statement.trim()||event.statement.length>500||state.lines.length>=500)throw Error('Invalid statement.');
   const s=readableStatement(event.statement);snapshot();
   if(event.line===null)state.lines.push({s,j:null});
   else {if(!integer(event.line))throw Error('Invalid proof line.');state.lines[event.line].s=s}
  }else if(event.kind==='justify'){
   if(!integer(event.line)||!tool||tool[1]!==event.reference)throw Error('Invalid justification.');
   snapshot();state.lines[event.line].j=tool[1];
  }else if(event.kind==='delete'){
   if(!integer(event.line))throw Error('Invalid proof line.');
   snapshot();state.lines.splice(event.line,1);
  }else if(event.kind==='cancelPicks'){picks=[];
  }else if(event.kind==='undo'){
   if(history.length)state=JSON.parse(history.pop());picks=[];
  }else throw Error('Unknown action.');
 }
 return {state,lesson:LESSONS[index]};
}
function validate(key,events){
 const {state,lesson}=replay(key,events);
 if(!constructionProgress(state,lesson).complete)throw Error('The construction is incomplete.');
 const result=EuclidLogic.grade(state,lesson);
 if(!result.complete)throw Error('The proof is incomplete or contains an invalid line.');
 return true;
}
function validatePart(key,input,from){
 index=EuclidBooks.position(key);state=input;
 if(index<0||!Number.isInteger(from)||from<0||from>state.lines.length)throw Error('Invalid validation checkpoint.');
 const lesson=LESSONS[index],parse=lesson.id<=5?BookOneLogic.baseParse:BookOneLogic.parse;
 const c=lesson.id<=5?EuclidLogic.context(state,lesson):BookOneLogic.context(state,lesson);
 const start=performance.now();let cursor=from;
 for(let i=0;i<state.lines.length;i++){
  const line=state.lines[i],ast=parse(line.s);
  if(!ast||!line.j)throw Error('Invalid proof line '+(i+1)+'.');
  if(i>=from){
   if(!c.check(ast,line.j).ok)throw Error('Invalid proof line '+(i+1)+'.');
   cursor=i+1;
  }
  // Earlier lines are trusted only because their checkpoint is stored by the server.
  c.accept(ast,line.j);
  if(i>=from&&(cursor-from>=2||performance.now()-start>300))break;
 }
 if(cursor===state.lines.length){
  let reached=lesson.id<=5?c.goal():(lesson.goals||[]).every(s=>c.posted(parse(s)));
  const constraints=lesson.goalConstraints||{};
  if(constraints.between)reached=reached&&c.d.between(...constraints.between);
  if(constraints.triangle)reached=reached&&c.d.proper(constraints.triangle);
  if(constraints.insideAngle){const {point,angle}=constraints.insideAngle;reached=reached&&c.d.angleInside(angle[0],angle[1],point,angle[2])}
  if(!reached||!constructionProgress(state,lesson).complete)throw Error('The proposition has not been established.');
 }
 return {cursor,complete:cursor===state.lines.length,total:state.lines.length};
}
// Test fixtures exercise the same tool calls as supplied practice diagrams.
function fixture(key){
 index=EuclidBooks.position(key);state=fresh();const events=[];
 const originals={choosePoint,bookOneMark,superposeTriangles};
 let selected=null;
 const select=reference=>{if(selected!==reference){events.push({kind:'select',reference});selected=reference}};
 try{
  choosePoint=name=>{if(!picks.length){events.push({kind:'select',reference:tool[1]});selected=tool[1]}events.push({kind:'point',name});return originals.choosePoint(name)};
  bookOneMark=(coordinate,supports)=>{const names=new Set(Object.keys(state.points));originals.bookOneMark(coordinate,supports);const name=Object.keys(state.points).find(n=>!names.has(n));select('D1');events.push({kind:'mark',coordinate:state.points[name]})};
  superposeTriangles=()=>{select('CN4');events.push({kind:'superpose'});originals.superposeTriangles()};
  suppliedConstruction(index);
 }finally{({choosePoint,bookOneMark,superposeTriangles}=originals)}
 const lesson=LESSONS[index];let line=(lesson.givens||[]).length;
 for(const step of lesson.id<=5?lesson.hintSteps:lesson.proofGuide){
  if(step.j==='Given')continue;
  events.push({kind:'statement',statement:step.s,line:null});select(step.j);events.push({kind:'justify',line:line++,reference:step.j});
 }
 return events;
}
return {validate,validatePart,replay,fixture,lessons:LESSONS,position:EuclidBooks.position,grade:EuclidLogic.grade,constructionProgress};
