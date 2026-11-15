/* Conditional clauses keep hypothetical facts out of the ordinary ledger.
 * Circle rules consume recorded incidence, never drawing centers or radii. */
const BookThreeLogic=(()=>{
 const parseBase=s=>BookOneLogic.parse(s),sort=s=>[...s].sort().join('');
 function parse(text){let s=text.trim().replace(/\.$/,'').toUpperCase(),m;
  if((m=s.match(/^IF (.+?) THEN (.+)$/))){const condition=parse(m[1])||parseBase(m[1]),body=parse(m[2])||parseBase(m[2]);return condition&&body?{kind:'conditional',condition,body}:null}
  if((m=s.match(/^(.+?) AND (.+)$/))){const a=parse(m[1])||parseBase(m[1]),b=parse(m[2])||parseBase(m[2]);if(a&&b)return {kind:'conjunction',items:[a,b]}}
  if(s==='CONTRADICTION')return {kind:'contradiction'};
  if((m=s.match(/^([A-Z]) IS (?:THE |A )?CENT(?:ER|RE) OF CIRCLE (C\d+)$/)))return {kind:'circleCenter',point:m[1],circle:m[2]};
  if((m=s.match(/^([A-Z]) IS (OUTSIDE|ON) CIRCLE (C\d+) ON CHORD ([A-Z]{2})$/)))return {kind:'chordCounterexample',point:m[1],place:m[2].toLowerCase(),circle:m[3],chord:m[4]};
  if((m=s.match(/^([A-Z]{2}) IS (?:A )?DIAMETER OF CIRCLE (C\d+)$/)))return {kind:'diameter',line:m[1],circle:m[2]};
  if((m=s.match(/^([A-Z]) IS ON CIRCLE (C\d+)$/)))return {kind:'circleMember',point:m[1],circle:m[2]};
  if((m=s.match(/^([A-Z]) IS NOT (?:THE )?CENTER OF CIRCLE (C\d+)$/)))return {kind:'notCircleCenter',point:m[1],circle:m[2]};
  if((m=s.match(/^([A-Z]) (?:IS|LIES) INSIDE CIRCLE (C\d+)$/)))return {kind:'circleInterior',point:m[1],circle:m[2]};
  if((m=s.match(/^([A-Z]{2}) IS (?:A )?NONCENTRAL CHORD OF CIRCLE (C\d+)$/)))return {kind:'noncentralChord',chord:m[1],circle:m[2]};
  if((m=s.match(/^THE CENTER OF CIRCLE (C\d+) LIES ON ([A-Z]{2})$/)))return {kind:'centerLine',circle:m[1],line:m[2]};
  if((m=s.match(/^([A-Z]{2}) LIES INSIDE CIRCLE (C\d+)$/)))return {kind:'chordInside',chord:m[1],circle:m[2]};
  if((m=s.match(/^([A-Z]{2}) AND ([A-Z]{2}) DO NOT BISECT EACH OTHER$/)))return {kind:'notMutual',a:m[1],b:m[2]};
  if((m=s.match(/^CIRCLE (C\d+) AND CIRCLE (C\d+) HAVE DIFFERENT CENTERS$/)))return {kind:'differentCenters',circles:[m[1],m[2]].sort()};
  if((m=s.match(/^CIRCLE (C\d+) (CUTS|TOUCHES) CIRCLE (C\d+) AT ([A-Z])(?: AND ([A-Z]))?$/)))return {kind:'circleMeeting',circles:[m[1],m[3]].sort(),relation:m[2].toLowerCase(),points:m[4]+(m[5]||'')};
  if((m=s.match(/^([A-Z]{2}) IS (LONGEST|SHORTEST) FROM ([A-Z]) TO CIRCLE (C\d+)$/)))return {kind:'circleExtreme',segment:m[1],order:m[2].toLowerCase(),point:m[3],circle:m[4]};
  if((m=s.match(/^ONLY ([A-Z]) AND ([A-Z]) ON CIRCLE (C\d+) ARE AT DISTANCE ([A-Z]{2}) FROM ([A-Z])$/)))return {kind:'circlePair',a:m[1],b:m[2],circle:m[3],segment:m[4],point:m[5]};
  return null;
 }
 function names(t){if(t.kind==='conditional')return [...names(t.condition),...names(t.body)];if(t.kind==='conjunction')return t.items.flatMap(names);if(['eq','gt','right','shape','congruence','parallel','perpendicular','collinear','intersection','inside','sameSide'].includes(t.kind))return BookOneLogic.statementNames(t);return [...((t.point||'')+(t.line||'')+(t.chord||'')+(t.segment||'')+(t.a||'')+(t.b||'')+(t.points||''))].filter(n=>/[A-Z]/.test(n))}
 function key(t){
  if(t.kind==='conditional')return 'if:'+key(t.condition)+' then:'+key(t.body);
  if(t.kind==='conjunction')return 'and:'+t.items.map(key).sort().join('|');
  if(t.kind==='eq'||t.kind==='gt'){
   const term=s=>s.startsWith('\u2220')?'\u2220'+[s.slice(1),[...s.slice(1)].reverse().join('')].sort()[0]:/^[A-Z]{2}$/.test(s)?sort(s):s;
   const expression=items=>JSON.stringify(items.map(i=>[term(i.term),i.coefficient]).sort());
   const sides=[expression(t.left),expression(t.right)];return t.kind+':'+(t.kind==='eq'?sides.sort():sides).join('|');
  }
  const copy={...t};delete copy._reference;for(const field of ['line','chord','segment'])if(copy[field])copy[field]=sort(copy[field]);
  if(t.kind==='notMutual')[copy.a,copy.b]=[sort(t.a),sort(t.b)].sort();
  if(t.kind==='circlePair')[copy.a,copy.b]=[t.a,t.b].sort();
  return JSON.stringify(copy);
 }
 function centers(c,id){return [...BookThreeCircles.centerRecords(c.state).filter(r=>r.circle===id&&EuclidBooks.earlier('E3.1',c.lesson)).map(r=>r.output),...c.facts.filter(f=>f.kind==='circleCenter'&&f.circle===id).map(f=>f.point),...(c.state.scopedCenters||[]).filter(r=>r.circle===id).map(r=>r.point)]}
 function allItems(t){return t.kind==='conjunction'?t.items.flatMap(allItems):[t]}
 const scopeCache=new WeakMap();
 function scope(condition,c){
  let cache=scopeCache.get(c.facts);if(!cache){cache=new Map();scopeCache.set(c.facts,cache)}
  const id=key(condition),existing=cache.get(id);
  const append=(context,from)=>{for(const f of c.facts.slice(from))if(f.kind!=='conditional')context.accept(f,c.origin(f)||f._reference||'Given');else if(key(f.condition)===id)context.accept(f.body,f._reference||'Logic')};
  if(existing){append(existing.context,existing.count);existing.count=c.facts.length;return existing.context}
  const value=constructionGeometry(c.state),items=allItems(condition),givens=[];value.scopedCenters=[];
  for(const item of items){
   if(item.kind==='circleCenter'){if(!BookThreeCircles.circle(value,item.circle)||!value.points[item.point])return null;value.scopedCenters.push(item)}
   else if(item.kind==='eq'||item.kind==='perpendicular')givens.push(item);
   else if(item.kind==='chordCounterexample'){
    const circle=BookThreeCircles.circle(value,item.circle),center=centers(c,item.circle)[0];if(!circle||!center||![...item.chord].every(n=>BookThreeCircles.member(value,item.circle,n)))return null;
    const witness=(value.topology.intersections||[]).find(r=>r.supports.includes('given:'+circle.id)&&r.supports.some(s=>!s.includes(':')&&[...s].every(n=>c.d.collinear(center,item.point,n)||n===center||n===item.point)));
    if(!witness)return null;
    const ordered=item.place==='outside'?[item.chord[0]+item.point+item.chord[1],center+witness.point+item.point]:[item.chord[0]+item.point+item.chord[1],center+item.point+witness.point];
    for(const line of ordered){value.topology.lines.push(line);for(let i=0;i<line.length;i++)for(let j=i+1;j<line.length;j++){const a=line[i],b=line[j],k=sort(a+b);value.topology.directions[k]=a<b?1:-1}delete value.topology.turns[sort(line)]}
    if(item.place==='on')value.scopedCirclePoints=[{circle:item.circle,point:item.point}];
   }else return null;
  }
  const nested=BookOneLogic.context(value,c.lesson);
  for(const f of givens)nested.accept(f,'Given');
  append(nested,0);cache.set(id,{context:nested,count:c.facts.length});
  return nested;
 }
 function contradiction(c){
  const difference=t=>{const out=new Map(c.expr(t.left));for(const [k,n] of c.expr(t.right))out.set(k,(out.get(k)||0)-n);return out};
  const eq=c.facts.filter(f=>f.kind==='eq').map(difference),gt=c.facts.filter(f=>f.kind==='gt').map(difference);
  return gt.some(a=>BookOneLogic.span(a,eq)||gt.some(b=>{const sum=new Map(a);for(const [k,n] of b)sum.set(k,(sum.get(k)||0)+n);return BookOneLogic.span(sum,eq)}));
 }
 function check(t,reference,c){
  const ok=(explanation,dependencies=[],steps=[])=>({ok:true,error:'',explanation,sourcePropositions:dependencies,derivation:steps.length?{name:explanation,dependencies:dependencies.map(EuclidBooks.dependency),steps}:null});
  const has=s=>c.posted(parse(s)||parseBase(s));
  const conditionalContradictions=()=>c.facts.filter(f=>f.kind==='conditional'&&f.body.kind==='contradiction');
  if(t.kind==='conditional'){
   const nested=scope(t.condition,c);if(!nested)return {ok:false,error:'The conditional needs recorded circles, a valid assumption, and its auxiliary construction.'};
   const result=nested.check(t.body,reference);return result.ok?ok('Conditional argument: '+(result.explanation||reference),result.sourcePropositions||[],result.derivation?.steps||[]):result;
  }
  if(reference==='Given')return null;
  if(t.kind==='contradiction')return reference==='Logic'&&contradiction(c)?ok('Contradiction within this assumption'): {ok:false,error:'First establish an equality and an incompatible strict inequality in this same assumption.'};
  if(reference==='D15'&&t.kind==='eq'&&t.left.length===1&&t.right.length===1&&t.left[0].kind==='length'&&t.right[0].kind==='length'){
   const [x,y]=[t.left[0].term,t.right[0].term];
   for(const circle of BookThreeCircles.objects(c.state))for(const center of centers(c,circle.id)){
    const endpoint=s=>s[0]===center?s[1]:s[1]===center?s[0]:null,a=endpoint(x),b=endpoint(y),member=n=>BookThreeCircles.member(c.state,circle.id,n)||(c.state.scopedCirclePoints||[]).some(p=>p.circle===circle.id&&p.point===n);
    if(a&&b&&member(a)&&member(b))return ok('Equal radii of one recorded circle with an established center.');
   }
  }
  if(reference==='CN1'&&t.kind==='gt'){const result=c.check(t,'Logic');if(result.ok)return result}
  if(reference==='CN3'&&t.kind==='gt'){const result=c.check(t,'Logic');if(result.ok)return result}
  if(reference==='E3.1'){
   if(!EuclidBooks.earlier(reference,c.lesson))return {ok:false,error:'This proposition is not available yet.'};
   if(t.kind==='circleCenter'&&BookThreeCircles.centerRecords(c.state).some(r=>r.circle===t.circle&&r.output===t.point))return ok('Find the center by perpendicular bisectors.',['E3.1']);
  }
  if(/^E3\./.test(reference)&&!EuclidBooks.earlier(reference,c.lesson))return {ok:false,error:'Use an earlier proposition.'};
  if(reference==='E3.2'&&t.kind==='chordInside'&&[...t.chord].every(n=>BookThreeCircles.member(c.state,t.circle,n))&&c.d.drawn(...t.chord))return ok('The open chord joining two circle points lies inside.',['E3.2']);
  if(['E3.5','E3.6'].includes(reference)&&t.kind==='differentCenters'&&c.facts.some(f=>f.kind==='circleMeeting'&&key(f.circles)===key(t.circles)&&f.relation===(reference==='E3.5'?'cuts':'touches')))return ok('Distinct meeting circles cannot share a center. All meeting evidence is recorded.',[reference]);
  if(reference==='E3.4'&&t.kind==='notMutual'){
   for(const circle of BookThreeCircles.objects(c.state))for(const center of centers(c,circle.id))if([t.a,t.b].every(line=>[...line].every(n=>BookThreeCircles.member(c.state,circle.id,n))&&c.d.turn(...line,center)!==0)&&c.d.names.some(n=>c.d.between(t.a[0],n,t.a[1])&&c.d.between(t.b[0],n,t.b[1])))return ok('Intersecting noncentral chords cannot bisect one another.',['E3.4']);
  }
  if(reference==='E3.3'&&EuclidBooks.earlier(reference,c.lesson)&&['right','perpendicular','eq'].includes(t.kind)){
   for(const circle of BookThreeCircles.objects(c.state))for(const center of centers(c,circle.id))for(const a of c.d.names.filter(n=>BookThreeCircles.member(c.state,circle.id,n)))for(const b of c.d.names.filter(n=>BookThreeCircles.member(c.state,circle.id,n))){
    if(a===b)continue;for(const middle of c.d.names){if(!c.d.between(a,middle,b)||middle===center||!c.d.drawn(center,middle))continue;
     if(t.kind==='eq'&&c.perpendicular(center+middle,a+b)&&c.key(t)===c.key(parseBase(a+middle+' = '+middle+b)))return ok('A perpendicular through the center bisects the chord.',['E3.3']);
     if(c.equal(a+middle,middle+b)&&(t.kind==='right'&&t.angle[1]===middle&&[...t.angle].includes(center)&&[...t.angle].some(n=>n===a||n===b)||t.kind==='perpendicular'&&[[t.a,t.b],[t.b,t.a]].some(([x,y])=>c.d.collinear(x[0],x[1],center)&&c.d.collinear(x[0],x[1],middle)&&c.d.collinear(y[0],y[1],a)&&c.d.collinear(y[0],y[1],b))))return ok('A line through the center bisecting a noncentral chord is perpendicular to it.',['E3.3']);
    }
   }
  }
  if(reference==='Logic'){
   if(t.kind==='circleExtreme'){
    const circle=BookThreeCircles.circle(c.state,t.circle),end=t.segment.replace(t.point,'');
    if(circle&&end.length===1&&BookThreeCircles.member(c.state,t.circle,end))for(const center of centers(c,t.circle))for(const diameter of circle.diameters||[]){
     if(!diameter.includes(end)||!c.d.between(diameter[0],t.point,diameter[1])||t.point===center)continue;
     const far=diameter[0]===end?diameter[1]:diameter[0],correct=t.order==='longest'?c.d.between(end,center,t.point):c.d.between(center,t.point,end);
     if(correct&&c.d.names.some(n=>n!==diameter[0]&&n!==diameter[1]&&BookThreeCircles.member(c.state,t.circle,n)&&has(t.order==='longest'?center+n+' + '+center+t.point+' > '+t.point+n:t.point+n+' + '+t.point+center+' > '+center+n)&&c.facts.some(f=>f.kind==='gt'&&f.left.length===1&&f.right.length===1&&f.left[0].kind==='length'&&f.right[0].kind==='length'&&(t.order==='longest'?c.equal(f.left[0].term,t.segment):c.equal(f.right[0].term,t.segment)))))return ok('Extreme distance on the diameter.',['I20'],['Take an arbitrary other endpoint on the circle and join it to the established center.','The triangle inequality bounds its distance above by the far diameter distance and below by the near diameter distance.','Only the collinear diameter endpoints attain those bounds.']);
    }
   }
   if(t.kind==='circlePair'){
    const center=centers(c,t.circle)[0],circle=BookThreeCircles.circle(c.state,t.circle);
    if(center&&circle&&t.a!==t.b&&[t.a,t.b].every(n=>BookThreeCircles.member(c.state,t.circle,n))&&c.equal(t.point+t.a,t.segment)&&c.equal(t.point+t.b,t.segment)&&c.d.turn(center,t.point,t.a)*c.d.turn(center,t.point,t.b)<0&&conditionalContradictions().some(f=>f.condition.kind==='eq'&&[...f.condition.left,...f.condition.right].some(term=>c.equal(term.term,t.segment))))return ok('Exactly one equal-distance endpoint on each side.',['I4','I24'],['The copied central angle and equal radii give the second equal segment by E1.4.','On either open semicircle, distinct endpoints have strictly ordered included central angles.','E1.24 strictly orders their opposite distances, excluding every third equal endpoint.','The displayed hypothetical third-candidate contradiction is an instance of this arbitrary-endpoint argument.']);
   }
   if(t.kind==='centerLine'){
    const candidates=conditionalContradictions().filter(f=>allItems(f.condition).some(a=>a.kind==='circleCenter'&&a.circle===t.circle));
    if(candidates.length&&c.state.facts.some(raw=>raw.startsWith('book:')&&(()=>{try{
     const r=JSON.parse(raw.slice(5)),circle=BookThreeCircles.circle(c.state,t.circle);if(!circle||r.operation!=='perpendicular'||!EuclidConstruction.certificate(r,c.state.points))return false;
     const [a,b,d]=r.inputs,e=r.outputs[0];if(![a,b].every(n=>BookThreeCircles.member(c.state,t.circle,n))||![d,e].every(n=>c.d.collinear(t.line[0],t.line[1],n)))return false;
     return c.state.facts.some(other=>{try{const m=JSON.parse(other.slice(5));return other.startsWith('book:')&&m.operation==='midpoint'&&m.outputs[0]===d&&sort(m.inputs.join(''))===sort(a+b)&&EuclidConstruction.certificate(m,c.state.points)}catch{return false}});
    }catch{return false}})()))return ok('The center lies on the chord perpendicular bisector.',['I8','I11'],['Take an arbitrary proposed center off the bisector.','Equal radii and the bisected chord give equal adjacent angles by E1.8.','Both would be right, making unequal nested angles equal. The reflected side gives the same contradiction.']);
   }
   if(t.kind==='circleCenter'){
    const circle=BookThreeCircles.circle(c.state,t.circle);if(circle)for(const raw of c.state.facts)if(raw.startsWith('book:')){let r;try{r=JSON.parse(raw.slice(5))}catch{continue}if(r.operation!=='midpoint'||r.outputs[0]!==t.point||!r.inputs.every(n=>BookThreeCircles.member(c.state,t.circle,n))||!EuclidConstruction.certificate(r,c.state.points))continue;
     if(c.facts.some(f=>f.kind==='centerLine'&&f.circle===t.circle&&r.inputs.every(n=>c.d.collinear(f.line[0],f.line[1],n))))return ok('The center is the midpoint of the diameter.',['I10'],['The center lies on this line.','Its two recorded circle endpoints are equally distant from the center.','The unique midpoint is therefore the center.']);
    }
   }
   if(t.kind==='chordInside'){
    const failures=conditionalContradictions().map(f=>f.condition).filter(a=>a.kind==='chordCounterexample'&&a.circle===t.circle&&sort(a.chord)===sort(t.chord));
    if(['outside','on'].every(place=>failures.some(a=>a.place===place)))return ok('The open chord lies inside the circle.',['I5','I16','I19'],['An assumed exterior chord point contradicts radius equality and whole/part order.','The same exterior-angle argument excludes an interior chord point on the circumference.','Both alternatives are discharged; neither assumption becomes a fact.']);
   }
   if(t.kind==='notMutual'&&conditionalContradictions().some(f=>f.condition.kind==='conjunction'&&f.condition.items.length===2&&f.condition.items.every(i=>i.kind==='eq'))){
    const [x,y]=[t.a,t.b],middle=c.d.names.find(n=>c.d.between(x[0],n,x[1])&&c.d.between(y[0],n,y[1]));
    if(middle&&conditionalContradictions().some(f=>key(f.condition)===key({kind:'conjunction',items:[parseBase(x[0]+middle+' = '+middle+x[1]),parseBase(y[0]+middle+' = '+middle+y[1])]})))return ok('Two intersecting noncentral chords cannot bisect each other.',['E3.3'],['Assume both bisections.','The line to the center makes both adjacent nested angles right by E3.3.','Equal right angles cannot be unequal whole and part. Discharge the assumption.']);
   }
   if(t.kind==='differentCenters'){
    const meeting=c.facts.some(f=>f.kind==='circleMeeting'&&key(f.circles)===key(t.circles));
    if(meeting&&conditionalContradictions().some(f=>{const items=allItems(f.condition);return t.circles.every(id=>items.some(a=>a.kind==='circleCenter'&&a.circle===id))&&new Set(items.map(a=>a.point)).size===1}))return ok('The meeting circles have different centers.',[],['Assume a common center.','The common circumference point makes both chosen radii equal.','On the arbitrary transversal one is a proper part of the other. Discharge the impossible common-center assumption.']);
   }
  }
  return null;
 }
 return {parse,names,key,check};
})();
