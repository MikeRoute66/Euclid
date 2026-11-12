addEventListener('load',async()=>{
 let results=[],failures=0;
 const check=(ok,text)=>{results.push((ok?'PASS ':'FAIL ')+text);if(!ok)failures++};
 const wait=async predicate=>{for(let i=0;i<250;i++){if(predicate())return;await new Promise(r=>setTimeout(r,100))}throw Error('Timed out waiting for ranked UI: '+($('#account-status')?.textContent||'')+' '+($('#ranked-message')?.textContent||''))};
 const phase=JSON.parse(sessionStorage.getItem('ranked-test-phase')||'null');
 if(phase){results=phase.results;failures=phase.failures}
 try{
  if(!phase){
   $('#account-menu').click();$('#account-username').value=RANK_TEST_ACCOUNT.username;$('#account-password').value=RANK_TEST_ACCOUNT.password;$('#account-form').requestSubmit();
   await wait(()=>!$('#account-signed-in').hidden);
   check($('#account-player').textContent===RANK_TEST_ACCOUNT.username,'Password login displays the correct public username');
   check([...Object.keys(localStorage)].some(k=>k.startsWith('sb-')&&k.endsWith('-auth-token')),'The auth client persists a session for this browser');
   sessionStorage.setItem('ranked-test-phase',JSON.stringify({phase:1,results,failures}));location.reload();return;
  }
  if(phase.phase===2){
   await wait(()=>$('#account-menu').textContent==='Player / Sign in');
   check($('#account-signed-in').hidden&&!settings.rankedMode,'Signing out remains effective after reload');
  }else if(phase.phase===3){
   await wait(()=>$('#account-menu').textContent.includes(RANK_TEST_ACCOUNT.username));
   check(settings.rankedMode&&Object.entries(RANKED_SETTINGS).every(([k,v])=>settings[k]===v),'Reload keeps Ranked mode and its locked settings');
   check(localStorage.getItem('euclid-workshop-v2')===phase.stored,'Reloading a ranked attempt preserves the practice autosave');
   $('#continue-menu').click();await wait(()=>$('#ranked-message').textContent.startsWith('Ranked attempt:'));
   check(state.circles.length===0&&state.lines.length===0,'Reload starts a fresh ranked attempt instead of resuming an old timer');
   $('#main-menu-button').click();$('#settings-menu').click();document.querySelector('[data-setting="rankedMode"]').click();
   check(settings.learningMode&&JSON.stringify(state.lines)===phase.practice,'Practice settings and proof survive turning Ranked off after reload');
   $('#back-from-settings').click();$('#account-menu').click();$('#account-signout').click();await wait(()=>!$('#account-signed-out').hidden);
   sessionStorage.setItem('ranked-test-phase',JSON.stringify({phase:2,results,failures}));location.reload();return;
  }else{
   await wait(()=>$('#account-menu').textContent.includes(RANK_TEST_ACCOUNT.username));
   check(true,'A real page reload retains login without entering the password again');
   Object.assign(settings,DEFAULT_SETTINGS,{learningMode:true,soundEffects:false});load(0);
   state.lines.push({s:'AB = AB',j:null});render();
   const practice=JSON.stringify(state.lines),stored=localStorage.getItem('euclid-workshop-v2');
   $('#settings-menu').click();document.querySelector('[data-setting="rankedMode"]').click();
   check(settings.rankedMode&&Object.entries(RANKED_SETTINGS).every(([key,value])=>settings[key]===value),'The Ranked settings toggle enforces every hardest-setting requirement');
   check(Object.keys(RANKED_SETTINGS).every(key=>document.querySelector('[data-setting="'+key+'"]').disabled),'Assistance settings are locked during Ranked mode');
   $('#back-from-settings').click();$('#continue-menu').click();
   await wait(()=>$('#ranked-message').textContent.startsWith('Ranked attempt:'));
   check(state.lines.length===0&&state.circles.length===0,'A ranked attempt starts fresh instead of submitting the practice save');
   const use=(reference,...names)=>{selectReference(Object.values(REFERENCES).flat().find(r=>r[1]===reference));names.forEach(choosePoint)};
   use('P3','A','B');use('P3','B','A');selectReference(REFERENCES.definitions.find(r=>r[1]==='D1'));
   mark(intersectionCandidates().sort((a,b)=>a[1]-b[1])[0]);use('P1','A','C');use('P1','B','C');
   $('#undo').click();choosePoint('B');choosePoint('C');
   if(matchMedia(MOBILE_WORKSPACE_QUERY).matches){document.querySelector('[data-mobile-view="proof"]').click();check(!$('#proof-panel').inert&&!$('#lineform').hidden,'Mobile ranked play keeps the proof input available after switching panels')}
   const add=s=>{$('#statement').value=s;$('#lineform').requestSubmit()};
   const justify=(i,ref)=>{selectReference(Object.values(REFERENCES).flat().find(r=>r[1]===ref));$('#lines').children[i].click()};
   add('AC = AC');beginEdit(0);$('#statement').value='AC = AB';$('#lineform').requestSubmit();justify(0,'D15');
   add('BC = BA');justify(1,'D15');add('AB = AB');$('#lines').children[2].querySelector('.delete-line').click();
   add('AC = BC');justify(2,'CN1');add('ABC is equilateral');justify(3,'D20');
   await wait(()=>/^(Personal best!|Recorded\.)/.test($('#ranked-message').textContent));
   check(state.completed,'Construction, Undo, statement edits/deletion, and justifications replay successfully on the real server');
   check(localStorage.getItem('euclid-workshop-v2')===stored,'Ranked play does not overwrite the practice autosave');
   $('#main-menu-button').click();$('#leaderboard-menu').click();
   await wait(()=>[...$('#leaderboard-rows').children].some(row=>row.textContent.includes(RANK_TEST_ACCOUNT.username)));
   check(true,'The shared leaderboard shows the completed player\'s best time');$('#leaderboard-close').click();
   $('#settings-menu').click();document.querySelector('[data-setting="rankedMode"]').click();
   check(!settings.rankedMode&&settings.learningMode&&JSON.stringify(state.lines)===practice,'Turning Ranked mode off restores practice progress and assistance settings');
   document.querySelector('[data-setting="rankedMode"]').click();$('#back-from-settings').click();$('#continue-menu').click();
   await wait(()=>$('#ranked-message').textContent.startsWith('Ranked attempt:'));
   use('P3','A','B');check(state.circles.length===1,'A second ranked attempt can start normally');
   sessionStorage.setItem('ranked-test-phase',JSON.stringify({phase:3,results,failures,practice,stored:localStorage.getItem('euclid-workshop-v2')}));location.reload();return;
  }
  check((window.PROOF_ENTRY_ERRORS||[]).length===0,'The account and ranked flow has no uncaught page errors');
 }catch(error){check(false,error.stack)}
 const pre=document.createElement('pre');pre.id='qa-result';pre.textContent=results.concat(failures?'FAILED '+failures+' checks':'ALL CHECKS PASSED').join('\n');document.body.append(pre);
});
