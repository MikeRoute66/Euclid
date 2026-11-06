/* Exercise malformed input through the form and a real autosave page reload. */
addEventListener('load',()=>{
 const key='euclid-proof-entry-reload-test';
 let results=[],failures=0;
 const check=(ok,name)=>{results.push((ok?'PASS ':'FAIL ')+name);if(!ok)failures++};
 const finish=()=>{sessionStorage.removeItem(key);let out=document.createElement('pre');out.id='qa-result';out.textContent=results.join('\n')+'\n'+(failures?'FAILED '+failures:'ALL CHECKS PASSED');document.body.append(out)};
 const malformed='area BGNC = areaBGLD + area DLME + area EMNC';
 const correct='area BGNC = area BGLD + area DLME + area EMNC';
 try{
  let prior=JSON.parse(sessionStorage.getItem(key)||'null');
  if(!prior){
   $('#continue-menu').click();saved={};Object.assign(settings,DEFAULT_SETTINGS,{learningMode:true,skipConstruction:true,skipJustifications:true});
   localStorage.setItem(SETTINGS_KEY,JSON.stringify(settings));load(EuclidBooks.position('2.1'));
   check(norm(malformed)===norm(correct)&&!BookOneLogic.parse(malformed),'formatting variant matches the teaching key but is not a parsed statement');
   $('#statement').value=malformed;$('#statement').dispatchEvent(new Event('input',{bubbles:true}));
   check(!$('#format-help').hidden&&$('#format-help button').textContent===correct,'neutral format help supplies the missing area spacing without changing the figures');
   $('#lineform').requestSubmit();
   check(state.lines.length===2&&$('#lines').children.length===2,'malformed second line remains visible after submission');
   check(!state.lines[1].valid&&/format/i.test(state.lines[1].error)&&!state.lines[1].autoJustification,'malformed input shows a format error without an inferred reference');
   check((window.PROOF_ENTRY_ERRORS||[]).length===0,'submitting malformed input does not interrupt rendering');
   check(!BookOneLogic.context(state,LESSONS[index]).check(null,'CN2').ok,'extended formal checker rejects a missing syntax tree');
   check(!EuclidLogic.context(suppliedConstruction(0),LESSONS[0]).check(null,'D20').ok,'original formal checker rejects a missing syntax tree');
   let original={...suppliedConstruction(0),lines:[{s:'A BC is equilateral',j:null}]};
   check(!BookOneLogic.baseParse(original.lines[0].s)&&!inferredProof(original,LESSONS[0]).complete&&!original.lines[0].valid,'automatic justification also retains a malformed teaching-step variant in Book I');
   let document=saveDocument();
   try{let restored=validateSave(document);check(restored.progress[index].lines[1].s===malformed,'save validation retains an invalid statement for editing')}catch(e){check(false,'save validation: '+e.message)}
   sessionStorage.setItem(key,JSON.stringify({results,failures}));
   setTimeout(()=>location.reload(),0);return;
  }
  ({results,failures}=prior);
  check((window.PROOF_ENTRY_ERRORS||[]).length===0,'page boot with an invalid saved statement does not throw');
  check(index===EuclidBooks.position('2.1')&&state.lines[1]?.s===malformed&&$('#lines').children.length===2,'real reload restores E2.1 and keeps the invalid line visible');
  check($('#main-menu').open,'the main menu is available after restoring invalid proof input');
  $('#continue-menu').click();
  check(settings.learningMode&&settings.skipConstruction&&settings.skipJustifications&&!settings.skipProof,'real reload retains the reported practice settings');
  check(!$('#learning-guidance').hidden&&$('#learning-instructions').textContent.includes('Edit line 2'),'learning mode directs the player to correct the invalid line');
  $('#lines').children[1].querySelector('.edit-line').click();$('#statement').dispatchEvent(new Event('input',{bubbles:true}));$('#format-help button').click();
  $('#lineform button[type="submit"]').click();
  check(state.lines.length===2&&state.lines[1].s===correct&&state.lines[1].valid&&state.lines[1].autoJustification==='CN2','format correction edits the existing row and automatically justifies the area sum');
  $('#statement').value='BG = AX';$('#lineform button[type="submit"]').click();
  check(state.lines.length===3&&state.lines[2].valid&&state.lines[2].autoJustification==='I3','the next proof statement can be submitted normally');
  let snapshot=saveDocument();restoreSave(snapshot);load(0);load(EuclidBooks.position('2.1'));
  check(state.lines.length===3&&state.lines.every(line=>line.valid),'corrected proof survives save restoration and navigation away and back');
  check((window.PROOF_ENTRY_ERRORS||[]).length===0,'the entire input, reload, edit, and navigation flow has no uncaught errors');
 }catch(e){check(false,e.stack)}
 finish();
});
