/* Syntax assistance only: this function has no lesson, diagram, or proof input. */
function suggestStatementFormat(input){
 if(!input.trim()||EuclidLogic.parse(input))return null;
 const words=input.toLowerCase().match(/[a-z]+/g)||[];
 function editDistance(a,b){let row=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){let next=[i];for(let j=1;j<=b.length;j++)next[j]=Math.min(next[j-1]+1,row[j]+1,row[j-1]+(a[i-1]===b[j-1]?0:1));row=next}return row[b.length]}
 const keyword=word=>words.some(w=>w===word||(w.length>=5&&editDistance(w,word)<=2));
 const ignored=new Set(['is','are','and','the','to','on','of','at','has','two','all','for','a','an']);
 const keywords=['triangle','triangles','equilateral','isosceles','scalene','congruent','superposed','superpose','equal','equals','angle','angles','segment','length'];
 const names=(input.match(/\b[a-zA-Z]{2,3}\b/g)||[]).filter(w=>!ignored.has(w.toLowerCase())&&!keywords.includes(w.toLowerCase())).map(w=>w.toUpperCase());
 let property=['equilateral','isosceles','scalene'].find(keyword);
 if(property){let name=names.find(n=>n.length===3);return {text:(name||'[triangle]')+' is '+property,insertable:!!name}}
 let relation=keyword('congruent')?'congruent to':keyword('superposed')||keyword('superpose')?'superposed on':null;
 if(relation){let triangles=names.filter(n=>n.length===3);return {text:(triangles[0]||'[first triangle]')+' is '+relation+' '+(triangles[1]||'[second triangle]'),insertable:triangles.length>=2}}
 if(keyword('equal')||keyword('equals')||input.includes('=')){
  const candidate=input.replace(/\bis\s+equal\s+to\b/gi,'=').replace(/\bequals?\b/gi,'='),parsed=EuclidLogic.parse(candidate);
  if(parsed?.kind==='equality'){
   const format=terms=>terms.map((t,i)=>(t.coefficient<0?(i?' - ':'-'):(i?' + ':''))+t.term).join('');
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
document.querySelector('#statement')?.addEventListener('input',updateFormatHelp);
