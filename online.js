/* Accounts persist per browser. Ranked timing and score acceptance live on the server. */
const Ranked=(()=>{
 const q=s=>document.querySelector(s);
 const HARD=RANKED_SETTINGS;
 const OPTIONS_KEY='euclid-ranked-practice-options-v1';
 function savedOptions(){try{const value=JSON.parse(localStorage.getItem(OPTIONS_KEY));if(value&&Object.keys(HARD).every(k=>typeof value[k]==='boolean'))return value}catch{}return null}
 const client=globalThis.supabase?.createClient(ONLINE_CONFIG.url,ONLINE_CONFIG.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
 let user=null,username='',attempt=null,epoch=0,chain=Promise.resolve(),practice=null,previousOptions=savedOptions(),authMode='login',message='',submitting=false,ready=false;
 function format(ms){const seconds=Math.max(0,Math.floor(ms/1000));return Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0')+'.'+String(Math.floor(ms%1000/100))}
 async function api(body,authenticated=true){
  if(!client)throw Error('Online services are unavailable. Practice is still available.');
  const session=authenticated?(await client.auth.getSession()).data.session:null;
  if(authenticated&&!session)throw Error('Please sign in.');
  const response=await fetch(ONLINE_CONFIG.url+'/functions/v1/euclid-online',{method:'POST',headers:{'Content-Type':'application/json',apikey:ONLINE_CONFIG.publishableKey,...(session?{Authorization:'Bearer '+session.access_token}:{})},body:JSON.stringify(body)});
  const data=await response.json().catch(()=>({error:'Online services are temporarily unavailable.'}));
  if(!response.ok)throw Error(data.error||'The request could not be completed.');
  return data;
 }
 function persist(){try{localStorage.setItem(SETTINGS_KEY,JSON.stringify(settings))}catch{}}
 function controls(){
  for(const [key,value] of Object.entries(settings)){const input=q('[data-setting="'+key+'"]');if(input){input.checked=value;input.disabled=settings.rankedMode&&key in HARD}}
  for(const id of ['load-save','save-point-menu','fresh-menu'])if(q('#'+id))q('#'+id).disabled=settings.rankedMode;
  if(q('#account-menu'))q('#account-menu').textContent=user?'Player: '+username:'Player / Sign in';
  if(q('#account-player'))q('#account-player').textContent=username;
  if(q('#account-signed-in'))q('#account-signed-in').hidden=!user;
  if(q('#account-signed-out'))q('#account-signed-out').hidden=!!user;
  const pending=settings.rankedMode&&!attempt;
  document.body.classList.toggle('ranked-pending',pending);
  const workspace=q('.workspace'),shelf=q('.shelf');if(workspace)workspace.inert=pending;if(shelf)shelf.inert=pending&&!(typeof Tutorial!=='undefined'&&Tutorial.usingMenus());
  for(const input of q('#lineform')?.querySelectorAll('input,button')||[])input.disabled=pending;
  q('#ranked-status').hidden=!settings.rankedMode;
  q('#ranked-message').textContent=message||(user?'Return to play to start a fresh timed attempt.':'Sign in to play ranked.');
  q('#ranked-message').title=message;
  q('#ranked-retry').hidden=!(attempt?.error);
 }
 function cancel(){epoch++;attempt=null;submitting=false;message='';controls()}
 function settingsChanged(previous){
  if(settings.rankedMode&&!previous.rankedMode){
   previousOptions=Object.fromEntries(Object.keys(HARD).map(k=>[k,previous[k]]));
   try{localStorage.setItem(OPTIONS_KEY,JSON.stringify(previousOptions))}catch{}
   practice={index,state:structuredClone(state),history:history.slice()};
   cancel();
  }
  if(settings.rankedMode)Object.assign(settings,HARD);
  else if(previous.rankedMode){
   cancel();
   if(previousOptions)Object.assign(settings,previousOptions);
   if(practice&&practice.index===index){state=practice.state;saved[index]=state;history=practice.history||[]}
   tool=null;picks=[];resetLineForm();
   try{localStorage.removeItem(OPTIONS_KEY)}catch{}
   practice=null;previousOptions=null;
  }
  controls();
  if(settings.rankedMode&&!user)queueMicrotask(showAccount);
 }
 function beforeLoad(){
  if(!settings.rankedMode)return;
  if(practice)saved[practice.index]=practice.state;
  practice=null;cancel();
 }
 function begin(){
  if(!ready||!settings.rankedMode||!user||q('#main-menu').open||attempt)return;
  const ticket=++epoch,stage=index;
  if(!practice)practice={index:stage,state:structuredClone(state),history:history.slice()};
  message='Starting ranked attempt...';controls();
  chain=chain.catch(()=>{}).then(async()=>{
   if(ticket!==epoch)return;
   try{
    const result=await api({action:'start',proposition:EuclidBooks.key(LESSONS[stage]),courseVersion:ONLINE_CONFIG.courseVersion});
    if(ticket!==epoch||!settings.rankedMode)return;
    state=fresh();tool=null;picks=[];history=[];resetLineForm();
    attempt={id:result.id,index:stage,events:[],anchor:performance.now(),base:Math.max(0,(result.serverNow||Date.parse(result.startedAt))-Date.parse(result.startedAt)),done:false,error:false};
    message='Ranked attempt: timer keeps running in menus and other tabs.';render();renderTools();
   }catch(error){if(ticket===epoch){message=error.message+' Turn Ranked mode off to return to practice.';controls()}}
  });
 }
 function record(event){
  if(!settings.rankedMode||!attempt||attempt.done||attempt.index!==index)return;
  if(attempt.events.length>=2000){message='This attempt has too many actions. Use Start over.';attempt.error=false;attempt.done=true;controls();return}
  attempt.events.push(structuredClone(event));
 }
 function onRender(){
  controls();
  if(settings.rankedMode&&attempt&&!attempt.done&&state.completed&&constructionProgress(state,LESSONS[index]).complete){
   const current=attempt;queueMicrotask(()=>{if(current===attempt&&!current.done&&state.completed){current.done=true;current.elapsed=current.base+performance.now()-current.anchor;submit()}});
  }
 }
 async function submit(){
  if(!attempt||submitting)return;
  const current=attempt;submitting=true;current.error=false;message='Checking your construction and proof...';controls();
  try{
   let result=await api({action:'finish',attempt:current.id,events:current.events});
   while(result.pending&&current===attempt){
    message='Checking proof: '+result.cursor+' / '+result.total+' lines';controls();
    result=await api({action:'finish',attempt:current.id});
   }
   if(current!==attempt)return;
   current.elapsed=result.elapsedMs;
   message=(result.personalBest?'Personal best! ':'Recorded. ')+format(result.elapsedMs)+' | Best: '+format(result.bestMs);
  }catch(error){if(current===attempt){current.error=true;message='Not recorded: '+error.message}}
  finally{if(current===attempt){submitting=false;controls()}}
 }
 function restart(){
  if(!settings.rankedMode)return false;
  cancel();begin();return true;
 }
 function showAccount(){
  controls();q('#account-status').textContent='';
  if(!q('#account-dialog').open)q('#account-dialog').showModal();
  (user?q('#account-close'):q('#account-username')).focus();
 }
 function setAuthMode(mode){
  authMode=mode;q('#account-submit').textContent=mode==='register'?'Create account':'Sign in';
  q('#account-password').autocomplete=mode==='register'?'new-password':'current-password';
  q('#account-password').minLength=mode==='register'?10:1;
  q('#account-confirm-row').hidden=mode!=='register';q('#account-confirm').required=mode==='register';
  q('#account-create').setAttribute('aria-pressed',String(mode==='register'));q('#account-login').setAttribute('aria-pressed',String(mode==='login'));
  q('#account-status').textContent='';
 }
 async function authSubmit(event){
  event.preventDefault();const password=q('#account-password').value;
  if(authMode==='register'&&password!==q('#account-confirm').value){q('#account-status').textContent='Passwords do not match.';return}
  q('#account-submit').disabled=true;q('#account-status').textContent='Connecting...';
  try{
   const result=await api({action:authMode,username:q('#account-username').value.trim(),password},false);
   const {error}=await client.auth.setSession({access_token:result.session.access_token,refresh_token:result.session.refresh_token});if(error)throw error;
   user=result.session.user;username=(await api({action:'me'})).username;
   q('#account-password').value=q('#account-confirm').value='';q('#account-status').textContent='Signed in. This device will stay signed in.';
   controls();if(settings.rankedMode&&!q('#main-menu').open){q('#account-dialog').close();begin()}
  }catch(error){q('#account-status').textContent=error.message}
  finally{q('#account-submit').disabled=false}
 }
 const HIDDEN_BOARDS_KEY='euclid-hidden-leaderboards-v1';
 let hiddenBoards=new Set(),boardRequest=0;
 try{const stored=JSON.parse(localStorage.getItem(HIDDEN_BOARDS_KEY));if(Array.isArray(stored))hiddenBoards=new Set(stored.filter(s=>typeof s==='string'))}catch{}
 function saveHiddenBoards(){try{localStorage.setItem(HIDDEN_BOARDS_KEY,JSON.stringify([...hiddenBoards]))}catch{}}
 async function board(){
  const ticket=++boardRequest;
  q('#leaderboard-status').textContent='Loading...';q('#leaderboard-refresh').disabled=true;
  try{
   const data=await api({action:'boards'},false);
   if(ticket!==boardRequest)return;
   const sections=[];
   for(const entry of data.boards){
    const lesson=LESSONS.find(l=>EuclidBooks.key(l)===entry.proposition);
    if(!lesson||!entry.rows.length)continue;
    const section=document.createElement('details');section.className='leaderboard-board';section.dataset.proposition=entry.proposition;section.open=!hiddenBoards.has(entry.proposition);
    const summary=document.createElement('summary');summary.textContent=EuclidBooks.reference(lesson)+' - '+lesson.title+' ('+entry.rows.length+')';
    const table=document.createElement('table'),caption=document.createElement('caption');caption.textContent=EuclidBooks.reference(lesson)+' best times';caption.className='sr-only';table.append(caption);
    const head=document.createElement('thead'),heading=document.createElement('tr');
    for(const text of ['Rank','Player','Best time']){const th=document.createElement('th');th.scope='col';th.textContent=text;heading.append(th)}head.append(heading);table.append(head);
    const rows=document.createElement('tbody');
    for(const row of entry.rows){const tr=document.createElement('tr');for(const value of [row.rank,row.username,format(row.elapsedMs)]){const td=document.createElement('td');td.textContent=String(value);tr.append(td)}if(row.username===username)tr.className='own-score';rows.append(tr)}
    table.append(rows);section.append(summary,table);
    section.addEventListener('toggle',()=>{if(section.open)hiddenBoards.delete(entry.proposition);else hiddenBoards.add(entry.proposition);saveHiddenBoards()});
    sections.push(section);
   }
   q('#leaderboard-boards').replaceChildren(...sections);
   q('#leaderboard-status').textContent=sections.length?sections.length+' proposition'+(sections.length===1?'':'s')+' with ranked times.':'No ranked times yet. Finish a proposition in Ranked mode to appear here.';
  }catch(error){if(ticket===boardRequest)q('#leaderboard-status').textContent='Could not refresh. '+error.message}
  finally{if(ticket===boardRequest)q('#leaderboard-refresh').disabled=false}
 }
 async function init(){
  q('#account-menu').onclick=showAccount;q('#account-close').onclick=()=>q('#account-dialog').close();
  q('#account-login').onclick=()=>setAuthMode('login');q('#account-create').onclick=()=>setAuthMode('register');q('#account-form').onsubmit=authSubmit;
  q('#account-signout').onclick=async()=>{
   if(settings.rankedMode){const previous={...settings};settings.rankedMode=false;settingsChanged(previous);persist();render();renderTools()}
   await client?.auth.signOut({scope:'local'});user=null;username='';controls();q('#account-status').textContent='Signed out on this device.';
  };
  q('#leaderboard-menu').onclick=()=>{q('#leaderboard-dialog').showModal();board()};
  q('#leaderboard-close').onclick=()=>q('#leaderboard-dialog').close();q('#leaderboard-refresh').onclick=board;
  for(const [id,open] of [['leaderboard-expand',true],['leaderboard-collapse',false]])q('#'+id).onclick=()=>{for(const section of q('#leaderboard-boards').children){section.open=open;if(open)hiddenBoards.delete(section.dataset.proposition);else hiddenBoards.add(section.dataset.proposition)}saveHiddenBoards()};
  q('#ranked-retry').onclick=submit;
  q('#main-menu').addEventListener('close',begin);
  q('#account-dialog').addEventListener('close',()=>{if(settings.rankedMode&&!user){const previous={...settings};settings.rankedMode=false;settingsChanged(previous);persist();render();renderTools()}else begin()});
  setInterval(()=>{if(settings.rankedMode)q('#ranked-timer').textContent=attempt?format(attempt.done?attempt.elapsed||0:attempt.base+performance.now()-attempt.anchor):'0:00.0'},100);
  setAuthMode('login');controls();
  if(client){
   const session=(await client.auth.getSession()).data.session;
   if(session){try{const profile=await api({action:'me'});user=session.user;username=profile.username}catch{message='Please sign in again to play ranked.'}}
   client.auth.onAuthStateChange((event,session)=>{if(event==='SIGNED_OUT'){user=null;username='';if(settings.rankedMode){cancel();message='Sign in again or turn Ranked mode off.'}controls()}else if((event==='SIGNED_IN'||event==='TOKEN_REFRESHED')&&session){const changed=user?.id!==session.user.id;user=session.user;if(changed){cancel();username=user.user_metadata?.username||'';queueMicrotask(async()=>{try{username=(await api({action:'me'})).username;controls();begin()}catch{}})}controls()}});
  }
  ready=true;controls();begin();
 }
 // The script loads after app.js, before main-menu.js opens the menu.
 queueMicrotask(()=>init().catch(error=>{message=error.message;controls()}));
 return {record,onRender,settingsChanged,beforeLoad,begin,restart,controls,ownsState:()=>!!settings.rankedMode,hardSettings:HARD};
})();
