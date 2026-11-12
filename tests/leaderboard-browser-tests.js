addEventListener('load',async()=>{
 const results=[];let failures=0;
 const q=s=>document.querySelector(s),check=(ok,text)=>{results.push((ok?'PASS ':'FAIL ')+text);if(!ok)failures++};
 const wait=async predicate=>{for(let i=0;i<100;i++){if(predicate())return;await new Promise(r=>setTimeout(r,30))}throw Error('Viewer did not update')};
 const originalFetch=window.fetch;
 let mode='full',requests=0;
 window.fetch=async(input,options)=>{
  const body=options?.body&&JSON.parse(options.body);
  if(body?.action!=='boards')return originalFetch(input,options);
  requests++;
  if(mode==='error')return Response.json({error:'Test network failure'},{status:503});
  return Response.json({boards:mode==='empty'?[]:LESSONS.map(lesson=>({proposition:EuclidBooks.key(lesson),rows:Array.from({length:100},(_,i)=>({rank:i+1,username:i===0?'<img src=x onerror=alert(1)>':'Player_'+i,elapsedMs:12345+i*100}))}))});
 };
 try{
  localStorage.removeItem('euclid-hidden-leaderboards-v1');
  q('#leaderboard-menu').click();await wait(()=>q('#leaderboard-boards').children.length===62);
  check(requests===1,'All 62 boards load in a single request without signing in');
  const viewer=q('#leaderboard-boards'),first=viewer.firstElementChild;
  check(viewer.querySelectorAll('tbody tr').length===6200,'Every board includes all 100 returned entries');
  check(!viewer.querySelector('img')&&first.textContent.includes('<img'),'Player names render as text');
  check(viewer.scrollHeight>viewer.clientHeight&&viewer.clientHeight>100,'The board list has a usable independent scrolling area');
  viewer.scrollTop=viewer.scrollHeight;
  check(viewer.scrollTop>0,'The last proposition can be reached by scrolling');
  check(q('#leaderboard-refresh').getBoundingClientRect().bottom<viewer.getBoundingClientRect().top+1,'Viewer controls remain outside the scrolling area');
  first.querySelector('summary').click();await wait(()=>!first.open&&JSON.parse(localStorage.getItem('euclid-hidden-leaderboards-v1')||'[]').includes('1.1'));
  check(!first.open&&viewer.children[1].open,'A proposition can be hidden independently');
  q('#leaderboard-refresh').click();await wait(()=>!q('#leaderboard-refresh').disabled);
  check(!viewer.firstElementChild.open,'Refresh preserves hidden propositions');
  q('#leaderboard-collapse').click();check([...viewer.children].every(s=>!s.open),'Hide all collapses every board');
  q('#leaderboard-expand').click();check([...viewer.children].every(s=>s.open),'Show all restores every board');
  q('#leaderboard-close').click();q('#leaderboard-menu').click();await wait(()=>!q('#leaderboard-refresh').disabled);
  check([...viewer.children].every(s=>s.open),'Reopening preserves the chosen visibility');
  mode='error';q('#leaderboard-refresh').click();await wait(()=>q('#leaderboard-status').textContent.includes('Test network failure'));
  check(viewer.children.length===62&&!q('#leaderboard-refresh').disabled,'Failed refresh preserves the previous boards and allows retry');
  mode='empty';q('#leaderboard-refresh').click();await wait(()=>q('#leaderboard-status').textContent.startsWith('No ranked times'));
  check(!viewer.children.length,'Empty leaderboards show a clear empty state');
  check(PROOF_ENTRY_ERRORS.length===0,'No uncaught browser errors');
 }catch(error){check(false,error.stack||String(error))}
 finally{window.fetch=originalFetch;localStorage.removeItem('euclid-hidden-leaderboards-v1')}
 const output=document.createElement('pre');output.id='qa-result';output.textContent=results.join('\n')+'\n'+(failures?'CHECKS FAILED':'ALL CHECKS PASSED');document.body.append(output);
});
