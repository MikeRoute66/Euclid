import {createVerifier,COURSE_VERSION} from '../supabase/functions/_shared/runtime.js';
let failures=0;
function check(ok,text){console.log((ok?'PASS ':'FAIL ')+text);if(!ok)failures++}
function rejects(fn){try{fn();return false}catch{return true}}
const fixtures={};
for(const lesson of createVerifier().lessons){
 const key=lesson.key;
 try{
  const events=createVerifier().fixture(key),start=performance.now();
  check(createVerifier().validate(key,events),key+' replays recorded tools and validates its source proof');
  const ms=Math.round(performance.now()-start);console.log('Validation ms '+key+': '+ms);
  const v=createVerifier(),replayed=v.replay(key,events);let cursor=0,part,max=0;
  do{const started=performance.now();part=v.validatePart(key,structuredClone(replayed.state),cursor);max=Math.max(max,performance.now()-started);cursor=part.cursor}while(!part.complete);
  check(part.complete,key+' batched validation agrees with the full formal grader');
  console.log('Maximum batch ms '+key+': '+Math.round(max));
  fixtures[key]=events;
 }catch(error){check(false,key+': '+error.stack)}
}
const valid=fixtures['1.1'];
check(rejects(()=>createVerifier().validate('1.1',[])),'Client completion flags cannot replace recorded actions');
check(rejects(()=>createVerifier().validate('1.1',valid.filter(e=>e.kind!=='mark'))),'Circle intersection provenance is required');
check(rejects(()=>createVerifier().validate('1.1',[...valid,{kind:'grant',fact:'equilateral:ABC'}])),'Invented construction facts are rejected');
check(rejects(()=>createVerifier().validate('1.1',[...valid,{kind:'select',reference:'I48'}])),'Future propositions cannot be used as tools');
check(rejects(()=>createVerifier().validate('1.1',[{kind:'select',reference:'P3'},{kind:'point',name:'__proto__'}])),'Only actual named construction points can be selected');
const bad=structuredClone(valid);bad.find(e=>e.kind==='justify').reference='D20';
check(rejects(()=>createVerifier().validate('1.1',bad)),'A mismatched manual justification is rejected');
if(Deno.args[0])await Deno.writeTextFile(Deno.args[0],JSON.stringify({courseVersion:COURSE_VERSION,fixtures}));
if(failures)throw Error(failures+' checks failed');
console.log('ALL CHECKS PASSED');
