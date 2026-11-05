/* Non-metric diagram relationships are recorded when a construction is made.
 * Coordinates are used by the tools here, never by the proof checker. */
const EuclidConstruction=(()=>{
 const layouts={9:['ADB'],11:['ADCB'],13:['ACB'],15:['AEB','CED'],16:['BCD'],17:['BCD'],27:['AGB','CHD','EGHF'],28:['AGB','CHD','EGHF'],29:['AGB','CHD','EGHF'],32:['BCD'],35:['DCFE'],36:['ABEF','DCHG'],38:['BCEF'],40:['BCEF'],41:['DEC'],43:['AEC','FEH','GEK','AGB','BHC','CKD','DFA']};
 const sort=s=>[...s].sort().join('');
 function permutation(s){let n=0;for(let i=0;i<s.length;i++)for(let j=i+1;j<s.length;j++)if(s[i]>s[j])n++;return n%2?-1:1}
 function restoreGivens(state,lesson){
  for(let line of layouts[lesson.id]||[])if([...line].every(n=>state.points[n])&&!state.topology.lines.includes(line))state.topology.lines.push(line);
  // Older point tools recorded every displayed coincidence. For guided
  // intersections, retain the selected supports, not unrelated passing lines.
  state.topology.intersections??=[];
  for(let task of lesson.construction||[])if(task.ref==='D1'&&task.outputs.length){let n=task.outputs[0],supports=task.supports||(typeof INTERSECTION_SUPPORTS!=='undefined'?INTERSECTION_SUPPORTS[lesson.id]?.[n]:null);if(!state.points[n]||!supports)continue;
   let entry=state.topology.intersections.find(r=>r.point===n);
   if(!entry&&supports.every(s=>s.startsWith('circle:')?state.topology.circles.includes(s[7]+':'+s[8]+':'+n):state.topology.lines.some(g=>[...s,n].every(v=>g.includes(v))))){entry={point:n,supports:[...supports]};state.topology.intersections.push(entry)}
   if(entry){let lines=entry.supports.filter(s=>!s.startsWith('circle:'));state.topology.lines=state.topology.lines.filter(g=>g.at(-1)!==n||(layouts[lesson.id]||[]).includes(g)||lines.some(line=>[...line].every(v=>g.includes(v))))}
  }
 }
 function initialize(state,lesson){state.topology={version:1,lines:(layouts[lesson.id]||[]).filter(g=>[...g].every(n=>state.points[n])),turns:{},directions:{},circles:[],intersections:[]};for(let n of Object.keys(state.points))point(state,n);
  for(let raw of state.facts||[])if(/^extend:[A-Z]:[A-Z]:[A-Z]$/.test(raw)){let [,a,b,n]=raw.split(':');if([a,b,n].every(v=>state.points[v])&&state.rays.includes(a+b))support(state,a+b,n)}
  // Replay only relationships implied by recorded operations in older saves.
  for(let raw of state.facts||[])if(raw.startsWith('book:')){try{let r=JSON.parse(raw.slice(5));if(!certificate(r,state.points))continue;let [a,b,c]=r.inputs,[n,m]=r.outputs;
   if(['cut','midpoint'].includes(r.operation))support(state,a+b,n);
   if(r.operation==='bisectAngle')support(state,a+c,n);
   if(r.operation==='sss')support(state,r.inputs[6]+r.inputs[7],n);
   if(r.operation==='perpendicular'){if(r.rule===12)support(state,a+b,n);else support(state,a+b,c)}
   if(r.operation==='copy'&&lesson.id===46&&a==='A'&&state.points.C)support(state,'AC',n);
   if(['equalArea','figureArea'].includes(r.operation))support(state,r.inputs.slice(-2).join(''),n);
  }catch{}}
  if(lesson.id===5&&state.facts?.some(f=>f==='equalExtensions'||f==='cut:A:F:A:G')){if(state.points.F)support(state,'AB','F');if(state.points.G)support(state,'AC','G')}
  return state.topology}
 function point(state,n){let t=state.topology;if(!t)return;const p=state.points;for(let a of Object.keys(p))if(a!==n){let key=sort(a+n);if(!(key in t.directions)){let [u,v]=[p[key[0]],p[key[1]]],dx=v[0]-u[0],dy=v[1]-u[1];t.directions[key]=Math.abs(dx)>1e-7?Math.sign(dx):Math.sign(dy)}}for(let a of Object.keys(p))for(let b of Object.keys(p))if(new Set(a+b+n).size===3){let key=sort(a+b+n);if(key in t.turns)continue;let [u,v,w]=[...key].map(k=>p[k]),cross=(v[0]-u[0])*(w[1]-u[1])-(v[1]-u[1])*(w[0]-u[0]);if(Math.abs(cross)>1e-7)t.turns[key]=Math.sign(cross)}}
 // Joining equal-angle parallelograms does not construct their outer alignment.
 // Old saves contain these inferred triples; ignore them until a proof line
 // establishes the relationship. This applies to every use of the area tool.
 function derivedAlignments(state){
  let records=[];for(let raw of state.facts||[])if(raw.startsWith('book:'))try{let r=JSON.parse(raw.slice(5));if(['equalArea','applyArea','figureArea'].includes(r.operation)&&certificate(r,state.points)){
   let applied=r.operation==='applyArea',size=r.operation==='figureArea'?4:3;
   records.push({applied,p:applied?[...r.inputs.slice(0,2),...r.outputs]:[r.inputs.at(-2),...r.outputs],angle:(applied?r.inputs.slice(5,8):r.inputs.slice(size,size+3)).join('')});
  }}catch{}
  let result=[];for(let r of records)if(r.applied)for(let p of records)if(p!==r&&p.angle===r.angle&&p.p[2]===r.p[1]&&p.p[3]===r.p[0])result.push(p.p[0]+r.p[0]+r.p[3],p.p[1]+r.p[1]+r.p[2]);
  return [...new Set(result.map(sort))];
 }

 function directLines(state){let derived=derivedAlignments(state);return (state.topology?.lines||[]).filter(line=>!derived.some(triple=>[...triple].every(n=>line.includes(n))))}
 function support(state,line,n){if(!state.topology||line.includes(n))return;let key=sort(line+n);if(!state.topology.lines.some(s=>sort(s)===key))state.topology.lines.push(line+n)}
 function onCircle(state,c,n){if(!state.topology)return;let key=c.a+':'+c.b+':'+n;if(!state.topology.circles.includes(key))state.topology.circles.push(key)}
 function nearCircle(state,c,n){let p=state.points,r=Math.hypot(p[c.a][0]-p[c.b][0],p[c.a][1]-p[c.b][1]),s=Math.hypot(p[c.a][0]-p[n][0],p[c.a][1]-p[n][1]);return Math.abs(r-s)<1e-7*Math.max(1,r)}
 function edge(state,a,b){if(!state.topology)return;point(state,a);point(state,b)}
 function intersection(state,n,supports){
  if(!state.topology)return;point(state,n);
  // Clicking an existing point can mark circle membership. It does not prove
  // that the point also lies on every line at the same screen coordinates.
  supports??=state.circles.filter(c=>nearCircle(state,c,n)).map(c=>'circle:'+c.a+c.b);
  state.topology.intersections??=[];
  if(supports.length&&!state.topology.intersections.some(r=>r.point===n&&[...r.supports].sort().join(',')===[...supports].sort().join(',')))state.topology.intersections.push({point:n,supports:[...supports]});
  for(let selected of supports)if(selected.startsWith('circle:')){let [a,b]=selected.slice(7);onCircle(state,{a,b},n)}else support(state,selected,n);
 }

 function radius(state,c,n){return n===c.b||!!state.topology?.circles.includes(c.a+':'+c.b+':'+n)}
 function turn(state,a,b,c){return (state.topology?.turns[sort(a+b+c)]||0)*permutation(a+b+c)}
 function direction(state,a,b){return (state.topology?.directions[sort(a+b)]||0)*(a<b?1:-1)}
 function certificate(r,points){
  const rules={equilateral:[1,2,1],copy:[2,3,1],cut:[3,4,1],bisectAngle:[9,3,1],midpoint:[10,2,1],perpendicular:[r.rule===12?12:11,3,1],sss:[22,8,2],copyAngle:[23,5,1],parallel:[31,3,1],equalArea:[42,8,3],applyArea:[44,8,2],figureArea:[45,9,3],square:[46,2,2]},contract=rules[r.operation];
  if(!contract||r.rule!==contract[0]||r.inputs?.length!==contract[1]||r.outputs?.length!==contract[2]||![...r.inputs,...r.outputs].every(n=>/^[A-Z]$/.test(n)&&points[n])||!Array.isArray(r.claims))return false;
  let [a,b,c,e]=r.inputs,[n,m,q]=r.outputs,expected=[];
  switch(r.operation){
   case 'equilateral':expected=[a+n+' = '+a+b,b+n+' = '+a+b,a+n+' = '+b+n,a+b+n+' is equilateral'];break;
   case 'copy':expected=[a+n+' = '+b+c];break;
   case 'cut':expected=[a+n+' = '+c+e];break;
   case 'midpoint':expected=[a+n+' = '+n+b,a+n+b+' are collinear'];break;
   case 'bisectAngle':expected=['angle '+a+b+n+' = angle '+n+b+c];break;
   case 'perpendicular':expected=[c+n+' is perpendicular to '+a+b];break;
   case 'parallel':expected=[a+n+' is parallel to '+b+c];break;
   case 'copyAngle':expected=['angle '+r.inputs[4]+e+n+' = angle '+a+b+c];break;
   case 'sss':expected=[r.inputs[6]+n+' = '+a+b,r.inputs[6]+m+' = '+c+e,n+m+' = '+r.inputs[4]+r.inputs[5]];break;
   case 'square':{let p=a+b+n+m;expected=[p+' is a square',p+' is a parallelogram',a+b+' = '+b+n,a+b+' = '+a+m,a+m+' is perpendicular to '+a+b];break;}
   default:{let applied=r.operation==='applyArea',size=r.operation==='figureArea'?4:3,shape=applied?r.inputs.slice(2,5):r.inputs.slice(0,size),angle=applied?r.inputs.slice(5,8):r.inputs.slice(size,size+3),origin=applied?a:r.inputs.at(-2),end=applied?b:n,topEnd=applied?n:m,topOrigin=applied?m:q,p=origin+end+topEnd+topOrigin;expected=[p+' is a parallelogram','area '+p+' = area '+shape.join(''),'angle '+topOrigin+origin+end+' = angle '+angle.join(''),'angle '+end+origin+topOrigin+' = angle '+angle.join('')];}
  }
  return r.claims.length===expected.length&&r.claims.every(s=>expected.includes(s));
 }
 function valid(t,points){const names=s=>typeof s==='string'&&[...s].every(n=>points[n]);return t?.version===1&&(t.intersections===undefined||Array.isArray(t.intersections)&&t.intersections.length<=500&&t.intersections.every(r=>r&&names(r.point)&&r.point.length===1&&Array.isArray(r.supports)&&r.supports.length<=10&&r.supports.every(s=>typeof s==='string'&&/^(?:circle:)?[A-Z]{2}$/.test(s)&&names(s.replace('circle:','')))))&&Array.isArray(t.lines)&&t.lines.length<=500&&t.lines.every(s=>names(s)&&s.length>=3&&s.length<=26)&&t.turns&&Object.keys(t.turns).length<=2600&&Object.entries(t.turns).every(([s,n])=>names(s)&&s.length===3&&new Set(s).size===3&&Math.abs(n)===1)&&t.directions&&Object.keys(t.directions).length<=325&&Object.entries(t.directions).every(([s,n])=>names(s)&&s.length===2&&new Set(s).size===2&&[-1,0,1].includes(n))&&Array.isArray(t.circles)&&t.circles.length<=2600&&t.circles.every(s=>typeof s==='string'&&/^[A-Z]:[A-Z]:[A-Z]$/.test(s)&&names(s.replace(/:/g,'')))}
 return {restoreGivens,certificate,valid,directLines,derivedAlignments,initialize,point,support,onCircle,edge,intersection,radius,turn,direction};
})();
