addEventListener('load',()=>{
 const results=[];let failures=0;
 const check=(ok,text)=>{results.push((ok?'PASS ':'FAIL ')+text);if(!ok)failures++};
 function inspect(expected){
  const before=JSON.stringify({state,history,tool,picks,index,editingLine}),event=new MouseEvent('contextmenu',{bubbles:true,cancelable:true});
  $('#learning-guidance').dispatchEvent(event);
  check(event.defaultPrevented&&$('#modal').open&&(!expected||$('#modalbody').textContent.includes(expected==='Logic'?'Deduction':displayReference(expected))),'Right-click reveals '+(expected||'the current step status'));
  check(JSON.stringify({state,history,tool,picks,index,editingLine})===before,'Inspecting guidance leaves construction, proof, selection, and Undo unchanged');$('#closemodal').click();
 }
 try{
  $('#continue-menu').click();
  const firstFive=['P3','P1','I2','CN4','P2'];
  for(let i=0;i<LESSONS.length;i++){
   Object.assign(settings,DEFAULT_SETTINGS,{learningMode:true,soundEffects:false});saved={};load(i);
   const lesson=LESSONS[i],progress=constructionProgress(state,lesson);
   if(!progress.complete){const expected=lesson.id<=5?firstFive[lesson.id-1]:lesson.construction[progress.checks.findIndex(v=>!v)].ref;check(learningToolHint().reference===expected,lesson.key+' preview identifies the next construction tool')}
  }
  Object.assign(settings,DEFAULT_SETTINGS,{learningMode:true,soundEffects:false});saved={};load(0);inspect('P3');
  $('#learning-guidance').click();inspect('P3');$('#learning-guidance').click();inspect('D1');
  Object.assign(settings,{skipConstruction:true});render();inspect('D15');
  state.lines=[{s:'AC = AB',j:'P1'}];render();inspect('D15');
  state.lines=[{s:'AC = AB',j:'D15'},{s:'BC = BA',j:'D15'}];render();inspect('CN1');
  state.lines.push({s:'AC = BC',j:'CN1'});render();inspect('D20');
  settings.showDefinitionNames=false;render();inspect('D20');
  $('#learning-guidance').dispatchEvent(new KeyboardEvent('keydown',{key:'F10',shiftKey:true,bubbles:true,cancelable:true}));check($('#modal').open,'Shift+F10 also reveals the tool');$('#closemodal').click();
  Object.assign(settings,DEFAULT_SETTINGS,{learningMode:true,soundEffects:false,skipConstruction:true,skipProof:true});saved={};load(0);inspect('D15');
  Object.assign(settings,{skipProof:false,skipJustifications:true});render();inspect('D15');
  Object.assign(settings,DEFAULT_SETTINGS,{learningMode:true,soundEffects:false});saved={};load(EuclidBooks.position('2.14'));
  for(let steps=0;steps<20&&!constructionProgress(state,LESSONS[index]).checks[5];steps++)$('#learning-guidance').click();inspect('D18');
  saved={};load(EuclidBooks.position('3.2'));inspect('E3.1');
  Object.assign(settings,{skipConstruction:true});render();inspect('E3.1');
  state.lines.push({s:LESSONS[index].proofGuide[0].s,j:'E3.1'});render();inspect('D15');
  saved={};load(EuclidBooks.position('3.1'));state.lines.push(...LESSONS[index].proofGuide.slice(0,9).map(s=>({s:s.s,j:s.j})));render();inspect('Logic');
  Object.assign(settings,DEFAULT_SETTINGS,{learningMode:true,soundEffects:false,skipConstruction:true});saved={};load(0);state.lines=[{s:'AC = AB',j:'D15'}];render();beginEdit(0);inspect();check(editingLine===0&&$('#statement').value==='AC = AB','Preview does not submit an active edit');$('#cancel-edit').click();
  Object.assign(settings,{skipProof:true,skipJustifications:true});render();check(state.completed,'Review mode is complete');inspect();
  check(PROOF_ENTRY_ERRORS.length===0,'No uncaught browser errors');
 }catch(error){check(false,error.stack||String(error))}
 const output=document.createElement('pre');output.id='qa-result';output.textContent=results.join('\n')+'\n'+(failures?'CHECKS FAILED':'ALL CHECKS PASSED');document.body.append(output);
});
