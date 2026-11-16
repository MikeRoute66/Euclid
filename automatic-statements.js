// Supply unusual statement wording only after the ordinary checker proves it.
// Record ordinary statement events so ranked replay uses the same proof rules.
const AutomaticStatements=(()=>{
 const ordinaryKinds=new Set(['eq','gt','right','shape','congruence','parallel','perpendicular','collinear','intersection','sameSide','inside','pointEqual']);
 const suppressed=new WeakMap();let queued=false;
 const signature=value=>JSON.stringify([constructionGeometry(value),value.lines.map(l=>[l.s,l.j]),settings.skipProof,settings.skipJustifications]);
 const special=step=>{let ast=BookOneLogic.parse(step.s);while(ast?.kind==='conditional')ast=ast.body;return step.j!=='Given'&&!!ast&&!ordinaryKinds.has(ast.kind)};
 function suppress(value){suppressed.set(value,signature(value))}
 function schedule(){
  if(queued||buildingPractice)return;
  queued=true;
  queueMicrotask(()=>{
   queued=false;
   if(buildingPractice||settings.skipProof||editingLine!==null||typeof Tutorial!=='undefined'&&Tutorial.usingMenus())return;
   const lesson=LESSONS[index],steps=(lesson.proofGuide||[]).filter(special);
   if(!steps.length||suppressed.get(state)===signature(state)||!constructionProgress(state,lesson).complete)return;
   const context=BookOneLogic.context(structuredClone(state),lesson);
   for(const line of state.lines){const ast=BookOneLogic.parse(line.s);if(line.valid&&ast)context.accept(ast,line.j||line.autoJustification)}
   for(const step of steps){
    const ast=BookOneLogic.parse(step.s);
    if(state.lines.some(line=>context.key(BookOneLogic.parse(line.s))===context.key(ast))||!context.check(ast,step.j).ok)continue;
    snapshot();const statement=readableStatement(step.s);
    state.lines.push({s:statement,j:null});
    if(typeof Ranked!=='undefined')Ranked.record({kind:'statement',statement,line:null});
    render();break;
   }
  });
 }
 return {schedule,suppress,special};
})();
