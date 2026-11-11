/* Keep pointer input in screen pixels, independent of SVG scale and zoom. */
function canvasPointAt(event,radius=18){
 const label=event.target.closest?.('[data-label]');if(label)return label.dataset.label;
 const matrix=$('#canvas').getScreenCTM();if(!matrix)return null;
 let best=null,nearest=radius;for(let [name,p] of Object.entries(state.points)){let q=$('#canvas').createSVGPoint();q.x=p[0];q.y=p[1];q=q.matrixTransform(matrix);let d=Math.hypot(q.x-event.clientX,q.y-event.clientY);if(d<nearest){best=name;nearest=d}}if(tool?.[3]==='point'){let position=coords(event);for(let p of bookOneIntersections())if(distance(p,position)*Math.hypot(matrix.a,matrix.b)<Math.min(12,nearest))return null}return best;
}
function superposeTriangles(){
 if(index!==3||tool?.[1]!=='CN4')return;
 snapshot();for(let fact of ['superpose','superpose:ABC:DEF'])if(!state.facts.includes(fact))state.facts.push(fact);
 for(let [a,b] of [['A','D'],['B','E'],['C','F']])state.points[a]=[...state.points[b]];picks=[];render();Feedback.play(true);
}
function activateCanvasPoint(name){
 if(index===3&&tool?.[1]==='CN4'){
  if(picks[0]==='A'&&name==='D'){superposeTriangles();return}
  picks=name==='A'?['A']:[];if(name!=='A')Feedback.play(false);render();$('#instruction').textContent=picks.length?'Now click D to superpose the triangles.':'Drag A onto D, or click A followed by D.';return;
 }
 choosePoint(name);
}
function clearCanvasGesture(){
 const active=drag;drag=null;$('#canvas').classList.remove('is-dragging');$('#canvas .drag-preview')?.remove();
 if(active)try{if($('#canvas').hasPointerCapture?.(active.id))$('#canvas').releasePointerCapture(active.id)}catch{}
}
function previewCanvasDrag(event){
 if(index!==3||tool?.[1]!=='CN4'||drag.name!=='A'){
  if(!drag.name||picks.length||!['line','extend','circle','equilateral','midpoint','square'].includes(tool?.[3]))return;
  let preview=$('#canvas .drag-preview'),a=state.points[drag.name],b=coords(event);
  if(!preview){preview=el('g',{class:'drag-preview','pointer-events':'none'});preview.append(el(tool[3]==='circle'?'circle':'line',{}));$('#canvas').append(preview)}
  let shape=preview.firstElementChild,attributes=tool[3]==='circle'?{cx:a[0],cy:a[1],r:distance(a,b)}:{x1:a[0],y1:a[1],x2:b[0],y2:b[1]};for(let [key,value] of Object.entries(attributes))shape.setAttribute(key,value);return;
 }
 let preview=$('#canvas .drag-preview');if(!preview){preview=el('g',{class:'drag-preview','pointer-events':'none'});let [a,b,c]=['A','B','C'].map(n=>state.points[n]);preview.append(el('path',{d:`M ${a} L ${b} L ${c} Z`}));for(let p of [a,b,c])preview.append(el('circle',{cx:p[0],cy:p[1],r:7}));$('#canvas').append(preview)}
 let p=coords(event);preview.setAttribute('transform',`translate(${p[0]-drag.start[0]} ${p[1]-drag.start[1]})`);
}
function installCanvasInput(){
 const canvas=$('#canvas');
 canvas.addEventListener('dragstart',e=>e.preventDefault());
 canvas.addEventListener('pointerdown',e=>{
  if(e.button!==0||e.ctrlKey||drag||!tool)return;
  e.preventDefault();let name=canvasPointAt(e);drag={id:e.pointerId,name,start:coords(e),client:[e.clientX,e.clientY],moved:false};
  // Window listeners remain a fallback when an SVG/browser rejects capture.
  try{canvas.setPointerCapture?.(e.pointerId)}catch{}
 },{passive:false});
 window.addEventListener('pointermove',e=>{
  if(!drag||drag.id!==e.pointerId)return;
  if(Math.hypot(e.clientX-drag.client[0],e.clientY-drag.client[1])>4)drag.moved=true;
  if(drag.moved){e.preventDefault();canvas.classList.add('is-dragging');previewCanvasDrag(e)}
 },{passive:false});
 window.addEventListener('pointerup',e=>{
  if(!drag||drag.id!==e.pointerId)return;
  e.preventDefault();let active=drag,moved=active.moved||Math.hypot(e.clientX-active.client[0],e.clientY-active.client[1])>4,target=canvasPointAt(e,32);clearCanvasGesture();
  if(moved){
   if(index===3&&tool?.[1]==='CN4'&&active.name==='A'&&target==='D'){superposeTriangles();return}
   if(active.name&&target&&target!==active.name&&!picks.length&&['line','extend','circle','equilateral','midpoint','square'].includes(tool?.[3])){choosePoint(active.name);choosePoint(target);return}
   $('#instruction').textContent=index===3&&tool?.[1]==='CN4'?'Drop A near D, or click A followed by D.':'Click the named points in order. Two-point tools also accept a drag between endpoints.';Feedback.play(false);return;
  }
  if(active.name)activateCanvasPoint(active.name);else if(tool?.[3]==='point'){let r=canvas.getBoundingClientRect();if(e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom)mark(coords(e))}else Feedback.play(false);
 },{passive:false});
 window.addEventListener('pointercancel',e=>{if(drag?.id===e.pointerId)clearCanvasGesture()});
 canvas.addEventListener('lostpointercapture',e=>{if(drag?.id===e.pointerId)clearCanvasGesture()});
 window.addEventListener('blur',clearCanvasGesture);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){clearCanvasGesture();if(tool?.[3]==='equalAreaSquare'&&picks.length){picks=[];render()}}});
}
