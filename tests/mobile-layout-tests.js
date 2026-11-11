function runMobileLayoutChecks(check){
 const visible=selector=>getComputedStyle(document.querySelector(selector)).display!=='none';
 if(!matchMedia(MOBILE_WORKSPACE_QUERY).matches){
  check(visible('.drawing')&&visible('.proof')&&!visible('.mobile-views'),'desktop retains both work panels and hides mobile navigation');return;
 }
 const previous={settings:{...settings},chapter:index,view:mobileWorkspaceView,draft:$('#statement').value};
 const touch=(target,type,id,x,y)=>target.dispatchEvent(new PointerEvent(type,{bubbles:true,cancelable:true,pointerType:'touch',pointerId:id,isPrimary:true,button:0,clientX:x,clientY:y}));
 const swipe=(target,dx,dy=0)=>{let box=target.getBoundingClientRect(),x=dx<0?box.right-25:box.left+25,y=box.top+Math.min(60,box.height/2);touch(target,'pointerdown',81,x,y);touch(window,'pointermove',81,x+dx,y+dy);touch(window,'pointerup',81,x+dx,y+dy)};
 try{
  Object.assign(settings,DEFAULT_SETTINGS);load(0);state=fresh();render();setMobileWorkspaceView('construction');
  check(visible('.drawing')&&!visible('.proof')&&$('.proof').inert,'mobile shows only construction and removes the proof from focus navigation');
  check(Math.abs($('.drawing').getBoundingClientRect().width-$('.workspace').clientWidth)<2,'mobile construction uses the whole workspace width');
  let before=JSON.stringify(constructionGeometry(state));swipe($('#canvas'),-110);
  check(mobileWorkspaceView==='proof'&&visible('.proof')&&!visible('.drawing')&&$('.drawing').inert,'left swipe switches to proof and hides construction');
  let accidentalClick=false,recordClick=()=>accidentalClick=true;$('.proofbody').addEventListener('click',recordClick);$('.proofbody').dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,detail:1}));$('.proofbody').removeEventListener('click',recordClick);
  check(!accidentalClick,'a swipe cannot also click a proof statement');
  check(JSON.stringify(constructionGeometry(state))===before,'panel swipe does not change construction evidence');
  $('#statement').value='AB = AB';swipe($('.proofbody'),3,90);
  check(mobileWorkspaceView==='proof','vertical proof scrolling does not switch panels');
  swipe($('.proofbody'),110);
  check(mobileWorkspaceView==='construction'&&$('#statement').value==='AB = AB','right swipe returns to construction and retains the proof draft');
  let frame=$('#canvas').getBoundingClientRect(),x=frame.right-25,y=frame.top+45;
  touch($('#canvas'),'pointerdown',83,x,y);touch(window,'pointermove',83,x-110,y);touch(window,'pointerup',83,x,y);
  check(mobileWorkspaceView==='construction','returning a swipe to its start cancels panel navigation');
  document.querySelector('[data-mobile-view="proof"]').click();
  check(visible('.proof')&&document.querySelector('[data-mobile-view="proof"]').getAttribute('aria-pressed')==='true','mobile panel buttons provide a keyboard-accessible alternative to swiping');
  document.querySelector('[data-mobile-view="construction"]').click();
  tool=REFERENCES.postulates.find(r=>r[1]==='P3');picks=[];
  const screen=name=>{let point=$('#canvas').createSVGPoint();[point.x,point.y]=state.points[name];return point.matrixTransform($('#canvas').getScreenCTM())};
  let a=screen('B'),b=screen('A');touch($('#canvas'),'pointerdown',82,a.x,a.y);touch(window,'pointermove',82,b.x,b.y);touch(window,'pointerup',82,b.x,b.y);
  check(mobileWorkspaceView==='construction'&&state.circles.some(c=>c.a==='B'&&c.b==='A'),'leftward drag from a named point constructs a circle instead of navigating');
  tool=null;load(EuclidBooks.position('2.14'));
  for(let group of ['definitions','postulates','notions','propositions']){
   document.querySelector('[data-tab="'+group+'"]').click();let popup=$('#toolpopup'),list=$('#tools'),box=popup.getBoundingClientRect(),buttons=[...list.querySelectorAll('button')];
   check(getComputedStyle(list).gridTemplateColumns.split(' ').length===1&&buttons[1].getBoundingClientRect().top>=buttons[0].getBoundingClientRect().bottom,group+' mobile palette is a single vertical list');
   check(box.height<=Math.min(innerHeight*.3,228)+1&&box.left>=-1&&box.right<=innerWidth+1,group+' palette stays compact and within the frame');
   check(list.scrollHeight>list.clientHeight&&getComputedStyle(list).overflowY==='auto',group+' palette scrolls within its list');
   list.scrollTop=list.scrollHeight;check(buttons.at(-1).getBoundingClientRect().bottom<=list.getBoundingClientRect().bottom+1,group+' last tool is reachable by scrolling');closeTools();
  }
  check(document.body.scrollWidth===document.body.clientWidth&&document.body.scrollHeight===document.body.clientHeight,'mobile workspace and palettes fit the screen without page scrolling');
  runMobileKeyboardChecks(check);
 }finally{Object.assign(settings,previous.settings);load(previous.chapter);setMobileWorkspaceView(previous.view);$('#statement').value=previous.draft}
}
function runMobileKeyboardChecks(check){
 const descriptor=Object.getOwnPropertyDescriptor(window,'visualViewport'),viewport=window.visualViewport;
 try{
  Object.assign(settings,DEFAULT_SETTINGS,{skipConstruction:true,skipJustifications:true,learningMode:true});
  load(EuclidBooks.position('2.1'));state.lines=LESSONS[index].proofGuide.slice(0,8).map(step=>({s:step.s,j:null}));render();setMobileWorkspaceView('proof');
  const field=$('#statement'),form=$('#lineform'),ledger=$('.proofbody');
  let position=field.getBoundingClientRect();ledger.scrollTop=ledger.scrollHeight;
  check(form.parentElement===$('.proof-composer')&&Math.abs(position.top-field.getBoundingClientRect().top)<1,'mobile proof input stays pinned when the proof ledger scrolls');
  ledger.scrollTop=0;check(field.getBoundingClientRect().bottom<=$('.proof').getBoundingClientRect().bottom+1,'input is accessible even while reading the first proof line');
  field.focus({preventScroll:true});
  let keyboardViewport={height:340,offsetTop:75};Object.defineProperty(window,'visualViewport',{configurable:true,value:keyboardViewport});updateMobileViewport();revealMobileProofLine();
  check(document.body.classList.contains('mobile-proof-typing')&&getComputedStyle($('header')).display==='none'&&getComputedStyle($('.brief')).display==='none','keyboard mode reclaims the header and lesson-summary space');
  let body=document.body.getBoundingClientRect(),input=field.getBoundingClientRect(),panel=ledger.getBoundingClientRect();
  check(Math.abs(body.top-75)<1&&Math.abs(body.height-340)<1&&input.bottom<=415&&input.top>=75,'composer follows the visual viewport height and pan offset above the keyboard');
  let visible=[...$('#lines').children].filter(row=>{let r=row.getBoundingClientRect();return r.top>=panel.top-1&&r.bottom<=panel.bottom+1});
  check(panel.height>=170&&visible.length>=3,'at least three complete proof lines fit in a keyboard-sized viewport');
  tab='definitions';renderTools();check($('#toolpopup').getBoundingClientRect().bottom<=$('.proof-composer').getBoundingClientRect().top,'tool palette opens above the composer instead of covering the input');closeTools();
  field.value=LESSONS[index].proofGuide[8].s;form.requestSubmit();
  check(document.activeElement===field&&state.lines.at(-1).valid&&field.value==='','submitting a line keeps the mobile composer focused for continued typing');
  check($('#lines').lastElementChild.getBoundingClientRect().bottom<=ledger.getBoundingClientRect().bottom+1,'new proof line is revealed directly above the composer');
  beginEdit(1);let editing=$('#lines').children[1].getBoundingClientRect();
  check(editing.bottom>=ledger.getBoundingClientRect().top&&editing.top<=ledger.getBoundingClientRect().bottom&&document.activeElement===field,'editing an earlier line keeps its row and input accessible');
  $('#cancel-edit').click();field.focus();keyboardViewport.height=viewport?.height||innerHeight;keyboardViewport.offsetTop=0;updateMobileViewport();
  check(!document.body.classList.contains('mobile-proof-typing')&&getComputedStyle($('header')).display!=='none','dismissing the keyboard restores headers even if the input remains focused');
 }finally{
  $('#statement').blur();if(descriptor)Object.defineProperty(window,'visualViewport',descriptor);else delete window.visualViewport;
  updateMobileViewport();
 }
}
