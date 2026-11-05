/* Source audit for Book I lessons: real form entry, all eight practice modes,
 * with/without learning guidance, source inspection, and save migration. */
addEventListener('load',()=>{
 const results=[];let failures=0,count=0;
 const check=(ok,message)=>{count++;if(!ok){failures++;results.push('FAIL '+message)}};
 const labels=value=>value.lines.map(l=>({s:l.s,j:l.j,valid:l.valid,auto:l.autoJustification}));
 const clean=text=>!(/\b(?:CN|[DEIP])\.?\s*\d+\b|undefined|NaN/.test(text));
 const id=window.AUDIT_LESSON,i=id-1;
 try{
  $('#continue-menu').click();saved={};Object.assign(settings,DEFAULT_SETTINGS);load(i);state=fresh();
  const lesson=LESSONS[i],geometry=suppliedConstruction(i);
  check(constructionProgress(geometry,lesson).complete,'supplied geometry has every recorded operation');
  check(!(lesson.proofGuide||lesson.hintSteps).some(l=>l.j==='D22'&&/is a parallelogram/.test(l.s)),'general parallelograms never cite the square definition');
  if(window.AUDIT_PHASE==='construction'){
   for(let mask of [0,2,4,6])for(let learning of [false,true]){
    Object.assign(settings,DEFAULT_SETTINGS,{skipProof:!!(mask&2),skipJustifications:!!(mask&4),learningMode:learning});state=fresh();render();
    if(id<=5)Object.assign(state,suppliedConstruction(i));
    for(let task of lesson.construction||[]){
     check(clean(nextHint()),'construction hint has no rule answer mode='+mask+' '+task.text);
     buildingPractice=true;
     try{
      tool=Object.values(REFERENCES).flat().find(r=>r[1]===task.ref);picks=[];
      if(task.ref!=='D1'||task.inputs.length)task.inputs.forEach(choosePoint);
      else{
       let supports=task.supports||INTERSECTION_SUPPORTS[id][task.outputs[0]],candidates=bookOneIntersections().filter(q=>supports.every(s=>{if(s.startsWith('circle:'))return Math.abs(distance(q,state.points[s[7]])-distance(state.points[s[7]],state.points[s[8]]))<.001;let [a,b]=[state.points[s[0]],state.points[s[1]]];return Math.abs((b[0]-a[0])*(q[1]-a[1])-(b[1]-a[1])*(q[0]-a[0]))<.001}));
       if(task.beyond)candidates=candidates.filter(q=>{let a=state.points[task.beyond[0]],b=state.points[task.beyond[1]];return (q[0]-a[0])*(b[0]-a[0])+(q[1]-a[1])*(b[1]-a[1])>distance(a,b)**2});
       if(task.within)candidates=candidates.filter(q=>distance(q,state.points[task.within[0]])<distance(state.points[task.within[0]],state.points[task.within[1]])&&distance(q,state.points[task.within[1]])<distance(state.points[task.within[0]],state.points[task.within[1]]));
       let point=candidates.sort((a,b)=>a[1]-b[1])[0];if(!point)throw Error('No intersection for '+task.text);bookOneMark(point);
      }
     }finally{buildingPractice=false}
     render();check(task.outputs.every(n=>state.points[n]),'actual tool outputs mode='+mask+' '+task.text);
    }
    check(constructionProgress(state,lesson).complete,'manually constructed mode='+mask+' learning='+learning);
    state.lines=(lesson.proofGuide||lesson.hintSteps).map(l=>({s:l.s,j:settings.skipJustifications?null:l.j}));render();check(state.completed,'manual construction supports proof mode='+mask+' learning='+learning);
   }
   if(id===45){
    Object.assign(settings,DEFAULT_SETTINGS);state=fresh();state.points.H=[180,460];state.points.I=[380,460];state.edges.push('HI');EuclidConstruction.initialize(state,lesson);
    for(let names of [['H','I','A','B','C','E','F','G'],['K','J','A','C','D','E','F','G']]){tool=REFERENCES.propositions.find(r=>r[1]==='I44');picks=[];names.forEach(choosePoint)}
    check(constructionProgress(state,lesson).complete,'legacy E.45 two-application construction remains valid');
    state.lines=(lesson.proofGuide||lesson.hintSteps).map(l=>({s:l.s,j:l.j==='I42'?'I44':l.j}));render();check(state.completed,'legacy E.45 drawing retains its original valid references');
   }
   if(id===46){let c=BookOneLogic.context({...structuredClone(geometry),lines:[]},lesson),pg=BookOneLogic.parse('ABGD is a parallelogram');check(!c.check(pg,'D22').ok&&c.check(pg,'Logic').ok,'parallelogram criterion is a valid deduction but not Definition 22')}
   if(id===48){
    let cachedProof={...structuredClone(geometry),lines:(lesson.proofGuide||lesson.hintSteps).map(l=>({s:l.s,j:null}))};check(inferredProof(cachedProof,lesson).complete,'automatic cache accepts the established full proof');cachedProof.lines=cachedProof.lines.filter(l=>l.s!==lesson.givens[0]);check(!inferredProof(cachedProof,lesson).complete,'automatic cache invalidates when a required premise is removed');
    let legacy={...structuredClone(geometry),lines:(lesson.proofGuide||lesson.hintSteps).filter(l=>l.j!=='Given').map(l=>({s:l.s,j:l.j}))};delete legacy.topology.intersections;legacy.topology.lines.push('ABF');
    check(!EuclidLogic.grade(legacy,lesson).complete&&!EuclidLogic.diagram(legacy).collinear('A','B','F'),'legacy accidental alignment does not prove E.48 without its hypothesis');
    check(geometry.topology.intersections.find(r=>r.point==='F')?.supports.join(',')==='AD,circle:AE','E.48 circle intersection records precisely its selected supports');
   }
   // Remove essential premises/records; a visually identical drawing is not evidence.
   const missingGiven={38:'BC = EF',39:'area ABC = area ABD',40:'BC = EF',41:'ABCD is a parallelogram',43:'ABCD is a parallelogram',47:'angle BAC is right',48:'BC^2 = AB^2 + AC^2'}[id];
   let value={...structuredClone(geometry),lines:(lesson.proofGuide||lesson.hintSteps).filter(l=>l.s!==missingGiven).map(l=>({s:l.s,j:l.j}))};
   if(missingGiven)check(!EuclidLogic.grade(value,lesson).complete,'essential premise cannot be omitted: '+missingGiven);
   for(let operation of ({42:['midpoint'],44:['equalArea'],45:['equalArea','applyArea'],46:['perpendicular'],47:['square'],48:['perpendicular']}[id]||[])){
    let missing={...structuredClone(geometry),lines:(lesson.proofGuide||lesson.hintSteps).map(l=>({s:l.s,j:l.j}))};missing.facts=missing.facts.filter(raw=>!raw.startsWith('book:')||JSON.parse(raw.slice(5)).operation!==operation);
    check(!EuclidLogic.grade(missing,lesson).complete,'missing '+operation+' record cannot be replaced by appearance');
   }
  }else{
  // Follow the proof one line at a time through the actual input form. Guidance
  // must preserve automatic grades and tell the current step, not a later proof.
  for(let automatic of [false,true]){
   Object.assign(settings,DEFAULT_SETTINGS,{skipJustifications:automatic,learningMode:true});state={...fresh(),...structuredClone(geometry)};render();
   for(let step of (lesson.proofGuide||lesson.hintSteps)){
    let c=(automatic?inferredProof(state,lesson):EuclidLogic.grade(state,lesson)).context,ast=(id<=5?BookOneLogic.baseParse:BookOneLogic.parse)(step.s);
    if(state.lines.some(l=>l.valid&&(id<=5?norm(l.s)===norm(step.s):c.key(BookOneLogic.parse(l.s))===c.key(ast))))continue;
    const before=JSON.stringify(labels(state)),hint=nextHint();
    check(JSON.stringify(labels(state))===before,'hint preserves proof at '+step.s+' auto='+automatic);
    check(clean(hint),'hint hides rule indices and contains real text at '+step.s);
    check(hint.includes(step.s),'hint directs the next source statement '+step.s);
    check($('#learning-instructions').textContent===displayReference(hint),'learning mode and hint use identical current guidance');
    check(!!proofStepReason(lesson,step),'specific guidance covers '+step.s);
    $('#statement').value=step.s;$('#lineform').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
    if(!automatic){tool=Object.values(REFERENCES).flat().find(r=>r[1]===step.j)||[step.j,step.j];$('#lines .proofline:last-child').click()}
    check(state.lines.at(-1).valid,'form-entered '+step.s+' auto='+automatic+' '+state.lines.at(-1).error);
    if(automatic)check(state.lines.at(-1).autoJustification===step.j,'source-aligned automatic reference '+step.s+' wanted '+step.j+' got '+state.lines.at(-1).autoJustification);
   }
   check(state.completed,'step-by-step proof completes auto='+automatic);
  }
  for(let mask=0;mask<8;mask++)for(let learning of [false,true]){
   Object.assign(settings,DEFAULT_SETTINGS,{skipConstruction:!!(mask&1),skipProof:!!(mask&2),skipJustifications:!!(mask&4),learningMode:learning});
   state=fresh();render();
   check((lesson.givens||[]).every(s=>state.lines.some(l=>l.s===s&&l.valid)),'hypotheses supplied mode='+mask+' learning='+learning);
   check(!document.querySelector('.proof').hidden,'proof visible mode='+mask);
   if(!settings.skipConstruction)Object.assign(state,structuredClone(geometry));
   if(!settings.skipProof)state.lines=(lesson.proofGuide||lesson.hintSteps).map(step=>({s:step.s,j:settings.skipJustifications?null:step.j}));
   else if(!settings.skipJustifications)state.lines.forEach(l=>l.j=(lesson.proofGuide||lesson.hintSteps).find(s=>s.s===l.s)?.j||l.j);
   render();
   check(state.completed&&state.lines.every(l=>l.valid),'mode='+mask+' learning='+learning+' complete '+state.lines.filter(l=>!l.valid).map(l=>l.s+': '+l.error).join('; '));
   check($('#lineform').hidden===settings.skipProof,'form follows skip-proof setting mode='+mask);
   check($('#learning-guidance').hidden===!learning,'learning panel mode='+mask);
   let previous=JSON.stringify(labels(state));nextHint();render();
   check(JSON.stringify(labels(state))===previous,'hints and rendering preserve grades mode='+mask+' learning='+learning);
   check([...document.querySelectorAll('#lines .proofline small')].every((node,n)=>node.textContent===proofReferenceName(state.lines[n],settings.skipJustifications?state.lines[n].autoJustification:state.lines[n].j)),'visible sources match actual references mode='+mask);
   let snapshot=saveDocument();restoreSave(snapshot);check(state.completed&&state.lines.every(l=>l.valid),'save restores mode='+mask+' learning='+learning);
   check(document.body.scrollHeight===document.body.clientHeight&&document.body.scrollWidth===document.body.clientWidth,'frame fits mode='+mask);
   if(!settings.skipProof){
    $('#statement').value='AB > AB';$('#lineform').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
    if(!settings.skipJustifications){tool=['Deduction','Logic'];$('#lines .proofline:last-child').click()}
    check(!state.lines.at(-1).valid&&!state.completed,'false statement rejected mode='+mask);
    if(settings.skipJustifications)check(!/select a reference/i.test(state.lines.at(-1).error),'automatic errors never request manual references mode='+mask);
   }
  }
  if(id===26||id===29){
   let missing={...structuredClone(geometry),lines:(lesson.proofGuide||lesson.hintSteps).filter(l=>l.j!=='Given').map(l=>({s:l.s,j:null}))};
   inferredProof(missing,lesson);check(!missing.lines.find(l=>l.s===(id===26?'BC = EF':'angle AGH = angle GHD')).valid,'teaching-route source cannot grant a missing hypothesis');
  }
  if(id===28){let value={...structuredClone(geometry),lines:[]},c=BookOneLogic.context(value,lesson);for(let s of lesson.givens)c.accept(BookOneLogic.parse(s),'Given');c.accept(BookOneLogic.parse('angle EGB = angle AGH'),'I15');check(!c.check(BookOneLogic.parse('angle AGH = angle GHD'),'I15',true).ok&&c.check(BookOneLogic.parse('angle AGH = angle GHD'),'CN1').ok,'vertical-angle rule and equality substitution remain separate steps')}
  // Euclid gives two cases in these propositions. The displayed exercise
  // supplies one hypothesis set; independently validate the companion route.
  if(id===26||id===28){
   let variant=id===26?{...lesson,givens:['angle ABC = angle DEF','angle ACB = angle DFE','BC = EF'],goals:['AB = DE','AC = DF','angle BAC = angle EDF'],proofGuide:[['angle ABC = angle DEF','Given'],['angle ACB = angle DFE','Given'],['BC = EF','Given'],['AB = DE','I4'],['ABC is congruent to DEF','I4'],['AC = DF','I4'],['angle BAC = angle EDF','I4']].map(([s,j])=>({s,j}))}:{...lesson,givens:['angle BGH + angle GHD = 2 right angles'],proofGuide:[['angle BGH + angle GHD = 2 right angles','Given'],['angle AGH + angle BGH = 2 right angles','I13'],['angle AGH + angle BGH = angle BGH + angle GHD','CN1'],['angle AGH = angle GHD','CN3'],['AB is parallel to CD','I27']].map(([s,j])=>({s,j}))};
   let value={...structuredClone(geometry),lines:variant.proofGuide.map(l=>({...l}))};
   check(EuclidLogic.grade(value,variant).complete,'companion Euclidean case accepts its actual source proof');
   value.lines.forEach(l=>l.j=null);check(inferredProof(value,variant).complete,'companion case also validates with automatic justifications');
   check(!value.points.X,'temporary assumption points never enter a construction');
  }
  if([9,10,11,12,23,33,34].includes(id)){
   let route=lesson.proofGuide,position=route.findIndex(l=>/is congruent/.test(l.s)),after=route.slice(position+1).find(l=>l.j===route[position].j&&!/is congruent/.test(l.s));
   if(position>=0&&after){let direct={...structuredClone(geometry),lines:[...route.slice(0,position),after].map(l=>({s:l.s,j:l.j}))};EuclidLogic.grade(direct,lesson);check(direct.lines.at(-1).valid,'source theorem concludes its corresponding part without a compulsory congruence sentence')}
  }
  // Neither actual given incidence nor algebra depends on display coordinates.
  Object.assign(settings,DEFAULT_SETTINGS);state={...fresh(),...structuredClone(geometry),lines:(lesson.proofGuide||lesson.hintSteps).map(l=>({s:l.s,j:l.j}))};
  for(let [n,name] of Object.keys(state.points).entries())state.points[name]=[n*17+3,n*n*11+9];
  check(EuclidLogic.grade(state,lesson).complete,'moved drawing does not change formal proof');
  if(id===44){
   let missing={...fresh(),...structuredClone(geometry),lines:(lesson.proofGuide||lesson.hintSteps).filter(l=>l.s!=='angle BMJ + angle MJI < 2 right angles').map(l=>({s:l.s,j:l.j}))};
   EuclidLogic.grade(missing,lesson);check(!missing.lines.find(l=>l.s==='MB meets JI at N').valid,'parallel-postulate meeting requires proved strict angle sum');
  }
  }
 }catch(e){check(false,e.stack)}
 results.push((failures?'FAILED '+failures+' checks':'ALL CHECKS PASSED')+' (E.'+id+', '+count+' checks, '+(window.AUDIT_PHASE==='construction'?'8 construction/learning combinations':'16 mode combinations')+')');
 let pre=document.createElement('pre');pre.id='qa-result';pre.textContent=results.join('\n');document.body.replaceChildren(pre);document.body.style.cssText='display:block;height:auto;overflow:auto';
});
