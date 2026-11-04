const $=s=>document.querySelector(s), ns='http://www.w3.org/2000/svg';
let index=0,state,tool=null,picks=[],tab=null,history=[],drag=null,editingLine=null;
let saved={};try{saved=JSON.parse(localStorage.getItem('euclid-workshop-v1')||'{}')}catch{}
const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
// Lengths are undirected, angles may reverse their rays, and equality is symmetric.
function magnitude(s){if(/^[A-Z]{2}$/.test(s))return [...s].sort().join('');if(/^∠[A-Z]{3}$/.test(s)){let a=s.slice(1),b=[...a].reverse().join('');return '∠'+[a,b].sort()[0]}return s}
function equality(s){let text=s.toUpperCase().replace(/\s/g,'').replace(/ANGLE/g,'∠'),parts=text.split('=');if(parts.length!==2||!parts.every(p=>/^(?:[A-Z]{2}|∠[A-Z]{3})$/.test(p)))return null;return parts.map(magnitude)}
function readableStatement(s){return s.replace(/Equilateral\(([A-Z]{3})\)/gi,'$1 is equilateral').replace(/Congruent\(([A-Z]{3}),\s*([A-Z]{3})\)/gi,'$1 is congruent to $2').replace(/Superpose\(([A-Z]{3}),\s*([A-Z]{3})\)/gi,'$1 is superposed on $2')}
function triangleStatement(s){
 let text=readableStatement(s).toUpperCase().replace(/\bTRIANGLES?\b/g,'').replace(/[\u25b3\u0394]/g,'').replace(/\s/g,'').replace(/\.$/,'');
 let unary=text.match(/^([A-Z]{3})IS(EQUILATERAL|ISOSCELES|SCALENE)$/);
 if(unary&&new Set(unary[1]).size===3)return unary[2]+':'+[...unary[1]].sort().join('');
 let binary=text.match(/^([A-Z]{3})IS(CONGRUENTTO|SUPERPOSEDON)([A-Z]{3})$/);
 if(!binary){let both=text.match(/^([A-Z]{3})AND([A-Z]{3})ARE(CONGRUENT|SUPERPOSED)$/);if(both)binary=[both[0],both[1],both[3]==='CONGRUENT'?'CONGRUENTTO':'SUPERPOSEDON',both[2]];}
 if(!binary||new Set(binary[1]).size!==3||new Set(binary[3]).size!==3)return null;
 // Sort pairs of corresponding vertices, not each triangle independently.
 let a=[...binary[1]],b=[...binary[3]],forward=a.map((v,i)=>v+'='+b[i]).sort().join(','),reverse=b.map((v,i)=>v+'='+a[i]).sort().join(',');
 return binary[2]+':'+[forward,reverse].sort()[0];
}
function norm(s){let pair=equality(s);return pair?pair.sort().join('='):triangleStatement(s)||s.toUpperCase().replace(/\s/g,'').replace(/\u25b3/g,'').replace(/ANGLE/g,'\u2220')}

