/* Curved objects retain identities and selected sides. Screen coordinates are
 * used for drawing/snapping; incidence and membership remain recorded facts. */
const EuclidCurves=(()=>{
 const circle=(value,id)=>value.circles.find(c=>c.id===id);
 const arc=(value,id)=>(value.arcs||[]).find(a=>a.id===id);
 function ensureIds(value){let used=new Set(value.circles.map(c=>c.id).filter(Boolean)),next=1;for(let c of value.circles)if(!c.id){while(used.has('c'+next))next++;c.id='c'+next++;used.add(c.id)}}
 const masked=(value,c)=>(value.arcs||[]).some(a=>a.circleId===c.id);
 const baseRadius=(value,c,n)=>n===c.b||!!value.topology?.circles.includes(c.a+':'+c.b+':'+n);
 function member(value,a,name){return a.points.includes(name)&&(name===a.start||name===a.end||EuclidConstruction.turn(value,a.start,a.end,name)===a.side&&value.topology.intersections.some(r=>r.point===name&&r.supports.includes('arc:'+a.id)))}
 function supported(value,a,seen=new Set()){if(!a||a.kind!=='semicircle'||!Array.isArray(a.points)||![a.start,a.end,a.marker].every(n=>typeof n==='string'&&/^[A-Z]$/.test(n)&&value.points[n]))return false;let c=circle(value,a.circleId);if(!c||seen.has(a.id)||!EuclidLogic.diagram(value).between(a.start,c.a,a.end)||EuclidConstruction.turn(value,a.start,a.end,a.marker)!==a.side)return false;seen=new Set(seen).add(a.id);
  if(a.basis?.kind==='radii')return [a.start,a.end].every((name,i)=>{let witness=a.basis.sources?.[i];if(!witness||witness.kind==='base')return baseRadius(value,c,name);let parent=witness.kind==='arc'&&arc(value,witness.id);return !!parent&&parent.circleId===c.id&&supported(value,parent,seen)&&member(value,parent,name)});
  if(a.basis?.kind!=='midpoint'||!value.facts.includes(a.basis.record))return false;
  try{let record=JSON.parse(a.basis.record.slice(5));return record.rule===10&&record.operation==='midpoint'&&record.outputs[0]===c.a&&[...record.inputs].sort().join('')===[a.start,a.end].sort().join('')&&EuclidConstruction.certificate(record,value.points)&&(baseRadius(value,c,a.start)||baseRadius(value,c,a.end))}catch{return false}
 }
 function radius(value,c,name){return (value.arcs||[]).some(a=>a.circleId===c.id&&supported(value,a)&&member(value,a,name))}
 function containsPosition(value,a,p){let x=value.points[a.start],y=value.points[a.end],cross=(y[0]-x[0])*(p[1]-x[1])-(y[1]-x[1])*(p[0]-x[0]);return Math.abs(cross)<1e-7||Math.sign(cross)===a.side}
 function createSemicircle(value,lesson,[center,start,end,marker]){
  const context=BookOneLogic.context(value,lesson),side=EuclidConstruction.turn(value,start,end,marker),c=value.circles.find(c=>c.a===center&&EuclidConstruction.radius(value,c,start));
  if(!c||!side||!context.d.between(start,center,end)||!EuclidConstruction.radius(value,c,end)&&!context.equal(center+start,center+end))throw Error('Choose a recorded circle, opposite diameter endpoints, and a point on the chosen side. The equal radii must be established.');
  let basis=baseRadius(value,c,start)&&baseRadius(value,c,end)?{kind:'radii'}:null;
  if(!basis)for(let raw of value.facts){if(!raw.startsWith('book:'))continue;try{let r=JSON.parse(raw.slice(5));if(r.rule===10&&r.operation==='midpoint'&&r.outputs[0]===center&&[...r.inputs].sort().join('')===[start,end].sort().join('')&&EuclidConstruction.certificate(r,value.points)&&(baseRadius(value,c,start)||baseRadius(value,c,end))){basis={kind:'midpoint',record:raw};break}}catch{}}
  if(!basis){let sources=[start,end].map(name=>baseRadius(value,c,name)?{kind:'base'}:(value.arcs||[]).filter(a=>a.circleId===c.id&&supported(value,a)&&member(value,a,name)).map(a=>({kind:'arc',id:a.id}))[0]);if(sources.every(Boolean))basis={kind:'radii',sources}}
  if(!basis)throw Error('Record the diameter by bisecting it, or mark both endpoints on the circle first.');
  ensureIds(value);value.arcs??=[];let existing=value.arcs.find(a=>a.circleId===c.id&&(a.start===start&&a.end===end&&a.side===side||a.start===end&&a.end===start&&a.side===-side));if(existing)return existing;
  let n=1;while(value.arcs.some(a=>a.id==='a'+n))n++;
  const result={id:'a'+n,kind:'semicircle',circleId:c.id,start,end,marker,side,basis,points:[start,end]};
  value.arcs.push(result);return result;
 }
 function mark(value,id,name){let a=arc(value,id),c=a&&circle(value,a.circleId);if(!a||!c||!supported(value,a))return false;let side=EuclidConstruction.turn(value,a.start,a.end,name);if(name!==a.start&&name!==a.end&&side!==a.side)return false;if(!a.points.includes(name))a.points.push(name);return true}
 function path(value,a){let c=circle(value,a.circleId),r=distance(value.points[c.a],value.points[a.start]);return 'M '+value.points[a.start]+' A '+r+' '+r+' 0 0 '+(a.side<0?1:0)+' '+value.points[a.end]}
 function diagramPoints(value){let out=[];for(let c of value.circles){let p=value.points[c.a],r=distance(p,value.points[c.b]),positions=[[p[0]+r,p[1]],[p[0]-r,p[1]],[p[0],p[1]+r],[p[0],p[1]-r]];if(!masked(value,c))out.push(...positions);else for(let a of value.arcs.filter(a=>a.circleId===c.id))out.push(...positions.filter(q=>containsPosition(value,a,q)),value.points[a.start],value.points[a.end])}return out}
 function valid(value){
  if(!Array.isArray(value.arcs)||value.arcs.length>100||new Set(value.arcs.map(a=>a?.id)).size!==value.arcs.length)return false;
  const names=s=>typeof s==='string'&&/^[A-Z]$/.test(s)&&value.points[s];
  return value.arcs.every(a=>{if(!a||!/^a[1-9]\d*$/.test(a.id)||a.kind!=='semicircle'||!/^c[1-9]\d*$/.test(a.circleId)||![a.start,a.end,a.marker].every(names)||a.start===a.end||![-1,1].includes(a.side)||!Array.isArray(a.points)||a.points.length>26||new Set(a.points).size!==a.points.length||!a.points.every(names)||![a.start,a.end].every(n=>a.points.includes(n)))return false;
   let c=circle(value,a.circleId);if(!c||!supported(value,a))return false;
   return a.points.every(n=>member(value,a,n));
  });
 }
 return {circle,arc,ensureIds,masked,containsPosition,createSemicircle,mark,path,diagramPoints,valid,radius,supported};
})();
