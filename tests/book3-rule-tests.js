import {createVerifier} from '../supabase/functions/_shared/runtime.js';
let failures=0;
const check=(ok,text)=>{console.log((ok?'PASS ':'FAIL ')+text);if(!ok)failures++};
for(let n=1;n<=7;n++){
 const v=createVerifier(),key='3.'+n,{state,lesson}=v.replay(key,v.fixture(key));
 check(v.grade(state,lesson).complete,key+' reviewed route proves all goals');
 const moved=structuredClone(state);for(const p of Object.values(moved.points)){p[0]=p[0]*1.2+41;p[1]=p[1]*.8-30}
 check(v.grade(moved,lesson).complete,key+' hidden rendering measurements do not determine validity');
 const hidden=structuredClone(state);hidden.facts=hidden.facts.filter(s=>!s.startsWith('center:'));hidden.points.Z=[...lesson.givenCircles[0].plot.center];hidden.lines=[{s:'Z is the center of circle C1',j:'Logic'}];
 check(!v.grade(hidden,lesson).complete&&!hidden.lines[0].valid,key+' placing a point at the drawing center is not evidence');
 const wrong=structuredClone(state);wrong.lines.at(-1).j='P1';check(!v.grade(wrong,lesson).complete,key+' joining a line cannot justify the conclusion');
 const missing=structuredClone(state),index=missing.lines.findIndex(l=>l.s.endsWith('then contradiction'));
 if(index>=0){missing.lines.splice(index,1);check(!v.grade(missing,lesson).complete,key+' a contradiction cannot be skipped')}
 if([1,5,6].includes(n)){
  const escaped=structuredClone(state),step=lesson.proofGuide.find(s=>s.s.startsWith('If ')&&s.j==='D15');escaped.lines.push({s:step.s.split(' then ')[1],j:'D15'});v.grade(escaped,lesson);check(!escaped.lines.at(-1).valid,key+' assumed radii are not available outside the implication');
 }
 if(n===1){
  const reordered=structuredClone(state),start=lesson.givens.length;[reordered.lines[start],reordered.lines[start+1]]=[reordered.lines[start+1],reordered.lines[start]];
  check(v.grade(reordered,lesson).complete,'E3.1 ranked checker accepts the radius equality before the midpoint equality');
  const future=structuredClone(state);future.facts.push('center:'+JSON.stringify({rule:'E3.1',circle:'C1',inputs:['A','B','C'],output:'H'}));future.lines=[{s:'HA = HB',j:'D15'}];v.grade(future,lesson);check(!future.lines[0].valid,'E3.1 cannot borrow its own future construction tool');
 }
 if(n===2){const incomplete=structuredClone(state);incomplete.facts=incomplete.facts.filter(s=>!s.startsWith('center:'));check(!v.grade(incomplete,lesson).complete,'E3.2 requires the recorded center-finding operation')}
 if(n===3){const converse=structuredClone(state);converse.lines=converse.lines.filter(l=>!l.s.startsWith('If CD'));check(!v.grade(converse,lesson).complete,'E3.3 requires the converse separately');const reverse=structuredClone(state);reverse.lines.forEach(l=>l.s=l.s.replace('If AF = FB','If BF = FA'));check(v.grade(reverse,lesson).complete,'Reversed endpoint/equality spellings work inside conditionals')}
 if(n===5){const noMembership=structuredClone(state);for(const r of noMembership.topology.intersections)if(r.point==='F')r.supports=r.supports.filter(s=>s!=='given:C1');check(!v.grade(noMembership,lesson).complete,'An unrecorded point near a circle cannot be used as a radius endpoint')}
 if(n===7){const shortcut=structuredClone(state);shortcut.lines=[{s:'E is the center of circle C1',j:'E3.1'},{s:'AF > FD',j:'CN5'},{s:'AF is longest from F to circle C1',j:'Logic'}];v.grade(shortcut,lesson);check(!shortcut.lines.at(-1).valid,'E3.7 cannot claim the universal bound from a whole/part comparison alone');const noUniqueness=structuredClone(state);noUniqueness.lines=noUniqueness.lines.filter(l=>!l.s.startsWith('If '));check(!v.grade(noUniqueness,lesson).complete,'E3.7 includes the uniqueness argument, not just two equal segments')}
}
{
 const v=createVerifier(),events=v.fixture('3.7'),copy=[{kind:'select',reference:'I2'},...['E','E','A'].map(name=>({kind:'point',name})),{kind:'statement',statement:'EJ = EA',line:null},{kind:'select',reference:'D15'},{kind:'justify',line:v.replay('3.7',events).state.lines.length,reference:'D15'}];
 const unmarked=v.replay('3.7',[...events,...copy]);v.grade(unmarked.state,unmarked.lesson);check(!unmarked.state.lines.at(-1).valid,'A copied endpoint does not acquire circle membership from its position');
 const marked=v.replay('3.7',[...events,...copy.slice(0,4),{kind:'select',reference:'D1'},{kind:'point',name:'J'},...copy.slice(4)]);check(v.grade(marked.state,marked.lesson).complete,'The point tool explicitly records an existing endpoint on a named given circle');
}
if(failures)throw Error(failures+' checks failed');console.log('ALL CHECKS PASSED');
