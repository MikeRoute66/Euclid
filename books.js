/* Stable public identities. Legacy Book I rule numbers remain an adapter for
 * its existing calculus; array positions are never persisted in version 2. */
const EuclidBooks=(()=>{
 const books=[{number:1,name:'Book I',source:'https://mathcs.clarku.edu/~djoyce/elements/bookI/bookI.html'},{number:2,name:'Book II',source:'https://mathcs.clarku.edu/~djoyce/elements/bookII/bookII.html'},{number:3,name:'Book III',source:'https://mathcs.clarku.edu/~djoyce/elements/bookIII/bookIII.html'}];
 function identity(lesson){return {book:lesson.book||1,proposition:lesson.proposition||lesson.id}}
 function key(lesson){let v=identity(lesson);return v.book+'.'+v.proposition}
 function reference(lesson){return 'E'+key(lesson)}
 function position(value){return LESSONS.findIndex(l=>key(l)===value)}
 function rule(value){let m=/^I\.?([1-9]\d*)$/.exec(value);if(m)return 'E1.'+m[1];m=/^D([1-9]\d*)$/.exec(value);return m?'D1.'+m[1]:value}
 function runtimeRule(value){let m=/^E1\.([1-9]\d*)$/.exec(value);if(m)return 'I'+m[1];m=/^D1\.([1-9]\d*)$/.exec(value);return m?'D'+m[1]:value}
 function dependency(value){let ref=runtimeRule(value);return /^I[1-9]\d*$/.test(ref)?Number(ref.slice(1)):ref}
 function dependencyRule(value){return typeof value==='number'?'I'+value:runtimeRule(value)}
 function referenceLesson(value){return LESSONS.find(l=>reference(l)===rule(value))}
 function earlier(value,lesson){let source=referenceLesson(value);if(!source)return false;let a=identity(source),b=identity(lesson);return a.book<b.book||a.book===b.book&&a.proposition<b.proposition}
 function install(number,lessons,definitions,modes={}){
  const expected={2:14,3:37}[number],ordered=[...lessons].sort((a,b)=>a.proposition-b.proposition);
  if(!expected||LESSONS.some(l=>identity(l).book===number)||ordered.length!==expected||ordered.some((l,i)=>l.book!==number||l.proposition!==i+1||l.id!==LESSONS.length+i+1||!l.goals?.length||!l.proofGuide?.length||!Array.isArray(l.construction)))throw Error('Install a complete, ordered book after all its predecessors.');
  for(let l of ordered){l.key=key(l);for(let step of [...l.construction,...l.proofGuide]){let ref=step.ref||step.j,m=/^E([23])\.(\d+)$/.exec(ref);if(m&&(Number(m[1])>number||Number(m[1])===number&&Number(m[2])>=l.proposition))throw Error('A lesson cannot use its own or a later proposition.')}}
  LESSONS.push(...ordered);REFERENCES.definitions.push(...definitions);REFERENCES.propositions.push(...ordered.map(l=>[l.title,reference(l),l.description,modes[reference(l)]]));
 }
 // Convert every proof variant, including hidden practice backups. Derived
 // validity is deliberately discarded by the importer and computed again.
 function mapProgress(value,convert){
  let out=structuredClone(value);if(!out||typeof out!=='object'||Array.isArray(out))throw Error('Invalid saved proposition.');
  for(let field of ['lines','manualProof','practiceProof'])if(Array.isArray(out[field]))out[field]=out[field].map(line=>{if(!line||typeof line!=='object')return line;let j=typeof line.j==='string'?convert(line.j):line.j;return convert===rule?{s:line.s,j}:{...line,j}});
  function geometry(value){if(!value||typeof value!=='object')return;
   if(Array.isArray(value.facts))value.facts=value.facts.map(raw=>{if(typeof raw!=='string'||!raw.startsWith('book:'))return raw;try{let record=JSON.parse(raw.slice(5)),mapped=convert(Number.isInteger(record.rule)?'I'+record.rule:record.rule);record.rule=/^I[1-9]\d*$/.test(mapped)?Number(mapped.slice(1)):mapped;return 'book:'+JSON.stringify(record)}catch{return raw}});
   for(let a of value.arcs||[])if(a.basis?.record){let holder={facts:[a.basis.record]};geometry(holder);a.basis.record=holder.facts[0]}
  }
  geometry(out);for(let field of ['manualConstruction','practiceConstruction'])geometry(out[field]);return out;
 }
 function encode(progress,active){let out={};for(let [index,value] of Object.entries(progress)){let lesson=LESSONS[Number(index)];if(!lesson)throw Error('Unknown saved proposition.');out[key(lesson)]=mapProgress(value,rule)}return {format:'euclid-workshop',version:2,activeProposition:key(LESSONS[active]),progress:out}}
 function decode(document){
  if(!document||document.version!==2)return document;
  if(!document.progress||typeof document.progress!=='object'||Array.isArray(document.progress))throw Error('Invalid saved progress.');
  let active=position(document.activeProposition),progress={};if(active<0)throw Error('This save requires a proposition that is not installed.');
  for(let [id,value] of Object.entries(document.progress)){let index=position(id);if(index<0)throw Error('This save requires a proposition that is not installed.');progress[index]=mapProgress(value,runtimeRule)}
  return {...document,version:1,activeProposition:active,progress};
 }
 for(let lesson of LESSONS){lesson.book??=1;lesson.proposition??=lesson.id;lesson.key=key(lesson)}
 return {books,identity,key,reference,position,rule,runtimeRule,dependency,dependencyRule,referenceLesson,earlier,encode,decode,install};
})();
