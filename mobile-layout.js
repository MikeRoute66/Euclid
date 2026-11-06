/* Swipes change the visible panel; point-to-point drawing gestures keep priority. */
const MOBILE_WORKSPACE_QUERY='(max-width: 800px), (pointer: coarse) and (max-height: 600px)';
let mobileWorkspaceView='construction',mobileProofScroll=0;
function updateMobileWorkspace(){
 const mobile=matchMedia(MOBILE_WORKSPACE_QUERY).matches,workspace=document.querySelector('.workspace');
 workspace.dataset.mobileView=mobileWorkspaceView;
 for(let [view,selector] of [['construction','.drawing'],['proof','.proof']]){
  let panel=document.querySelector(selector),inactive=mobile&&view!==mobileWorkspaceView;
  panel.inert=inactive;
  if(inactive)panel.setAttribute('aria-hidden','true');else panel.removeAttribute('aria-hidden');
  document.querySelector('[data-mobile-view="'+view+'"]').setAttribute('aria-pressed',String(view===mobileWorkspaceView));
 }
}
function setMobileWorkspaceView(view){
 if(!['construction','proof'].includes(view)||view===mobileWorkspaceView)return;
 if(mobileWorkspaceView==='proof')mobileProofScroll=document.querySelector('.proofbody').scrollTop;
 if(view==='construction'&&document.querySelector('.proof').contains(document.activeElement))document.activeElement.blur();
 mobileWorkspaceView=view;clearCanvasGesture();closeTools();updateMobileWorkspace();render();
 if(view==='proof')document.querySelector('.proofbody').scrollTop=mobileProofScroll;
}
function installMobileWorkspace(){
 const workspace=document.querySelector('.workspace'),media=matchMedia(MOBILE_WORKSPACE_QUERY);
 let gesture=null,ignoreSwipeClick=false;
 document.querySelectorAll('[data-mobile-view]').forEach(button=>button.onclick=()=>setMobileWorkspaceView(button.dataset.mobileView));
 media.addEventListener('change',()=>{gesture=null;ignoreSwipeClick=false;clearCanvasGesture();updateMobileWorkspace();render()});
 workspace.addEventListener('pointerdown',event=>{
  ignoreSwipeClick=false;
  if(!media.matches||event.pointerType!=='touch')return;
  if(!event.isPrimary){gesture=null;clearCanvasGesture();event.stopPropagation();return}
  if(event.target.closest('button,input,select,textarea,a,[contenteditable="true"]'))return;
  // A drag that starts at a construction point belongs to the selected tool.
  if(event.target.closest('#canvas')&&tool&&canvasPointAt(event,24))return;
  gesture={id:event.pointerId,x:event.clientX,y:event.clientY,claimed:false};
 },true);
 window.addEventListener('pointermove',event=>{
  if(!gesture||event.pointerId!==gesture.id)return;
  let dx=event.clientX-gesture.x,dy=event.clientY-gesture.y;
  if(!gesture.claimed&&Math.abs(dy)>16&&Math.abs(dy)>Math.abs(dx)){gesture=null;return}
  let forward=mobileWorkspaceView==='construction'?dx<0:dx>0;
  if(forward&&Math.abs(dx)>=56&&Math.abs(dx)>Math.abs(dy)*1.5){gesture.claimed=true;clearCanvasGesture()}
  if(gesture.claimed){event.preventDefault();event.stopPropagation()}
 },{capture:true,passive:false});
 window.addEventListener('pointerup',event=>{
  if(!gesture||event.pointerId!==gesture.id)return;
  let active=gesture;gesture=null;
  let dx=event.clientX-active.x,dy=event.clientY-active.y,forward=mobileWorkspaceView==='construction'?dx<0:dx>0;
  if(!(forward&&Math.abs(dx)>=56&&Math.abs(dx)>Math.abs(dy)*1.5)){
   if(active.claimed){event.preventDefault();event.stopPropagation();ignoreSwipeClick=true}
   return;
  }
  event.preventDefault();event.stopPropagation();clearCanvasGesture();
  ignoreSwipeClick=true;
  setMobileWorkspaceView(mobileWorkspaceView==='construction'?'proof':'construction');
 },{capture:true,passive:false});
 workspace.addEventListener('click',event=>{
  if(ignoreSwipeClick&&event.detail>0){ignoreSwipeClick=false;event.preventDefault();event.stopImmediatePropagation()}
 },true);
 window.addEventListener('pointercancel',()=>gesture=null);
 window.addEventListener('blur',()=>gesture=null);
 updateMobileWorkspace();
}
