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
  Object.assign(settings,DEFAULT_SETTINGS,{skipConstruction:true});load(EuclidBooks.position('2.1'));state=fresh();render();
  const area='area BGNC = area BGLD + area DLME + area EMNC',submit=text=>{$('#statement').value=text;$('#lineform').requestSubmit()};
  sounds=[];submit(area);check(sounds.length===1&&sounds[0]===true&&!state.lines[1].j,'correct statement beeps before its manual justification is assigned');
  sounds=[];submit('AB = 2 AB');check(sounds.length===1&&sounds[0]===false,'incorrect proof submission clicks');
  beginEdit(2);sounds=[];submit('BG = AX');check(sounds.length===1&&sounds[0]===true,'saving a corrected proof statement beeps');
  beginEdit(2);sounds=[];submit('not a statement');check(sounds.length===1&&sounds[0]===false,'saving malformed proof input clicks');
  deleteProofLine(2);tool=null;sounds=[];$('#lines').children[1].click();check(sounds.length===1&&sounds[0]===true,'tapping an unassigned correct proof line confirms its statement');
  settings.skipJustifications=true;render();sounds=[];submit('BG = AX');check(sounds.length===1&&sounds[0]===true,'automatic justification mode also beeps on a correct submission');
  sounds=[];submit('');check(sounds.length===1&&sounds[0]===false,'an empty proof submission clicks once');
  for(let chapter of [0,EuclidBooks.position('2.1')]){
   Object.assign(settings,DEFAULT_SETTINGS,{skipConstruction:chapter!==0});load(chapter);state=fresh();render();let attempted=0;
   for(let group of Object.keys(REFERENCES))for(let ref of REFERENCES[group]){
    tab=group;renderTools();let button=document.querySelector('#tools button[data-reference="'+ref[1]+'"]'),before=tool;sounds=[];button.click();attempted++;
    check(sounds.length===1&&typeof sounds[0]==='boolean','every tool choice gives one outcome: '+EuclidBooks.reference(LESSONS[index])+' '+ref[1]);
    if(!referenceAvailable(ref))check(sounds[0]===false&&tool===before&&button.getAttribute('aria-disabled')==='true','unavailable tool rejects with a click without being selected: '+ref[1]);
   }
   closeTools();check(attempted===Object.values(REFERENCES).flat().length,'all four tool categories were checked at '+EuclidBooks.reference(LESSONS[index]));
  }
  openMainMenu();showSettings();let control=document.querySelector('[data-setting="soundEffects"]');control.checked=false;control.dispatchEvent(new Event('change',{bubbles:true}));$('#resume-menu').click();sounds=[];select('P1');
  check(!settings.soundEffects&&JSON.parse(localStorage.getItem(SETTINGS_KEY)).soundEffects===false&&sounds.length===0,'sound toggle is saved and muted tool selection does not request feedback');
 }finally{Feedback.play=previous.play;Object.assign(settings,previous.settings);localStorage.setItem(SETTINGS_KEY,JSON.stringify(settings));load(previous.chapter)}
}
async function runAudioStartupChecks(check){
 const original=window.AudioContext,previous=settings.soundEffects;let starts=[];
 const wait=()=>new Promise(resolve=>setTimeout(resolve,380));
 class SlowAudio{
  constructor(){this.state='suspended';this.currentTime=0;this.destination={};this.sampleRate=44100}
  resume(){return new Promise(resolve=>setTimeout(()=>{this.state='running';this.onstatechange?.();resolve()},350))}
  createOscillator(){let node={frequency:{setValueAtTime(){}},connect(){},disconnect(){},stop(){},start(){starts.push(node.type)}};return node}
  createBuffer(channels,length){const data=new Float32Array(length);return {getChannelData:()=>data}}
  createBufferSource(){return {connect(){},disconnect(){},stop(){},start(){starts.push('buffer')}}}
  createGain(){return {gain:{setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){}}}
 }
 try{
  settings.soundEffects=true;window.AudioContext=SlowAudio;
  let audio=createFeedback();audio.play(true);check(starts.length===0,'audio waits for a suspended context to start');await wait();
  check(starts.length===1&&starts[0]==='triangle'&&audio.status()==='Audio ready.','slow audio startup longer than 300 ms still plays the confirmation');
  starts=[];audio=createFeedback();audio.play(true);audio.play(false);await wait();
  check(starts.length===1&&starts[0]==='buffer','audio startup plays only the most recent requested feedback');
  starts=[];audio=createFeedback();audio.play(true);settings.soundEffects=false;audio.sync();await wait();
  check(starts.length===0&&audio.status()==='Sound is off.','muting while audio starts cancels the pending sound');
  settings.soundEffects=true;window.AudioContext=class extends SlowAudio{resume(){return Promise.reject(new Error('blocked'))}};
  audio=createFeedback();audio.play(true);await Promise.resolve();await Promise.resolve();
  check(/blocked/i.test(audio.status()),'blocked audio has a visible explanation instead of a silent failure');
 }finally{window.AudioContext=original;settings.soundEffects=previous;Feedback.refreshStatus()}
}
