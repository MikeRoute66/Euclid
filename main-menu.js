const SAVE_FORMAT='euclid-workshop', SAVE_VERSION=2;
function saveDocument(){remember();return EuclidBooks.encode(saved,index)}
function validateSave(data){
 data=EuclidBooks.decode(data);
 const fail=()=>{throw new Error('This is not a valid Euclid workshop save file.')};
 const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
 if(!object(data)||data.format!==SAVE_FORMAT||data.version!==1||!Number.isInteger(data.activeProposition)||data.activeProposition<0||data.activeProposition>=LESSONS.length||!object(data.progress))fail();
 let progress={};const justifications=new Set(['Given','Logic',...Object.values(REFERENCES).flat().map(r=>r[1])]);
 for(let [key,value] of Object.entries(data.progress)){
  if(!/^\d+$/.test(key)||Number(key)>=LESSONS.length||!object(value)||!object(value.points)||Object.keys(value.points).length>26)fail();
  let points={};for(let [name,p] of Object.entries(value.points)){if(!/^[A-Z]$/.test(name)||!Array.isArray(p)||p.length!==2||!p.every(n=>Number.isFinite(n)&&Math.abs(n)<=10000))fail();points[name]=[...p]}
  if(!Object.keys(LESSONS[Number(key)].points).every(n=>points[n]||LESSONS[Number(key)].optionalInitialPoints?.includes(n)))fail();
  const segment=e=>typeof e==='string'&&/^[A-Z]{2}$/.test(e)&&e[0]!==e[1]&&points[e[0]]&&points[e[1]];
  for(let field of ['edges','rays'])if(!Array.isArray(value[field])||value[field].length>500||!value[field].every(segment))fail();
  if(!Array.isArray(value.circles)||value.circles.length>100||!value.circles.every(c=>object(c)&&segment(c.a+c.b)&&distance(points[c.a],points[c.b])>0&&(c.id===undefined||typeof c.id==='string'&&/^c[1-9]\d*$/.test(c.id))))fail();
  if(new Set(value.circles.map(c=>c.id).filter(Boolean)).size!==value.circles.filter(c=>c.id).length)fail();
  const facts=new Set(['equilateral:D','copy:E','equalExtensions','superpose']);
  if(!Array.isArray(value.facts)||value.facts.length>300||!value.facts.every(f=>typeof f==='string'&&(facts.has(f)||validBookCertificate(f,points)||/^(?:extend:[A-Z]:[A-Z]:[A-Z]|equilateral:[A-Z]:[A-Z]:[A-Z]|copy:[A-Z]:[A-Z]:[A-Z]:[A-Z]|cut:[A-Z]:[A-Z]:[A-Z]:[A-Z]|superpose:[A-Z]{3}:[A-Z]{3})$/.test(f)&&[...f.split(':').slice(1).join('')].every(n=>points[n]))))fail();
  for(let raw of value.facts)if(raw.startsWith('book:')&&!EuclidBooks.earlier(EuclidBooks.dependencyRule(JSON.parse(raw.slice(5)).rule),LESSONS[Number(key)]))fail();
  if(!Array.isArray(value.lines)||value.lines.length>500||!value.lines.every(l=>object(l)&&typeof l.s==='string'&&l.s.length<=500&&(l.j===null||justifications.has(l.j))))fail();
  if(value.topology&&!EuclidConstruction.valid(value.topology,points))fail();
  progress[key]={points,topology:value.topology?structuredClone(value.topology):undefined,edges:[...value.edges],rays:[...value.rays],circles:value.circles.map(c=>({a:c.a,b:c.b,...(c.id?{id:c.id}:{})})),arcs:structuredClone(value.arcs||[]),facts:[...value.facts],lines:value.lines.map(l=>({s:readableStatement(l.s,points),j:l.j})),completed:false,completionMode:typeof value.completionMode==='string'?value.completionMode:undefined};
  if(!EuclidCurves.valid(progress[key]))fail();
  for(let r of value.topology?.intersections||[])for(let support of r.supports)if(support.startsWith('arc:')&&!EuclidCurves.arc(progress[key],support.slice(4))?.points.includes(r.point))fail();
  if(value.completionMode!==undefined&&!PRACTICE_MODES.includes(value.completionMode))fail();
  for(let field of ['manualProof','practiceProof'])if(value[field]!==undefined){if(!Array.isArray(value[field])||value[field].length>500||!value[field].every(l=>object(l)&&typeof l.s==='string'&&l.s.length<=500&&(l.j===null||justifications.has(l.j))))fail();progress[key][field]=value[field].map(l=>({s:readableStatement(l.s,points),j:l.j}));}
  for(let field of ['manualConstruction','practiceConstruction'])if(value[field]!==undefined){if(!object(value[field]))fail();let geometry={...constructionGeometry(value[field]),lines:[]};let checked=validateSave({format:SAVE_FORMAT,version:1,activeProposition:Number(key),progress:{[key]:geometry}});progress[key][field]=constructionGeometry(checked.progress[key]);}

 }
 if(!progress[data.activeProposition])fail();
 for(let [key,value] of Object.entries(progress))if(!value.topology)EuclidConstruction.initialize(value,LESSONS[Number(key)]);
 // Recheck derived validity instead of trusting flags supplied by the file.
 for(let [key,value] of Object.entries(progress))value.completed=savedProgressComplete(value,LESSONS[Number(key)]);
 return {progress,activeProposition:data.activeProposition};
}
function restoreSave(data){const result=validateSave(data);saved=result.progress;load(result.activeProposition)}
function showMenuHome(){ $('#main-menu').classList.remove('options-open');$('#menu-home').hidden=false;$('#settings-view').hidden=true; }
function openMainMenu(){
 $('#jump-search').value='';closeTools();showMenuHome();
 $('#jump-options').replaceChildren(...LESSONS.map((lesson,i)=>{const button=document.createElement('button');button.type='button';button.textContent=EuclidBooks.reference(lesson)+' - '+lesson.title;button.classList.toggle('current',i===index);button.onclick=()=>{load(i);$('#main-menu').close()};return button}));
 $('#main-menu').showModal();
}
$('#main-menu-button').onclick=openMainMenu;
$('#resume-menu').onclick=$('#continue-menu').onclick=()=>$('#main-menu').close();
$('#tutorial-menu').onclick=()=>Tutorial.open();
$('#jump-search').oninput=()=>{const query=$('#jump-search').value.toLowerCase();for(const button of $('#jump-options').children)button.hidden=!button.textContent.toLowerCase().includes(query)};
installSettings();
openMainMenu();
