addEventListener('load',()=>{
 const results=[];let failures=0;
 const check=(ok,text)=>{results.push((ok?'PASS ':'FAIL ')+text);if(!ok)failures++};
 try{
  $('#main-menu').close();
  for(let i=0;i<LESSONS.length;i++){
   if(i+1<(window.AUDIT_START||1)||i+1>(window.AUDIT_END||LESSONS.length))continue;
   if(window.AUDIT_LESSON&&LESSONS[i].id!==window.AUDIT_LESSON)continue;
   const masks=[0,1,2,3,4,5,6,7];
   for(let mask of masks){
    Object.assign(settings,DEFAULT_SETTINGS,{learningMode:true,soundEffects:false,skipConstruction:!!(mask&1),skipProof:!!(mask&2),skipJustifications:!!(mask&4)});
    saved={};index=i;state=fresh();history=[];resetLineForm();render();let clicks=0,stalled=false;
    while(!state.completed&&clicks++<150){
     const before=JSON.stringify(state),wasConstructing=!constructionProgress(state,LESSONS[i]).complete,undoCount=history.length;
     $('#learning-guidance').click();
     if(wasConstructing&&history.length!==Math.min(50,undoCount+1)){check(false,EuclidBooks.key(LESSONS[i])+' records one construction action for Undo');break}
     if(JSON.stringify(state)===before){stalled=true;break}
    }
    check(state.completed&&!stalled,EuclidBooks.key(LESSONS[i])+' mode '+mask+' completes via guidance ('+clicks+' clicks)'+(stalled?' STALLED: '+$('#learning-instructions').textContent:''));
    const before=JSON.stringify(state);$('#learning-guidance').click();check(JSON.stringify(state)===before,'Completed guidance leaves progress intact');
   }
  }
  Object.assign(settings,DEFAULT_SETTINGS,{learningMode:true,soundEffects:false});index=0;state=fresh();render();
  $('#learning-guidance').dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));
  check(state.circles.length===1&&history.length===1,'Keyboard activation makes one recorded, undoable circle');
  $('#undo').click();check(state.circles.length===0,'Undo reverts the guided construction');
  Object.assign(state,suppliedConstruction(0));state.lines.push({s:'not a statement',j:null});render();
  for(let count=0;count<30&&!state.completed;count++)$('#learning-guidance').click();
  check(state.completed&&state.lines.every(line=>line.valid),'Guided proof preserves progress and removes an unnecessary invalid line');
  index=0;state=fresh();
  settings.learningMode=false;render();performLearningStep();check(state.circles.length===0,'Shortcut is inactive outside learning mode');
 }catch(error){check(false,error.stack)}
 const pre=document.createElement('pre');pre.id='qa-result';pre.textContent=results.concat(failures?'FAILED '+failures+' checks':'ALL CHECKS PASSED').join('\n');document.body.replaceChildren(pre);
});
