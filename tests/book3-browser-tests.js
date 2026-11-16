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
   check([...document.querySelectorAll('#lines .proofline strong')].every(node=>!/^If /i.test(node.textContent)),lesson.key+' displays plain statements in every hypothetical block');
   check($('#lines .scope-start')?.dataset.assumption.startsWith('Assume '),lesson.key+' displays the assumption separately from numbered statements');
   const conditionalIndex=state.lines.findIndex(l=>/^If /i.test(l.s));
   beginEdit(conditionalIndex);const original=state.lines[conditionalIndex].s;
   check($('#statement').value===ProofScopes.split(original).body,lesson.key+' edit field contains only the statement');
   $('#lineform').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
   check(state.lines[conditionalIndex].s===original&&state.lines[conditionalIndex].valid,lesson.key+' editing a closed block preserves its original assumption');
   if(lesson.proposition===1)check($('#lines').children[4].querySelector('strong').textContent==='JA = JB','E3.1 numbered line five is exactly JA = JB');
   const full=structuredClone(state),moved=structuredClone(state);for(const p of Object.values(moved.points)){p[0]=p[0]*1.17+43;p[1]=p[1]*.83-25}
   const earlyCase=structuredClone(full);earlyCase.lines=earlyCase.lines.slice(0,lesson.givens.length);
   const firstCase=ProofScopes.split(lesson.proofGuide.find(step=>ProofScopes.split(step.s)).s);
   check(ProofScopes.input(firstCase.body,earlyCase,lesson,null)==='If '+firstCase.condition+' then '+firstCase.body,lesson.key+' hypothetical statements can precede independent earlier steps');
   earlyCase.lines=full.lines.slice(0,conditionalIndex+1);
   check(lesson.proofGuide.filter(step=>!ProofScopes.split(step.s)).every(step=>ProofScopes.input(step.s,earlyCase,lesson,null)===step.s),lesson.key+' independent steps stay unconditional when interleaved with a hypothetical block');
   if(lesson.proposition===1){
    state.lines=state.lines.slice(0,3);render();
    for(const [s,j] of [['ja = jb','D15'],['da = db','I10']]){
     $('#statement').value=s;$('#lineform').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
     selectReference(Object.values(REFERENCES).flat().find(r=>r[1]===j));$('#lines').lastElementChild.click();
     check(state.lines.at(-1).valid,'E3.1 accepts '+s+' in reversed order with '+j);
    }
    check(state.lines[3].s==='If J is the center of circle C1 then JA = JB'&&state.lines[4].s==='DA = DB','Reordered radius equality stays hypothetical and midpoint equality stays unconditional');
    check(ProofScopes.input('AC = AC',state,lesson,null)==='AC = AC','An independent fact outside the teaching route stays unconditional within a case');
    const legacy=structuredClone(state);legacy.lines[3]={s:'JA = JB',j:'D15',valid:false};
    check(ProofScopes.input('JA = JB',legacy,lesson,3)==='If J is the center of circle C1 then JA = JB','Editing a formerly rejected bare radius equality repairs its missing scope');
    const early=structuredClone(state);early.lines=early.lines.slice(0,4);early.facts=early.facts.filter(f=>!f.startsWith('book:')||JSON.parse(f.slice(5)).operation!=='midpoint');early.lines.push({s:'If J is the center of circle C1 then angle ADJ = angle JDB',j:'I8'});EuclidLogic.grade(early,lesson);
    check(!early.lines.at(-1).valid,'Reordering does not let SSS omit the midpoint construction evidence');
    state=structuredClone(full);
    state.lines=state.lines.slice(0,4);settings.learningMode=true;render();
    check($('#learning-instructions').textContent.includes('JA = JB')&&!$('#learning-instructions').textContent.includes('If '),'Learning guidance requests the plain radius equality');
    check($('#learning-instructions .proof-assumption').textContent==='Assume J is the center of circle C1.','Learning guidance shows the current assumption separately');
    $('#statement').value='JB = AJ';$('#lineform').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
    selectReference(REFERENCES.definitions.find(r=>r[1]==='D15'));$('#lines').lastElementChild.click();
    check(state.lines.at(-1).valid&&state.lines.at(-1).s==='If J is the center of circle C1 then JB = AJ','Plain equality with reversed endpoints receives the correct scoped justification');
    state=structuredClone(full);settings.learningMode=false;render();
   }
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
     else for(const step of lesson.proofGuide){$('#statement').value=ProofScopes.display(step.s,lesson);
      if(ProofScopes.split(step.s)){
       check(ProofScopes.assumption(state,lesson)==='Assume '+ProofScopes.split(step.s).condition+'.',lesson.key+' current input has the correct active assumption');
       check($('#proof-input-assumption').textContent==='Assume '+ProofScopes.split(step.s).condition+'.',lesson.key+' input shows its assumption without Learning mode');
      }$('#lineform').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));if(!settings.skipJustifications){selectReference(Object.values(REFERENCES).flat().find(r=>r[1]===step.j)||LOGIC_REFERENCE);$('#lines').lastElementChild.click()}}
    }
    check([...document.querySelectorAll('#lines .proofline strong')].every(node=>!/^If /i.test(node.textContent)),lesson.key+' mode '+mask+' learning '+learningMode+' plain proof display');
    check(state.completed&&state.lines.every(l=>l.valid),lesson.key+' mode '+mask+' learning '+learningMode+': '+(state.lines.find(l=>!l.valid)?.error||$('#instruction').textContent));cases++;await pause();
   }
  }
  check(cases===112,'All 112 Book III practice/learning combinations exercised');
  check(PROOF_ENTRY_ERRORS.length===0,'No uncaught browser errors');
 }catch(error){check(false,error.stack||String(error))}
 const node=document.createElement('pre');node.id='qa-result';node.textContent=results.join('\n')+'\n'+(failures?'CHECKS FAILED':'ALL CHECKS PASSED');document.body.append(node);
});
