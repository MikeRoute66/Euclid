/* A small Euclidean inference calculus. The grader never reads lesson proof recipes.
 * Incidence, orientation, and metric claims come from construction records or proof premises.
 * Every equality is proved from hypotheses, construction certificates, definitions,
 * prior accepted statements, or an explicit inference rule. */
const EuclidLogic=(()=>{
 const ANG='\u2220', EPS=1e-8;
 const segment=s=>[...s].sort().join('');
 const permutations=s=>[[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]].map(p=>p.map(i=>s[i]).join(''));
 const triangle=s=>typeof s==='string'&&/^[A-Z]{3}$/.test(s)&&new Set(s).size===3;
 function legacy(s){return s.replace(/Equilateral\(([A-Z]{3})\)/gi,'$1 is equilateral').replace(/Congruent\(([A-Z]{3}),\s*([A-Z]{3})\)/gi,'$1 is congruent to $2').replace(/Superpose\(([A-Z]{3}),\s*([A-Z]{3})\)/gi,'$1 is superposed on $2')}
 function expression(s){
  let text=s.toUpperCase().replace(/\b(?:SEGMENT|SIDE|LENGTH|OF)\b/g,'').replace(/ANGLE\s*/g,ANG).replace(/\s/g,'');
  if(!text||!new RegExp('^[+-]?(?:'+ANG+'[A-Z]{3}|[A-Z]{2})(?:[+-](?:'+ANG+'[A-Z]{3}|[A-Z]{2}))*$').test(text))return null;
  let terms=[...text.matchAll(new RegExp('([+-]?)('+ANG+'[A-Z]{3}|[A-Z]{2})','g'))].map(m=>({term:m[2],coefficient:m[1]==='-'?-1:1}));
  if(terms.some(t=>t.term.startsWith(ANG)?new Set(t.term.slice(1)).size!==3:t.term[0]===t.term[1]))return null;
  if(new Set(terms.map(t=>t.term.startsWith(ANG)?'angle':'length')).size!==1)return null;
  return terms;
 }
 function parse(s){
  let text=legacy(s).trim().replace(/[.\u3002]$/,'').replace(/\btriangles?\b/gi,'').replace(/[\u25b3\u0394]/g,'').trim().toUpperCase();
  let unary=text.match(/^([A-Z]{3})\s+IS\s+(EQUILATERAL|ISOSCELES|SCALENE)$/);
  if(unary&&triangle(unary[1]))return {kind:'property',property:unary[2].toLowerCase(),triangle:unary[1]};
  let relation=text.match(/^([A-Z]{3})\s+IS\s+(CONGRUENT\s+TO|SUPERPOSED\s+ON)\s+([A-Z]{3})$/);
  if(!relation){let both=text.match(/^([A-Z]{3})\s+AND\s+([A-Z]{3})\s+ARE\s+(CONGRUENT|SUPERPOSED)$/);if(both)relation=[both[0],both[1],both[3]==='CONGRUENT'?'CONGRUENT TO':'SUPERPOSED ON',both[2]]}
  if(relation&&triangle(relation[1])&&triangle(relation[3]))return {kind:'relation',relation:relation[2].startsWith('CONGRUENT')?'congruent':'superposed',a:relation[1],b:relation[3]};
  let parts=text.split(/(=|>|<)/);if(parts.length!==3)return null;
  let left=expression(parts[0]),right=expression(parts[2]);if(!left||!right||left[0].term.startsWith(ANG)!==right[0].term.startsWith(ANG))return null;
  return {kind:parts[1]==='='?'equality':'inequality',left:parts[1]==='<'?right:left,right:parts[1]==='<'?left:right};
 }
 function relationKey(a,b){let forward=[...a].map((v,i)=>v+'='+b[i]).sort().join(','),reverse=[...b].map((v,i)=>v+'='+a[i]).sort().join(',');return [forward,reverse].sort()[0]}
 function diagram(state,established=[]){
  const points=state.points, names=Object.keys(points);
  function collinear(a,b,c){if(new Set(a+b+c).size<3)return true;let groups=[...(state.topology?.lines||[]),...established.filter(f=>f.kind==='collinear').map(f=>f.points)];let merged=true;while(merged){merged=false;for(let i=0;i<groups.length;i++)for(let j=i+1;j<groups.length;j++)if([...groups[i]].filter(n=>groups[j].includes(n)).length>=2){groups[i]=[...new Set(groups[i]+groups[j])].join('');groups.splice(j,1);merged=true;j--}}return groups.some(g=>[a,b,c].every(n=>g.includes(n)))}
  const direction=(a,b)=>EuclidConstruction.direction(state,a,b),turn=(a,b,c)=>EuclidConstruction.turn(state,a,b,c);
  function sameRay(v,a,b){return a===b||collinear(v,a,b)&&direction(v,a)*direction(v,b)>0}
  function between(a,b,c){return new Set(a+b+c).size===3&&collinear(a,b,c)&&direction(b,a)*direction(b,c)<0}
  function drawn(a,b){return [...state.edges,...state.rays].some(e=>{let [u,v]=e;return segment(a+b)===segment(e)||(a===u||a===v||collinear(u,v,a))&&(b===u||b===v||collinear(u,v,b))})}
  function proper(t){return triangle(t)&&[...t].every(n=>points[n])&&!!turn(...t)&&!collinear(...t)&&drawn(t[0],t[1])&&drawn(t[1],t[2])&&drawn(t[0],t[2])}
  function canonical(term){if(!term.startsWith(ANG))return segment(term);let [a,v,b]=term.slice(1);if(between(a,v,b))return ANG+'STRAIGHT';let ray=p=>names.filter(n=>n!==v&&sameRay(v,p,n)).sort()[0]||p;return ANG+[ray(a),ray(b)].sort().join('')+'@'+v}
  function angleInside(a,v,c,b){return new Set(a+v+c+b).size===4&&turn(v,a,b)*turn(v,a,c)>0&&turn(v,a,b)*turn(v,c,b)>0}
  function identities(terms){
   let equations=[];const put=items=>equations.push(new Map(items.map(([term,n])=>[canonical(term),n])));
   let lengths=terms.filter(t=>!t.startsWith(ANG));
   for(let big of lengths)for(let mid of names)if(mid!==big[0]&&mid!==big[1]&&drawn(big[0],big[1])&&between(big[0],mid,big[1]))put([[big,1],[big[0]+mid,-1],[mid+big[1],-1]]);
   let angles=terms.filter(t=>t.startsWith(ANG));
   for(let big of angles){let [a,v,b]=big.slice(1);for(let mid of names){if(drawn(v,mid)&&angleInside(a,v,mid,b))put([[big,1],[ANG+a+v+mid,-1],[ANG+mid+v+b,-1]]);if(drawn(v,mid)&&between(a,v,mid)&&!collinear(a,v,b))put([[ANG+a+v+mid,1],[big,-1],[ANG+b+v+mid,-1]]);if(drawn(v,mid)&&between(b,v,mid)&&!collinear(a,v,b))put([[ANG+b+v+mid,1],[big,-1],[ANG+a+v+mid,-1]])}}
   return equations;
  }
  return {names,points,canonical,collinear,sameRay,between,drawn,proper,identities,turn,direction,angleInside};
 }
 const termsOf=ast=>ast.kind==='equality'||ast.kind==='inequality'?[...ast.left,...ast.right].map(t=>t.term):ast.kind==='property'?[ast.triangle[0]+ast.triangle[1],ast.triangle[1]+ast.triangle[2],ast.triangle[2]+ast.triangle[0]]:[];
 function vector(ast,d){let v=new Map();for(let [side,sign] of [[ast.left,1],[ast.right,-1]])for(let t of side){let key=d.canonical(t.term);v.set(key,(v.get(key)||0)+sign*t.coefficient)}return clean(v)}
 function clean(v){for(let [k,n] of v)if(Math.abs(n)<EPS)v.delete(k);return v}
 function subtract(a,b,k){let out=new Map(a);for(let [term,n] of b)out.set(term,(out.get(term)||0)-n*k);return clean(out)}
 function follows(target,equations){let basis=new Map();for(let input of equations){let row=clean(new Map(input));for(let [pivot,b] of basis)if(row.has(pivot))row=subtract(row,b,row.get(pivot));if(row.size){let key=[...row.keys()].sort()[0],scale=row.get(key);for(let [k,n] of row)row.set(k,n/scale);basis.set(key,row)}}let rest=new Map(target);for(let [pivot,b] of basis)if(rest.has(pivot))rest=subtract(rest,b,rest.get(pivot));return clean(rest).size===0}
 const atomic=ast=>ast.kind==='equality'&&ast.left.length===1&&ast.right.length===1&&ast.left[0].coefficient===1&&ast.right[0].coefficient===1;
 function makeEquality(a,b){return parse(a+' = '+b)}
 function context(state,lesson){
  const accepted=[],d=diagram(state,accepted),hypotheses=(lesson.givens||[]).map(parse),reasons=[],origins=new WeakMap();
  function sameFact(a,b){if(a.kind!==b.kind)return false;if(a.kind==='equality')return follows(vector(a,d),[vector(b,d)])&&follows(vector(b,d),[vector(a,d)]);if(a.kind==='inequality'){let left=vector(a,d),right=vector(b,d);return left.size===right.size&&[...left].every(([term,coefficient])=>Math.abs(coefficient-(right.get(term)||0))<1e-9)}if(a.kind==='property')return a.property===b.property&&segment(a.triangle)===segment(b.triangle);if(a.kind==='relation')return a.relation===b.relation&&relationKey(a.a,a.b)===relationKey(b.a,b.b);return false}
  function equivalent(a,b){return d.canonical(a)===d.canonical(b)}
  function knownEqual(a,b){if(equivalent(a,b))return true;let graph=new Map();for(let fact of accepted)if(atomic(fact)){let x=d.canonical(fact.left[0].term),y=d.canonical(fact.right[0].term);if(!graph.has(x))graph.set(x,new Set());if(!graph.has(y))graph.set(y,new Set());graph.get(x).add(y);graph.get(y).add(x)}let end=d.canonical(b),queue=[d.canonical(a)],seen=new Set();while(queue.length){let p=queue.shift();if(p===end)return true;if(seen.has(p))continue;seen.add(p);for(let n of graph.get(p)||[])if(!seen.has(n))queue.push(n)}return false}
  function transitiveEquality(ast){
   if(ast.kind!=='equality')return false;
   const key=items=>{let v=new Map();for(let t of items){let term=d.canonical(t.term);v.set(term,(v.get(term)||0)+t.coefficient)}return JSON.stringify([...clean(v)].sort(([a],[b])=>a.localeCompare(b)))};
   let graph=new Map(),connect=(a,b)=>{if(!graph.has(a))graph.set(a,new Set());graph.get(a).add(b)};
   for(let fact of accepted)if(fact.kind==='equality'){let a=key(fact.left),b=key(fact.right);connect(a,b);connect(b,a)}
   let queue=[key(ast.left)],end=key(ast.right),seen=new Set();while(queue.length){let p=queue.shift();if(p===end)return true;if(seen.has(p))continue;seen.add(p);for(let n of graph.get(p)||[])if(!seen.has(n))queue.push(n)}return false;
  }
  function congruences(){return accepted.filter(a=>a.kind==='relation')}
  function partsMatch(ast,relation){if(ast.kind!=='equality'||!atomic(ast))return false;let [a,b]=[relation.a,relation.b],pairs=[];for(let i=0;i<3;i++){let j=(i+1)%3,k=(i+2)%3;pairs.push([a[i]+a[j],b[i]+b[j]],[ANG+a[j]+a[i]+a[k],ANG+b[j]+b[i]+b[k]])}return pairs.some(([x,y])=>{let u=ast.left[0].term,v=ast.right[0].term;return equivalent(u,x)&&equivalent(v,y)||equivalent(u,y)&&equivalent(v,x)})}
  function sas(a,b){if(!d.proper(a)||!d.proper(b))return false;for(let i=0;i<3;i++){let j=(i+1)%3,k=(i+2)%3;if(knownEqual(a[i]+a[j],b[i]+b[j])&&knownEqual(a[i]+a[k],b[i]+b[k])&&knownEqual(ANG+a[j]+a[i]+a[k],ANG+b[j]+b[i]+b[k]))return true}return false}
  function certifiedEqualities(rule){let out=[];const add=(a,b)=>out.push(makeEquality(a,b));
   for(let f of state.facts){let p=f.split(':');
    if(rule==='I1'&&p[0]==='equilateral'){let apex=p[1],a=p[2]||(lesson.id===2?'A':null),b=p[3]||(lesson.id===2?'B':null);if(a&&b&&d.proper(apex+a+b)){add(apex+a,apex+b);add(apex+a,a+b);add(apex+b,a+b)}}
    if(rule==='I2'&&p[0]==='copy'){let [a,e,b,c]=p.length===5?p.slice(1):lesson.id===3?['A','E','C','D']:[];if(a&&[a,e,b,c].every(n=>d.points[n]))add(a+e,b+c)}
    if(rule==='I3'&&p[0]==='cut'&&p.length===5)add(p[1]+p[2],p[3]+p[4]);
    if(rule==='I3'&&f==='equalExtensions'&&lesson.id===5&&d.points.F&&d.points.G)add('AF','AG');
   }return out.filter(Boolean);
  }
  function superposition(a,b){return state.facts.some(f=>f==='superpose'&&lesson.id===4&&relationKey(a,b)===relationKey('ABC','DEF')||f.startsWith('superpose:')&&relationKey(a,b)===relationKey(f.split(':')[1],f.split(':')[2]))}
  function radiusEquality(ast){if(!atomic(ast)||ast.left[0].term.startsWith(ANG))return false;let [x,y]=[ast.left[0].term,ast.right[0].term];return state.circles.some(c=>{let endpoint=t=>t[0]===c.a?t[1]:t[1]===c.a?t[0]:null,p=endpoint(x),q=endpoint(y);return p&&q&&EuclidConstruction.radius(state,c,p)&&EuclidConstruction.radius(state,c,q)})}
  function definition20(ast){let triangles=accepted.filter(a=>a.kind==='property'&&a.property==='equilateral').map(a=>a.triangle);if(lesson.id>1)for(let f of state.facts){let p=f.split(':');if(p[0]==='equilateral'){let t=p[1]+(p[2]||'A')+(p[3]||'B');if(d.proper(t))triangles.push(t)}}if(ast.kind==='property'&&ast.property==='equilateral'){let [a,b,c]=ast.triangle;return triangles.some(t=>segment(t)===segment(ast.triangle))||d.proper(ast.triangle)&&knownEqual(a+b,b+c)&&knownEqual(a+b,a+c)}return atomic(ast)&&triangles.some(t=>[ast.left[0].term,ast.right[0].term].every(s=>/^[A-Z]{2}$/.test(s)&&[...s].every(n=>t.includes(n))))}
  function linearRule(ast,rule){
   if(ast.kind!=='equality')return false;
   let eqs=accepted.filter(a=>a.kind==='equality');if(!eqs.length)return false;
   let terms=[...new Set([...termsOf(ast),...eqs.flatMap(termsOf)])],identities=d.identities(terms);
   const side=items=>{let v=new Map();for(let t of items){let key=d.canonical(t.term);v.set(key,(v.get(key)||0)+t.coefficient)}return clean(v)};
   const equal=(a,b)=>follows(subtract(a,b,1),identities),sum=(a,b)=>subtract(a,b,-1);
   const orient=eq=>[[eq.left,eq.right],[eq.right,eq.left]];
   let pairs=eqs.flatMap(orient).map(([a,b])=>[side(a),side(b)]);
   // Common quantities, including the straight angle, may be added/subtracted
   // without a separate reflexivity line.
   const variables=new Set([...terms.map(t=>d.canonical(t)),...identities.flatMap(v=>[...v.keys()])]);
   let common=[...variables].map(t=>[new Map([[t,1]]),new Map([[t,1]])]);
   let target=[side(ast.left),side(ast.right)],choices=[...pairs,...common];
   for(let [left,right] of pairs)for(let [partLeft,partRight] of choices){
    if(rule==='CN2'&&equal(target[0],sum(left,partLeft))&&equal(target[1],sum(right,partRight)))return true;
    if(rule==='CN3'&&(equal(sum(target[0],partLeft),left)&&equal(sum(target[1],partRight),right)||equal(sum(target[1],partLeft),left)&&equal(sum(target[0],partRight),right)))return true;
   }
   if(rule==='CN3')for(let [wholeLeft,wholeRight] of common)for(let [partLeft,partRight] of pairs)if(equal(sum(target[0],partLeft),wholeLeft)&&equal(sum(target[1],partRight),wholeRight)||equal(sum(target[1],partLeft),wholeLeft)&&equal(sum(target[0],partRight),wholeRight))return true;
   return false;
  }
  function sourceReferences(ast){return [...new Set([...['I1','I2','I3'].filter(r=>Number(r.slice(1))<lesson.id&&(certifiedEqualities(r).some(f=>sameFact(ast,f))||r==='I1'&&ast.kind==='property'&&ast.property==='equilateral'&&state.facts.some(f=>{let p=f.split(':');return p[0]==='equilateral'&&segment(ast.triangle)===segment(p[1]+(p[2]||'A')+(p[3]||'B'))})&&d.proper(ast.triangle))),...congruences().filter(f=>partsMatch(ast,f)).map(f=>origins.get(f)).filter(r=>/^I/.test(r||''))])]}
  function accept(ast,reference){origins.set(ast,reference);accepted.push(ast)}
  function check(ast,rule){
   if(termsOf(ast).some(t=>![...t.replace(ANG,'')].every(n=>d.points[n]))||(ast.kind==='property'&&![...ast.triangle].every(n=>d.points[n]))||(ast.kind==='relation'&&![...ast.a,...ast.b].every(n=>d.points[n])))return {ok:false,error:'This statement names a point that is not in the construction.'};
   if(/^I[1-4]$/.test(rule)&&Number(rule.slice(1))>=lesson.id)return {ok:false,error:'This proposition has not yet been established. Use an earlier proposition.'};
   let ok=false,explanation='';
   if(rule==='Given'){ok=hypotheses.some(h=>sameFact(ast,h));explanation='Hypothesis of the proposition.'}
   else if(rule==='D15'){ok=radiusEquality(ast);explanation='Both endpoints must be recorded on the same constructed circle. Mark the circle endpoint or intersection explicitly with D1; P3 records the endpoint used to define the circle.'}
   else if(rule==='D20'){ok=definition20(ast);explanation='D20 uses an equilateral triangle established by a construction record or an earlier proof line. An E.1 construction already establishes that property; a separate equilateral statement is not required.'}
   else if(rule==='CN1'){ok=transitiveEquality(ast);explanation='Equality follows from earlier established equalities.'}
   else if(rule==='CN2'||rule==='CN3'){ok=linearRule(ast,rule);explanation=rule==='CN2'?'Add equal magnitudes to equal magnitudes.':'Subtract equal parts from equal wholes.'}
   else if(rule==='CN5'){ok=ast.kind==='inequality'&&ast.left.length===1&&ast.right.length===1&&ast.left[0].coefficient===1&&ast.right[0].coefficient===1&&(()=>{let big=ast.left[0].term,small=ast.right[0].term;if(big.startsWith(ANG)||small.startsWith(ANG))return false;return [...big].some(v=>small.includes(v)&&d.between(v,small.replace(v,''),big.replace(v,'')))})();explanation='A proper part of a segment is smaller than the whole.'}
   else if(rule==='I1'||rule==='I2'||rule==='I3'){ok=certifiedEqualities(rule).some(e=>sameFact(ast,e))||rule==='I1'&&ast.kind==='property'&&ast.property==='equilateral'&&certifiedEqualities(rule).length>0&&state.facts.some(f=>{let p=f.split(':');return p[0]==='equilateral'&&segment(ast.triangle)===segment(p[1]+(p[2]||'A')+(p[3]||'B'))});explanation='Certified construction by '+rule+'.'}
   else if(rule==='I4'){ok=ast.kind==='relation'&&ast.relation==='congruent'&&(sas(ast.a,ast.b)||congruences().some(c=>relationKey(c.a,c.b)===relationKey(ast.a,ast.b)))||congruences().some(c=>partsMatch(ast,c));explanation='Side-angle-side, or corresponding parts of triangles already proved congruent.'}
   else if(rule==='CN4'){ok=ast.kind==='relation'&&(congruences().some(c=>relationKey(c.a,c.b)===relationKey(ast.a,ast.b))||superposition(ast.a,ast.b)&&sas(ast.a,ast.b))||congruences().some(c=>partsMatch(ast,c));explanation='Certified superposition or corresponding coincident parts.'}
   else if(rule==='P1'){ok=false;explanation='Joining points constructs a line; it does not establish a length equality.'}
   return {ok,sourcePropositions:ok?sourceReferences(ast):[],error:ok?'':explanation?explanation+' The required premises or construction evidence are missing.':'This reference does not imply that statement in the supported Euclidean calculus.',explanation};
  }
  function goal(){switch(lesson.id){
   case 1:return accepted.some(a=>a.kind==='property'&&a.property==='equilateral'&&a.triangle.includes('A')&&a.triangle.includes('B')&&d.proper(a.triangle));
   case 2:return d.names.some(n=>n!=='A'&&d.drawn('A',n)&&knownEqual('A'+n,'BC'));
   case 3:return d.names.some(n=>n!=='A'&&n!=='B'&&d.between('A',n,'B')&&knownEqual('A'+n,'CD'));
   case 4:return congruences().some(c=>relationKey(c.a,c.b)===relationKey('ABC','DEF'));
   case 5:return knownEqual(ANG+'ABC',ANG+'ACB')&&d.points.F&&d.points.G&&d.between('A','B','F')&&d.between('A','C','G')&&knownEqual(ANG+'FBC',ANG+'GCB');
   default:return false;
  }}
  return {d,accepted,check,goal,knownEqual,reasons,sourceReferences,accept};
 }
 function grade(state,lesson){const ctx=context(state,lesson);for(let [i,line] of state.lines.entries()){let ast=parse(line.s);line.valid=false;line.dependencies=[];if(!ast){line.error='Unrecognized format. Use the keyword-based “Did you mean?” help to format your own statement.';continue}if(!line.j){line.error='Select a reference, then click this line to justify it.';continue}let result=ctx.check(ast,line.j);line.valid=result.ok;line.error=result.error;if(result.ok){line.reason=result.explanation;line.sourcePropositions=result.sourcePropositions||[];line.dependencies=state.lines.slice(0,i).flatMap((l,j)=>l.valid?[j+1]:[]);ctx.accept(ast,line.j)}}return {complete:state.lines.every(l=>l.valid)&&ctx.goal(),goalReached:!!ctx.goal(),context:ctx}}
 return {parse,grade,diagram,context,permutations,relationKey};
})();
