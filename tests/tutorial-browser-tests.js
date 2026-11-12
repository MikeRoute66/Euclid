addEventListener('load',async()=>{
 const results=[];let failures=0;
 const q=s=>document.querySelector(s),check=(ok,text)=>{results.push((ok?'PASS ':'FAIL ')+text);if(!ok)failures++};
 const pause=()=>new Promise(r=>setTimeout(r,20));
 try{
  settings.soundEffects=false;
  const before={index,state:JSON.stringify(state),saved:JSON.stringify(saved),settings:JSON.stringify(settings),autosave:localStorage.getItem('euclid-workshop-v2')};
  check(q('#continue-menu').textContent==='Play'&&q('#tutorial-menu').textContent==='Tutorial'&&!q('#load-save')&&!q('#save-point-menu')&&!q('#fresh-menu')&&!q('#save-file'),'Main menu replaces the four save-game actions with Play and Tutorial');
  q('#tutorial-menu').click();
  const refs=new Set(Tutorial.lessons.map(l=>l.ref));check([...REFERENCES.definitions,...REFERENCES.postulates,...REFERENCES.notions].every(r=>refs.has(r[1])),'Every installed definition, postulate, and common notion has at least one example');
  for(const l of Tutorial.lessons){
   try{
    q('#tutorial-search').value='';q('#tutorial-search').dispatchEvent(new Event('input'));
    q('[data-lesson="'+l.id+'"]').click();
    check(!q('#tutorial-status').textContent.includes('could not open'),l.id+' opens its prepared example');
    if(['proof','customProof'].includes(l.kind)){
     const fixture=Tutorial.makeExercise(l);fixture.value.lines.at(-1).j=l.ref;EuclidLogic.grade(fixture.value,fixture.source);
     check(fixture.value.lines.every(line=>line.valid),l.id+' supplied facts and target pass the production formal grader: '+(fixture.value.lines.find(line=>!line.valid)?.s||''));
     const select=q('#tutorial-reference-select');select.value=l.ref;select.dispatchEvent(new Event('change'));q('#tutorial-proof-line').click();
    }else if(l.kind==='classify')q('[data-answer="'+l.answer+'"]').click();
    else for(const key of l.targets){
     const actual=key==='anyEdge'?'edge:AB':key==='eitherEndpoint'?'point:A':key==='half:upperOrLower'?'half:upper':key;
     const target=q('#tutorial-canvas [data-target="'+actual+'"]');if(!target)throw Error('Missing interactive target '+actual);target.dispatchEvent(new MouseEvent('click',{bubbles:true}));
    }
    check(q('#tutorial-status').classList.contains('correct')&&!q('#tutorial-next').disabled,l.id+' completes in '+(['proof','customProof'].includes(l.kind)?2:l.targets?.length||1)+' exercise actions: '+q('#tutorial-status').textContent);
    q('#tutorial-catalog').click();await pause();
   }catch(error){check(false,l.id+' '+error.stack);q('#tutorial-catalog').click()}
  }
  q('[data-lesson="D1-0"]').click();q('#tutorial-canvas [data-target="point:A"]').dispatchEvent(new MouseEvent('click',{bubbles:true}));
  check(!q('#tutorial-status').classList.contains('correct')&&q('#tutorial-next').disabled,'Wrong construction choices do not complete a lesson');
  q('#tutorial-canvas [data-target="intersection"]').dispatchEvent(new MouseEvent('click',{bubbles:true}));check(!q('#tutorial-next').disabled,'A wrong construction choice can be corrected without restarting');q('#tutorial-catalog').click();
  q('[data-lesson="D15-0"]').click();q('#tutorial-reference-select').value='D20';q('#tutorial-reference-select').dispatchEvent(new Event('change'));q('#tutorial-proof-line').click();
  check(q('#tutorial-next').disabled&&!q('#tutorial-status').classList.contains('correct'),'An unrelated justification cannot complete a proof example');q('#tutorial-reference-select').value='D15';q('#tutorial-reference-select').dispatchEvent(new Event('change'));q('#tutorial-proof-line').click();check(!q('#tutorial-next').disabled,'An incorrect justification can be replaced with the taught reference');q('#tutorial-catalog').click();
  q('#tutorial-search').value='gnomon';q('#tutorial-search').dispatchEvent(new Event('input'));check(q('#tutorial-list').querySelectorAll('button').length===2,'Catalog search locates both gnomon use cases');
  q('#tutorial-close').click();
  check(!q('#tutorial-dialog').open&&q('#main-menu').open,'Tutorial returns to the main menu');
  check(index===before.index&&JSON.stringify(state)===before.state&&JSON.stringify(saved)===before.saved&&JSON.stringify(settings)===before.settings&&localStorage.getItem('euclid-workshop-v2')===before.autosave,'All examples leave proposition state, settings, ranked mode, and practice autosave unchanged');
  check(JSON.parse(localStorage.getItem('euclid-tutorial-v1')).completed.length===Tutorial.lessons.length,'Tutorial completion persists separately for every example');
  q('#tutorial-menu').click();q('#tutorial-resume').click();
  const close=q('#tutorial-close').getBoundingClientRect(),hit=document.elementFromPoint(close.left+close.width/2,close.top+close.height/2);check(close.height>=44&&hit===q('#tutorial-close'),'Mobile tutorial exit is visible and has a touch-sized target');
  hit.click();q('#settings-menu').click();check(!q('#settings-view').hidden,'Options still opens after removing save controls');q('#back-from-settings').click();
  check(PROOF_ENTRY_ERRORS.length===0,'No uncaught browser errors');
 }catch(error){check(false,error.stack||String(error))}
 const output=document.createElement('pre');output.id='qa-result';output.textContent=results.join('\n')+'\n'+(failures?'CHECKS FAILED':'ALL CHECKS PASSED');document.body.append(output);
});
