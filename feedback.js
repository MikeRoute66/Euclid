/* Feedback is driven by explicit player actions, never grading or rendering. */
const Feedback=(()=>{
 let context=null;
 function play(correct){
  if(!settings.soundEffects||buildingPractice)return;
  const requested=performance.now();
  try{
   const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;
   context??=new Audio();
   const tone=()=>{
    if(!settings.soundEffects||performance.now()-requested>300||context.state!=='running')return;
    const start=context.currentTime,oscillator=context.createOscillator(),gain=context.createGain(),duration=correct ? 0.12 : 0.018;
    oscillator.type=correct?'triangle':'square';oscillator.frequency.setValueAtTime(correct?170:850,start);
    gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(correct ? 0.12 : 0.045,start+.003);gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
    oscillator.connect(gain);gain.connect(context.destination);oscillator.start(start);oscillator.stop(start+duration+.005);
    oscillator.onended=()=>{oscillator.disconnect();gain.disconnect()};
   };
   if(context.state==='running')tone();else context.resume().then(tone).catch(()=>{});
  }catch{} // Missing, blocked, or interrupted audio must not interrupt play.
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
 return {play,use,correctTool};
})();
