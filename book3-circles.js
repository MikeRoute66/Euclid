/* Drawing parameters are never used by the proof checker. Membership and the
 * identity of a circle survive finding (or hypothesizing) its center. */
const BookThreeCircles=(()=>{
 const objects=value=>value.givenCircles||[];
 const circle=(value,id)=>objects(value).find(c=>c.id===id);
 function initialize(value,lesson){if(lesson.givenCircles)value.givenCircles=structuredClone(lesson.givenCircles)}
 function member(value,id,name){const c=circle(value,id);return !!c&&(c.members.includes(name)||value.topology?.intersections.some(r=>r.point===name&&r.supports.includes('given:'+id)))}
 function mark(value,id,name){return !!circle(value,id)&&!!value.points[name]}
 function centerRecords(value){return (value.facts||[]).flatMap(raw=>{if(!raw.startsWith('center:'))return [];try{const r=JSON.parse(raw.slice(7));return validCenter(value,r)?[r]:[]}catch{return []}})}
 function validCenter(value,r){return r?.rule==='E3.1'&&typeof r.circle==='string'&&Array.isArray(r.inputs)&&r.inputs.length===3&&new Set(r.inputs).size===3&&r.inputs.every(n=>member(value,r.circle,n))&&/^[A-Z]$/.test(r.output)&&value.points[r.output]&&r.inputs.every(n=>n!==r.output)}
 function construct(value,names){
  const c=objects(value).find(c=>names.every(n=>member(value,c.id,n)));if(!c||new Set(names).size!==3)throw Error('Choose three different points recorded on one circle.');
  const [a,b,d]=names.map(n=>value.points[n]),den=2*(a[0]*(b[1]-d[1])+b[0]*(d[1]-a[1])+d[0]*(a[1]-b[1]));
  if(Math.abs(den)<1e-8)throw Error('The three circle points must not be collinear.');
  const sq=p=>p[0]*p[0]+p[1]*p[1],point=[(sq(a)*(b[1]-d[1])+sq(b)*(d[1]-a[1])+sq(d)*(a[1]-b[1]))/den,(sq(a)*(d[0]-b[0])+sq(b)*(a[0]-d[0])+sq(d)*(b[0]-a[0]))/den];
  const output=nextPointName();if(!output)throw Error('All point labels are used.');value.points[output]=point;EuclidConstruction.point(value,output);
  for(const line of c.diameters||[])EuclidConstruction.support(value,line,output);
  value.facts.push('center:'+JSON.stringify({rule:'E3.1',circle:c.id,inputs:[...names],output}));return output;
 }
 function valid(value,lesson){
  if(!lesson.givenCircles)return !value.givenCircles?.length;
  return JSON.stringify(value.givenCircles)===JSON.stringify(lesson.givenCircles)&&(value.facts||[]).filter(s=>s.startsWith('center:')).every(s=>{try{return validCenter(value,JSON.parse(s.slice(7)))}catch{return false}});
 }
 function draw(svg,value){for(const c of objects(value)){const shape=el('circle',{cx:c.plot.center[0],cy:c.plot.center[1],r:c.plot.radius,class:'circle given-circle','data-circle':c.id});svg.append(shape);const text=el('text',{x:c.plot.center[0]+c.plot.radius-20,y:c.plot.center[1]-c.plot.radius+20,class:'circle-name'});text.textContent=c.id;svg.append(text)}}
 function bounds(value){return objects(value).flatMap(c=>[[c.plot.center[0]-c.plot.radius,c.plot.center[1]-c.plot.radius],[c.plot.center[0]+c.plot.radius,c.plot.center[1]+c.plot.radius]])}
 return {objects,circle,initialize,member,mark,centerRecords,validCenter,construct,valid,draw,bounds};
})();
