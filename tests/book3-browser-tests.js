addEventListener('load',async()=>{
 const results=[];let failures=0,cases=0;
 const check=(ok,text)=>{results.push((ok?'PASS ':'FAIL ')+text);if(!ok)failures++},pause=()=>new Promise(r=>setTimeout(r,0));
 try{
  $('#continue-menu').click();
  check(LESSONS.length===69&&BOOK_THREE_LESSONS.length===7,'Only the first seven Book III propositions are installed');
  for(const lesson of BOOK_THREE_LESSONS){
   const position=EuclidBooks.position(lesson.key);Object.assign(settings,DEFAULT_SETTINGS,{soundEffects:false});saved={};load(position);
   const built=suppliedConstruction(position);Object.assign(state,built);state.lines.push(...lesson.proofGuide.map(s=>({s:s.s,j:s.j})));render();
   check(state.completed&&state.lines.every(l=>l.valid),lesson.key+' source route validates with recorded construction');
   const full=structuredClone(state),moved=structuredClone(state);for(const p of Object.values(moved.points)){p[0]=p[0]*1.17+43;p[1]=p[1]*.83-25}
   check(EuclidLogic.grade(moved,lesson).complete,lesson.key+' proof is invariant under moved drawing coordinates');
   const restored=saveDocument();restoreSave(restored);check(state.completed&&state.givenCircles.length===lesson.givenCircles.length,lesson.key+' circle identities and proof survive persistence');
   const noCenters=structuredClone(full);noCenters.facts=noCenters.facts.filter(s=>!s.startsWith('center:'));noCenters.lines=[];
   const centerQuery=lesson.proofGuide.find(s=>BookOneLogic.parse(s.s)?.kind==='circleCenter');
   if(centerQuery){const trial=structuredClone(noCenters);trial.lines=[{s:centerQuery.s,j:centerQuery.j}];EuclidLogic.grade(trial,lesson);check(!trial.lines[0].valid,lesson.key+' hidden drawing center does not supply a center proof')}
   const conditional=lesson.proofGuide.find(s=>s.s.startsWith('If ')&&s.j==='D15');
   if(conditional){const trial=structuredClone(full);trial.lines=[{s:conditional.s.split(' then ')[1],j:'D15'}];EuclidLogic.grade(trial,lesson);if([1,5,6].includes(lesson.proposition))check(!trial.lines[0].valid,lesson.key+' hypothetical radii do not escape their conditional clause')}
   const contradiction=lesson.proofGuide.find(s=>s.s.endsWith('then contradiction'));
   if(contradiction){const trial=structuredClone(full);trial.lines=trial.lines.filter(l=>l.s!==contradiction.s);check(!EuclidLogic.grade(trial,lesson).complete,lesson.key+' deleting a required contradiction invalidates the conclusion')}
   for(let mask=0;mask<8;mask++)for(const learningMode of [false,true]){
    Object.assign(settings,DEFAULT_SETTINGS,{soundEffects:false,skipConstruction:!!(mask&1),skipProof:!!(mask&2),skipJustifications:!!(mask&4),learningMode});saved={};load(position);
    if(learningMode){
     let steps=0;while(!state.completed&&steps++<200){const before=JSON.stringify(state);$('#learning-guidance').click();if(before===JSON.stringify(state))break}
    }else{
     if(!settings.skipConstruction){Object.assign(state,structuredClone(built));render()}
     if(settings.skipProof){for(let i=0;i<state.lines.length;i++){const line=state.lines[i];if(line.j==='Given'||settings.skipJustifications)continue;const step=lesson.proofGuide.find(s=>norm(s.s)===norm(line.s));selectReference(Object.values(REFERENCES).flat().find(r=>r[1]===step.j)||LOGIC_REFERENCE);$('#lines').children[i].click()}}
     else for(const step of lesson.proofGuide){$('#statement').value=step.s;$('#lineform').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));if(!settings.skipJustifications){selectReference(Object.values(REFERENCES).flat().find(r=>r[1]===step.j)||LOGIC_REFERENCE);$('#lines').lastElementChild.click()}}
    }
    check(state.completed&&state.lines.every(l=>l.valid),lesson.key+' mode '+mask+' learning '+learningMode+': '+(state.lines.find(l=>!l.valid)?.error||$('#instruction').textContent));cases++;await pause();
   }
  }
  check(cases===112,'All 112 Book III practice/learning combinations exercised');
  check(PROOF_ENTRY_ERRORS.length===0,'No uncaught browser errors');
 }catch(error){check(false,error.stack||String(error))}
 const node=document.createElement('pre');node.id='qa-result';node.textContent=results.join('\n')+'\n'+(failures?'CHECKS FAILED':'ALL CHECKS PASSED');document.body.append(node);
});
