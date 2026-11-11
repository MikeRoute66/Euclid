function runFeedbackChecks(check){
 const previous={settings:{...settings},chapter:index,play:Feedback.play};let sounds=[];
 Feedback.play=correct=>sounds.push(correct);
 try{
  Object.assign(settings,DEFAULT_SETTINGS);load(0);state=fresh();render();
  suppliedConstruction(0);check(sounds.length===0,'loading, rendering, and supplied construction do not trigger action feedback');
  const select=id=>selectReference(Object.values(REFERENCES).flat().find(r=>r[1]===id));
  select('P1');check(sounds.at(-1)===false,'wrong next construction tool produces incorrect-choice feedback');
  select('P3');check(sounds.at(-1)===true,'correct next construction tool produces confirmation');
  sounds=[];choosePoint('A');check(sounds.length===0,'an unfinished point selection does not claim success');choosePoint('B');check(sounds.length===1&&sounds[0]===true,'successfully drawing a circle produces one confirmation');
  sounds=[];choosePoint('B');choosePoint('B');check(sounds.length===1&&sounds[0]===false,'a zero-radius circle attempt produces an incorrect-use click');
  Object.assign(settings,{skipConstruction:true});load(EuclidBooks.position('2.1'));sounds=[];
  select('CN2');check(sounds.at(-1)===true,'correct proof-tool selection is validated against the next statement');
  select('CN3');check(sounds.at(-1)===false,'a reference that does not establish the next statement gives incorrect-choice feedback');
  state.lines.push({s:'area BGNC = area BGLD + area DLME + area EMNC',j:null});render();select('CN2');sounds=[];$('#lines').children[1].click();
  check(state.lines[1].valid&&sounds.length===1&&sounds[0]===true,'applying a valid justification confirms the checked proof line');
  select('CN3');sounds=[];$('#lines').children[1].click();check(!state.lines[1].valid&&sounds.length===1&&sounds[0]===false,'applying an invalid justification produces an incorrect-use click');
  Object.assign(settings,DEFAULT_SETTINGS);load(47);state=fresh();render();tool=REFERENCES.propositions.find(r=>r[1]==='I11');sounds=[];
  let geometry=JSON.stringify(constructionGeometry(state));for(let n of ['B','C','A'])choosePoint(n);
  check(sounds.length===1&&sounds[0]===false&&JSON.stringify(constructionGeometry(state))===geometry,'rejected theorem construction clicks once and retains its geometry');
  sounds=[];for(let n of ['B','C','B'])choosePoint(n);check(sounds.length===1&&sounds[0]===true,'valid theorem construction confirms only after all required points');
  openMainMenu();showSettings();let control=document.querySelector('[data-setting="soundEffects"]');control.checked=false;control.dispatchEvent(new Event('change',{bubbles:true}));$('#resume-menu').click();sounds=[];select('P1');
  check(!settings.soundEffects&&JSON.parse(localStorage.getItem(SETTINGS_KEY)).soundEffects===false&&sounds.length===0,'sound toggle is saved and muted tool selection does not request feedback');
 }finally{Feedback.play=previous.play;Object.assign(settings,previous.settings);localStorage.setItem(SETTINGS_KEY,JSON.stringify(settings));load(previous.chapter)}
}
async function runAudioStartupChecks(check){
 const original=window.AudioContext,previous=settings.soundEffects;let starts=[];
 const wait=()=>new Promise(resolve=>setTimeout(resolve,380));
 class SlowAudio{
  constructor(){this.state='suspended';this.currentTime=0;this.destination={}}
  resume(){return new Promise(resolve=>setTimeout(()=>{this.state='running';this.onstatechange?.();resolve()},350))}
  createOscillator(){let node={frequency:{setValueAtTime(){}},connect(){},disconnect(){},stop(){},start(){starts.push(node.type)}};return node}
  createGain(){return {gain:{setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){}}}
 }
 try{
  settings.soundEffects=true;window.AudioContext=SlowAudio;
  let audio=createFeedback();audio.play(true);check(starts.length===0,'audio waits for a suspended context to start');await wait();
  check(starts.length===1&&starts[0]==='triangle'&&audio.status()==='Audio ready.','slow audio startup longer than 300 ms still plays the confirmation');
  starts=[];audio=createFeedback();audio.play(true);audio.play(false);await wait();
  check(starts.length===1&&starts[0]==='square','audio startup plays only the most recent requested feedback');
  starts=[];audio=createFeedback();audio.play(true);settings.soundEffects=false;audio.sync();await wait();
  check(starts.length===0&&audio.status()==='Sound is off.','muting while audio starts cancels the pending sound');
  settings.soundEffects=true;window.AudioContext=class extends SlowAudio{resume(){return Promise.reject(new Error('blocked'))}};
  audio=createFeedback();audio.play(true);await Promise.resolve();await Promise.resolve();
  check(/blocked/i.test(audio.status()),'blocked audio has a visible explanation instead of a silent failure');
 }finally{window.AudioContext=original;settings.soundEffects=previous;Feedback.refreshStatus()}
}
