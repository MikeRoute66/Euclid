addEventListener('load',()=>{
 let failures=0,count=0,results=[];const check=(ok,message)=>{count++;if(!ok){failures++;results.push('FAIL '+message)}};
 try{
  $('#continue-menu').click();saved={};Object.assign(settings,DEFAULT_SETTINGS);
  for(let i=0;i<48;i++){
   load(i);state=fresh();let lesson=LESSONS[i],entries=AngleVisual.catalog(lesson),before=JSON.stringify(entries),geometry=suppliedConstruction(i);
   check(new Set(entries.map(e=>e.color)).size===entries.length,'E.'+(i+1)+' angle names unique');
   for(let e of entries){check(AngleVisual.resolve(e.color+' = '+e.color,lesson)==='angle '+e.angle+' = angle '+e.angle,'E.'+(i+1)+' bare color alias '+e.color);check(AngleVisual.resolve('ANGLE '+e.color.toUpperCase()+' = 2 '+e.color+' angle',lesson)==='angle '+e.angle+' = 2 angle '+e.angle,'color casing, optional angle, and coefficients '+e.color);check(AngleVisual.key(e.angle)===AngleVisual.key([...e.angle].reverse().join('')),'reversed angle keeps key')}
   state={...fresh(),...geometry,lines:(lesson.proofGuide||lesson.hintSteps).map(l=>({s:l.s,j:l.j}))};render();
   check(JSON.stringify(AngleVisual.catalog(lesson))===before,'E.'+(i+1)+' colors stable after construction');
   const d=EuclidLogic.diagram(state,state.lines.filter(l=>l.valid).map(l=>BookOneLogic.parse(l.s)).filter(Boolean)),expected=entries.filter(e=>[...e.angle].every(n=>state.points[n])&&d.drawn(e.angle[1],e.angle[0])&&d.drawn(e.angle[1],e.angle[2]));
   check([...document.querySelectorAll('.angle-sector')].every(n=>expected.some(e=>e.angle===n.dataset.angle&&e.color===n.dataset.color)),'E.'+(i+1)+' arcs match their construction and assigned colors');
   check(entries.every(e=>{let [a,v,b]=[...e.angle].map(n=>state.points[n]);if(!a||!v||!b||!d.drawn(e.angle[1],e.angle[0])||!d.drawn(e.angle[1],e.angle[2]))return true;let cross=(a[0]-v[0])*(b[1]-v[1])-(a[1]-v[1])*(b[0]-v[0]),dot=(a[0]-v[0])*(b[0]-v[0])+(a[1]-v[1])*(b[1]-v[1]);return Math.abs(cross)<1e-8&&dot>0||!!document.querySelector('[data-angle="'+e.angle+'"]')}),'E.'+(i+1)+' every constructed expected angle has a filled sector');
   check(!document.querySelector('.angle-sector[d*="NaN"]'),'E.'+(i+1)+' no invalid arc geometry');
   let line=state.lines.findIndex(l=>/angle|\u2220|\b[A-Z]{2}\b/.test(l.s));if(line>=0){let row=$('#lines').children[line],savedState=JSON.stringify(state);row.dispatchEvent(new MouseEvent('mouseenter'));let highlights=[...document.querySelectorAll('.proof-highlight')];check(highlights.length>0,'E.'+(i+1)+' hover highlights relevant geometry');check(highlights.every(n=>n.getAttribute('transform').includes('scale(1.1)')),'hover scales exactly ten percent');row.dispatchEvent(new MouseEvent('mouseleave'));check(!document.querySelector('.proof-highlight,.proof-highlight-overlay')&&JSON.stringify(state)===savedState,'hover leaves construction/proof records unchanged')}
  }
  // Exercise every statement, not just the first length/angle in a lesson.
  for(let i=0;i<48;i++){
   load(i);state={...fresh(),...suppliedConstruction(i),lines:(LESSONS[i].proofGuide||LESSONS[i].hintSteps).map(l=>({s:l.s,j:l.j}))};render();
   for(let [lineIndex,line] of state.lines.entries()){
    const before=JSON.stringify(state),row=$('#lines').children[lineIndex],ast=BookOneLogic.parse(line.s);row.dispatchEvent(new MouseEvent('mouseenter'));
    check([...new Set(BookOneLogic.statementNames(ast))].filter(n=>state.points[n]).every(n=>document.querySelector('.point.proof-highlight[data-point="'+n+'"]')),'E.'+(i+1)+' hovered statement highlights every named point: '+line.s);
    const figures=ast.kind==='shape'?[ast.polygon]:ast.kind==='congruence'?[ast.a,ast.b]:ast.kind==='inside'?[ast.triangle]:['eq','gt'].includes(ast.kind)?[...ast.left,...ast.right].filter(t=>t.kind==='area').map(t=>t.term.slice(5,-1)):[];
    check(figures.every(p=>document.querySelector('.proof-highlight-figure[data-figure="'+p+'"]')),'E.'+(i+1)+' figure/area gets a filled whole-figure highlight: '+line.s);
    const frame=$('#canvas').getBoundingClientRect();check([...document.querySelectorAll('.proof-highlight-figure')].every(p=>{let r=p.getBoundingClientRect();return r.left>=frame.left-4&&r.right<=frame.right+4&&r.top>=frame.top-4&&r.bottom<=frame.bottom+4}),'E.'+(i+1)+' enlarged figures stay visible in the frame: '+line.s);
    if(i===46&&line.s==='BC^2 = AB^2 + AC^2')check(document.querySelectorAll('.proof-highlight-figure').length===3,'Pythagorean area statement highlights all three constructed squares');
    check([...document.querySelectorAll('.proof-highlight')].every(n=>Math.abs(n.transform.baseVal.consolidate().matrix.a-1.1)<1e-6),'every geometry type enlarges exactly ten percent');
    row.dispatchEvent(new MouseEvent('mouseleave'));check(!document.querySelector('.proof-highlight,.proof-highlight-overlay')&&before===JSON.stringify(state),'all hover effects restore without changing construction or proof');
   }
   for(let step of LESSONS[i].proofGuide||LESSONS[i].hintSteps){let reason=proofStepReason(LESSONS[i],step);check(reason.split(/\s+/).length<=60,'E.'+(i+1)+' concise guidance: '+step.s);check(!/hypothetical|transitivity|admissible|coefficients|correspondence|premises/i.test(reason),'E.'+(i+1)+' plain guidance: '+step.s)}
  }
  load(27);state=fresh();settings.skipJustifications=true;render();let a=AngleVisual.catalog(LESSONS[27]).find(e=>e.key===AngleVisual.key('EGB')),b=AngleVisual.catalog(LESSONS[27]).find(e=>e.key===AngleVisual.key('AGH'));
  $('#statement').value=a.color+' = '+b.color;$('#lineform').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));check(state.lines.at(-1).valid&&state.lines.at(-1).autoJustification==='I15','color equality goes through the real input form and auto-justifies');check(state.lines.at(-1).s==='angle '+a.angle+' = angle '+b.angle,'posted aliases store canonical angles');
  let stored=saveDocument();restoreSave(stored);check(state.lines.at(-1).valid&&state.lines.at(-1).s.includes('angle '),'color-entered proof survives save/load');
  check(AngleVisual.resolve('RED is equilateral',LESSONS[27])==='RED is equilateral','color aliases do not steal geometric figure names');
  check(AngleVisual.resolve('right angle = right angle',LESSONS[27])==='right angle = right angle','right-angle constant remains unchanged');
  let snapshot=JSON.stringify(state);AngleVisual.highlight($('#canvas'),'angle EGB = angle AGH',state,LESSONS[27]);check(document.querySelectorAll('.angle-sector.proof-highlight').length>=2,'matching angle sectors highlight alongside their arms');AngleVisual.clear($('#canvas'));check(JSON.stringify(state)===snapshot,'highlighting is purely visual');
  check([...document.querySelectorAll('#lines .angle-reference')].every(n=>n.title.includes(' = angle ')),'proof angles expose usable color names');
  for(let mask=0;mask<16;mask++){
   Object.assign(settings,{skipConstruction:!!(mask&1),skipProof:!!(mask&2),skipJustifications:!!(mask&4),learningMode:!!(mask&8)});load(27);state={...fresh(),...suppliedConstruction(27)};render();
   check(document.querySelectorAll('.angle-sector').length===3,'angle sectors in practice/learning combination '+mask);
   if(settings.skipProof)check(document.querySelectorAll('#lines .angle-reference').length>=4,'supplied proof keeps angle colors in combination '+mask);
  }
  Object.assign(settings,DEFAULT_SETTINGS);load(0);state=fresh();render();check(!document.querySelector('.angle-sector'),'missing construction arms never create angle sectors');
  check(document.body.scrollHeight===document.body.clientHeight&&document.body.scrollWidth===document.body.clientWidth,'angle UI fits the viewport');
 }catch(e){check(false,e.stack)}
 results.push(failures?'FAILED '+failures+' checks':'ALL CHECKS PASSED ('+count+' angle/color/highlight checks)');let pre=document.createElement('pre');pre.id='qa-result';pre.textContent=results.join('\n');document.body.replaceChildren(pre);document.body.style.cssText='display:block;height:auto;overflow:auto';
});
