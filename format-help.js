/* Capitalize only construction labels in geometric statement positions. */
function capitalizeGeometryLabels(input,pointNames){
 const known=new Set(pointNames),parsed=!!EuclidLogic.parse(input);
 const words=new Set('this that these those it which what here there isosceles a an is are and the to on of at has two all for same than triangle triangles equilateral isosceles scalene congruent superposed superpose equal equals angle angles segment length line side parallel perpendicular parallelogram square collinear right area greater less inside point'.split(' '));
 return input.replace(/[a-z]+/gi,(word,offset)=>{
  const lower=word.toLowerCase(),upper=word.toUpperCase(),before=input.slice(0,offset),after=input.slice(offset+word.length);
  if(![...upper].every(n=>known.has(n))||new Set(upper).size!==upper.length)return word;
  // The article in "is a square" or "a right angle" is not point A.
  if(lower==='a'&&/^\s+(?:square|parallelogram|right\s+angle)\b/i.test(after))return word;
  const prefix=/\b(?:angle|area|triangle|triangles|segment|line|side|point|inside|(?:congruent|parallel|perpendicular)\s+to|superposed\s+on)\s*$/i.test(before),arithmetic=/(?:[=<>+\-^(]\s*|^\s*)(?:\d+(?:\/\d+)?\s*\*?\s*)$|[=<>+\-^(]\s*$/.test(before)||/^\s*[=<>+\-^),]/.test(after);
  if(lower!=='a'&&words.has(lower)&&!prefix&&!(word.length<=3&&arithmetic))return word;
  const context=prefix||arithmetic||/^\s+(?:is|are|and)\b/i.test(after);
  return parsed||context?upper:word;
 });
}
/* Syntax assistance only: this function has no lesson, diagram, or proof input. */
function suggestStatementFormat(input){
 if(!input.trim()||EuclidLogic.parse(input))return null;
 const words=input.toLowerCase().match(/[a-z]+/g)||[];
 function editDistance(a,b){let row=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){let next=[i];for(let j=1;j<=b.length;j++)next[j]=Math.min(next[j-1]+1,row[j]+1,row[j-1]+(a[i-1]===b[j-1]?0:1));row=next}return row[b.length]}
 const keyword=word=>words.some(w=>w===word||(w.length>=5&&editDistance(w,word)<=2));
 const ignored=new Set(['is','are','and','the','to','on','of','at','has','two','all','for','a','an','line','side','same','than']);
 const keywords=['triangle','triangles','equilateral','isosceles','scalene','congruent','superposed','superpose','equal','equals','angle','angles','segment','length','parallel','perpendicular','parallelogram','square','collinear','right','area','greater','less'];
 const names=(input.match(/\b[a-zA-Z]{2,4}\b/g)||[]).filter(w=>!ignored.has(w.toLowerCase())&&!keywords.includes(w.toLowerCase())).map(w=>w.toUpperCase());
 let property=['equilateral','isosceles','scalene'].find(keyword);
 if(property){let name=names.find(n=>n.length===3);return {text:(name||'[triangle]')+' is '+property,insertable:!!name}}
 let relation=keyword('congruent')?'congruent to':keyword('superposed')||keyword('superpose')?'superposed on':null;
 if(relation){let triangles=names.filter(n=>n.length===3);return {text:(triangles[0]||'[first triangle]')+' is '+relation+' '+(triangles[1]||'[second triangle]'),insertable:triangles.length>=2}}
 let lineRelation=keyword('perpendicular')?'perpendicular':keyword('parallel')?'parallel':null;
 if(lineRelation){let segments=names.filter(n=>n.length===2);return {text:(segments[0]||'[line]')+' is '+lineRelation+' to '+(segments[1]||'[line]'),insertable:segments.length>=2}}
 let shape=keyword('parallelogram')?'parallelogram':keyword('square')?'square':null;
 if(shape&&!keyword('equal')&&!keyword('equals')&&!/[=<>+]/.test(input)){let polygon=names.find(n=>n.length===4);return {text:(polygon||'[four vertices]')+' is a '+shape,insertable:!!polygon}}
 if(keyword('collinear')){let points=names.find(n=>n.length>=3);return {text:(points||'[vertices]')+' are collinear',insertable:!!points}}
 if(keyword('right')&&!keyword('equal')&&!keyword('equals')&&!/[=<>+]/.test(input)&&names.filter(n=>n.length===3).length<=1){let angle=names.find(n=>n.length===3);return {text:'angle '+(angle||'[vertices]')+' is right',insertable:!!angle}}
 if(keyword('equal')||keyword('equals')||input.includes('=')){
  const candidate=input.replace(/\bis\s+equal\s+to\b/gi,'=').replace(/\bequals?\b/gi,'='),parsed=EuclidLogic.parse(candidate);
  if(parsed?.kind==='equality'||parsed?.kind==='eq'){
   const format=terms=>terms.map((t,i)=>(t.coefficient<0?(i?' - ':'-'):(i?' + ':''))+(Math.abs(t.coefficient)!==1?Math.abs(t.coefficient)+' ':'')+t.term.replace(/AREA\(([A-Z]+)\)/,'area $1').replace('RIGHT','right angle')).join('');
   return {text:format(parsed.left)+' = '+format(parsed.right),insertable:true};
  }
  const angle=keyword('angle')||input.includes('\u2220'),size=angle?3:2,terms=names.filter(n=>n.length===size);
  if(terms.length===2)return {text:(angle?'\u2220':'')+terms[0]+' = '+(angle?'\u2220':'')+terms[1],insertable:true};
  return {text:'[magnitude] = [magnitude]',insertable:false};
 }
 return null;
}
function updateFormatHelp(){
 let suggestion=suggestStatementFormat(document.querySelector('#statement').value),box=document.querySelector('#format-help');box.replaceChildren();box.hidden=!suggestion;
 if(!suggestion)return;
 let label=document.createElement('span');label.textContent=suggestion.insertable?'Did you mean? ':'Format: ';
 let button=document.createElement('button');button.type='button';button.textContent=suggestion.text;button.disabled=!suggestion.insertable;
 button.onclick=()=>{document.querySelector('#statement').value=suggestion.text;updateFormatHelp();document.querySelector('#statement').focus()};
 box.append(label,button);
}
function normalizeProofInput(event){
 if(event?.isComposing)return;
 const field=document.querySelector('#statement');if(!field)return;
 if(typeof state!=='undefined'&&state?.points){let value=capitalizeGeometryLabels(field.value,Object.keys(state.points));if(value!==field.value){let {selectionStart,selectionEnd,selectionDirection}=field;field.value=value;field.setSelectionRange(selectionStart,selectionEnd,selectionDirection)}}
 updateFormatHelp();
}
document.querySelector('#statement')?.addEventListener('input',normalizeProofInput);
document.querySelector('#statement')?.addEventListener('compositionend',normalizeProofInput);
