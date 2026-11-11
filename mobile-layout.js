/* Swipes change the visible panel; point-to-point drawing gestures keep priority. */
const MOBILE_WORKSPACE_QUERY='(max-width: 800px), (pointer: coarse) and (max-width: 1000px)';
let mobileWorkspaceView='construction',mobileProofScroll=0;
let mobileViewportBaseline=null,mobileViewportFrame=0,mobileViewportReveal=false;
function updateMobileViewport(){
 const mobile=matchMedia(MOBILE_WORKSPACE_QUERY).matches,viewport=window.visualViewport;
 document.body.classList.toggle('mobile-workspace',mobile);
 document.body.classList.toggle('mobile-proof-view',mobile&&mobileWorkspaceView==='proof');
 if(!mobile){document.body.classList.remove('mobile-proof-typing');return}
 const height=viewport?.height||innerHeight,width=innerWidth,top=viewport?.offsetTop||0;
 if(!mobileViewportBaseline||Math.abs(width-mobileViewportBaseline.width)>80)mobileViewportBaseline={width,height};
 mobileViewportBaseline.height=Math.max(height,mobileViewportBaseline.height);
 document.documentElement.style.setProperty('--mobile-app-height',height+'px');
 document.documentElement.style.setProperty('--mobile-app-top',top+'px');
 const typing=mobileWorkspaceView==='proof'&&!settings.skipProof&&document.activeElement===document.querySelector('#statement');
 document.body.classList.toggle('mobile-proof-typing',typing&&height<mobileViewportBaseline.height-100);
 document.documentElement.style.setProperty('--mobile-composer-height',document.querySelector('.proof-composer').getBoundingClientRect().height+'px');
 document.documentElement.style.setProperty('--mobile-shelf-height',document.querySelector('.shelf').getBoundingClientRect().height+'px');
}
function revealMobileProofLine(){
 if(!matchMedia(MOBILE_WORKSPACE_QUERY).matches||mobileWorkspaceView!=='proof')return;
 const panel=document.querySelector('.proofbody'),row=editingLine!==null?document.querySelector('#lines').children[editingLine]:null;
 if(row)row.scrollIntoView({block:'nearest'});else panel.scrollTop=panel.scrollHeight;
}
function queueMobileViewport(reveal=false){
 mobileViewportReveal=mobileViewportReveal||reveal;
 cancelAnimationFrame(mobileViewportFrame);
 mobileViewportFrame=requestAnimationFrame(()=>{updateMobileViewport();if(mobileViewportReveal&&document.activeElement===document.querySelector('#statement'))revealMobileProofLine();mobileViewportReveal=false});
}
function focusMobileProofInput(){
 if(!matchMedia(MOBILE_WORKSPACE_QUERY).matches||mobileWorkspaceView!=='proof'||settings.skipProof)return;
 document.querySelector('#statement').focus({preventScroll:true});updateMobileViewport();revealMobileProofLine();
}
function updateMobileWorkspace(){
 const mobile=matchMedia(MOBILE_WORKSPACE_QUERY).matches,workspace=document.querySelector('.workspace');
 const form=document.querySelector('#lineform'),composer=document.querySelector('.proof-composer');
 if(mobile){if(form.parentElement!==composer)composer.append(form);composer.hidden=settings.skipProof}
 else{if(form.parentElement===composer)document.querySelector('.proofbody').insertBefore(form,document.querySelector('.proofnote'));composer.hidden=true}
 updateMobileViewport();
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
 document.addEventListener('focusin',event=>queueMobileViewport(event.target.id==='statement'));
 document.addEventListener('focusout',()=>queueMobileViewport());
 window.addEventListener('resize',()=>queueMobileViewport(document.activeElement===document.querySelector('#statement')));
 window.visualViewport?.addEventListener('resize',()=>queueMobileViewport(document.activeElement===document.querySelector('#statement')));
 window.visualViewport?.addEventListener('scroll',()=>queueMobileViewport());
 new ResizeObserver(()=>queueMobileViewport()).observe(document.querySelector('.proof-composer'));
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
