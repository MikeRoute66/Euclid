/* Place labels in screen space, then map their positions back into the SVG. */
function constructionLabelLayout(svg,value=state){
 const matrix=svg.getScreenCTM(),rect=svg.getBoundingClientRect();if(!matrix||!rect.width||!rect.height)return;
 const scale=Math.hypot(matrix.a,matrix.b),inverse=matrix.inverse(),project=p=>({x:matrix.a*p[0]+matrix.c*p[1]+matrix.e-rect.left,y:matrix.b*p[0]+matrix.d*p[1]+matrix.f-rect.top});
 const points=Object.entries(value.points).map(([name,p])=>({name,...project(p)}));
 const segments=[...value.edges.map(e=>[project(value.points[e[0]]),project(value.points[e[1]])]),...value.rays.map(e=>{let a=value.points[e[0]],b=value.points[e[1]];return [project(a),project([a[0]+4*(b[0]-a[0]),a[1]+4*(b[1]-a[1])])]})];
 const circles=value.circles.map(c=>({...project(value.points[c.a]),r:distance(value.points[c.a],value.points[c.b])*scale}));
 const overlaps=(a,b,gap=0)=>a.x<b.x+b.w+gap&&a.x+a.w+gap>b.x&&a.y<b.y+b.h+gap&&a.y+a.h+gap>b.y;
 const obstacles=[svg.closest('.canvaswrap')?.querySelector('#instruction'),svg.closest('.canvaswrap')?.querySelector('.angle-key')].filter(Boolean).map(n=>n.getBoundingClientRect()).map(r=>({x:r.left-rect.left,y:r.top-rect.top,w:r.width,h:r.height}));
 function crosses(box,a,b){let low=0,high=1;for(let [origin,delta,min,max] of [[a.x,b.x-a.x,box.x-3,box.x+box.w+3],[a.y,b.y-a.y,box.y-3,box.y+box.h+3]]){if(Math.abs(delta)<1e-9){if(origin<min||origin>max)return false}else{let x=(min-origin)/delta,y=(max-origin)/delta;low=Math.max(low,Math.min(x,y));high=Math.min(high,Math.max(x,y));if(low>high)return false}}return true}
 const boxes=[];
 for(let p of points){
  const text=el('text',{'data-label':p.name,'text-anchor':'middle',class:'point-label'});text.textContent=p.name;text.style.fontSize=((settings.largeLabels?21:17)/scale)+'px';svg.append(text);
  const w=Math.max(10,text.getComputedTextLength()*scale)+10,h=settings.largeLabels?28:24;let candidates=[];
  for(let radius of [21,34,50,70])for(let angle=0;angle<16;angle++){let theta=-Math.PI/4+angle*Math.PI/8,x=p.x+Math.cos(theta)*radius-w/2,y=p.y+Math.sin(theta)*radius-h/2;
   x=Math.max(4,Math.min(rect.width-w-4,x));y=Math.max(4,Math.min(rect.height-h-4,y));let box={x,y,w,h},cost=radius*.65+angle*.04;
   for(let q of points)if(overlaps(box,{x:q.x-8,y:q.y-8,w:16,h:16},2))cost+=3000;
   for(let other of boxes)if(overlaps(box,other,4))cost+=10000;
   for(let other of obstacles)if(overlaps(box,other,4))cost+=10000;
   for(let [a,b] of segments)if(crosses(box,a,b))cost+=140;
   for(let c of circles){let dx=Math.max(box.x-c.x,0,c.x-box.x-w),dy=Math.max(box.y-c.y,0,c.y-box.y-h),near=Math.hypot(dx,dy),far=Math.max(...[[x,y],[x+w,y],[x,y+h],[x+w,y+h]].map(([u,v])=>Math.hypot(c.x-u,c.y-v)));if(c.r>=near-3&&c.r<=far+3)cost+=140}
   candidates.push({...box,cost});
  }
  let box=candidates.sort((a,b)=>a.cost-b.cost)[0];
  // Dense/coincident vertices can exhaust the nearby positions. Search free
  // screen space rather than stacking letters, and connect distant labels.
  if([...boxes,...obstacles].some(other=>overlaps(box,other,4))){let alternatives=[];for(let y=4;y+h<rect.height-4;y+=h+7)for(let x=4;x+w<rect.width-4;x+=w+7){let candidate={x,y,w,h};if([...boxes,...obstacles].some(other=>overlaps(candidate,other,4))||points.some(q=>overlaps(candidate,{x:q.x-8,y:q.y-8,w:16,h:16},2)))continue;let cost=Math.hypot(x+w/2-p.x,y+h/2-p.y);for(let [a,b] of segments)if(crosses(candidate,a,b))cost+=40;alternatives.push({...candidate,cost})}if(alternatives.length)box=alternatives.sort((a,b)=>a.cost-b.cost)[0]}
  boxes.push(box);
  const toSvg=(x,y)=>{let q=svg.createSVGPoint();q.x=x+rect.left;q.y=y+rect.top;return q.matrixTransform(inverse)},center=toSvg(box.x+box.w/2,box.y+box.h/2),corner=toSvg(box.x,box.y);
  const group=el('g',{'data-label':p.name,class:'point-label-group'}),background=el('rect',{x:corner.x,y:corner.y,width:box.w/scale,height:box.h/scale,rx:3/scale,class:'label-background'});
  if(Math.hypot(box.x+box.w/2-p.x,box.y+box.h/2-p.y)>40){let anchor=toSvg(Math.max(box.x,Math.min(box.x+box.w,p.x)),Math.max(box.y,Math.min(box.y+box.h,p.y))),vertex=value.points[p.name],leader=el('line',{x1:vertex[0],y1:vertex[1],x2:anchor.x,y2:anchor.y,class:'label-leader'});svg.insertBefore(leader,svg.querySelector('.point-label-group'))}
  text.setAttribute('x',center.x);text.setAttribute('y',center.y+(settings.largeLabels?6.8:5.5)/scale);text.style.strokeWidth=(3/scale)+'px';group.append(background,text);svg.append(group);
 }
 // Transparent targets retain a constant physical size as the viewBox changes.
 for(let [name,p] of Object.entries(value.points)){let hit=el('circle',{cx:p[0],cy:p[1],r:16/scale,class:'point-hit','data-point':name});svg.insertBefore(hit,svg.querySelector('.point-label-group'))}
}

let labelResizeFrame;
window.addEventListener('resize',()=>{cancelAnimationFrame(labelResizeFrame);labelResizeFrame=requestAnimationFrame(()=>{const svg=document.querySelector('#canvas');if(!svg||typeof state==='undefined'||!state)return;svg.querySelectorAll('.point-label-group,.point-hit,.label-leader').forEach(n=>n.remove());AngleVisual.clear(svg);svg.querySelector('.angle-sectors')?.remove();AngleVisual.mount(svg,LESSONS[index],state);constructionLabelLayout(svg)})});
