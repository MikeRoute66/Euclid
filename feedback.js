/* Feedback is driven by explicit player actions, never grading or rendering. */
function createFeedback(){
 let context=null,pending=null,resuming=null,active=null,clickBuffer=null,problem='';
 function status(){
  if(!settings.soundEffects)return 'Sound is off.';
  if(problem)return problem;
  return context?.state==='running'?'Audio ready.':'Tap Test sound to enable audio.';
 }
 function refreshStatus(){
  let label=document.querySelector('#sound-status');
  if(label)label.textContent=status();for(let id of ['test-sound','test-click']){let button=document.querySelector('#'+id);if(button)button.disabled=!settings.soundEffects}
 }
 function noiseClick(){
  if(clickBuffer)return clickBuffer;
  clickBuffer=context.createBuffer(1,Math.ceil(context.sampleRate*.025),context.sampleRate);
  const data=clickBuffer.getChannelData(0),alpha=1-Math.exp(-2*Math.PI*1200/context.sampleRate);let low=0,smooth=0,peak=0;
  for(let i=0;i<data.length;i++){
   low+=alpha*(Math.random()*2-1-low);smooth+=alpha*(low-smooth);
   const time=i/context.sampleRate;data[i]=smooth*(1-Math.exp(-time/.0004))*Math.exp(-time/.0038);peak=Math.max(peak,Math.abs(data[i]));
  }
  if(peak)for(let i=0;i<data.length;i++)data[i]=data[i]/peak*.9;
  return clickBuffer;
 }
 function flush(){
  if(pending===null||!settings.soundEffects||context?.state!=='running')return;
  const correct=pending;pending=null;
  try{
   active?.stop();
   const start=context.currentTime+.02,source=correct?context.createOscillator():context.createBufferSource(),gain=context.createGain(),duration=correct ? 0.22 : 0.025;
   if(correct){source.type='triangle';source.frequency.setValueAtTime(220,start)}else source.buffer=noiseClick();
   gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(correct ? 0.18 : 0.065,start+(correct ? 0.004 : 0.0015));
   gain.gain.setValueAtTime(correct ? 0.18 : 0.065,start+(correct ? 0.13 : 0.003));gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
   source.connect(gain);gain.connect(context.destination);source.start(start);source.stop(start+duration+.005);active=source;
   source.onended=()=>{source.disconnect();gain.disconnect();if(active===source)active=null};
  }catch{problem='Audio could not play. Tap Test sound to retry.';refreshStatus()}
 }
 function unlock(force=false){
  if(!settings.soundEffects||buildingPractice)return;
  try{
   const Audio=window.AudioContext||window.webkitAudioContext;
   if(!Audio){problem='Audio is unavailable in this browser.';refreshStatus();return}
   if(!context||context.state==='closed'){
    context=new Audio();clickBuffer=null;context.onstatechange=()=>{if(context.state==='running'){problem='';flush()}refreshStatus()};
   }
   if(context.state==='running'){problem='';flush();refreshStatus();return}
   if(!resuming||force)resuming=context.resume().then(()=>{problem='';flush()}).catch(()=>{problem='Audio is blocked. Tap Test sound to retry.'}).finally(()=>{resuming=null;refreshStatus()});
   refreshStatus();
  }catch{problem='Audio could not start. Tap Test sound to retry.';refreshStatus()}
 }
 function play(correct){
  if(!settings.soundEffects||buildingPractice)return;
  pending=!!correct;unlock();
 }
 function sync(){
  if(!settings.soundEffects){pending=null;try{active?.stop()}catch{}active=null}
  refreshStatus();
 }
 function install(){
  const activate=event=>{if(event.isTrusted){if(context?.state!=='running')pending=null;unlock(true)}};
  for(let event of ['pointerdown','pointerup','keydown'])document.addEventListener(event,activate,true);
  document.querySelector('#test-sound').onclick=()=>play(true);document.querySelector('#test-click').onclick=()=>play(false);refreshStatus();
 }
 function geometry(){return JSON.stringify(constructionGeometry(state))}
 function use(action){
  if(buildingPractice)return action();
  const before=geometry(),previousPicks=JSON.stringify(picks);let result=action();
  if(geometry()!==before)Feedback.play(true);
  else if(!picks.length||JSON.stringify(picks)===previousPicks)Feedback.play(false);
  return result;
 }
 function correctTool(reference){
  const id=EuclidBooks.runtimeRule(reference[1]),lesson=LESSONS[index],progress=constructionProgress(state,lesson),next=progress.checks.findIndex(done=>!done);
  if(next>=0){
   const originals={1:['P3','P3','D1','P1','P1'],2:['P1','I1','P2','P3','D1','P2','P3','D1','P1'],3:['I2','P3','D1'],4:['CN4'],5:['P2','P2','I3','P1','P1']};
   const task=lesson.construction?.[next],expected=task?[task.ref,...(task.alternatives||[]).map(t=>t.ref)]:[originals[lesson.id]?.[next]];
   if(expected.some(r=>EuclidBooks.runtimeRule(r)===id))return true;
  }
  const pending=state.lines.findIndex(line=>!line.valid);
  if(next>=0&&pending<0)return false;
  const prefix={...state,lines:state.lines.slice(0,pending<0?state.lines.length:pending).map(l=>({s:l.s,j:settings.skipJustifications?l.autoJustification:l.j}))};
  const graded=EuclidLogic.grade(prefix,lesson),parse=lesson.id<=5?BookOneLogic.baseParse:BookOneLogic.parse;
  if(pending>=0){let ast=parse(state.lines[pending].s);return !!ast&&graded.context.check(ast,id).ok}
  const teaching=BookOneLogic.context(state,lesson),key=s=>teaching.key(BookOneLogic.parse(s));
  const step=(lesson.proofGuide||lesson.hintSteps).find(step=>!state.lines.some(l=>l.valid&&key(l.s)===key(step.s)));
  let ast=step&&parse(step.s);return !!ast&&graded.context.check(ast,id).ok;
 }
 function correctStatement(lineIndex){
  if(!state.lines[lineIndex])return false;
  const prefix={...constructionGeometry(state),lines:state.lines.slice(0,lineIndex+1).map(line=>({s:line.s,j:line.j}))};
  inferredProof(prefix,LESSONS[index]);return !!prefix.lines[lineIndex].valid;
 }
 return {play,use,correctTool,correctStatement,unlock,sync,install,status,refreshStatus};
}
const Feedback=createFeedback();
