const SAVE_FORMAT='euclid-workshop', SAVE_VERSION=1;
function saveDocument(){remember();return {format:SAVE_FORMAT,version:SAVE_VERSION,activeProposition:index,progress:structuredClone(saved)}}
function validateSave(data){
 const fail=()=>{throw new Error('This is not a valid Euclid workshop save file.')};
 const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
 if(!object(data)||data.format!==SAVE_FORMAT||data.version!==SAVE_VERSION||!Number.isInteger(data.activeProposition)||data.activeProposition<0||data.activeProposition>=LESSONS.length||!object(data.progress))fail();
 let progress={};const justifications=new Set(['Given','Logic',...Object.values(REFERENCES).flat().map(r=>r[1])]);
 for(let [key,value] of Object.entries(data.progress)){
  if(!/^\d+$/.test(key)||Number(key)>=LESSONS.length||!object(value)||!object(value.points)||Object.keys(value.points).length>26)fail();
  let points={};for(let [name,p] of Object.entries(value.points)){if(!/^[A-Z]$/.test(name)||!Array.isArray(p)||p.length!==2||!p.every(n=>Number.isFinite(n)&&Math.abs(n)<=10000))fail();points[name]=[...p]}
  if(!Object.keys(LESSONS[Number(key)].points).every(n=>points[n]))fail();
  const segment=e=>typeof e==='string'&&/^[A-Z]{2}$/.test(e)&&e[0]!==e[1]&&points[e[0]]&&points[e[1]];
  for(let field of ['edges','rays'])if(!Array.isArray(value[field])||value[field].length>500||!value[field].every(segment))fail();
  if(!Array.isArray(value.circles)||value.circles.length>100||!value.circles.every(c=>object(c)&&segment(c.a+c.b)&&distance(points[c.a],points[c.b])>0))fail();
  const facts=new Set(['equilateral:D','copy:E','equalExtensions','superpose']);
  if(!Array.isArray(value.facts)||value.facts.length>300||!value.facts.every(f=>typeof f==='string'&&(facts.has(f)||validBookCertificate(f,points)||/^(?:equilateral:[A-Z]:[A-Z]:[A-Z]|copy:[A-Z]:[A-Z]:[A-Z]:[A-Z]|cut:[A-Z]:[A-Z]:[A-Z]:[A-Z]|superpose:[A-Z]{3}:[A-Z]{3})$/.test(f)&&[...f.split(':').slice(1).join('')].every(n=>points[n]))))fail();
  if(!Array.isArray(value.lines)||value.lines.length>500||!value.lines.every(l=>object(l)&&typeof l.s==='string'&&l.s.length<=500&&(l.j===null||justifications.has(l.j))))fail();
  progress[key]={points,edges:[...value.edges],rays:[...value.rays],circles:value.circles.map(c=>({a:c.a,b:c.b})),facts:[...value.facts],lines:value.lines.map(l=>({s:readableStatement(l.s),j:l.j})),completed:false};
 }
 if(!progress[data.activeProposition])fail();
 // Recheck derived validity instead of trusting flags supplied by the file.
 let previousIndex=index,previousState=state;
 try{for(let [key,value] of Object.entries(progress)){index=Number(key);state=value;value.completed=evaluate()}}finally{index=previousIndex;state=previousState}
 return {progress,activeProposition:data.activeProposition};
}
function restoreSave(data){const result=validateSave(data);saved=result.progress;load(result.activeProposition)}
function openMainMenu(){$('#jump-search').value='';closeTools();showMenuHome();$('#fresh-confirm').hidden=true;$('#save-status').textContent='';$('#jump-options').replaceChildren(...LESSONS.map((lesson,i)=>{let b=document.createElement('button');b.type='button';b.textContent=(i+1)+'. '+lesson.title;b.classList.toggle('current',i===index);b.onclick=()=>{load(i);$('#main-menu').close()};return b}));$('#main-menu').showModal()}
$('#main-menu-button').onclick=openMainMenu;
$('#resume-menu').onclick=$('#continue-menu').onclick=()=>$('#main-menu').close();
$('#fresh-menu').onclick=()=>{$('#fresh-confirm').hidden=false;$('#confirm-fresh').focus()};
$('#cancel-fresh').onclick=()=>{$('#fresh-confirm').hidden=true;$('#fresh-menu').focus()};
$('#confirm-fresh').onclick=()=>{saved={};load(0);$('#main-menu').close()};
$('#download-save').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(saveDocument(),null,2)],{type:'application/json'}));let link=document.createElement('a');link.href=url;link.download='euclid-workshop-save.json';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);$('#save-status').textContent='Save file downloaded. It includes progress throughout Book I.'};
$('#load-save').onclick=()=>showSavePoints();
$('#import-save').onclick=()=>$('#save-file').click();
async function loadSaveFileFromInput(e){let file=e.target.files[0];if(!file)return;try{if(file.size>1024*1024)throw new Error('Save files must be smaller than 1 MB.');restoreSave(JSON.parse(await file.text()));$('#save-status').textContent='';$('#main-menu').close()}catch(error){$('#save-status').textContent=error instanceof SyntaxError?'This file is not valid JSON. Your current progress is unchanged.':error.message+' Your current progress is unchanged.'}finally{e.target.value=''}}
$('#save-file').addEventListener('change',loadSaveFileFromInput);
const CHECKPOINT_KEY='euclid-workshop-checkpoints-v1';
function readSavePoints(){try{let points=JSON.parse(localStorage.getItem(CHECKPOINT_KEY)||'[]');return Array.isArray(points)?points:[]}catch{return []}}
function showMenuHome(){ $('#menu-home').hidden=false;$('#save-points-view').hidden=true;$('#save-status').textContent=''; }
function checkpointLabel(document){let p=document?.progress?.[document.activeProposition],number=document?.activeProposition;return Number.isInteger(number)&&number>=0&&number<LESSONS.length?'Proposition '+(number+1)+' - '+LESSONS[number].title+' - '+(p?.lines?.length||0)+' proof lines':'Saved workshop';}
function appendSavePoint(container,point,automatic=false){
 let button=document.createElement('button');button.type='button';button.className='save-point';let name=document.createElement('strong');name.textContent=point.name;let details=document.createElement('span');details.textContent=checkpointLabel(point.document);let time=document.createElement('small');let date=new Date(point.createdAt);time.textContent=(automatic?'Autosave - ':'')+(Number.isNaN(date.getTime())?'':date.toLocaleString());button.append(name,details,time);
 button.onclick=()=>{try{restoreSave(point.document);$('#main-menu').close()}catch{ $('#save-status').textContent='This save point could not be loaded. Your current progress is unchanged.'; }};container.append(button);
}
function showSavePoints(focusName=false){
 $('#menu-home').hidden=true;$('#save-points-view').hidden=false;$('#save-status').textContent='';
 let current=saveDocument(),updated;try{updated=localStorage.getItem('euclid-workshop-updated')}catch{}
 let container=$('#save-points-list');container.replaceChildren();appendSavePoint(container,{name:'Current workshop',createdAt:updated||new Date().toISOString(),document:current},true);
 const points=readSavePoints();for(let point of points)if(point&&typeof point.name==='string'&&point.document)appendSavePoint(container,point);
 if(!points.length){let empty=document.createElement('p');empty.className='empty';empty.textContent='No named save points yet. Save your current progress above.';container.append(empty);}
 if(focusName)$('#save-point-name').focus();else container.querySelector('button')?.focus();
}
function createSavePoint(name){
 const points=readSavePoints();
 let point={id:crypto.randomUUID(),name:name.trim(),createdAt:new Date().toISOString(),document:saveDocument()};if(!point.name)throw new Error('Give your save point a name.');
 try{localStorage.setItem(CHECKPOINT_KEY,JSON.stringify([point,...points]))}catch{throw new Error('This browser could not store the save point. Use Export file to keep your progress.');}
 return point;
}
$('#save-point-menu').onclick=()=>showSavePoints(true);
$('#back-from-saves').onclick=()=>{showMenuHome();$('#load-save').focus()};
$('#save-point-form').onsubmit=e=>{e.preventDefault();try{let point=createSavePoint($('#save-point-name').value);$('#save-point-name').value='';showSavePoints();$('#save-status').textContent='Saved "'+point.name+'".';}catch(error){$('#save-status').textContent=error.message}};
$('#jump-search').oninput=()=>{let query=$('#jump-search').value.toLowerCase();for(let button of $('#jump-options').children)button.hidden=!button.textContent.toLowerCase().includes(query)};
openMainMenu();
