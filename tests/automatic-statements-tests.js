addEventListener('load',async()=>{
 const results=[];let failures=0,cases=0;
 const check=(ok,text)=>{results.push((ok?'PASS ':'FAIL ')+text);if(!ok)failures++},settle=()=>new Promise(resolve=>setTimeout(resolve,0));
 const same=(a,b)=>{const c=BookOneLogic.context(structuredClone(state),LESSONS[index]);return c.key(BookOneLogic.parse(a))===c.key(BookOneLogic.parse(b))};
 const justify=i=>{const step=LESSONS[index].proofGuide.find(step=>same(step.s,state.lines[i].s));selectReference(Object.values(REFERENCES).flat().find(r=>r[1]===step.j)||LOGIC_REFERENCE);$('#lines').children[i].click()};
 try{
  $('#continue-menu').click();
  const specialKinds=new Set();let intermediates=0;
  for(const lesson of LESSONS)for(const step of lesson.proofGuide||lesson.hintSteps||[]){
   let ast=BookOneLogic.parse(step.s);while(ast?.kind==='conditional')ast=ast.body;
   if(AutomaticStatements.special(step)){specialKinds.add(ast.kind);if(step.j!=='Logic')intermediates++}
  }
  check(intermediates===4,'All four special-format intermediate center statements are supplied, including earlier-proposition justifications');
  check(specialKinds.size===8,'All special statement kinds currently used across the three books are covered');
  check(!AutomaticStatements.special({s:'If J is the center of circle C1 then JA = JB',j:'D15'}),'A standard equality remains manual inside a hypothetical argument');
  for(const lesson of BOOK_THREE_LESSONS)for(let mask=0;mask<8;mask++)for(const learningMode of [false,true]){
   Object.assign(settings,DEFAULT_SETTINGS,{soundEffects:false,skipConstruction:!!(mask&1),skipProof:!!(mask&2),skipJustifications:!!(mask&4),learningMode});saved={};load(EuclidBooks.position(lesson.key));
   if(!settings.skipConstruction){Object.assign(state,suppliedConstruction(index));render()}
   await settle();
   if(settings.skipProof){
    if(!settings.skipJustifications)for(let i=0;i<state.lines.length;i++){if(state.lines[i].j==='Given')continue;justify(i);await settle()}
   }else for(const step of lesson.proofGuide){
    let target=state.lines.findIndex(line=>same(line.s,step.s));
    if(AutomaticStatements.special(step)){
     check(target>=0,lesson.key+' mode '+mask+' learning '+learningMode+' supplies '+ProofScopes.display(step.s,lesson));
     if(target<0)throw Error('Missing automatic conclusion: '+step.s);
     if(!settings.skipJustifications)check(!state.lines[target].j,lesson.key+' supplied wording still needs a justification');
    }else{
     target=state.lines.length;$('#statement').value=ProofScopes.display(step.s,lesson);$('#lineform').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));await settle();
    }
    if(!settings.skipJustifications){justify(target);await settle()}
   }
   check(state.completed&&state.lines.every(line=>line.valid),lesson.key+' mode '+mask+' learning '+learningMode+' completes without typing special conclusions');cases++;
  }
  check(cases===112,'All 112 practice/learning combinations exercised');
  Object.assign(settings,DEFAULT_SETTINGS,{skipConstruction:true,soundEffects:false});saved={};load(EuclidBooks.position('3.1'));
  const lesson=LESSONS[index],closing=lesson.proofGuide.find(step=>step.s==='H is the center of circle C1');
  check([...lesson.givens,...lesson.proofGuide.map(step=>step.s)][14]===closing.s,'E3.1 source line 15 is the center statement');
  state.lines.push(...lesson.proofGuide.filter(step=>step!==closing).map(step=>({s:step.s,j:step.j})));
  const ready=structuredClone(state),historyBefore=history.length,events=[],record=Ranked.record;
  Ranked.record=event=>events.push(event);render();events.push({kind:'mutation-complete'});await settle();Ranked.record=record;
  check(events[0].kind==='mutation-complete'&&events[1]?.kind==='statement'&&events[1].statement===closing.s&&events[1].line===null&&events.length===2,'Automatic ranked events follow the triggering mutation and supply no justification');
  check(history.length===historyBefore+1,'An automatic statement has one ordinary Undo snapshot');
  $('#undo').click();await settle();check(!state.lines.some(line=>line.s===closing.s),'Undo removes an automatic statement without immediately restoring it');
  state=structuredClone(ready);render();await settle();
  const last=state.lines.length-1;check(state.lines[last].s===closing.s&&!state.lines[last].j,'E3.1 supplies its final center statement without auto-justifying');
  deleteProofLine(last);await settle();selectReference(LOGIC_REFERENCE);await settle();
  check(!state.lines.some(line=>line.s===closing.s),'Deleting a supplied conclusion does not immediately add it again');
  $('#undo').click();await settle();check(state.lines.some(line=>line.s===closing.s),'Undo restores the deleted supplied statement');
  justify(state.lines.length-1);await settle();const count=state.lines.length;load(index);await settle();
  check(state.lines.length===count&&state.completed,'Reload preserves supplied conclusions without duplicates');
  state.lines=state.lines.filter(line=>line.s!==closing.s);render();beginEdit(3);await settle();
  check(!state.lines.some(line=>line.s===closing.s),'Automatic wording does not interrupt an active edit');$('#cancel-edit').click();await settle();
  check(state.lines.some(line=>line.s===closing.s),'Automatic wording resumes after an edit is canceled');
  state.lines=state.lines.filter(line=>line.s!==closing.s);const premise=state.lines.find(line=>line.s==='The center of circle C1 lies on DE');premise.j='P1';render();await settle();
  check(!state.lines.some(line=>line.s===closing.s),'An invalid supporting argument cannot produce a conclusion');
  premise.j='Logic';state.lines.push({s:'not a proof statement',j:null});$('#statement').value='my unfinished draft';render();await settle();
  check(state.lines.some(line=>line.s===closing.s)&&state.lines.some(line=>line.s==='not a proof statement'&&!line.valid),'An unrelated invalid line cannot hide a proven special statement or become a premise');
  check($('#statement').value==='my unfinished draft','Supplying a special statement preserves an unfinished input draft');$('#statement').value='';
  deleteProofLine(state.lines.findIndex(line=>line.s==='not a proof statement'));await settle();
  check(state.lines.filter(line=>line.s===closing.s).length===1,'Deleting an ordinary erroneous line does not duplicate supplied statements');
  check(PROOF_ENTRY_ERRORS.length===0,'No uncaught browser errors');
 }catch(error){check(false,error.stack||String(error))}
 const output=document.createElement('pre');output.id='qa-result';output.textContent=results.join('\n')+'\n'+(failures?'CHECKS FAILED':'ALL CHECKS PASSED');document.body.append(output);
});
