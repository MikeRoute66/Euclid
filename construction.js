/* Non-metric diagram relationships are recorded when a construction is made.
 * Coordinates are used by the tools here, never by the proof checker. */
const EuclidConstruction=(()=>{
 const layouts={9:['ADB'],11:['ADCB'],13:['ACB'],15:['AEB','CED'],16:['BCD'],17:['BCD'],27:['AGB','CHD','EGHF'],28:['AGB','CHD','EGHF'],29:['AGB','CHD','EGHF'],32:['BCD'],35:['DCFE'],36:['ABEF','DCHG'],38:['BCEF'],40:['BCEF'],41:['DEC'],43:['AEC','FEH','GEK','AGB','BHC','CKD','DFA']};
 const sort=s=>[...s].sort().join('');
 function permutation(s){let n=0;for(let i=0;i<s.length;i++)for(let j=i+1;j<s.length;j++)if(s[i]>s[j])n++;return n%2?-1:1}
 function initialize(state,lesson){state.topology={version:1,lines:[...(layouts[lesson.id]||[])],turns:{},directions:{},circles:[]};for(let n of Object.keys(state.points))point(state,n);
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
  let records=[];for(let raw of state.facts||[])if(raw.startsWith('book:'))try{let r=JSON.parse(raw.slice(5));if(r.operation==='applyArea'&&certificate(r,state.points))records.push(r)}catch{}
  let result=[];for(let r of records)for(let p of records)if(p!==r&&p.inputs.slice(5).join('')===r.inputs.slice(5).join('')&&p.outputs[1]===r.inputs[0]&&p.outputs[0]===r.inputs[1])result.push(p.inputs[0]+r.inputs[0]+r.outputs[1],p.inputs[1]+r.inputs[1]+r.outputs[0]);
  return [...new Set(result.map(sort))];
 }
 function directLines(state){let derived=derivedAlignments(state);return (state.topology?.lines||[]).filter(line=>!derived.some(triple=>[...triple].every(n=>line.includes(n))))}
 function support(state,line,n){if(!state.topology||line.includes(n))return;let key=sort(line+n);if(!state.topology.lines.some(s=>sort(s)===key))state.topology.lines.push(line+n)}
 function onCircle(state,c,n){if(!state.topology)return;let key=c.a+':'+c.b+':'+n;if(!state.topology.circles.includes(key))state.topology.circles.push(key)}
 function nearCircle(state,c,n){let p=state.points,r=Math.hypot(p[c.a][0]-p[c.b][0],p[c.a][1]-p[c.b][1]),s=Math.hypot(p[c.a][0]-p[n][0],p[c.a][1]-p[n][1]);return Math.abs(r-s)<1e-7*Math.max(1,r)}
 function edge(state,a,b){if(!state.topology)return;point(state,a);point(state,b)}
 function intersection(state,n){if(!state.topology)return;point(state,n);let p=state.points[n];for(let line of [...state.edges,...state.rays]){let a=state.points[line[0]],b=state.points[line[1]],cross=(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);if(Math.abs(cross)<1e-6*Math.max(1,Math.hypot(b[0]-a[0],b[1]-a[1])))support(state,line,n)}for(let c of state.circles)if(nearCircle(state,c,n))onCircle(state,c,n)}
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
 function valid(t,points){const names=s=>typeof s==='string'&&[...s].every(n=>points[n]);return t?.version===1&&Array.isArray(t.lines)&&t.lines.length<=500&&t.lines.every(s=>names(s)&&s.length>=3&&s.length<=26)&&t.turns&&Object.keys(t.turns).length<=2600&&Object.entries(t.turns).every(([s,n])=>names(s)&&s.length===3&&new Set(s).size===3&&Math.abs(n)===1)&&t.directions&&Object.keys(t.directions).length<=325&&Object.entries(t.directions).every(([s,n])=>names(s)&&s.length===2&&new Set(s).size===2&&[-1,0,1].includes(n))&&Array.isArray(t.circles)&&t.circles.length<=2600&&t.circles.every(s=>typeof s==='string'&&/^[A-Z]:[A-Z]:[A-Z]$/.test(s)&&names(s.replace(/:/g,'')))}
 return {certificate,valid,directLines,derivedAlignments,initialize,point,support,onCircle,edge,intersection,radius,turn,direction};
})();
