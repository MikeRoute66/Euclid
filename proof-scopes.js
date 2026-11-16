// Keep hypothetical arguments scoped in the checker, while players write the
// ordinary statements used inside them. Saved and ranked statements stay canonical.
const ProofScopes=(()=>{
 const split=s=>{const m=/^If (.+?) then (.+)$/i.exec(s||'');return m?{condition:m[1],body:m[2]}:null};
 const enabled=lesson=>EuclidBooks.identity(lesson).book===3;
 const display=(s,lesson)=>enabled(lesson)?split(s)?.body||s:s;
 // A diameter and its subsegment name the same supporting line mathematically,
 // but remain distinct steps when a block transfers a result to the diameter.
 function writtenKey(t){
  if(t.kind==='conditional')return writtenKey(t.condition)+' then '+writtenKey(t.body);
  if(t.kind==='perpendicular'||t.kind==='parallel')return t.kind+':'+[t.a,t.b].map(s=>[...s].sort().join('')).sort().join('|');
  return BookThreeLogic.key(t);
 }
 function blocks(lesson){
  const result=[];let previous=(lesson.givens||[]).at(-1);
  for(const step of lesson.proofGuide||[]){
   const scope=split(step.s),last=result.at(-1);
   if(scope){if(!last||last.condition!==scope.condition||!split(previous))result.push({condition:scope.condition,anchor:previous,end:step.s});else last.end=step.s}
   previous=step.s;
  }
  return result;
 }
 function active(value,lesson,editing=null){
  if(!enabled(lesson))return null;
  // An edit belongs to its original block, including after that block closes.
  if(editing!==null)return split(value.lines[editing]?.s)?.condition||null;
  const copy=structuredClone(value),context=BookOneLogic.context(copy,lesson);
  const keys=new Set(),written=new Set();
  for(const line of copy.lines){if(!line.valid)continue;const ast=BookOneLogic.parse(line.s);if(ast){keys.add(context.key(ast));written.add(writtenKey(ast));context.accept(ast,line.j||line.autoJustification)}}
  const has=s=>{const ast=BookOneLogic.parse(s||'');return ast&&keys.has(context.key(ast))};
  return blocks(lesson).find(block=>(!block.anchor||has(block.anchor))&&!written.has(writtenKey(BookOneLogic.parse(block.end))))?.condition||null;
 }
 function input(s,value,lesson,editing){
  if(!s||split(s)||!enabled(lesson))return s;
  const condition=active(value,lesson,editing);
  return condition?'If '+condition+' then '+s:s;
 }
 function guidance(s,lesson){
  if(!enabled(lesson))return s;
  for(const {condition} of blocks(lesson))s=s.split('If '+condition+' then ').join('');
  return s;
 }
 function assumption(value,lesson,editing=null){const c=active(value,lesson,editing);return c?'Assume '+c+'.':''}
 function updateInputContext(value,lesson,editing){
  let label=document.querySelector('#proof-input-assumption');
  if(!label){label=document.createElement('p');label.id='proof-input-assumption';label.className='proof-assumption';label.setAttribute('aria-live','polite');document.querySelector('#lineform').prepend(label)}
  label.textContent=assumption(value,lesson,editing);label.hidden=!label.textContent;
 }
 return {split,enabled,display,input,guidance,assumption,updateInputContext};
})();