function remember(){try{saved[index]=state;localStorage.setItem('euclid-workshop-v1',JSON.stringify(saved));localStorage.setItem('euclid-workshop-active',String(index));localStorage.setItem('euclid-workshop-updated',new Date().toISOString())}catch{}}
function snapshot(){history.push(JSON.stringify(state));if(history.length>50)history.shift()}
function fresh(){let value={points:structuredClone(LESSONS[index].points),edges:[...LESSONS[index].edges],circles:[],rays:[],facts:[],lines:[]};EuclidConstruction.initialize(value,LESSONS[index]);return value}
function load(i){index=i;state=saved[i]||fresh();if(!state.topology)EuclidConstruction.initialize(state,LESSONS[i]);state.lines.forEach(l=>l.s=readableStatement(l.s));tool=null;tab=null;picks=[];editingLine=null;resetLineForm();history=[];$('#title').textContent=LESSONS[i].title;$('#description').textContent=LESSONS[i].description;$('#given').textContent=LESSONS[i].given;render();renderTools()}
function el(tag,attrs){let e=document.createElementNS(ns,tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));return e}
function addEdge(a,b){if(a===b)return;EuclidConstruction.edge(state,a,b);let key=a+b;if(!state.edges.some(e=>e===key||e===b+a))state.edges.push(key)}
function has(need){let [type,a,b]=need.split(':');if(type==='point')return !!state.points[a];if(type==='edge')return state.edges.includes(a)||state.edges.includes(a.split('').reverse().join(''));if(type==='circle')return state.circles.some(c=>c.a===a&&c.b===b);return state.facts.includes(need)}
function evaluate(){return EuclidLogic.grade(state,LESSONS[index]).complete}
function render(){if(drag)clearCanvasGesture();let completed=evaluate();state.completed=completed;renderChapterNavigation();
let svg=$('#canvas');svg.replaceChildren();state.circles.forEach(c=>{let a=state.points[c.a],b=state.points[c.b];svg.append(el('circle',{cx:a[0],cy:a[1],r:distance(a,b),class:'circle'}))});state.rays.forEach(r=>{let a=state.points[r[0]],b=state.points[r[1]],v=[b[0]-a[0],b[1]-a[1]];svg.append(el('path',{d:`M ${a} L ${[a[0]+v[0]*4,a[1]+v[1]*4]}`,class:'ghost'}))});state.edges.forEach(e=>{let a=state.points[e[0]],b=state.points[e[1]];svg.append(el('line',{x1:a[0],y1:a[1],x2:b[0],y2:b[1],class:'edge'}))});Object.entries(state.points).forEach(([name,p])=>svg.append(el('circle',{cx:p[0],cy:p[1],r:picks.includes(name)?9:6,class:'point','data-point':name})));
$('#instruction').textContent=tool?displayReference(toolText()): 'Select a postulate below to begin your construction';$('#count').textContent=state.lines.length+' lines';$('#lines').replaceChildren(...state.lines.map((l,i)=>{let row=document.createElement('div');row.className='proofline '+(l.valid?'valid':'');row.tabIndex=0;row.setAttribute('role','button');row.setAttribute('aria-label',l.s+'. '+(l.valid?'Valid':l.error));let num=document.createElement('span');num.className='num';num.textContent=String(i+1).padStart(2,'0');let content=document.createElement('div'),strong=document.createElement('strong'),small=document.createElement('small');strong.textContent=l.s;small.textContent=l.valid?referenceName(l.j):displayReference(l.error);let edit=document.createElement('button');edit.type='button';edit.className='edit-line';edit.textContent='Edit';edit.setAttribute('aria-label','Edit proof line '+(i+1));edit.onclick=e=>{e.stopPropagation();beginEdit(i)};let remove=document.createElement('button');remove.type='button';remove.className='delete-line';remove.textContent='Delete';remove.setAttribute('aria-label','Delete proof line '+(i+1));remove.onclick=e=>{e.stopPropagation();deleteProofLine(i)};content.append(strong,edit,remove,small);let status=document.createElement('span');status.className='status';status.textContent=l.valid?'✓':'!';row.append(num,content,status);row.oncontextmenu=e=>{if(l.valid){e.preventDefault();modal('PROOF ARGUMENT',l.derivation?.name||referenceName(l.j),l.derivation?['Earlier propositions: '+l.derivation.dependencies.map(n=>'I.'+n).join(', '),...l.derivation.steps]:[l.reason||referenceName(l.j),'Earlier proof lines: '+(l.dependencies||[]).join(', ')])}};row.onclick=()=>{if(tool){snapshot();l.j=tool[1];render()}};row.onkeydown=e=>{if(e.target!==row)return;if(e.key==='Enter'||e.key===' '){e.preventDefault();row.click()}};return row}));$('#complete').hidden=!completed;if(completed){$('#complete').textContent='∎ Proposition established. Your construction and every proof line are justified.';if(index<LESSONS.length-1){let next=document.createElement('button');next.textContent='Continue to Proposition E.'+(index+2)+' →';next.onclick=()=>load(index+1);$('#complete').append(next)}}fitConstructionView();constructionLabelLayout(svg);remember()}
function referenceName(id){if(id==='Logic')return 'Deduction - derived Euclidean argument';if(id==='Given')return 'Given - Hypothesis';for(let group of Object.values(REFERENCES)){let r=group.find(t=>t[1]===id);if(r)return displayReference(id)+' · '+r[0]}return id}
function toolText(){if(index>=5){let instruction=bookToolInstruction();if(instruction)return instruction;}let mode=tool[3];return ({point:'Click an intersection to mark a point',line:'Click two endpoints'+(picks.length?' · first: '+picks[0]:''),circle:'Click a center, then a circumference point'+(picks.length?' · center: '+picks[0]:''),extend:'Click the start, then the point to extend beyond',equilateral:'Click two endpoints for an equilateral triangle',copy:'Click destination, then source endpoints ('+picks.length+'/3)',cut:'Click A to mark equal extensions on AB and AC',superpose:'Drag A onto D to superpose · or click a proof line'})[mode]||'Click a proof line to apply '+tool[1]}
function hideToolName(){let tip=$('#tool-name');if(tip)tip.hidden=true;document.querySelectorAll('[aria-describedby="tool-name"]').forEach(b=>b.removeAttribute('aria-describedby'));}
function showToolName(button,name){let tip=$('#tool-name');if(!tip){tip=document.createElement('div');tip.id='tool-name';tip.setAttribute('role','tooltip');document.body.append(tip);}hideToolName();tip.textContent=name;tip.hidden=false;button.setAttribute('aria-describedby','tool-name');let r=button.getBoundingClientRect(),t=tip.getBoundingClientRect();tip.style.left=Math.max(8,Math.min(r.left+(r.width-t.width)/2,innerWidth-t.width-8))+'px';tip.style.top=Math.max(8,r.top-t.height-7)+'px';}
window.addEventListener('resize',hideToolName);
function inspectReference(reference){hideToolName();let body=[reference[2]];if(reference[1].startsWith('I'))body.unshift(LESSONS[Number(reference[1].slice(1))-1].description);if(reference[1]==='Given')body=[LESSONS[index].given];modal(reference[1]+' - FULL REFERENCE',reference[0],body);}
function bindReferenceInspection(button,reference){button.addEventListener('contextmenu',e=>{e.preventDefault();e.stopPropagation();inspectReference(reference)});button.addEventListener('keydown',e=>{if(e.key==='ContextMenu'||(e.shiftKey&&e.key==='F10')){e.preventDefault();e.stopPropagation();inspectReference(reference)}});}
function selectReference(reference){clearCanvasGesture();tool=reference;picks=[];$('#selected').textContent='Selected: '+displayReference(reference[1]);closeTools();render();}
function closeTools(restoreFocus=false){hideToolName();let previous=tab;tab=null;renderTools();if(restoreFocus&&previous)document.querySelector('[data-tab="'+previous+'"]').focus();}
function renderTools(){
 document.querySelectorAll('[data-tab]').forEach(b=>{let open=b.dataset.tab===tab;b.classList.toggle('active',open);b.setAttribute('aria-expanded',String(open));});
 hideToolName();
 $('#toolpopup').hidden=!tab;
 if(tab)$('#toolpopup').style.setProperty('--menu-column',Object.keys(REFERENCES).indexOf(tab));
 $('#given-tool').classList.toggle('active',tool?.[1]==='Given');
 if(!tab){$('#tools').replaceChildren();return;}
 const labels={definitions:'Definitions - 23',postulates:'Postulates - 5',notions:'Common notions - 5',propositions:'Proven propositions'};
 $('#popup-title').textContent=labels[tab];
 $('#tools').onscroll=hideToolName;
 $('#tools').replaceChildren(...REFERENCES[tab].map(t=>{
  let b=document.createElement('button');b.className='tool '+(tool?.[1]===t[1]?'active':'');
  let code=document.createElement('span');code.textContent=displayReference(t[1]);b.append(code);
  b.setAttribute('aria-label',displayReference(t[1])+': '+t[0]+'. Right-click for full reference.');
  bindReferenceInspection(b,t);
  b.addEventListener('mouseenter',()=>showToolName(b,t[0]));
  b.addEventListener('mouseleave',hideToolName);
  b.addEventListener('focus',()=>showToolName(b,t[0]));
  b.addEventListener('blur',hideToolName);
  if(tab==='propositions'&&Number(t[1].slice(1))>index){b.disabled=true;b.title='Available in a later lesson';}
  b.onclick=()=>{selectReference(t);document.querySelector('[data-tab="'+(t[1].startsWith('CN')?'notions':t[1].startsWith('D')?'definitions':t[1].startsWith('P')?'postulates':'propositions')+'"]').focus();};return b;
 }));
}
function coords(e){let p=$('#canvas').createSVGPoint();p.x=e.clientX;p.y=e.clientY;let q=p.matrixTransform($('#canvas').getScreenCTM().inverse());return [q.x,q.y]}
function intersectionCandidates(){return bookOneIntersections()}
function mark(p){bookOneMark(p)}
function choosePoint(name){if(!tool)return;if(tool[3]==='point'){snapshot();EuclidConstruction.intersection(state,name);render();return;}if(index>=5||!(tool[3]==='copy'&&index===2||tool[3]==='cut'&&index===4)){if(bookOneChoosePoint(name))return;}let mode=tool[3];if(mode==='point')return;if(!['line','extend','circle','equilateral','copy','cut'].includes(mode))return;picks.push(name);let required=mode==='copy'?3:mode==='cut'?1:2;if(picks.length<required){render();return}let [a,b,c]=picks;picks=[];snapshot();if(mode==='line')addEdge(a,b);if(mode==='extend'&&a!==b&&!state.rays.includes(a+b))state.rays.push(a+b);if(mode==='circle'&&a!==b&&!state.circles.some(c=>c.a===a&&c.b===b))state.circles.push({a,b});if(mode==='equilateral'&&a!==b){let A=state.points[a],B=state.points[b],n=index===1?'D':'H';if(!state.points[n]){state.points[n]=[(A[0]+B[0])/2+(B[1]-A[1])*Math.sqrt(3)/2,(A[1]+B[1])/2-(B[0]-A[0])*Math.sqrt(3)/2];addEdge(a,b);addEdge(n,a);addEdge(n,b);state.facts.push('equilateral:'+n+':'+a+':'+b);if(index===1&&[a,b].includes('A')&&[a,b].includes('B'))state.facts.push('equilateral:D')}}if(mode==='copy'&&index===2&&a==='A'&&[b,c].includes('C')&&[b,c].includes('D')){state.points.E=[state.points.A[0],state.points.A[1]-distance(state.points.C,state.points.D)];addEdge('A','E');state.facts.push('copy:E','copy:A:E:C:D')}if(mode==='cut'&&index===4&&a==='A'&&state.rays.includes('AB')&&state.rays.includes('AC')){let A=state.points.A;for(let [b,n] of [['B','F'],['C','G']]){let B=state.points[b];state.points[n]=[A[0]+1.6*(B[0]-A[0]),A[1]+1.6*(B[1]-A[1])];addEdge(b,n);EuclidConstruction.support(state,'A'+b,n)}state.facts.push('equalExtensions','cut:A:F:A:G')}render()}
installCanvasInput();
function resetLineForm(){editingLine=null;$('#lineform label').textContent='Your next statement';$('#lineform button[type="submit"]').textContent='+ Add a line';$('#cancel-edit').hidden=true;$('#statement').value='';updateFormatHelp();}
function deleteProofLine(i){snapshot();state.lines.splice(i,1);if(editingLine===i)resetLineForm();else if(editingLine!==null&&editingLine>i){editingLine--;$('#lineform label').textContent='Editing line '+(editingLine+1)}render()}
function beginEdit(i){editingLine=i;$('#statement').value=state.lines[i].s;$('#lineform label').textContent='Editing line '+(i+1);$('#lineform button[type="submit"]').textContent='Save changes';$('#cancel-edit').hidden=false;$('#statement').focus();$('#statement').select();updateFormatHelp();$('#lineform').scrollIntoView({block:'nearest'});}
$('#cancel-edit').onclick=()=>resetLineForm();
$('#statement').addEventListener('keydown',e=>{if(e.key==='Escape'&&editingLine!==null){e.preventDefault();resetLineForm();}});
$('#lineform').onsubmit=e=>{e.preventDefault();let value=$('#statement').value.trim();if(!value)return;snapshot();if(editingLine===null)state.lines.push({s:value,j:null});else state.lines[editingLine].s=value;resetLineForm();render();};
document.querySelectorAll('[data-tab]').forEach(b=>{
 b.onclick=()=>{tab=tab===b.dataset.tab?null:b.dataset.tab;renderTools()};
 b.addEventListener('keydown',e=>{if(e.key==='ArrowUp'||e.key==='ArrowDown'){e.preventDefault();tab=b.dataset.tab;renderTools();$('#tools button:not(:disabled)')?.focus();}});
});
$('#close-tools').onclick=()=>closeTools(true);
$('#logic-tool').onclick=()=>selectReference(LOGIC_REFERENCE);
bindReferenceInspection($('#logic-tool'),LOGIC_REFERENCE);
$('#given-tool').onclick=()=>selectReference(GIVEN_REFERENCE);
bindReferenceInspection($('#given-tool'),GIVEN_REFERENCE);
document.addEventListener('pointerdown',e=>{if(tab&&!e.target.closest('.shelf'))closeTools();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&tab){e.preventDefault();closeTools(true);}});
$('#undo').onclick=()=>{if(history.length){state=JSON.parse(history.pop());picks=[];resetLineForm();render()}};$('#reset').onclick=()=>{snapshot();state=fresh();picks=[];resetLineForm();render()};
function modal(k,t,body){$('#modalkicker').textContent=displayReference(k);$('#modaltitle').textContent=displayReference(t);$('#modalbody').replaceChildren();for(let text of body){let p=document.createElement('p');p.textContent=displayReference(text);$('#modalbody').append(p)}$('#modal').showModal()}
function nextHint(){
 if(evaluate())return 'This proposition is complete. Your conclusion follows from the justified proof.';
 if(editingLine!==null)return 'You are editing line '+(editingLine+1)+'. Finish the statement and click Save changes, or Cancel edit to return to the proof.';
 const step=(done,text)=>({done,text}),fact=has;
 const plans=[
  [step(fact('circle:A:B'),'Click A and B to draw the circle centered at A through B.'),step(fact('circle:B:A'),'Click B and A to draw the circle centered at B through A.'),step(fact('point:C'),'Click an intersection of the two circles to mark C.'),step(fact('edge:AC'),'Click A and C to join them.'),step(fact('edge:BC'),'Click B and C to join them.')],
  [step(fact('edge:AB'),'Click A and B to join them.'),step(fact('equilateral:D'),'Click A and B to construct equilateral triangle DAB.'),step(state.rays.includes('DB'),'Click D and B to extend DB beyond B.'),step(fact('circle:B:C'),'Click B and C to draw the circle centered at B through C.'),step(fact('point:G'),'Mark G where the circle centered at B meets the extension of DB beyond B.'),step(state.rays.includes('DA'),'Click D and A to extend DA beyond A.'),step(fact('circle:D:G'),'Click D and G to draw the circle centered at D through G.'),step(fact('point:L'),'Mark L where the circle centered at D meets the extension of DA beyond A.'),step(fact('edge:AL'),'Click A and L to join them.')],
  [step(fact('copy:E'),'Click A, then C and D, to transfer length CD to AE.'),step(fact('circle:A:E'),'Click A and E to draw the circle centered at A through E.'),step(fact('point:F'),'Click the intersection of this circle with segment AB to mark F.')],
  [],
  [step(state.rays.includes('AB'),'Click A and B to extend AB beyond B.'),step(state.rays.includes('AC'),'Click A and C to extend AC beyond C.'),step(fact('equalExtensions'),'Click A to mark F and G at equal distances from A on the extensions.'),step(fact('edge:FC'),'Click F and C to join them.'),step(fact('edge:GB'),'Click G and B to join them.')]
 ];
 const construction=(plans[index]||[]).find(s=>!s.done);
 if(construction)return construction.text+' Choose a tool that performs this construction.';
 if(index>=5)return bookOneHint();
 const valid=new Set(state.lines.filter(l=>l.valid).map(l=>norm(l.s)));
 const missing=LESSONS[index].hintSteps.find(r=>!valid.has(norm(r.s)));
 if(!missing){let bad=state.lines.findIndex(l=>!l.valid);return bad<0?'This proposition is complete. Every proof line is justified. Continue to the next proposition when ready.':'The result is established, but line '+(bad+1)+' still needs correction. Use Edit: '+hintFeedback(state.lines[bad].error);}
 if(index===3&&missing.needs.includes('superpose')&&!fact('superpose'))return 'Drag A onto D, or click A then D, to superpose triangle ABC on DEF. The given equal sides and included angle make their vertices coincide.';
 const existing=state.lines.findIndex(l=>norm(l.s)===norm(missing.s));
 const reasoning=proofStepReason(LESSONS[index],missing);
 const earliestBad=state.lines.findIndex(l=>!l.valid);
 if(existing>=0){const dependencies=missing.deps.filter(d=>!state.lines.slice(0,existing).some(l=>l.valid&&norm(l.s)===norm(d)));if(dependencies.length)return 'Line '+(existing+1)+' needs '+dependencies.join('; ')+' established earlier. Use Edit to place the missing premise first, then add the dependent statement again afterward.';return 'Justify line '+(existing+1)+' ('+state.lines[existing].s+').\n\nReasoning: '+reasoning+'\n\nChoose a justification that matches this reasoning, then click that proof line.';}
 if(earliestBad>=0)return hintProofAction(missing.s,earliestBad)+' This premise must come before the later reasoning.\n\nReasoning: '+reasoning;
 return hintProofAction(missing.s,-1)+'\n\nReasoning: '+reasoning;
}
$('#hint').onclick=()=>modal('NEXT STEP','What to do next',nextHint().split('\n\n'));
$('#help').onclick=()=>modal('THE WORKSHOP','Construct. State. Justify.',['Choose a postulate, then click named points to draw. The point tool in Definitions marks intersections. Select earlier propositions to use their constructions. Given points are fixed; the drag interaction in I.4 demonstrates superposition.','Use [segment] = [segment], angle [vertices] = angle [vertices], [triangle] is equilateral, [triangle] is congruent to [triangle], or [triangle] is superposed on [triangle]. You can also add or subtract segment lengths and angles with + and -. Triangle names may use any vertex order for a property such as equilateral. Congruence and superposition accept matching reorderings of both triangles, preserving corresponding vertices. Formatting help uses only your own words and point names. The grader parses statements and checks inference rules against construction evidence and earlier justified premises. It supports equality, addition and subtraction of segments and angles, circle radii, equilateral triangles, and side-angle-side congruence; it is a Euclidean calculus rather than an unrestricted natural-language prover. Book I also supports parallel/perpendicular lines, collinearity, right angles, inequalities, area expressions, and squared lengths (use ^2). Deduction expands derived Euclidean arguments; right-click a justified line to inspect its reasoning. Deleting a line rechecks the proof and can be undone.','Additional formats: [line] is parallel to [line]; [line] is perpendicular to [line]; [vertices] are collinear; angle [vertices] is right; [polygon] is a parallelogram or square; area [polygon] = area [polygon]; [side]^2 = [side]^2 + [side]^2. Comparisons use =, >, or <.', 'Select a definition, common notion, or earlier proposition, then click a proof line to attach its justification. A red ! explains what is missing. Premises must occur earlier in the proof. Use Edit on any posted line to change its statement; its justification is retained and the proof is checked again. Equality accepts reversed sides and reversed segment endpoints. Undo removes the last edit. Progress saves in this browser.','Earlier propositions are available as assumed results when opening a later lesson directly. I.1 assumes circle intersection; I.4 uses Euclid’s superposition argument; shared angles and collinearity are implicit diagram facts.']);$('#closemodal').onclick=()=>$('#modal').close();
let initialProposition=0;try{let value=Number(localStorage.getItem('euclid-workshop-active'));if(Number.isInteger(value)&&value>=0&&value<LESSONS.length)initialProposition=value}catch{}
load(initialProposition);
