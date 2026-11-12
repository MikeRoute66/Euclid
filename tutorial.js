/* Tutorial state never enters the workshop, practice autosave, or ranked log. */
const Tutorial=(()=>{
 const q=s=>document.querySelector(s),KEY='euclid-tutorial-v1',cache=new Map();
 let current=null,exercise=null,selection=null,answers=[],done=false,progress={completed:[],last:null};
 try{const stored=JSON.parse(localStorage.getItem(KEY));if(stored&&Array.isArray(stored.completed))progress={completed:stored.completed.filter(id=>TUTORIAL_LESSONS.some(l=>l.id===id)),last:stored.last}}catch{}
 const reference=id=>Object.values(REFERENCES).flat().find(r=>r[1]===id);
 function isolated(position,value,run){
  const previous={index,state,tool,picks,history,buildingPractice},instruction=q('#instruction').textContent;
  try{index=position;state=value;tool=null;picks=[];history=[];buildingPractice=true;return run()}
  finally{({index,state,tool,picks,history,buildingPractice}=previous);q('#instruction').textContent=instruction}
 }
 function blank(points,edges=[],incidence=[]){const value={points,edges,rays:[],circles:[],arcs:[],facts:[],lines:[]};EuclidConstruction.initialize(value,{id:99,points,edges,incidence});return value}
 function sourceExercise(lesson){
  const position=EuclidBooks.position(lesson.source),source=LESSONS[position],route=source.id<=5?source.hintSteps:source.proofGuide;
  const step=route.findIndex(s=>s.j===lesson.ref&&lesson.match.test(s.s));
  if(step<0)throw Error('This example is missing its source proof step.');
  if(!cache.has(position))cache.set(position,isolated(position,null,()=>suppliedConstruction(position)));
  const value=structuredClone(cache.get(position));
  value.lines=[...(source.givens||[]).map(s=>({s,j:'Given'})),...route.slice(0,step).filter(s=>s.j!=='Given').map(s=>({s:s.s,j:s.j}))];
  const statement=lesson.replacement||route[step].s;
  value.lines.push({s:statement,j:null});return {value,source,statement};
 }
 function makeExercise(lesson){
  if(lesson.kind==='proof')return sourceExercise(lesson);
  if(lesson.kind==='customProof'){
   const value=lesson.scene==='lengths'?blank({A:[90,80],B:[240,80],C:[90,150],D:[240,150],E:[290,220],F:[390,220],G:[290,290],H:[390,290]},['AB','CD','EF','GH']):blank({A:[100,190],B:[240,190],C:[400,190]},['AC'],['ABC']);
   value.lines=[...(lesson.givens||[]).map(s=>({s,j:'Given'})),{s:lesson.statement,j:null}];return {value,source:{id:99,givens:lesson.givens||[],goals:[],book:1},statement:lesson.statement};
  }
  if(lesson.kind!=='construct')return {value:scene(lesson.scene)};
  const op=lesson.operation;
  if(op==='superpose')return {value:structuredClone({points:LESSONS[3].points,edges:LESSONS[3].edges,rays:[],circles:[],arcs:[],facts:[],lines:[]}),position:3};
  if(op==='intersection'){
   const value=blank({A:[170,220],B:[330,220]},['AB']);value.circles=[{a:'A',b:'B'},{a:'B',b:'A'}];return {value,position:5,coordinate:[250,220-80*Math.sqrt(3)],supports:['circle:AB','circle:BA']};
  }
  if(op==='lineIntersection')return {value:blank({A:[100,100],B:[400,280],C:[100,280],D:[400,100]},['AB','CD']),position:5,coordinate:[250,190],supports:['AB','CD']};
  if(op==='lineCircle'){
   const value=blank({O:[250,190],A:[250,70],B:[70,190],C:[430,190]},['BC']);value.circles=[{a:'O',b:'A'}];return {value,position:5,coordinate:[370,190],supports:['BC','circle:OA']};
  }
  if(['semicircle','circlePoint','arcPoint'].includes(op)){
   const value=scene('circle');value.circles=[{a:'O',b:'A'}];EuclidConstruction.support(value,'AB','O');EuclidConstruction.intersection(value,'B',['AB','circle:OA']);
   if(op==='arcPoint')EuclidCurves.createSemicircle(value,{id:99,book:1,givens:[],goals:[]},['O','A','B','C']);
   return {value,position:5};
  }
  if(op==='circle')return {value:blank({O:[180,190],A:[330,190]}),position:5};
  return {value:blank({A:[150,190],B:[330,190]},op==='extend'?['AB']:[]),position:5};
 }
 function scene(name){
  if(['circle','halves'].includes(name))return blank({O:[250,190],A:[370,190],B:[130,190],C:[250,70]},['AB']);
  if(name==='line')return blank({A:[120,200],B:[380,200],C:[250,100]},['AB']);
  if(name==='curvedAngle')return blank({A:[100,230],B:[260,230]},['BA']);
  if(['angle','obtuse'].includes(name))return blank({A:[100,230],B:[260,230],C:name==='obtuse'?[355,110]:[175,100]},['BA','BC']);
  if(name==='parallel')return blank({A:[90,120],B:[400,120],C:[90,250],D:[400,250]},['AB','CD']);
  if(['triangle','equilateral','isosceles','rightTriangle','obtuseTriangle'].includes(name)){
   const p={triangle:{A:[100,270],B:[390,270],C:[210,95]},equilateral:{A:[120,280],B:[380,280],C:[250,280-130*Math.sqrt(3)]},isosceles:{A:[250,70],B:[120,280],C:[380,280]},rightTriangle:{A:[100,80],B:[100,280],C:[390,280]},obtuseTriangle:{A:[80,260],B:[240,260],C:[370,90]}}[name];return blank(p,['AB','BC','CA']);
  }
  const polygons={surface:{A:[100,80],B:[400,80],C:[400,280],D:[100,280]},square:{A:[150,70],B:[350,70],C:[350,270],D:[150,270]},rhombus:{A:[250,60],B:[390,190],C:[250,320],D:[110,190]},rhomboid:{A:[170,80],B:[410,80],C:[330,280],D:[90,280]},trapezium:{A:[180,80],B:[350,80],C:[410,280],D:[90,280]},pentagon:{A:[250,50],B:[410,160],C:[350,300],D:[150,300],E:[90,160]}};
  const points=polygons[name]||polygons.surface,names=Object.keys(points),edges=names.map((n,i)=>n+names[(i+1)%names.length]);
  if(name==='areaPart')Object.assign(points,{E:[400,180],F:[100,180]});
  if(name==='gnomon')Object.assign(points,{E:[400,180],F:[100,180],G:[250,80],H:[250,280],I:[250,180]});
  return blank(structuredClone(points),edges);
 }
 function remember(){try{localStorage.setItem(KEY,JSON.stringify(progress))}catch{}}
 function catalog(){
  const query=q('#tutorial-search').value.trim().toLowerCase(),list=q('#tutorial-list');list.replaceChildren();
  for(const [group,label] of [['definitions','Definitions'],['postulates','Postulates'],['notions','Common notions']]){
   const entries=TUTORIAL_LESSONS.filter(l=>REFERENCES[group].some(r=>r[1]===l.ref)&&[l.ref,l.title,reference(l.ref)[0]].join(' ').toLowerCase().includes(query));
   if(!entries.length)continue;
   const heading=document.createElement('h3');heading.textContent=label;list.append(heading);
   for(const lesson of entries){const b=document.createElement('button');b.type='button';b.textContent=(progress.completed.includes(lesson.id)?'\u2713 ':'')+lesson.ref+' \u00b7 '+lesson.title;b.dataset.lesson=lesson.id;b.setAttribute('aria-current',String(current===lesson));b.onclick=()=>start(lesson.id);list.append(b)}
  }
  if(!list.children.length)list.textContent='No matching lessons.';
  q('#tutorial-progress').textContent=progress.completed.length+' / '+TUTORIAL_LESSONS.length+' examples completed';
 }
 function start(id){
  const lesson=TUTORIAL_LESSONS.find(l=>l.id===id);if(!lesson)return;
  current=lesson;selection=null;answers=[];done=false;q('#tutorial-status').textContent='';q('#tutorial-status').classList.remove('correct');q('#tutorial-next').disabled=true;
  q('#tutorial-home').hidden=true;q('#tutorial-exercise').hidden=false;
  q('#tutorial-title').textContent=lesson.ref+' \u00b7 '+lesson.title;q('#tutorial-reference').textContent=reference(lesson.ref)[2];q('#tutorial-prompt').textContent=lesson.prompt;
  q('#tutorial-facts').textContent=lesson.facts||'';q('#tutorial-facts').hidden=!lesson.facts;
  q('#tutorial-response').replaceChildren();q('#tutorial-prior').replaceChildren();q('#tutorial-context').open=false;q('#tutorial-context').hidden=true;
  try{
   exercise=makeExercise(lesson);renderDiagram();
   if(lesson.kind==='proof'||lesson.kind==='customProof'){
    const label=document.createElement('label');label.textContent='Justification';label.htmlFor='tutorial-reference-select';const select=document.createElement('select');select.id='tutorial-reference-select';
    const placeholder=document.createElement('option');placeholder.value='';placeholder.textContent='Choose a tool';select.append(placeholder);
    const group=Object.values(REFERENCES).find(g=>g.some(r=>r[1]===lesson.ref));
    for(const r of group){const option=document.createElement('option');option.value=r[1];option.textContent=r[1]+' \u00b7 '+r[0];select.append(option)}
    select.onchange=()=>{selection=select.value;q('#tutorial-status').textContent='Now click the proof line.'};
    const line=document.createElement('button');line.type='button';line.id='tutorial-proof-line';line.className='tutorial-proof-line';line.textContent=exercise.statement;line.onclick=justify;
    q('#tutorial-response').append(label,select,line);
    const prior=exercise.value.lines.slice(0,-1);q('#tutorial-context').hidden=!prior.length;
    for(const p of prior){const row=document.createElement('li');row.textContent=p.s+' \u00b7 '+displayReference(p.j);q('#tutorial-prior').append(row)}
   }else if(lesson.kind==='classify'){
    for(const option of lesson.choices){const b=document.createElement('button');b.type='button';b.textContent=option;b.dataset.answer=option;b.onclick=()=>attempt(option===lesson.answer);q('#tutorial-response').append(b)}
   }else{
    const text=document.createElement('p');text.textContent=lesson.kind==='construct'?'Tool ready: '+reference(lesson.ref)[0]+'.':'Click the diagram. You can also use Tab, then Enter.';q('#tutorial-response').append(text);
   }
   progress.last=id;remember();q('#tutorial-prompt').focus();
  }catch(error){exercise=null;q('#tutorial-status').textContent='This example could not open. '+error.message}
 }
 function attempt(ok,message){
  if(done)return;
  if(!ok){q('#tutorial-status').textContent=message||'Try again. Use the given facts and the definition above.';Feedback.play(false);return}
  done=true;if(!progress.completed.includes(current.id))progress.completed.push(current.id);remember();
  q('#tutorial-status').classList.add('correct');q('#tutorial-status').textContent='Correct. '+current.explanation;q('#tutorial-next').disabled=false;Feedback.play(true);
  q('#tutorial-response').querySelectorAll('button,select').forEach(b=>b.disabled=true);
  q('#tutorial-progress').textContent=progress.completed.length+' / '+TUTORIAL_LESSONS.length+' examples completed';
 }
 function justify(){
  if(!selection){attempt(false,'Choose a justification first, then click this line.');return}
  if(selection!==current.ref){attempt(false,'This example practices '+current.ref+'. Select it and try the proof line again.');return}
  const value=structuredClone(exercise.value);value.lines.at(-1).j=selection;EuclidLogic.grade(value,exercise.source);
  attempt(value.lines.every(l=>l.valid),value.lines.find(l=>!l.valid)?.error);
  if(done)q('#tutorial-proof-line').textContent=exercise.statement+' \u00b7 '+selection+' \u2713';
 }
 function target(key){
  if(done||!exercise)return;
  if(current.kind==='construct'){constructionTarget(key);return}
  const expected=current.targets?.[answers.length];
  const accepted=current.targets?.includes(key)&&!answers.includes(key)||expected==='anyEdge'&&key.startsWith('edge:')||expected==='eitherEndpoint'&&['point:A','point:B'].includes(key)||expected==='half:upperOrLower'&&key.startsWith('half:');
  if(!accepted){attempt(false);return}
  answers.push(key);if(answers.length===current.targets.length)attempt(true);else{q('#tutorial-status').textContent='Good. Now click '+current.targets.find(t=>!answers.includes(t)).replace('point:','').replace('edge:','')+'.';Feedback.play(true)}
 }
 function constructionTarget(key){
  const expected=current.targets[answers.length];if(key!==expected){attempt(false,'Follow the point order in the instruction.');return}
  answers.push(key);if(answers.length<current.targets.length){q('#tutorial-status').textContent='Now click '+current.targets[answers.length].replace('point:','')+'.';return}
  try{
   const value=exercise.value,op=current.operation;
   isolated(exercise.position,value,()=>{
    tool=reference(current.ref);
    if(op==='superpose'){EuclidConstruction.initialize(value,LESSONS[3]);superposeTriangles()}
    else if(op==='semicircle'){picks=['O','A','B'];choosePoint('C')}
    else if(exercise.coordinate)bookOneMark(exercise.coordinate,exercise.supports);
    else for(const key of answers)choosePoint(key.slice(6));
   });
   const built=op==='superpose'?value.facts.includes('superpose'):op==='semicircle'?value.arcs.length>0:op==='circlePoint'?EuclidConstruction.radius(value,value.circles[0],'C'):op==='arcPoint'?value.arcs[0].points.includes('C'):exercise.coordinate?value.topology.intersections.some(r=>exercise.supports.every(s=>r.supports.includes(s))):op==='line'?value.edges.includes('AB'):op==='extend'?value.rays.includes('AB'):value.circles.some(c=>c.a==='O'&&c.b==='A');
   if(!built)throw Error('The requested construction was not recorded. Try again.');
   renderDiagram();attempt(true);
  }catch(error){answers=[];attempt(false,error.message)}
 }
 function node(tag,attrs,text){const e=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,v);if(text)e.textContent=text;return e}
 function clickable(svg,element,key,label){
  if(!['identify','construct'].includes(current.kind)){svg.append(element);return}
  element.setAttribute('tabindex','0');element.setAttribute('role','button');element.setAttribute('aria-label',label||key);element.dataset.target=key;
  element.addEventListener('click',e=>{e.stopPropagation();target(key)});element.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();target(key)}});svg.append(element);
 }
 function renderDiagram(){
  const svg=q('#tutorial-canvas'),value=exercise.value;svg.replaceChildren();
  const sceneName=current.scene,polygon=Object.keys(value.points).slice(0,sceneName==='pentagon'?5:4),p=n=>value.points[n];
  const simple=!['proof','customProof','construct'].includes(current.kind);
  if(simple&&!['line','angle','obtuse','curvedAngle','circle','halves','parallel'].includes(sceneName)){
   let path=polygon.map(n=>p(n).join(',')).join(' '),key='face:ABCD';
   if(sceneName==='gnomon'){path=['100,80','400,80','400,180','250,180','250,280','100,280'].join(' ');key='face:gnomon'}
   clickable(svg,node('polygon',{points:path,class:'tutorial-face'}),key,'Shaded region');
  }
  if(simple&&['circle','halves'].includes(sceneName)){
   if(sceneName==='circle')clickable(svg,node('circle',{cx:250,cy:190,r:120,class:'tutorial-face'}),'face:circle','Circular region');
   else for(const [name,sweep] of [['upper',1],['lower',0]])clickable(svg,node('path',{d:'M 130 190 A 120 120 0 0 '+sweep+' 370 190 Z',class:'tutorial-face'}),'half:'+name,name+' semicircle');
   clickable(svg,node('circle',{cx:250,cy:190,r:120,class:'tutorial-edge'}),'boundary:circle','Circumference');
  }
  if(simple&&sceneName==='areaPart')svg.append(node('polygon',{points:'100,80 400,80 400,180 100,180',class:'tutorial-part'}),node('line',{x1:100,y1:180,x2:400,y2:180,class:'tutorial-edge'}));
  if(simple&&sceneName==='gnomon')for(const coords of [[100,180,400,180],[250,80,250,280],[100,80,400,280]])svg.append(node('line',{x1:coords[0],y1:coords[1],x2:coords[2],y2:coords[3],class:'tutorial-guide'}));
  if(simple&&sceneName==='line')svg.append(node('path',{d:'M 120 200 Q 250 20 380 200',class:'tutorial-guide'}));
  for(const c of value.circles){if(EuclidCurves.masked(value,c))continue;svg.append(node('circle',{cx:p(c.a)[0],cy:p(c.a)[1],r:distance(p(c.a),p(c.b)),class:'tutorial-circle'}))}
  for(const arc of value.arcs||[])svg.append(node('path',{d:EuclidCurves.path(value,arc),class:'tutorial-circle'}));
  for(const edge of value.edges){const [a,b]=[p(edge[0]),p(edge[1])];clickable(svg,node('line',{x1:a[0],y1:a[1],x2:b[0],y2:b[1],class:'tutorial-edge'}),'edge:'+edge,'Segment '+edge)}
  for(const ray of value.rays){const [a,b]=[p(ray[0]),p(ray[1])];svg.append(node('line',{x1:a[0],y1:a[1],x2:b[0]+(b[0]-a[0])*.6,y2:b[1]+(b[1]-a[1])*.6,class:'tutorial-guide'}))}
  if(simple&&['angle','obtuse'].includes(sceneName))angleArc(svg,value,'ABC');
  if(simple&&sceneName==='curvedAngle'){
   clickable(svg,node('path',{d:'M 260 230 L 100 230 Q 130 140 260 230 Z',class:'tutorial-angle'}),'angle:curved','Angle between a curve and a straight line');
   svg.append(node('path',{d:'M 260 230 Q 130 140 100 230',class:'tutorial-guide'}));
  }
  if(current.kind==='proof'){
   const names=[...exercise.statement.matchAll(/(?:angle\s+|\u2220)([A-Z]{3})/gi)].map(m=>m[1]);for(const name of new Set(names))if([...name].every(n=>p(n)))angleArc(svg,value,name);
  }
  for(const [name,coordinate] of Object.entries(value.points)){
   clickable(svg,node('circle',{cx:coordinate[0],cy:coordinate[1],r:9,class:'tutorial-point'}),'point:'+name,'Point '+name);
  }
  if(exercise.coordinate&&!done&&!answers.length){const [x,y]=exercise.coordinate;clickable(svg,node('circle',{cx:x,cy:y,r:16,class:'tutorial-intersection'}),'intersection','Unmarked intersection')}
  const extent=[...Object.values(value.points)];for(const c of value.circles){const center=p(c.a),r=distance(center,p(c.b));extent.push([center[0]-r,center[1]-r],[center[0]+r,center[1]+r])}
  if(simple&&['circle','halves'].includes(sceneName))extent.push([130,70],[370,310]);
  if(exercise.coordinate)extent.push(exercise.coordinate);
  if(value.rays.length)for(const ray of value.rays){const [a,b]=[p(ray[0]),p(ray[1])];extent.push([b[0]+(b[0]-a[0])*.6,b[1]+(b[1]-a[1])*.6])}
  const minX=Math.min(...extent.map(p=>p[0]))-40,minY=Math.min(...extent.map(p=>p[1]))-40,w=Math.max(...extent.map(p=>p[0]))-minX+40,h=Math.max(...extent.map(p=>p[1]))-minY+40;
  svg.setAttribute('viewBox',[minX,minY,Math.max(w,100),Math.max(h,160)].join(' '));
  constructionLabelLayout(svg,value);
  for(const element of svg.querySelectorAll('.point-hit,.point-label-group')){
   if(['identify','construct'].includes(current.kind))clickable(svg,element,'point:'+(element.dataset.point||element.dataset.label),'Point '+(element.dataset.point||element.dataset.label));
  }
 }
 function angleArc(svg,value,name){
  const [a,v,b]=[...name].map(n=>value.points[n]),left=Math.atan2(a[1]-v[1],a[0]-v[0]),end=Math.atan2(b[1]-v[1],b[0]-v[0]),sweep=(end-left+Math.PI*3)%(Math.PI*2)-Math.PI,r=32;
  clickable(svg,node('path',{d:`M ${v} L ${v[0]+r*Math.cos(left)} ${v[1]+r*Math.sin(left)} A ${r} ${r} 0 0 ${sweep>0?1:0} ${v[0]+r*Math.cos(left+sweep)} ${v[1]+r*Math.sin(left+sweep)} Z`,class:'tutorial-angle'}),'angle:'+name,'Angle '+name);
 }
 function home(){q('#tutorial-home').hidden=false;q('#tutorial-exercise').hidden=true;catalog();q('#tutorial-resume').focus()}
 function open(){q('#tutorial-search').value='';home();q('#tutorial-dialog').showModal();q('#tutorial-resume').focus()}
 function close(){q('#tutorial-dialog').close();q('#tutorial-menu').focus()}
 q('#tutorial-close').onclick=close;q('#tutorial-catalog').onclick=home;q('#tutorial-search').oninput=catalog;
 q('#tutorial-retry').onclick=()=>start(current.id);
 q('#tutorial-next').onclick=()=>{const next=TUTORIAL_LESSONS.indexOf(current)+1;if(next<TUTORIAL_LESSONS.length)start(TUTORIAL_LESSONS[next].id);else home()};
 q('#tutorial-resume').onclick=()=>start(progress.last||TUTORIAL_LESSONS[0].id);
 let resizeFrame;window.addEventListener('resize',()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>{if(q('#tutorial-dialog').open&&exercise&&!q('#tutorial-exercise').hidden)renderDiagram()})});
 return {open,makeExercise,lessons:TUTORIAL_LESSONS};
})();
