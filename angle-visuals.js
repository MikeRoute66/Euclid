/* Presentation and input aliases only. Colors never supply proof premises. */
const AngleVisual=(()=>{
 const palette=[['red','#ff6b6b'],['orange','#ffa052'],['yellow','#f4df65'],['lime','#b5e56b'],['green','#62d995'],['teal','#53cbb8'],['cyan','#6bd9ee'],['blue','#78adff'],['indigo','#a39aff'],['violet','#c591fa'],['magenta','#ed86e3'],['pink','#ffabc8'],['coral','#ff927e'],['gold','#e9bc55'],['mint','#a0edc6'],['turquoise','#50e0cf'],['azure','#64bfee'],['lavender','#c4b5ff'],['plum','#cd90bd'],['rose','#ef849f'],['peach','#f6c0a1'],['olive','#bdc773'],['sage','#a5c6a1'],['aqua','#a0e7e6'],['lilac','#d8b4ee'],['amber','#efc17f'],['cobalt','#91a3ee'],['ruby','#ed7195'],['copper','#dca37e'],['silver','#ced4df'],['emerald','#72c8a3'],['orchid','#e5a0dc'],['cerulean','#84c9e5'],['apricot','#f6ca82'],['mauve','#d3a8c2'],['periwinkle','#b2c1ff'],['scarlet','#f58b95'],['jade','#97d6b8'],['sapphire','#a2c0f3'],['raspberry','#db8db1']];
 const cache=new WeakMap(),anglePattern=/\bangle\s*([a-z]{3})\b|\u2220([a-z]{3})\b/gi;
 const key=name=>name[1]+':'+[name[0],name[2]].sort().join('');
 function catalog(lesson){
  const statements=[...(lesson.givens||[]),...(lesson.proofGuide||lesson.hintSteps||[]).map(l=>l.s)],stamp=statements.join('\n');
  if(cache.get(lesson)?.stamp===stamp)return cache.get(lesson).entries;
  const entries=[],seen=new Set();for(let s of statements)for(let m of s.matchAll(anglePattern)){let name=(m[1]||m[2]).toUpperCase(),id=key(name);if(new Set(name).size!==3||seen.has(id))continue;seen.add(id);let n=entries.length,[color,hex]=palette[n%palette.length];if(n>=palette.length)color='light '+color;entries.push({angle:name,key:id,color,hex})}
  cache.set(lesson,{stamp,entries});return entries;
 }
 function resolve(text,lesson){
  const entries=catalog(lesson);if(!entries.length)return text;
  const names=entries.map(e=>e.color).sort((a,b)=>b.length-a.length).join('|'),pattern=new RegExp('\\b(?:angle\\s+)?('+names+')(?:\\s+angle)?\\b','gi');
  return text.replace(pattern,(match,color,offset)=>{
   let before=text.slice(0,offset),after=text.slice(offset+match.length);
   // A triangle named RED is still a triangle. Only magnitude positions and
   // right-angle statements accept a bare color as an angle alias.
   if(!/(?:^|[=<>+\-()])\s*(?:\d+(?:\/\d+)?\s*\*?\s*)?$/.test(before)||!/^\s*(?:$|[=<>+\-().]|is\s+(?:a\s+)?right\b)/i.test(after))return match;
   return 'angle '+entries.find(e=>e.color===color.toLowerCase()).angle;
  });
 }
 function decorate(node,text,lesson){
  node.replaceChildren();let cursor=0;for(let m of text.matchAll(anglePattern)){let name=(m[1]||m[2]).toUpperCase(),entry=catalog(lesson).find(e=>e.key===key(name));if(!entry)continue;node.append(document.createTextNode(text.slice(cursor,m.index)));let span=document.createElement('span');span.className='angle-reference';span.style.color=entry.hex;span.textContent=m[0];span.title=entry.color+' = angle '+entry.angle;node.append(span);cursor=m.index+m[0].length}node.append(document.createTextNode(text.slice(cursor)));
 }
 function diagram(value){return EuclidLogic.diagram(value,(value.lines||[]).filter(l=>l.valid).map(l=>BookOneLogic.parse(l.s)).filter(Boolean))}
 function mount(svg,lesson,value){
  const d=diagram(value),matrix=svg.getScreenCTM();if(!matrix)return;
  const scale=Math.hypot(matrix.a,matrix.b),layer=el('g',{class:'angle-sectors'}),atVertex=new Map(),visible=[];
  for(let entry of catalog(lesson)){
   let [a,v,b]=entry.angle;if(![a,v,b].every(n=>value.points[n])||!d.drawn(v,a)||!d.drawn(v,b))continue;
   let p=value.points[v],u=value.points[a],w=value.points[b],left=Math.atan2(u[1]-p[1],u[0]-p[0]),right=Math.atan2(w[1]-p[1],w[0]-p[0]),sweep=(right-left+Math.PI*3)%(Math.PI*2)-Math.PI;
   if(Math.abs(sweep)<1e-7||Math.hypot(u[0]-p[0],u[1]-p[1])<1e-7||Math.hypot(w[0]-p[0],w[1]-p[1])<1e-7)continue;
   let rank=atVertex.get(v)||0;atVertex.set(v,rank+1);
   let r=Math.min((24+rank*7)/scale,Math.hypot(u[0]-p[0],u[1]-p[1])*.42,Math.hypot(w[0]-p[0],w[1]-p[1])*.42),end=left+sweep;
   let x=p[0]+Math.cos(left)*r,y=p[1]+Math.sin(left)*r,x2=p[0]+Math.cos(end)*r,y2=p[1]+Math.sin(end)*r;
   let path=el('path',{d:`M ${p} L ${x} ${y} A ${r} ${r} 0 0 ${sweep>0?1:0} ${x2} ${y2} Z`,class:'angle-sector',fill:entry.hex,stroke:entry.hex,'data-angle':entry.angle,'data-color':entry.color,'data-vertex':v});
   let title=el('title',{});title.textContent=entry.color+' = angle '+entry.angle;path.append(title);layer.append(path);visible.push(entry);
  }
  svg.insertBefore(layer,svg.firstChild);
  svg.querySelectorAll('.edge').forEach((e,i)=>e.dataset.segment=value.edges[i]);svg.querySelectorAll('.ghost').forEach((e,i)=>e.dataset.segment=value.rays[i]);
  const wrap=svg.closest('.canvaswrap');wrap.querySelector('.angle-key')?.remove();
  if(visible.length){let details=document.createElement('details');details.className='angle-key';let summary=document.createElement('summary');summary.textContent='Angle colors';details.append(summary);let list=document.createElement('div');for(let entry of visible){let item=document.createElement('span');item.style.color=entry.hex;item.textContent=entry.color+' = '+entry.angle;list.append(item)}details.append(list);details.addEventListener('toggle',()=>{if(!details.isConnected)return;svg.querySelectorAll('.point-label-group,.point-hit,.label-leader').forEach(n=>n.remove());constructionLabelLayout(svg)});wrap.append(details)}
 }
 function clear(svg){svg.querySelectorAll('.proof-highlight').forEach(e=>{e.classList.remove('proof-highlight');e.removeAttribute('transform')});svg.querySelectorAll('.proof-highlight-overlay').forEach(e=>e.remove())}
 function highlight(svg,text,value,lesson){
  clear(svg);let ast=BookOneLogic.parse(resolve(text,lesson));if(!ast)return;
  const segments=new Set(),angles=new Set(),figures=new Set(),points=new Set(BookOneLogic.statementNames(ast));
  const polygon=p=>{figures.add(p);[...p].forEach(n=>points.add(n))},angle=a=>{angles.add(a);segments.add(a[0]+a[1]);segments.add(a[1]+a[2])};
  const squares=(value.lines||[]).filter(l=>l.valid).map(l=>BookOneLogic.parse(l.s)).filter(a=>a?.kind==='shape'&&a.property==='square').map(a=>a.polygon);
  for(let raw of value.facts||[])if(raw.startsWith('book:')){try{const record=JSON.parse(raw.slice(5));if(record.operation==='square'&&EuclidConstruction.certificate(record,value.points))squares.push(record.inputs.join('')+record.outputs.join(''))}catch{}}
  if(ast.kind==='eq'||ast.kind==='gt'){
   for(let t of [...ast.left,...ast.right]){
    if(t.term.startsWith('\u2220')&&t.term!=='\u2220STRAIGHT')angle(t.term.slice(1));
    else if(t.kind==='area')polygon(t.term.slice(5,-1));
    else if(t.kind==='length'||t.kind==='square'){const side=t.term.slice(0,2);segments.add(side);if(t.kind==='square')for(let p of squares)if([...p].some((a,i)=>[a,p[(i+1)%p.length]].sort().join('')===[...side].sort().join('')))polygon(p)}
   }
  }else if(ast.kind==='right')angle(ast.angle);
  else if(ast.kind==='shape')polygon(ast.polygon);
  else if(ast.kind==='congruence'){polygon(ast.a);polygon(ast.b);for(let p of [ast.a,ast.b])for(let i=0;i<3;i++)angle(p[(i+2)%3]+p[i]+p[(i+1)%3])}
  else if(ast.kind==='collinear'){for(let a of ast.points)for(let b of ast.points)if(a!==b)segments.add(a+b)}
  else if(ast.kind==='sameSide')segments.add(ast.line);
  else if(ast.kind==='inside')polygon(ast.triangle);
  else if(ast.kind==='parallel'||ast.kind==='perpendicular'||ast.kind==='intersection'){segments.add(ast.a);segments.add(ast.b)}
  const enlarge=(node,p)=>{node.classList.add('proof-highlight');node.setAttribute('transform',`translate(${p}) scale(1.1) translate(${-p[0]} ${-p[1]})`)};
  const d=diagram(value);
  for(let name of figures){
   const sides=[...name].map((a,i)=>a+name[(i+1)%name.length]);
   if(![...name].every(n=>value.points[n])||!sides.every(e=>d.drawn(...e))){sides.forEach(e=>segments.add(e));continue}
   const vertices=[...name].map(n=>value.points[n]),center=[0,1].map(i=>vertices.reduce((sum,p)=>sum+p[i],0)/vertices.length);
   const overlay=el('polygon',{points:vertices.map(p=>p.join(',')).join(' '),class:'proof-highlight-figure proof-highlight-overlay','data-figure':name});
   enlarge(overlay,center);svg.insertBefore(overlay,svg.firstChild);
  }
  for(let name of points){
   if(!value.points[name])continue;
   const point=svg.querySelector('.point[data-point="'+name+'"]');if(point)enlarge(point,value.points[name]);
   const label=svg.querySelector('.point-label-group[data-label="'+name+'"]');if(label){const box=label.getBBox();enlarge(label,[box.x+box.width/2,box.y+box.height/2])}
  }
  const done=new Set();for(let name of segments){let id=[...name].sort().join('');if(name.length!==2||done.has(id)||!value.points[name[0]]||!value.points[name[1]]||!d.drawn(...name))continue;done.add(id);
   let [a,b]=[value.points[name[0]],value.points[name[1]]],e=[...svg.querySelectorAll('.edge[data-segment]')].find(e=>[...e.dataset.segment].sort().join('')===id);
   if(!e){e=el('line',{x1:a[0],y1:a[1],x2:b[0],y2:b[1],class:'edge proof-highlight-overlay'});svg.append(e)}
   enlarge(e,[(a[0]+b[0])/2,(a[1]+b[1])/2]);
  }
  for(let path of svg.querySelectorAll('.angle-sector'))if([...angles].some(a=>{let b=path.dataset.angle;return a[1]===b[1]&&(d.sameRay(a[1],a[0],b[0])&&d.sameRay(a[1],a[2],b[2])||d.sameRay(a[1],a[0],b[2])&&d.sameRay(a[1],a[2],b[0]))})){
   enlarge(path,value.points[path.dataset.vertex]);
  }
 }
 function bind(row,text,svg,value,lesson){row.addEventListener('mouseenter',()=>highlight(svg,text,value,lesson));row.addEventListener('mouseleave',()=>clear(svg));row.addEventListener('focus',()=>highlight(svg,text,value,lesson));row.addEventListener('blur',()=>clear(svg))}
 return {catalog,key,resolve,decorate,mount,highlight,clear,bind};
})();
