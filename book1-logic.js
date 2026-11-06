/* Extended Euclidean calculus for Book I. No lesson goals or proof guides are
 * consulted by inference rules. Derived arguments below have explicit earlier-
 * proposition dependencies. Area/square identities use symbolic coordinate
 * polynomials, never measured equality of the displayed diagram. */
const BookOneLogic=(()=>{
 const A='\u2220', baseParse=EuclidLogic.parse, baseGrade=EuclidLogic.grade;
 const sort=s=>[...s].sort().join('');
 const polygonKey=s=>{let variants=[];for(let t of [s,[...s].reverse().join('')])for(let i=0;i<t.length;i++)variants.push(t.slice(i)+t.slice(0,i));return variants.sort()[0]};
 function expression(raw){
  let s=raw.toUpperCase().replace(/TWO\s+RIGHT\s+ANGLES/g,'2 RIGHT').replace(/(?:A\s+)?RIGHT\s+ANGLES?/g,'RIGHT').replace(/\bANGLE\b\s*/g,A).replace(/AREA\s+([A-Z]{3,26})/g,'AREA($1)').replace(/\u00b2/g,'^2').replace(/RECTANGLE\s+(?:CONTAINED\s+BY\s+)?([A-Z]{2})\s*(?:,|AND|BY)\s*([A-Z]{2})/g,'$1*$2').replace(/\s/g,'');
  const pattern=new RegExp('([+-]?)(\\d+(?:/\\d+)?)?\\*?([A-Z]{2}\\*[A-Z]{2}|AREA\\([A-Z]{3,26}\\)|'+A+'[A-Z]{3}|[A-Z]{2}\\^2|RIGHT|[A-Z]{2})','g');
  let terms=[],position=0,m;while((m=pattern.exec(s))){if(m.index!==position)return null;position=pattern.lastIndex;let coefficient=m[2]?m[2].split('/').reduce((a,b)=>Number(a)/Number(b)):1;coefficient*=m[1]==='-'?-1:1;let term=m[3],kind=term.includes('*')?'product':term.startsWith('AREA(')?'area':term.startsWith(A)||term==='RIGHT'?'angle':term.endsWith('^2')?'square':'length';terms.push({term,coefficient,kind})}if(position!==s.length||!terms.length||terms.some(t=>!Number.isFinite(t.coefficient)))return null;if(terms.some(t=>t.term.startsWith(A)&&new Set(t.term.slice(1)).size!==3||['length','square'].includes(t.kind)&&t.term[0]===t.term[1]||t.kind==='product'&&t.term.split('*').some(s=>s[0]===s[1])||t.kind==='area'&&new Set(t.term.slice(5,-1)).size!==t.term.slice(5,-1).length))return null;
  let dimensions=new Set(terms.map(t=>['square','product'].includes(t.kind)?'area':t.kind));if(dimensions.size!==1)return null;return terms;
 }
 function parse(s){
  let text=readableLegacy(s).trim().replace(/\.$/,'').replace(/\btriangles?\b/gi,'').replace(/[\u25b3\u0394]/g,'').toUpperCase().trim(),m;
  if((m=text.match(/^([A-Z]{6})\s+IS\s+(?:A\s+)?GNOMON$/)))return new Set(m[1]).size===6?{kind:'shape',polygon:m[1],property:'gnomon'}:null;
  if((m=text.match(/^([A-Z]{2})\s+IS\s+(PARALLEL|PERPENDICULAR)\s+TO\s+([A-Z]{2})$/)))return m[1][0]!==m[1][1]&&m[3][0]!==m[3][1]?{kind:m[2].toLowerCase(),a:m[1],b:m[3]}:null;
  if((m=text.match(/^([A-Z]{2})\s+MEETS\s+([A-Z]{2})\s+AT\s+([A-Z])$/)))return {kind:'intersection',a:m[1],b:m[2],point:m[3]};
  if((m=text.match(/^([A-Z]{3,26})\s+(?:ARE|IS)\s+COLLINEAR$/)))return {kind:'collinear',points:m[1]};
  if((m=text.match(/^([A-Z])\s+AND\s+([A-Z])\s+ARE\s+ON\s+THE\s+SAME\s+SIDE\s+OF\s+([A-Z]{2})$/)))return {kind:'sameSide',a:m[1],b:m[2],line:m[3]};
  if((m=text.match(/^([A-Z])\s+IS\s+INSIDE\s+([A-Z]{3})$/)))return {kind:'inside',point:m[1],triangle:m[2]};
  if((m=text.match(/^(?:ANGLE\s*|\u2220)([A-Z]{3})\s+IS\s+(?:A\s+)?RIGHT(?:\s+ANGLE)?$/)))return {kind:'right',angle:m[1]};
  if((m=text.match(/^([A-Z]{3,4})\s+IS\s+(?:A\s+)?(PARALLELOGRAM|SQUARE|EQUILATERAL|ISOSCELES|SCALENE)$/)))return new Set(m[1]).size===m[1].length&&m[1].length===(['SQUARE','PARALLELOGRAM'].includes(m[2])?4:3)?{kind:'shape',polygon:m[1],property:m[2].toLowerCase()}:null;
  if((m=text.match(/^([A-Z]{3})\s+IS\s+(CONGRUENT\s+TO|SUPERPOSED\s+ON)\s+([A-Z]{3})$/)))return {kind:'congruence',a:m[1],b:m[3],superposed:m[2].startsWith('SUPERPOSED')};
  if((m=text.match(/^([A-Z])\s*=\s*([A-Z])$/)))return {kind:'pointEqual',a:m[1],b:m[2]};
  let sides=text.split(/(=|>|<)/);if(sides.length!==3)return null;let left=expression(sides[0]),right=expression(sides[2]);if(!left||!right||(['square','product'].includes(left[0].kind)?'area':left[0].kind)!==(['square','product'].includes(right[0].kind)?'area':right[0].kind))return null;
  return {kind:sides[1]==='='?'eq':'gt',left:sides[1]==='<'?right:left,right:sides[1]==='<'?left:right};
 }
 function readableLegacy(s){return s.replace(/Equilateral\(([A-Z]{3})\)/gi,'$1 is equilateral').replace(/Congruent\(([A-Z]{3}),\s*([A-Z]{3})\)/gi,'$1 is congruent to $2').replace(/Superpose\(([A-Z]{3}),\s*([A-Z]{3})\)/gi,'$1 is superposed on $2')}
 const equality=(x,y)=>parse(x+' = '+y),atomic=t=>t?.kind==='eq'&&t.left.length===1&&t.right.length===1&&t.left[0].coefficient===1&&t.right[0].coefficient===1;
 const namesIn=t=>{if(!t)return [];let text=t.kind==='eq'||t.kind==='gt'?[...t.left,...t.right].map(v=>v.term.replace(/AREA\(|\)|RIGHT|\^2|\u2220/g,'')).join(''):t.kind==='right'?t.angle:t.kind==='shape'?t.polygon:t.kind==='collinear'?t.points:t.kind==='intersection'?t.a+t.b+t.point:t.kind==='inside'?t.point+t.triangle:t.kind==='sameSide'?t.a+t.b+t.line:(t.a||'')+(t.b||'');return [...text].filter(n=>/[A-Z]/.test(n))};
 function context(state,lesson){
  if(!state.topology)EuclidConstruction.initialize(state,lesson);else EuclidConstruction.restoreGivens(state,lesson);
  let facts=[],derivations=[],origins=new WeakMap(),symbolicDependencies=new Set(),d=EuclidLogic.diagram(state,facts);
  const scalarTerms=t=>t.kind==='eq'||t.kind==='gt'?[...t.left,...t.right].map(v=>v.term):[];
  function canonical(term){if(term.includes('*')){let factors=term.split('*').map(sort).sort();return factors[0]===factors[1]?factors[0]+'^2':factors.join('*')}if(term==='RIGHT')return 'RIGHT';if(term.startsWith('AREA('))return 'AREA('+polygonKey(term.slice(5,-1))+')';if(term.endsWith('^2'))return sort(term.slice(0,2))+'^2';return d.canonical(term)}
  function expr(items){let out=new Map();for(let item of items){let key=canonical(item.term),coefficient=item.coefficient;if(key===A+'STRAIGHT'){key='RIGHT';coefficient*=2}out.set(key,(out.get(key)||0)+coefficient)}for(let [key,n] of out)if(Math.abs(n)<1e-8)out.delete(key);return out}
  const exprKey=items=>JSON.stringify([...expr(items)].sort(([a],[b])=>a.localeCompare(b)));
  function key(t){if(!t)return '';if(t.kind==='eq')return 'eq:'+sortPair(exprKey(t.left),exprKey(t.right));if(t.kind==='gt')return 'gt:'+exprKey(t.left)+'>'+exprKey(t.right);if(t.kind==='congruence')return 'congruent:'+EuclidLogic.relationKey(t.a,t.b);if(t.kind==='shape')return t.property+':'+polygonKey(t.polygon);if(t.kind==='parallel'||t.kind==='perpendicular')return t.kind+':'+sortPair(lineKey(t.a),lineKey(t.b));if(t.kind==='right')return 'right:'+canonical(A+t.angle);if(t.kind==='pointEqual')return 'point:'+sort(t.a+t.b);if(t.kind==='sameSide')return 'sameSide:'+sort(t.a+t.b)+':'+lineKey(t.line);if(t.kind==='collinear')return 'collinear:'+sort(t.points);return JSON.stringify(t)}
  const lineCache=new Map();let certificateStamp=null,certificateCache=[],pairStamp=null,pairCache=[];
  function lineKey(line){let k=facts.length+':'+sort(line);if(lineCache.has(k))return lineCache.get(k);let [a,b]=line,result=d.names.filter(n=>n===a||n===b||d.collinear(a,b,n)).sort().join('');lineCache.set(k,result);return result}
  const equivalent=(x,y)=>canonical(x)===canonical(y);
  const posted=t=>facts.some(f=>key(f)===key(t));
  function sameSide(a,b,line){return d.turn(line[0],line[1],a)*d.turn(line[0],line[1],b)>0}
  function inside(point,triangle){let [a,b,c]=triangle;return sameSide(point,c,a+b)&&sameSide(point,a,b+c)&&sameSide(point,b,a+c)}
  function parallelPairs(){let claims=certificateClaims(),stamp=facts.length+':'+certificateStamp;if(stamp===pairStamp)return pairCache;let available=[...facts,...claims.map(c=>c.claim)];let pairs=available.filter(f=>f.kind==='parallel').map(f=>[f.a,f.b]);for(let f of available)if(f.kind==='shape'&&['square','parallelogram'].includes(f.property)){let [a,b,c,e]=f.polygon;pairs.push([a+b,c+e],[a+e,b+c])}pairStamp=stamp;pairCache=pairs;return pairs}
  function parallel(x,y){
   let a=lineKey(x),b=lineKey(y);if(a===b)return true;
   // Parallelism obtained through a third line needs an explicit E.30 step.
   return parallelPairs().some(([u,v])=>lineKey(u)===a&&lineKey(v)===b||lineKey(u)===b&&lineKey(v)===a);
  }
  function perpendicular(x,y){let available=[...facts,...certificateClaims().map(c=>c.claim)];return available.some(f=>f.kind==='shape'&&f.property==='square'&&[...f.polygon].some((a,i)=>{let b=f.polygon[(i+1)%4],c=f.polygon[(i+2)%4];return lineKey(a+b)===lineKey(x)&&lineKey(b+c)===lineKey(y)||lineKey(a+b)===lineKey(y)&&lineKey(b+c)===lineKey(x)}))||available.some(f=>f.kind==='perpendicular'&&(lineKey(f.a)===lineKey(x)&&lineKey(f.b)===lineKey(y)||lineKey(f.b)===lineKey(x)&&lineKey(f.a)===lineKey(y)) )||available.some(f=>f.kind==='right'&&((lineKey(f.angle[0]+f.angle[1])===lineKey(x)&&lineKey(f.angle[1]+f.angle[2])===lineKey(y))||(lineKey(f.angle[0]+f.angle[1])===lineKey(y)&&lineKey(f.angle[1]+f.angle[2])===lineKey(x))))}
  function parts(t,congruence){if(!atomic(t))return false;let pairs=[];for(let i=0;i<3;i++){let j=(i+1)%3,k=(i+2)%3;pairs.push([congruence.a[i]+congruence.a[j],congruence.b[i]+congruence.b[j]],[A+congruence.a[j]+congruence.a[i]+congruence.a[k],A+congruence.b[j]+congruence.b[i]+congruence.b[k]])}pairs.push(['AREA('+congruence.a+')','AREA('+congruence.b+')']);return pairs.some(([x,y])=>equivalent(t.left[0].term,x)&&equivalent(t.right[0].term,y)||equivalent(t.left[0].term,y)&&equivalent(t.right[0].term,x))}
  function equal(x,y){if(equivalent(x,y))return true;if(/^[A-Z]{2}$/.test(x)&&/^[A-Z]{2}$/.test(y)&&[...facts,...certificateClaims().map(c=>c.claim)].some(f=>f.kind==='shape'&&['square','equilateral'].includes(f.property)&&[x,y].every(s=>[...f.polygon].some((a,i)=>sort(a+f.polygon[(i+1)%f.polygon.length])===sort(s)))))return true;let query=equality(x,y);if(facts.some(f=>f.kind==='congruence'&&parts(query,f)))return true;let graph=new Map(),connect=(a,b)=>{if(!graph.has(a))graph.set(a,new Set());graph.get(a).add(b)};for(let f of [...facts,...certificateClaims().map(c=>c.claim)])if(f.kind==='eq'){let a=exprKey(f.left),b=exprKey(f.right);connect(a,b);connect(b,a)}let queue=[exprKey(query.left)],end=exprKey(query.right),seen=new Set();while(queue.length){let p=queue.shift();if(p===end)return true;if(seen.has(p))continue;seen.add(p);for(let n of graph.get(p)||[])queue.push(n)}return false}
  function right(angle){return facts.some(f=>f.kind==='right'&&(canonical(A+f.angle)===canonical(A+angle)||equal(A+f.angle,A+angle)))||perpendicular(angle[0]+angle[1],angle[1]+angle[2])||equal(A+angle,'RIGHT')}
  function isParallelogram(p){let [a,b,c,e]=p;return p.length===4&&new Set(p).size===4&&!!d.turn(a,b,c)&&!d.collinear(a,b,c)&&[a+b,b+c,c+e,e+a].every(line=>d.drawn(line[0],line[1]))&&parallel(a+b,c+e)&&parallel(a+e,b+c)}
  // A theorem can conclude a corresponding part directly. An auxiliary
  // sentence saying the triangles are congruent is optional, not a premise.
  function trianglePart(t,test){
   if(!atomic(t))return false;
   let x=t.left[0],y=t.right[0];
   if(x.kind==='angle'&&x.term.startsWith(A)&&y.term.startsWith(A)){
    const aliases=q=>d.names.filter(n=>n!==q[1]&&d.sameRay(q[1],q[0],n)).flatMap(a=>d.names.filter(n=>n!==q[1]&&d.sameRay(q[1],q[2],n)).map(b=>a+q[1]+b));
    let left=aliases(x.term.slice(1)),right=aliases(y.term.slice(1));return left.some(a=>right.some(b=>[b,[...b].reverse().join('')].some(p=>test(a,p))))
   }
   if(x.kind==='area'&&y.kind==='area'){let a=x.term.slice(5,-1),b=y.term.slice(5,-1);return a.length===3&&b.length===3&&EuclidLogic.permutations(b).some(p=>test(a,p))}
   if(x.kind!=='length'||y.kind!=='length')return false;
   for(let a of d.names)for(let b of d.names)for(let side of [y.term,[...y.term].reverse().join('')])if(!x.term.includes(a)&&!side.includes(b)&&test(x.term+a,side+b))return true;
   return false;
  }
  function sas(a,b){return d.proper(a)&&d.proper(b)&&[0,1,2].some(i=>{let j=(i+1)%3,k=(i+2)%3;return equal(a[i]+a[j],b[i]+b[j])&&equal(a[i]+a[k],b[i]+b[k])&&equal(A+a[j]+a[i]+a[k],A+b[j]+b[i]+b[k])})}
  function sss(a,b){return d.proper(a)&&d.proper(b)&&[0,1,2].every(i=>equal(a[i]+a[(i+1)%3],b[i]+b[(i+1)%3]))}
  function asa(a,b){return d.proper(a)&&d.proper(b)&&[0,1,2].filter(i=>equal(A+a[(i+1)%3]+a[i]+a[(i+2)%3],A+b[(i+1)%3]+b[i]+b[(i+2)%3])).length>=2&&[0,1,2].some(i=>equal(a[i]+a[(i+1)%3],b[i]+b[(i+1)%3]))}
  const supported=dependencies=>dependencies.every(n=>typeof n==='number'?n<lesson.id:EuclidBooks.earlier(n,lesson));
  function argument(name,dependencies,steps){derivations.push({name,dependencies,steps});return supported(dependencies)}
  function certificateClaims(){let stamp=state.facts.join('\u0000');if(stamp===certificateStamp)return certificateCache;let claims=[];for(let raw of state.facts){if(!raw.startsWith('book:'))continue;try{let record=JSON.parse(raw.slice(5));let reference=EuclidBooks.dependencyRule(record.rule);if((typeof record.rule==='number'?record.rule<lesson.id:EuclidBooks.earlier(reference,lesson))&&EuclidConstruction.certificate(record,state.points)&&record.claims?.every(s=>parse(s)))for(let s of record.claims)claims.push({rule:reference,claim:parse(s),record})}catch{}}certificateStamp=stamp;certificateCache=claims;return claims}
  function preferredReferences(t){return atomic(t)&&t.left[0].kind==='length'&&equilateral(t)?['D20']:[]}
  function sourceReferences(t){return [...new Set([...certificateClaims().filter(c=>key(c.claim)===key(t)).map(c=>c.rule),...facts.filter(f=>f.kind==='congruence'&&parts(t,f)||t.kind==='right'&&right(t.angle)&&atomic(f)&&f.left[0].kind==='angle'&&[...f.left,...f.right].some(v=>canonical(v.term)===canonical(A+t.angle))).map(f=>origins.get(f)).filter(r=>/^(?:I|E[23]\.)/.test(r||''))])]}
  function accept(t,reference){origins.set(t,reference);facts.push(t)}
  function certificate(t,reference){return certificateClaims().some(c=>c.rule===reference&&key(c.claim)===key(t))}
  function circleEquality(t){if(!atomic(t)||t.left[0].kind!=='length'||t.right[0].kind!=='length')return false;let x=t.left[0].term,y=t.right[0].term;return state.circles.some(c=>{let end=s=>s[0]===c.a?s[1]:s[1]===c.a?s[0]:null,a=end(x),b=end(y);return a&&b&&EuclidConstruction.radius(state,c,a)&&EuclidConstruction.radius(state,c,b)})}
  function quadrilateralPart(t){return [...facts,...certificateClaims().map(c=>c.claim)].some(f=>{if(f.kind!=='shape'||f.property!=='square')return false;let p=f.polygon,edges=[...p].map((a,i)=>a+p[(i+1)%4]);if(atomic(t)&&t.left[0].kind==='length'&&t.right[0].kind==='length')return f.property==='square'&&[t.left[0].term,t.right[0].term].every(s=>edges.some(e=>sort(e)===sort(s)));if(t.kind==='parallel')return false;if(f.property!=='square')return false;let x=t.kind==='right'?t.angle[0]+t.angle[1]:t.a,y=t.kind==='right'?t.angle[1]+t.angle[2]:t.b;return ['right','perpendicular'].includes(t.kind)&&edges.some((e,i)=>lineKey(x)===lineKey(e)&&lineKey(y)===lineKey(edges[(i+1)%4])||lineKey(y)===lineKey(e)&&lineKey(x)===lineKey(edges[(i+1)%4]));})}
  function equilateral(t){let triangles=[...facts,...certificateClaims().map(c=>c.claim)].filter(f=>f.kind==='shape'&&f.property==='equilateral').map(f=>f.polygon);if(t.kind==='eq'&&atomic(t)&&t.left[0].kind==='length'&&t.right[0].kind==='length')return triangles.some(p=>[...t.left[0].term,...t.right[0].term].every(n=>p.includes(n)));return t.kind==='shape'&&t.property==='equilateral'&&(triangles.some(p=>sort(p)===sort(t.polygon))||d.proper(t.polygon)&&equal(t.polygon.slice(0,2),t.polygon.slice(1))&&equal(t.polygon.slice(0,2),t.polygon[0]+t.polygon[2]))}
  function angleDirections(angle){let [a,v,b]=angle;function ray(p){
   let queue=[lineKey(v+p)],seen=new Set(),pairs=parallelPairs().map(([x,y])=>[lineKey(x),lineKey(y)]);
   while(queue.length){let x=queue.shift();if(seen.has(x))continue;seen.add(x);for(let [u,w] of pairs)if(u===x)queue.push(w);else if(w===x)queue.push(u)}
   return [[...seen].sort()[0],d.direction(v,p)];
  }return [ray(a),ray(b)]}
  function anglesEqualByParallels(a,b){let x=angleDirections(a),y=angleDirections(b);return [y,[...y].reverse()].some(z=>x[0][0]===z[0][0]&&x[1][0]===z[1][0]&&x[0][1]*x[1][1]===z[0][1]*z[1][1])}
  function adjacentStraight(t){if(t.kind!=='eq')return false;let angles=t.left.filter(v=>v.kind==='angle'&&v.term!=='RIGHT');if(angles.length!==2||angles.some(v=>v.coefficient!==1)||t.left.length!==2||t.right.length!==1||t.right[0].term!=='RIGHT'||t.right[0].coefficient!==2)return false;let [x,y]=angles.map(v=>v.term.slice(1));for(let a of [x,[...x].reverse().join('')])for(let b of [y,[...y].reverse().join('')])if(a[1]===b[1]&&d.sameRay(a[1],a[2],b[0])&&d.between(a[0],a[1],b[2]))return true;return false}
  function parallelAngleTest(t,otherTests=false){
   if(t.kind!=='parallel'||!d.drawn(...t.a)||!d.drawn(...t.b))return false;
   for(let g of d.names)for(let h of d.names)if(g!==h&&lineKey(t.a).includes(g)&&lineKey(t.b).includes(h)&&d.drawn(g,h))for(let u of t.a)for(let v of t.b){
    if(u===g||v===h)continue;
    if(!otherTests&&!sameSide(u,v,g+h)&&equal(A+u+g+h,A+g+h+v))return true;
    if(otherTests&&sameSide(u,v,g+h)){
     if(equalExpression(parse('angle '+u+g+h+' + angle '+g+h+v+' = 2 right angles')))return true;
     for(let k of d.names)if(d.between(k,g,h)&&equal(A+k+g+u,A+g+h+v))return true;
    }
   }
   return false;
  }
  function parallelTransitivity(t){
   if(t.kind!=='parallel')return false;let a=lineKey(t.a),b=lineKey(t.b),pairs=parallelPairs().map(([x,y])=>[lineKey(x),lineKey(y)]);
   let neighbours=x=>pairs.flatMap(([u,v])=>u===x?[v]:v===x?[u]:[]);
   return neighbours(a).some(c=>c!==a&&c!==b&&neighbours(b).includes(c));
  }
  function exteriorTarget(t){if(t.left?.some(v=>v.coefficient!==1)||t.right?.some(v=>v.coefficient!==1))return false;if(t.kind!=='gt'||t.left.length!==1||t.right.length!==1||t.left[0].kind!=='angle'||t.right[0].kind!=='angle')return false;let x=t.left[0].term.slice(1),y=t.right[0].term.slice(1);for(let a of [x,[...x].reverse().join('')])for(let other of d.names)if(d.between(other,a[1],a[2])&&d.proper(a[0]+other+a[1])&&[a[0],other].includes(y[1])&&sort(y)===sort(a[0]+other+a[1]))return true;return false}
  function sideAngleOrder(t,inverse=false){if(t.left?.some(v=>v.coefficient!==1)||t.right?.some(v=>v.coefficient!==1))return false;if(t.kind!=='gt'||t.left.length!==1||t.right.length!==1)return false;let x=t.left[0].term,y=t.right[0].term;if(inverse){if(t.left[0].kind!=='length'||t.right[0].kind!=='length')return false;let common=[...x].find(n=>y.includes(n));if(!common)return false;let u=x.replace(common,''),v=y.replace(common,'');return d.proper(common+u+v)&&posted(parse('angle '+common+v+u+' > angle '+common+u+v))}if(!x.startsWith(A)||!y.startsWith(A))return false;let a=x.slice(1),b=y.slice(1);if(sort(a)!==sort(b)||a[1]===b[1]||!d.proper(a))return false;let third=[...a].find(n=>n!==a[1]&&n!==b[1]);return posted(parse(third+b[1]+' > '+third+a[1]))}
  function twoAngleSidePart(t){
   if(t.kind==='congruence')return asa(t.a,t.b);
   if(!atomic(t)||t.left[0].kind!=='length'||facts.filter(f=>atomic(f)&&f.left[0].kind==='angle').length<2)return false;
   let x=t.left[0].term,y=t.right[0].term;
   for(let a of d.names)for(let b of d.names)for(let v of [y,[...y].reverse().join('')])if(!x.includes(a)&&!v.includes(b)&&asa(x+a,v+b))return true;
   return false;
  }
  function inverseIsosceles(t){if(!atomic(t)||t.left[0].kind!=='length')return false;let x=t.left[0].term,y=t.right[0].term,a=[...x].find(n=>y.includes(n));if(!a)return false;let b=x.replace(a,''),c=y.replace(a,'');return b!==c&&d.proper(a+b+c)&&equal(A+a+b+c,A+a+c+b)}
  function triangleInequality(t){if(t.kind!=='gt'||t.left.length!==2||t.right.length!==1||[...t.left,...t.right].some(v=>v.kind!=='length'||v.coefficient!==1))return false;let x=t.left[0].term,y=t.left[1].term,z=t.right[0].term,a=[...x].find(n=>y.includes(n));return !!a&&sort(x.replace(a,'')+y.replace(a,''))===sort(z)&&d.proper(a+z)}
  function hinge(t,inverse){if(t.left?.some(v=>v.coefficient!==1)||t.right?.some(v=>v.coefficient!==1))return false;if(t.kind!=='gt'||t.left.length!==1||t.right.length!==1)return false;let x=t.left[0].term,y=t.right[0].term;if(inverse){if(!x.startsWith(A)||!y.startsWith(A))return false;let a=x.slice(1),b=y.slice(1);return d.proper(a)&&d.proper(b)&&equal(a[0]+a[1],b[0]+b[1])&&equal(a[1]+a[2],b[1]+b[2])&&posted(parse(a[0]+a[2]+' > '+b[0]+b[2]))}if(t.left[0].kind!=='length'||t.right[0].kind!=='length')return false;for(let a of d.names)for(let b of d.names)for(let z of [y,[...y].reverse().join('')])if(!x.includes(a)&&!z.includes(b)&&d.proper(a+x)&&d.proper(b+z)&&equal(a+x[0],b+z[0])&&equal(a+x[1],b+z[1])&&posted(parse('angle '+x[0]+a+x[1]+' > angle '+z[0]+b+z[1])))return true;return false}
  function innerBrokenLine(t){for(let f of facts)if(f.kind==='inside'&&inside(f.point,f.triangle)){let [a,b,c]=f.triangle,p=f.point;if(key(t)===key(parse(a+b+' + '+a+c+' > '+p+b+' + '+p+c))||key(t)===key(parse('angle '+b+p+c+' > angle '+b+a+c)))return true}return false}
  function uniqueness(t){if(t.kind!=='pointEqual'||t.a===t.b)return false;for(let a of d.names)for(let b of d.names)if(a!==b&&![t.a,t.b].includes(a)&&![t.a,t.b].includes(b)&&d.proper(a+b+t.a)&&d.proper(a+b+t.b)&&sameSide(t.a,t.b,a+b)&&equal(a+t.a,a+t.b)&&equal(b+t.a,b+t.b))return true;return false}
  function twoAnglesLess(t){if(t.kind!=='gt'||t.left.length!==1||t.left[0].term!=='RIGHT'||t.left[0].coefficient!==2||t.right.length!==2||t.right.some(v=>v.kind!=='angle'||v.term==='RIGHT'||v.coefficient!==1))return false;let a=t.right[0].term.slice(1),b=t.right[1].term.slice(1);return sort(a)===sort(b)&&a[1]!==b[1]&&d.proper(a)}
  function linear(t){if(t.kind!=='eq')return false;const dimension=kind=>['square','product','area'].includes(kind)?'area':kind,type=dimension(t.left[0].kind),relevant=facts.filter(f=>f.kind==='eq'&&dimension(f.left[0].kind)===type);let terms=[...scalarTerms(t),...relevant.flatMap(scalarTerms)],equations=relevant.map(f=>subtract(expr(f.left),expr(f.right),1));let plain=terms.filter(v=>v.startsWith(A)||/^[A-Z]{2}$/.test(v));for(let id of d.identities(plain)){let row=new Map();for(let [k,v] of id){if(k===A+'STRAIGHT'){k='RIGHT';v*=2}row.set(k,(row.get(k)||0)+v)}equations.push(row)}return span(subtract(expr(t.left),expr(t.right),1),equations)}
  let areaCount=-1,areaBasis=new Map(),areaTerms=new Map();
  function structuralArea(delta){
   // Oriented polygon boundaries cancel along shared edges. A recorded
   // collinear triple contributes a zero-area triangle. No metric identities
   // or displayed coordinates are needed for these additive decompositions.
   const boundary=(p,coefficient=1)=>{let row=new Map();for(let i=0;i<p.length;i++){let a=p[i],b=p[(i+1)%p.length];if(a===b)continue;let k='W:'+sort(a+b),n=a<b?coefficient:-coefficient;row.set(k,(row.get(k)||0)+n)}return subtract(row,new Map())};
   if(areaCount!==facts.length){
    areaCount=facts.length;areaBasis=new Map();areaTerms=new Map();
    for(let i=0;i<d.names.length;i++)for(let j=i+1;j<d.names.length;j++)for(let k=j+1;k<d.names.length;k++){
     let [a,b,c]=[d.names[i],d.names[j],d.names[k]];if(!d.collinear(a,b,c)||!d.drawn(a,b))continue;
     let row=boundary(a+b+c);for(let [pivot,v] of areaBasis)if(row.has(pivot))row=subtract(row,v,row.get(pivot));
     if(row.size){let pivot=[...row.keys()].sort()[0],scale=row.get(pivot);for(let [v,n] of row)row.set(v,n/scale);areaBasis.set(pivot,row)}
    }
   }
   let result=new Map();for(let [term,n] of delta){
    if(!term.startsWith('AREA(')){let k='M:'+term;result.set(k,(result.get(k)||0)+n);continue}
    if(!areaTerms.has(term)){
     let p=term.slice(5,-1),vertices=[...p],low=vertices.reduce((a,b)=>d.direction(a,b)>0?a:b),i=p.indexOf(low),sign=d.turn(p[(i+p.length-1)%p.length],low,p[(i+1)%p.length]);
     areaTerms.set(term,sign?boundary(p,sign/2):vertices.every(v=>d.collinear(p[0],p[1],v))?new Map():null);
    }
    let row=areaTerms.get(term);if(!row)return false;result=subtract(result,row,-n);
   }
   for(let [pivot,row] of areaBasis)if(result.has(pivot))result=subtract(result,row,result.get(pivot));return !result.size;
  }
  function strictCommonNotion(t,rule){
   const equations=facts.filter(f=>f.kind==='eq').map(f=>subtract(expr(f.left),expr(f.right))),sign=rule==='CN2'?1:-1;
   return facts.filter(f=>f.kind==='gt').some(f=>{let a=subtract(expr(t.left),expr(f.left)),b=subtract(expr(t.right),expr(f.right));return a.size&&b.size&&[...a.values(),...b.values()].every(n=>n*sign>0)&&span(subtract(a,b),equations)});
  }
  function commonNotion(t,rule){
   if(t.kind==='gt')return strictCommonNotion(t,rule);
   if(t.kind!=='eq')return false;
   const dimension=items=>['square','product'].includes(items[0].kind)?'area':items[0].kind,type=dimension(t.left);
   let eqs=facts.filter(f=>f.kind==='eq'&&dimension(f.left)===type);if(!eqs.length&&rule!=='CN2')return false;
   let all=[...scalarTerms(t),...eqs.flatMap(scalarTerms)],identities=d.identities(all.filter(s=>s.startsWith(A)||/^[A-Z]{2}$/.test(s))).map(row=>{let out=new Map();for(let [k,v] of row){if(k===A+'STRAIGHT'){k='RIGHT';v*=2}out.set(k,(out.get(k)||0)+v)}return out}),hasAreas=all.some(s=>s.startsWith('AREA(')),cache=new Map();
   const sum=(x,y)=>subtract(x,y,-1);
   function structural(x,y){let delta=subtract(x,y),key=JSON.stringify([...delta].sort());if(!delta.size||span(delta,identities))return true;if(!hasAreas)return false;if(!cache.has(key))cache.set(key,structuralArea(delta));return cache.get(key)}
   if(rule==='CN2'&&(span(subtract(expr(t.left),expr(t.right)),identities)||hasAreas&&structural(expr(t.left),expr(t.right))))return true;
   let pairs=eqs.flatMap(f=>[[expr(f.left),expr(f.right)],[expr(f.right),expr(f.left)]]),target=[expr(t.left),expr(t.right)],common=[...new Set([...all.map(canonical),...identities.flatMap(row=>[...row.keys()])])].map(k=>{let v=new Map([[k,1]]);return [v,v]});for(let v of [...target,...pairs.flat()])common.push([v,v]);
   for(let [left,right] of pairs){let partLeft=rule==='CN2'?subtract(target[0],left):subtract(left,target[0]),partRight=rule==='CN2'?subtract(target[1],right):subtract(right,target[1]);if(partLeft.size&&partRight.size&&[...partLeft.values(),...partRight.values()].every(n=>n>0)&&structural(partLeft,partRight))return true}
   for(let [left,right] of pairs)for(let [partLeft,partRight] of [...pairs,...common]){
    if(rule==='CN2'&&structural(target[0],sum(left,partLeft))&&structural(target[1],sum(right,partRight)))return true;
    if(rule==='CN3'&&(structural(sum(target[0],partLeft),left)&&structural(sum(target[1],partRight),right)||structural(sum(target[1],partLeft),left)&&structural(sum(target[0],partRight),right)))return true;
   }
   if(rule==='CN3')for(let [whole] of common)for(let [partLeft,partRight] of pairs)if(structural(sum(target[0],partLeft),whole)&&structural(sum(target[1],partRight),whole))return true;
   return false;
  }
  function geometricAlgebra(t){return symbolicConsequence(t,{d,facts,certificateClaims,parallel,equal,isParallelogram,allowParallelogramIdentity:lesson.id>34,onUseTheorem:n=>symbolicDependencies.add(n)})}
  function check(t,reference,directOnly=false){
   if(!t)return {ok:false,error:'Unrecognized format. Use the keyword-based format help or the statement grammar in How to play.'};
   reference=EuclidBooks.runtimeRule(reference);
   if(/^E2\./.test(reference)&&typeof BookTwoLogic!=='undefined'){if(EuclidBooks.earlier(reference,lesson)&&certificate(t,reference))return {ok:true,explanation:'Certified construction using '+reference+'.',sourcePropositions:[reference]};return BookTwoLogic.check(t,reference,{d,equal,right,perpendicular,acute:angle=>strictLinear(parse('angle '+angle+' < right angle'))},lesson)}
   let result=checkDirect(t,reference);
   if(result.ok||directOnly||!/^I\d+$/.test(reference)||Number(reference.slice(1))>=lesson.id)return result;
   // A named source may support a validated compound argument, never an
   // arbitrary symbolic consequence that merely happens to mention that source.
   let derived=checkDirect(t,'Logic'),argument=derived.derivation;
   if(derived.ok&&argument&&argument.name!=='Symbolic Euclidean deduction'&&argument.dependencies.includes(Number(reference.slice(1))))return {...derived,sourcePropositions:[...new Set([...derived.sourcePropositions,...argument.dependencies.map(EuclidBooks.dependencyRule)])]};
   return result;
  }
  function checkDirect(t,reference){
   derivations.length=0;symbolicDependencies.clear();
   if(namesIn(t).some(n=>!d.points[n]))return {ok:false,error:'This statement names a point not in the construction.'};
   if(t.kind==='gt'&&exprKey(t.left)===exprKey(t.right))return {ok:false,error:'A magnitude cannot be strictly greater than itself.'};
   if(t.kind==='parallel'&&lineKey(t.a)===lineKey(t.b))return {ok:false,error:'Coincident lines are not distinct parallel lines.'};
   const number=Number(reference?.slice(1));if(/^I\d+$/.test(reference)&&number>=lesson.id)return {ok:false,error:'Use an earlier proposition; the current result cannot justify itself.'};
   let ok=false,reason='';
   if(reference==='Given'){ok=(lesson.givens||[]).some(s=>key(parse(s))===key(t));reason='Hypothesis.'}
   else if(certificate(t,reference)){ok=true;reason='Certified construction using '+reference+'.'}
   else if(reference==='D15'){ok=circleEquality(t);reason='Both endpoints must be recorded on the same constructed circle. Mark the circle endpoint or intersection explicitly with D1; P3 records the endpoint used to define the circle.'}
   else if(reference==='D2.1'){ok=lesson.book>=2&&rectangleProductIdentity(t);reason='A rectangle is contained by its adjacent perpendicular sides. Parallel sides, a right angle, and any substituted side lengths must already be established.'}
   else if(reference==='D2.2'){ok=lesson.book>=2&&gnomon(t);reason='A gnomon consists of a parallelogram about a recorded diagonal and its two complements. Its six boundary vertices exclude the other parallelogram about that diagonal.'}
   else if(reference==='CN1'){ok=t.kind==='eq'&&equalExpression(t);reason='Transitivity of previously established equalities.'}
   else if(reference==='CN2'||reference==='CN3'){ok=commonNotion(t,reference);reason=reference==='CN2'?'Add established equal magnitudes to equal magnitudes.':'Subtract established equal parts from equal wholes.'}
   else if(reference==='P4'){ok=atomic(t)&&t.left[0].kind==='angle'&&t.right[0].kind==='angle'&&[t.left[0].term,t.right[0].term].every(s=>s==='RIGHT'||right(s.slice(1)));reason='Postulate 4 equates angles already established as right angles.'}
   else if(reference==='D10'){ok=t.kind==='perpendicular'&&(perpendicularByAdjacent(t)||perpendicular(t.a,t.b))||t.kind==='right'&&right(t.angle);reason='Equal adjacent angles define perpendicular lines; a straight angle is two right angles.'}
   else if(reference==='D22'){ok=quadrilateralPart(t)||t.kind==='shape'&&(t.property==='square'&&isParallelogram(t.polygon)&&(()=>{let [a,b,c,e]=t.polygon;return edges(t.polygon).every(side=>equal(side,a+b))&&[...t.polygon].every((v,i)=>right(t.polygon[(i+3)%4]+v+t.polygon[(i+1)%4]))})());reason='Definition of a square and its equal sides and right angles; it does not define a general parallelogram.'}
   else if(reference==='D23'){ok=t.kind==='parallel'&&parallel(t.a,t.b);reason='Parallelism established by the construction or earlier premises.'}
   else if(reference==='D20'){ok=equilateral(t);let witness=certificateClaims().find(c=>c.claim.kind==='shape'&&c.claim.property==='equilateral'&&namesIn(t).every(n=>c.claim.polygon.includes(n)));reason=witness?'D20 uses the equilateral triangle '+witness.claim.polygon+' established by the E.1 construction record. Its sides are equal even without a separate equilateral statement.':'D20 uses an earlier established equilateral triangle, or establishes one from its proved equal sides.'}
   else if(reference==='CN4'){
    let prior=facts.some(f=>f.kind==='congruence'&&origins.get(f)==='CN4'&&parts(t,f)),bySAS=t.kind==='congruence'&&sas(t.a,t.b),bySSS=t.kind==='congruence'&&supported([7])&&sss(t.a,t.b);ok=prior||bySAS||bySSS;reason='Equality of coincident figures or parts under justified superposition.';
    if(prior)argument('Corresponding coincident parts',[],['Use the previously established superposition and preserve its vertex correspondence.','The named corresponding parts coincide and are equal by common notion 4.']);
    else if(bySAS)argument('Side-angle-side superposition',[4],['Place the first equal side on its corresponding side.','The equal included angle fixes the second ray; the second equal side makes its endpoint coincide as well.','The corresponding triangle and remaining parts coincide and are equal by common notion 4.']);
    else if(bySSS)argument('Rigid superposition',[7],['Place the equal base endpoints on one another.','Equal distances to the base endpoints determine a unique apex on that side by I.7; otherwise the distinct apices contradict I.7.','The corresponding angles and triangles coincide and are equal by common notion 4.']);
   }
   else if(reference==='P5'||reference==='I29'){ok=reference==='P5'&&postulateMeeting(t)||parallelAngleConsequence(t);reason='Angles of a transversal across established parallels (parallel postulate).'}
   else if(reference==='I4'||reference==='I8'||reference==='I26'){ok=t.kind==='congruence'&&(reference==='I4'?sas(t.a,t.b):reference==='I8'?sss(t.a,t.b):asa(t.a,t.b))||trianglePart(t,reference==='I4'?sas:reference==='I8'?sss:asa)||facts.some(f=>f.kind==='congruence'&&parts(t,f)&&(origins.get(f)===reference||reference==='I4'&&sas(f.a,f.b)));reason='Triangle congruence and corresponding parts.'}
   else if(reference==='I5'){ok=isoscelesAngle(t);reason='Base angles of an isosceles triangle.'}
   else if(reference==='I6'){ok=inverseIsosceles(t);reason='Equal base angles imply equal opposite sides.'}
   else if(reference==='I7'){ok=uniqueness(t);reason='Uniqueness of an apex on a specified side of a base.'}
   else if(reference==='I13'){ok=adjacentStraight(t);reason='Angles on a straight line sum to two right angles.'}
   else if(reference==='I14'){ok=straightFromSum(t);reason='Supplementary adjacent angles determine a straight line.';if(!ok&&uniquePerpendicular(t)){ok=true;reason='Two perpendiculars to the same line through the same point form one straight line.';argument('Unique perpendicular through a point',[13,14],['Both named straight lines pass through the same point and make right angles with the same baseline.','Extend one of the lines in thought. Its adjacent right angles sum to two right angles (E1.13).','The converse straight-angle result (E1.14) forces the other perpendicular onto that same straight line. No hypothetical point is added to the construction.'])}}
   else if(reference==='I15'){ok=atomic(t)&&t.left[0].term.startsWith(A)&&t.right[0].term.startsWith(A)&&vertical(t.left[0].term.slice(1),t.right[0].term.slice(1));reason='Only the two actual vertically opposite angles are equal by I.15; substitute other equal angles separately using CN1.'}
   else if(reference==='I16'){ok=exteriorTarget(t);reason='An exterior angle exceeds either opposite interior angle.'}
   else if(reference==='I17'){ok=twoAnglesLess(t);reason='Any two angles of a triangle total less than two right angles.'}
   else if(reference==='I18'||reference==='I19'){ok=sideAngleOrder(t,reference==='I19');reason='Correspondence between the order of sides and opposite angles.'}
   else if(reference==='I20'){ok=triangleInequality(t);reason='Triangle inequality.'}
   else if(reference==='I21'){ok=innerBrokenLine(t);reason='An interior broken line shortens the two sides and enlarges the included angle.'}
   else if(reference==='I24'||reference==='I25'){ok=hinge(t,reference==='I25');reason='Hinge comparison with two established equal side pairs.'}
   else if(reference==='I27'||reference==='I28'){ok=parallelAngleTest(t,reference==='I28');reason=reference==='I27'?'Equal alternate angles imply parallel lines.':'Equal corresponding angles or supplementary same-side interior angles imply parallel lines.'}
   else if(reference==='I32'){ok=triangleAngleSum(t);reason='The exterior angle equals the two opposite interior angles; the three triangle angles sum to two right angles.'}
   else if(reference==='I30'){ok=parallelTransitivity(t);reason='Two established parallel pairs must share a third distinct line.'}
   else if(/^I(?:3[3-9]|4[0-3])$/.test(reference)){ok=areaOrParallelogramConsequence(t,number);reason='Established parallelograms, equal bases, and common parallels imply the claimed parts or areas.'}
   else if(reference==='I47'){ok=pythagorean(t);reason='The Pythagorean identity for an established right angle.'}
   else if(reference==='I48'){ok=conversePythagorean(t);reason='The converse Pythagorean identity.'}
   else if(reference==='CN5'){ok=properPart(t);reason='A proper part is smaller than the whole.'}
   else if(reference==='Logic'){
    if(lesson.requireConstruction&&!constructionProgress(state,lesson).complete)return {ok:false,error:'Complete the recorded auxiliary construction before using this deduction.'};
    let squareIdentity=pythagoreanForm(t);if(lesson.id<=47&&squareIdentity&&pythagorean(squareIdentity)&&!squareAlignments(squareIdentity))return {ok:false,error:'Establish the straight-line alignments of the squares and triangle before using the Pythagorean area argument.'};
    if(t.kind==='shape'&&t.property==='parallelogram'&&isParallelogram(t.polygon)&&argument('Parallelogram from opposite parallels',[],['Both pairs of opposite sides are established as parallel.','This is what is meant by a parallelogram; Definition 22 is not being used as an extra theorem.']))ok=true;
    else if(t.kind==='right'&&right(t.angle)&&argument('Substitute equal angles in an established right angle',sourceReferences(t).map(EuclidBooks.dependency),['An earlier angle is established as right.','The posted angle equality identifies the requested angle with that right angle.']))ok=true;
    else if(equalSquaresFromLengths(t)&&argument('Square equal segment lengths',[],['The two segment lengths are already established equal.','Squaring equal nonnegative quantities preserves equality.']))ok=true;
    else if(t.kind==='eq'&&linear(t)&&argument('Algebraic consequence of established equalities',[],['Use only the previously established equalities and recorded additive decompositions.','Substitute equal quantities and cancel common positive factors.']))ok=true;
    else if(squareAreaIdentity(t)&&argument('Square-area notation',[],['The named figure is established as a square.','Its area and the square of its own side length denote the same magnitude.']))ok=true;
    else if(t.kind==='gt'&&strictLinear(t)){ok=true;reason='Substitute established equal magnitudes in an earlier strict inequality.';argument('Preserve a strict inequality under established equalities',[],['Use the earlier strict inequality.','Substitute the proved equality of angle sums without changing its direction.'])}
    else if(twoAngleSidePart(t)&&argument('Two angles and a side by contradiction',[3,4,16],['If the equal side adjoins both equal angles, suppose an adjacent side unequal and cut the greater. SAS gives equal angles, a whole equal to its proper part. Thus that side is equal.','If the given side opposes an equal angle, suppose the side adjoining the equal angles unequal. Cut the larger to the smaller and join the hypothetical cut point to the other vertex. SAS makes an exterior angle equal to an opposite interior angle, contradicting I.16.','Discharge both possible inequalities. The adjoining sides are equal; SAS gives the remaining side and angle. Hypothetical points are not global construction facts.']))ok=true;
    else if(inverseIsosceles(t)&&argument('Converse isosceles by contradiction',[3,4],['If the sides differ, cut the greater equal to the smaller (I.3).','SAS makes a proper subtriangle equal to the whole (I.4).','This contradicts common notion 5; the sides are equal.']))ok=true;
    else if(uniqueness(t)&&argument('Apex uniqueness',[5],['Join the two proposed apices.','The two isosceles triangles give equal base angles (I.5).','Angle containment would make a whole equal to a proper part.']))ok=true;
    else if(exteriorTarget(t)&&argument('Exterior angle comparison',[3,4,10,15],['Bisect a side, extend the median by an equal length, and use SAS.','Vertical angles identify a copy of the opposite angle strictly inside the exterior angle.','Common notion 5 makes the exterior angle greater.']))ok=true;
    else if(straightFromSum(t)&&argument('Straight line from supplementary adjacent angles',[13],['Extend the first ray in a straight line.','Both adjacent-angle sums are two right angles.','Subtract their shared angle; the remaining rays coincide, establishing the stated collinearity.']))ok=true;
    else if(twoAnglesLess(t)&&argument('Two angles less than a straight angle',[13,16],['Replace the adjacent exterior angle by the greater angle supplied by I.16.','The exterior angle and adjacent interior angle sum to two right angles.']))ok=true;
    else if(sideAngleOrder(t)&&argument('Side-to-angle order',[3,5,16],['Cut the greater side to the smaller length.','Use the isosceles base angles and the exterior-angle inequality.']))ok=true;
    else if(sideAngleOrder(t,true)&&argument('Angle-to-side order',[5,18],['Equal sides would give equal angles (I.5).','The opposite ordering of the sides would reverse the angle inequality (I.18).','Trichotomy leaves the claimed ordering.']))ok=true;
    else if(triangleInequality(t)&&argument('Triangle inequality',[3,5,19],['Extend one side by the length of another.','The isosceles base angles and I.19 compare the extended side with the third side.']))ok=true;
    else if(innerBrokenLine(t)&&argument('Interior broken-line comparison',[16,20],['Extend an interior segment to the opposite boundary.','Apply triangle inequalities and cancel the shared portion.','Use the two exterior-angle inequalities for the angle comparison.']))ok=true;
    else if(hinge(t,false)&&argument('Hinge inequality',[3,4,5,19,23],['Copy the greater included angle at the vertex of the smaller one (I.23).','Cut the new ray to the equal side length (I.3), join the two new segments, and apply SAS.','Base-angle and side-order comparisons show the remaining base is greater.']))ok=true;
    else if(hinge(t,true)&&argument('Converse hinge inequality',[4,24],['Equal included angles would give equal bases (I.4).','A smaller included angle would give the opposite base inequality (I.24).','Trichotomy leaves the greater included angle.']))ok=true;
    else if(parallelAngleTest(t)&&argument('Parallel test by contradiction',[16],['Temporarily assume a meeting point X on either side. X and the resulting triangle are hypothetical, not actual construction objects.','The given alternate-angle equality would equate an exterior angle with an opposite interior angle, contradicting I.16. Discharge the meeting assumption on both sides; no point X enters the construction record.']))ok=true;
    else if(derivedAreaArgument(t))ok=true;
    else if(pythagorean(t)&&argument('Pythagorean area argument',[4,14,31,41,46],['Construct squares on the three sides and the parallel partition of the opposite square.','Compare the constructed triangles by SAS and equate their doubled areas using the common base and parallels.','Add the two rectangle areas to obtain the square on the opposite side.']))ok=true;
    else if(conversePythagorean(t)&&argument('Converse Pythagorean comparison',[8,11,47],['Construct the perpendicular comparison triangle with its recorded equal leg.','Apply the right-triangle square identity and the given equality of squares.','Equal nonnegative squared lengths give SSS congruence and the required right angle.']))ok=true;
    else if(atomic(t)&&t.left[0].kind==='length'&&t.right[0].kind==='length'&&d.drawn(...t.left[0].term)&&d.drawn(...t.right[0].term)&&equal(t.left[0].term+'^2',t.right[0].term+'^2')){ok=true;reason='Segments have nonnegative lengths, so established equal squares imply equal lengths.';argument('Equal squares of segment lengths',[],['The squares of the two lengths were established equal on earlier lines.','Both segment lengths are nonnegative, so their equal squares have equal nonnegative roots.'])}
    else if((t.kind==='eq'||t.kind==='parallel'||t.kind==='right')&&geometricAlgebra(t)){ok=true;reason='A symbolic Euclidean identity follows from the established constraints; no displayed measurements were used.';argument('Symbolic Euclidean deduction',[...new Set([...symbolicDependencies,...certificateClaims().map(c=>EuclidBooks.dependency(c.rule)),...facts.map(f=>origins.get(f)).filter(r=>/^(?:I|E[23]\.)/.test(r||'')).map(EuclidBooks.dependency)])],['Translate established side, angle, parallel, and area constraints into identities.','Eliminate those identities from the claim.','The remainder is identically zero for arbitrary admissible coordinates.'])}
   }
   return {ok:!!ok,sourcePropositions:ok?[...new Set([...sourceReferences(t),...[...symbolicDependencies].map(n=>'I'+n)])]:[],error:ok?'':'The stated premises and construction do not establish this claim using '+reference+'.',explanation:reason||derivations.at(-1)?.name,derivation:derivations.at(-1)||null};
  }
  function equalExpression(t){let graph=new Map(),join=(a,b)=>{if(!graph.has(a))graph.set(a,new Set());graph.get(a).add(b)};for(let f of facts)if(f.kind==='eq'){let a=exprKey(f.left),b=exprKey(f.right);join(a,b);join(b,a)}let queue=[exprKey(t.left)],end=exprKey(t.right),seen=new Set();while(queue.length){let x=queue.shift();if(x===end)return true;if(seen.has(x))continue;seen.add(x);for(let y of graph.get(x)||[])queue.push(y)}return false}
  function isoscelesAngle(t){if(!atomic(t)||t.left[0].kind!=='angle'||t.right[0].kind!=='angle')return false;let a=t.left[0].term.slice(1),b=t.right[0].term.slice(1);if(sort(a)!==sort(b)||a[1]===b[1])return false;let v=[...a].find(n=>n!==a[1]&&n!==b[1]);return d.proper(a)&&equal(v+a[1],v+b[1])}
  function vertical(a,b){return a[1]===b[1]&&[b,[...b].reverse().join('')].some(v=>d.between(a[0],a[1],v[0])&&d.between(a[2],a[1],v[2]))}
  function straightFromSum(t){if(t.kind!=='collinear')return false;for(let f of facts)if(f.kind==='eq'&&f.left.length===2&&f.left.every(q=>q.kind==='angle'&&q.term!=='RIGHT'&&q.coefficient===1)&&f.right.length===1&&f.right[0].term==='RIGHT'&&f.right[0].coefficient===2){let [x,y]=f.left.map(q=>q.term.slice(1));for(let a of [x,[...x].reverse().join('')])for(let b of [y,[...y].reverse().join('')])if(a[1]===b[1]&&d.sameRay(a[1],a[2],b[0])&&!sameSide(a[0],b[2],a[1]+a[2])&&sort(a[0]+a[1]+b[2])===sort(t.points))return true}return false}
  function uniquePerpendicular(t){if(t.kind!=='collinear'||t.points.length!==3)return false;for(let vertex of t.points){let ends=[...t.points].filter(n=>n!==vertex);if(!ends.every(n=>d.drawn(vertex,n)))continue;for(let base of d.names)if(base!==vertex&&d.drawn(vertex,base)&&ends.every(n=>perpendicular(vertex+n,vertex+base)))return true}return false}
  function perpendicularByAdjacent(t){for(let f of facts)if(atomic(f)&&f.left[0].kind==='angle'&&f.right[0].kind==='angle'){let x=f.left[0].term.slice(1),y=f.right[0].term.slice(1);for(let a of [x,[...x].reverse().join('')])for(let b of [y,[...y].reverse().join('')])if(a[1]===b[1]&&d.sameRay(a[1],a[2],b[0])&&d.between(a[0],a[1],b[2])&&(lineKey(t.a)===lineKey(a[1]+a[2])&&lineKey(t.b)===lineKey(a[0]+b[2])||lineKey(t.b)===lineKey(a[1]+a[2])&&lineKey(t.a)===lineKey(a[0]+b[2])))return true}return false}
  function transversalAngles(a,b){
   if(a[1]===b[1])return false;
   for(let x of [a,[...a].reverse().join('')])for(let y of [b,[...b].reverse().join('')]){
    let [u,v,k]=x,[l,w,z]=y;
    if(!d.drawn(v,w)||!onLine(v+w,k)||!onLine(v+w,l)||sameLine(v+u,w+z))continue;
    if(d.drawn(v,u)&&d.drawn(w,z)&&parallel(v+u,w+z))return true;
   }
   return false;
  }
  function parallelAngleConsequence(t){
   if(atomic(t)&&t.left[0].term.startsWith(A)&&t.right[0].term.startsWith(A)){let a=t.left[0].term.slice(1),b=t.right[0].term.slice(1);return transversalAngles(a,b)&&anglesEqualByParallels(a,b)}
   if(t.kind==='eq')for(let [left,rightTerms] of [[t.left,t.right],[t.right,t.left]])if(left.length===2&&left.every(v=>v.kind==='angle'&&v.term.startsWith(A)&&v.coefficient===1)&&rightTerms.length===1&&rightTerms[0].term==='RIGHT'&&rightTerms[0].coefficient===2){let [x,y]=left.map(v=>v.term.slice(1));if(!transversalAngles(x,y))continue;let a=angleDirections(x),b=angleDirections(y);if([b,[...b].reverse()].some(z=>a[0][0]===z[0][0]&&a[1][0]===z[1][0]&&a[0][1]*a[1][1]===-z[0][1]*z[1][1]))return true}
   return false;
  }
  const sameLine=(a,b)=>lineKey(a)===lineKey(b);
  const onLine=(line,p)=>line.includes(p)||d.collinear(line[0],line[1],p);
  const edges=p=>[...p].map((a,i)=>a+p[(i+1)%p.length]);
  function areaPair(t,ratio=1){
   if(t.kind!=='eq'||t.left.length!==1||t.right.length!==1)return null;
   let [a,b]=[t.left[0],t.right[0]];
   if(a.kind!=='area'||b.kind!=='area'||a.coefficient<=0||b.coefficient<=0)return null;
   if(Math.abs(b.coefficient/a.coefficient-ratio)<1e-8)return [a.term.slice(5,-1),b.term.slice(5,-1)];
   if(Math.abs(a.coefficient/b.coefficient-ratio)<1e-8)return [b.term.slice(5,-1),a.term.slice(5,-1)];
   return null;
  }
  function sameParallels(p,q,equalBases,sameBase,triangles=false){
   for(let [i,a] of edges(p).entries())for(let [j,b] of edges(q).entries()){
    if(sameBase?sort(a)!==sort(b):!sameLine(a,b))continue;
    if(equalBases&&!equal(a,b))continue;
    if(triangles){let u=p[(i+2)%3],v=q[(j+2)%3];if(u!==v?parallel(a,u+v):d.names.some(n=>n!==u&&d.drawn(u,n)&&parallel(a,u+n)))return true;}
    else {let u=edges(p)[(i+2)%4],v=edges(q)[(j+2)%4];if(sameLine(u,v)&&parallel(a,u))return true;}
   }
   return false;
  }
  function equalParallelJoins(t){
   let x,y;
   if(t.kind==='parallel'){x=t.a;y=t.b}
   else if(atomic(t)&&t.left[0].kind==='length'&&t.right[0].kind==='length'){x=t.left[0].term;y=t.right[0].term}else return false;
   if(new Set(x+y).size!==4||!d.drawn(...x)||!d.drawn(...y))return false;
   for(let v of [y,[...y].reverse().join('')]){let [a,c]=x,[b,e]=v;if(d.drawn(a,b)&&d.drawn(c,e)&&parallel(a+b,c+e)&&equal(a+b,c+e)&&d.direction(a,b)*d.direction(c,e)>0)return true}
   return false;
  }
  function parallelogramParts(t){
   // Named ray points need not be the actual corners. Use recorded incidence
   // and ray direction to identify both opposite interior angles before
   // applying the theorem; counting the letters in the claim loses this case.
   if(atomic(t)&&[t.left[0].term,t.right[0].term].every(s=>s.startsWith(A))){
    let x=t.left[0].term.slice(1),y=t.right[0].term.slice(1);
    if(x[1]!==y[1])for(let rays of [[y[0],y[2]],[y[2],y[0]]]){
     let corners=ray=>d.names.filter(n=>n!==x[1]&&n!==y[1]&&d.sameRay(x[1],x[ray?2:0],n)&&d.sameRay(y[1],rays[ray],n));
     for(let a of corners(0))for(let b of corners(1))if(isParallelogram(x[1]+a+y[1]+b))return true;
    }
   }
   let names=[...new Set(namesIn(t))];if(names.length!==4)return false;
   for(let rest of EuclidLogic.permutations(names.slice(1).join(''))){
    let p=names[0]+rest;if(!isParallelogram(p))continue;let [a,b,c,e]=p;
    if(atomic(t)&&t.left[0].kind==='length'&&t.right[0].kind==='length'&&[[a+b,c+e],[b+c,e+a]].some(([x,y])=>key(t)===key(equality(x,y))))return true;
    if(atomic(t)&&t.left[0].kind==='angle'&&[[e+a+b,b+c+e],[a+b+c,c+e+a]].some(([x,y])=>key(t)===key(equality('angle '+x,'angle '+y))))return true;
    let areas=areaPair(t);if(areas&&[[a+b+c,a+c+e,a+c],[b+c+e,b+e+a,b+e]].some(([x,y,diagonal])=>d.drawn(...diagonal)&&sortPair(polygonKey(areas[0]),polygonKey(areas[1]))===sortPair(polygonKey(x),polygonKey(y))))return true;
   }
   return false;
  }
  function converseAreaParallel(t,equalBases){
   if(t.kind!=='parallel')return false;
   for(let fact of facts){let pair=areaPair(fact);if(!pair||pair.some(p=>p.length!==3||!d.proper(p)))continue;
    for(let [i,a] of edges(pair[0]).entries())for(let [j,b] of edges(pair[1]).entries()){
     if(equalBases?(!sameLine(a,b)||!equal(a,b)):sort(a)!==sort(b))continue;
     let u=pair[0][(i+2)%3],v=pair[1][(j+2)%3];
     if(u!==v&&sameSide(u,v,a)&&((sameLine(t.a,u+v)&&sameLine(t.b,a))||(sameLine(t.b,u+v)&&sameLine(t.a,a))))return true;
    }
   }
   return false;
  }
  function complements(t){
   let pair=areaPair(t);if(!pair||pair.some(p=>p.length!==4||!isParallelogram(p)))return false;
   let common=[...pair[0]].filter(n=>pair[1].includes(n));if(common.length!==1)return false;let e=common[0];
   const at=p=>{let i=p.indexOf(e);return p.slice(i)+p.slice(0,i)};
   for(let p of [at(pair[0]),at([...pair[0]].reverse().join(''))])for(let q of [at(pair[1]),at([...pair[1]].reverse().join(''))]){
    let [,g,b,h]=p,[,f,v,k]=q;
    for(let a of d.names.filter(n=>onLine(g+b,n)&&onLine(f+v,n)))for(let c of d.names.filter(n=>onLine(h+b,n)&&onLine(k+v,n))){
     if(new Set(a+b+c+v).size===4&&isParallelogram(a+b+c+v)&&d.between(a,e,c)&&d.drawn(a,c)&&d.between(a,g,b)&&d.between(b,h,c)&&d.between(a,f,v)&&d.between(v,k,c))return true;
    }
   }
   return false;
  }
  function areaOrParallelogramConsequence(t,n){
   if(n===33)return equalParallelJoins(t);
   if(n===34)return parallelogramParts(t);
   if(n===39||n===40)return converseAreaParallel(t,n===40);
   if(n===43)return complements(t);
   if(n===41){
    let pair=areaPair(t,2);if(!pair||pair[0].length!==4||pair[1].length!==3||!isParallelogram(pair[0])||!d.proper(pair[1]))return false;
    for(let [i,base] of edges(pair[0]).entries())for(let [j,side] of edges(pair[1]).entries())if(sort(base)===sort(side)&&onLine(edges(pair[0])[(i+2)%4],pair[1][(j+2)%3]))return true;
    return false;
   }
   let pair=areaPair(t);if(!pair)return false;
   if(n===35||n===36)return pair.every(p=>p.length===4&&isParallelogram(p))&&sameParallels(...pair,n===36,n===35);
   if(n===37||n===38)return pair.every(p=>p.length===3&&d.proper(p))&&sameParallels(...pair,n===38,n===37,true);
   return false;
  }
  function triangleAngleSum(t){
   if(t.kind!=='eq'||[...t.left,...t.right].some(v=>v.kind!=='angle'))return false;
   let names=[...new Set(namesIn(t))];if(names.length<3||names.length>4)return false;
   for(let a of names)for(let b of names)for(let c of names)if(new Set(a+b+c).size===3&&d.proper(a+b+c)){
    if(key(t)===key(parse('angle '+a+b+c+' + angle '+b+c+a+' + angle '+c+a+b+' = 2 right angles')))return true;
    for(let e of names)if(![a,b,c].includes(e)&&d.between(b,c,e)&&d.drawn(c,e)&&key(t)===key(parse('angle '+a+c+e+' = angle '+c+a+b+' + angle '+a+b+c)))return true;
   }
   return false;
  }
  function pythagorean(t){
   if(t.kind!=='eq')return false;
   for(let [hyp,legs] of [[t.left,t.right],[t.right,t.left]]){
    if(hyp.length!==1||legs.length!==2||[...hyp,...legs].some(x=>x.kind!=='square'||x.coefficient<=0||Math.abs(x.coefficient-hyp[0].coefficient)>1e-8))continue;
    let h=hyp[0].term.slice(0,2),a=legs[0].term.slice(0,2),b=legs[1].term.slice(0,2),v=[...a].find(n=>b.includes(n));
    if(v&&!h.includes(v)&&sort(a.replace(v,'')+b.replace(v,''))===sort(h)&&d.proper(v+h)&&right(h[0]+v+h[1]))return true;
   }
   return false;
  }
  function squareAreaIdentity(t){
   if(!atomic(t))return false;
   for(let [area,square] of [[t.left[0],t.right[0]],[t.right[0],t.left[0]]])if(area.kind==='area'&&square.kind==='square'){
    let p=area.term.slice(5,-1),side=square.term.slice(0,2);
    if([...facts,...certificateClaims().map(c=>c.claim)].some(f=>f.kind==='shape'&&f.property==='square'&&polygonKey(f.polygon)===polygonKey(p)&&edges(p).some(e=>sort(e)===sort(side))))return true;
   }
   return false;
  }
  function equalSquaresFromLengths(t){return atomic(t)&&t.left[0].kind==='square'&&t.right[0].kind==='square'&&equal(t.left[0].term.slice(0,2),t.right[0].term.slice(0,2))}
  function gnomon(t){
   if(t.kind!=='shape'||t.property!=='gnomon')return false;
   for(let boundary of [t.polygon,[...t.polygon].reverse().join('')])for(let offset=0;offset<6;offset++){
    let [a,b,c,g,f,e]=boundary.slice(offset)+boundary.slice(0,offset);
    if(!edges(boundary).every(line=>d.drawn(...line)))continue;
    for(let v of d.names)if(!boundary.includes(v)&&d.between(v,e,a)&&d.between(v,g,c)&&isParallelogram(a+b+c+v)&&isParallelogram(v+e+f+g)&&d.between(b,f,v)&&d.drawn(b,v))return true;
   }
   return false;
  }
  function rectangleProductIdentity(t){
   if(!atomic(t))return false;
   for(let [area,product] of [[t.left[0],t.right[0]],[t.right[0],t.left[0]]]){
    if(area.kind!=='area'||!['product','square'].includes(product.kind))continue;
    let polygon=area.term.slice(5,-1);if(!isParallelogram(polygon))continue;
    let factors=product.kind==='square'?[product.term.slice(0,2),product.term.slice(0,2)]:product.term.split('*');
    for(let i=0;i<4;i++){let a=polygon[i],b=polygon[(i+1)%4],c=polygon[(i+2)%4];if(!right(a+b+c))continue;
     if(equal(a+b,factors[0])&&equal(b+c,factors[1])||equal(a+b,factors[1])&&equal(b+c,factors[0]))return true;
    }
   }
   return false;
  }
  function pythagoreanForm(t){
   if(t.kind!=='eq')return null;
   const squares=certificateClaims().filter(c=>c.record.operation==='square'&&c.claim.kind==='shape'&&c.claim.property==='square');
   let terms=new Map();for(let [side,sign] of [[t.left,1],[t.right,-1]])for(let item of side){let term=item.term;if(item.kind==='area'){let square=squares.find(c=>polygonKey(c.claim.polygon)===polygonKey(term.slice(5,-1)));if(!square)return null;term=sort(square.record.inputs.join(''))+'^2'}else if(item.kind!=='square')return null;term=canonical(term);terms.set(term,(terms.get(term)||0)+sign*item.coefficient)}
   let entries=[...terms].filter(([,n])=>Math.abs(n)>1e-8);if(entries.length!==3)return null;
   for(let sign of [1,-1]){let positive=entries.filter(([,n])=>n*sign>0),negative=entries.filter(([,n])=>n*sign<0);if(positive.length===1&&negative.length===2&&negative.every(([,n])=>Math.abs(n+positive[0][1])<1e-8))return parse(positive[0][0]+' = '+negative.map(([term])=>term).join(' + '))}
   return null;
  }
  function squareAlignments(t){
   let hyp=t.left[0].term.slice(0,2),legs=t.right.map(x=>x.term.slice(0,2)),v=[...legs[0]].find(n=>legs[1].includes(n));if(!v)return false;
   let squares=certificateClaims().filter(c=>c.record.operation==='square'&&c.claim.kind==='shape'&&c.claim.property==='square');
   if(!squares.some(c=>sort(c.record.inputs.join(''))===sort(hyp)))return false;
   return legs.every((leg,i)=>squares.some(c=>{if(sort(c.record.inputs.join(''))!==sort(leg))return false;let p=c.claim.polygon,k=p.indexOf(v),other=leg.replace(v,''),w=[p[(k+1)%4],p[(k+3)%4]].find(n=>n!==other),u=legs[1-i].replace(v,'');return !!w&&d.between(u,v,w)}));
  }
  function conversePythagorean(t){return t.kind==='right'&&d.proper(t.angle)&&equalExpression(parse(t.angle[0]+t.angle[2]+'^2 = '+t.angle[0]+t.angle[1]+'^2 + '+t.angle[1]+t.angle[2]+'^2'))}
  function derivedAreaArgument(t){
   const rules=[
    [33,[4,27,29],'Corresponding joins of equal parallel segments'],
    [34,[26,29],'Opposite parts and diagonal halves of a parallelogram'],
    [35,[4,29,34],'Subtract equal end triangles from the common outer area'],
    [36,[33,35],'Compare both parallelograms with their constructed connecting parallelogram'],
    [37,[31,34,35],'Complete the triangles to parallelograms and take equal halves'],
    [38,[31,34,36],'Complete equal-base triangles to equal-base parallelograms and take halves'],
    [39,[31,37],'Construct the comparison parallel and reject an unequal proper-part replacement triangle'],
    [40,[31,38],'Use the equal-base comparison parallel and reject a proper-part replacement triangle'],
    [41,[34,37],'Use the diagonal half and an equal triangle on the common base and parallels'],
    [43,[34],'Subtract the two pairs of equal diagonal halves to leave the complements']
   ];
   for(let [n,dependencies,name] of rules)if(areaOrParallelogramConsequence(t,n)&&supported(dependencies)){
    let steps=['Check the recorded figure, incidence, and base/parallel conditions.',name+'.','Use the established equalities and common notions to obtain the stated conclusion.'];
    if(n===39||n===40)steps=[
     'The triangles have established equal areas, '+(n===39?'the same base':'equal collinear bases')+', and vertices on the same side of the base line.',
     'Temporarily suppose the line joining those vertices is not parallel to the base. Use the comparison parallel through the first vertex (I.31). Under the assumption it meets a side or its extension at a hypothetical X; X is local to this argument, not an actual construction point.',
     'The replacement triangle and the first triangle have equal area by '+(n===39?'I.37 on their common base.':'I.38 on their equal bases.'),
     'The given equality then makes the replacement triangle equal in area to the second triangle, although one is a proper part of the other. This contradicts common notion 5. Discharge the assumption: the vertex line is parallel to the base.'
    ];
    return argument(name,dependencies,steps);
   }
   return false;
  }
  function properPart(t){
   if(t.left?.some(v=>v.coefficient!==1)||t.right?.some(v=>v.coefficient!==1)||t.kind!=='gt'||t.left.length!==1||t.right.length!==1)return false;
   let a=t.left[0].term,b=t.right[0].term;
   if(t.left[0].kind==='length')return [...a].some(v=>b.includes(v)&&d.between(v,b.replace(v,''),a.replace(v,'')));
   if(t.left[0].kind==='angle'&&a.startsWith(A)&&b.startsWith(A)){
    let x=a.slice(1),y=b.slice(1);if(x[1]!==y[1])return false;
    return [x,[...x].reverse().join('')].some(u=>[y,[...y].reverse().join('')].some(v=>d.sameRay(u[1],u[0],v[0])&&d.drawn(u[1],v[2])&&d.angleInside(u[0],u[1],v[2],u[2])));
   }
   return false;
  }
  function strictLinear(t){
   if(t.kind!=='gt'||!facts.some(f=>f.kind==='gt'))return false;
   let terms=[...scalarTerms(t),...facts.flatMap(scalarTerms)],identities=d.identities(terms.filter(v=>v.startsWith(A)||/^[A-Z]{2}$/.test(v))).map(row=>new Map([...row].map(([k,v])=>[k===A+'STRAIGHT'?'RIGHT':k,k===A+'STRAIGHT'?v*2:v])));
   let equations=[...facts.filter(f=>f.kind==='eq').map(f=>subtract(expr(f.left),expr(f.right))),...identities],basis=new Map();
   for(let input of equations){let row=new Map(input);for(let [pivot,b] of basis)if(row.has(pivot))row=subtract(row,b,row.get(pivot));if(row.size){let k=[...row.keys()].sort()[0],scale=row.get(k);for(let [v,n] of row)row.set(v,n/scale);basis.set(k,row)}}
   const reduce=items=>{let row=new Map(items);for(let [pivot,b] of basis)if(row.has(pivot))row=subtract(row,b,row.get(pivot));return row};
   let target=reduce(subtract(expr(t.left),expr(t.right)));if(!target.size)return false;
   let rows=facts.filter(f=>f.kind==='gt').map(f=>reduce(subtract(expr(f.left),expr(f.right)))).filter(r=>r.size);
   const positiveMultiple=row=>{if(!row.size)return false;let k=[...row.keys()][0],scale=(target.get(k)||0)/row.get(k);return scale>0&&!subtract(target,row,scale).size};
   return rows.some(positiveMultiple)||rows.some((a,i)=>rows.slice(i+1).some(b=>positiveMultiple(subtract(a,b,-1))));
  }
  function postulateMeeting(t){
   if(t.kind!=='intersection'||new Set(t.a).size!==2||new Set(t.b).size!==2||lineKey(t.a)===lineKey(t.b))return false;
   if(!d.drawn(...t.a)||!d.drawn(...t.b)||![t.a,t.b].every(line=>d.collinear(...line,t.point)))return false;
   for(let f of facts){if(f.kind!=='gt'||f.left.length!==1||f.left[0].term!=='RIGHT'||f.left[0].coefficient!==2||f.right.length!==2||f.right.some(v=>v.coefficient!==1||!v.term.startsWith(A)))continue;
    let angles=f.right.map(v=>v.term.slice(1));for(let pair of [angles,[...angles].reverse()])for(let x of [pair[0],[...pair[0]].reverse().join('')])for(let y of [pair[1],[...pair[1]].reverse().join('')]){
     let u=x[1],v=y[1];if(u===v||!d.drawn(u,v)||!d.sameRay(u,x[2],v)||!d.sameRay(v,y[0],u)||!sameSide(x[0],y[2],u+v))continue;
     if(!d.sameRay(u,x[0],t.point)||!d.sameRay(v,y[2],t.point))continue;
     if([[t.a,t.b],[t.b,t.a]].some(([a,b])=>sameLine(a,u+x[0])&&sameLine(b,v+y[2])))return true;
    }
   }
   return false;
  }

  return {d,facts,check,key,posted,equal,parallel,right,isParallelogram,canonical,expr,certificateClaims,sourceReferences,preferredReferences,accept};
 }
 function sortPair(a,b){return [a,b].sort().join('|')}
 function subtract(a,b,n=1){let out=new Map(a);for(let [k,v] of b)out.set(k,(out.get(k)||0)-n*v);for(let [k,v] of out)if(Math.abs(v)<1e-8)out.delete(k);return out}
 function span(target,equations){let basis=new Map();for(let input of equations){let row=new Map(input);for(let [pivot,b] of basis)if(row.has(pivot))row=subtract(row,b,row.get(pivot));if(row.size){let key=[...row.keys()].sort()[0],factor=row.get(key);for(let [k,v] of row)row.set(k,v/factor);basis.set(key,row)}}let out=new Map(target);for(let [pivot,b] of basis)if(out.has(pivot))out=subtract(out,b,out.get(pivot));return out.size===0}
 function gradeUncached(state,lesson,reuse){if(lesson.id<=5)return baseGrade(state,lesson);let c=reuse?.context||context(state,lesson);for(let [i,line] of state.lines.entries()){if(i<(reuse?.start||0))continue;let ast=parse(line.s);line.valid=false;line.dependencies=[];line.derivation=null;if(!ast){line.error='Unrecognized format. Use the keyword-based format help or the statement grammar in How to play.';continue}if(!line.j){line.error='Select a reference, then click this line.';continue}let result=c.check(ast,line.j);line.valid=result.ok;line.error=result.error;line.reason=result.explanation;line.derivation=result.derivation;line.sourcePropositions=result.sourcePropositions||[];if(result.ok){line.dependencies=state.lines.slice(0,i).flatMap((l,n)=>l.valid?[n+1]:[]);c.accept(ast,line.j)}}let reached=(lesson.goals||[]).every(s=>{let goal=parse(s);return c.posted(goal)});let constraints=lesson.goalConstraints||{};if(constraints.between)reached=reached&&c.d.between(...constraints.between);if(constraints.triangle)reached=reached&&c.d.proper(constraints.triangle);if(constraints.insideAngle){let {point,angle}=constraints.insideAngle;reached=reached&&c.d.angleInside(angle[0],angle[1],point,angle[2])}return {complete:!!reached&&state.lines.every(l=>l.valid)&&(!lesson.requireConstruction||constructionProgress(state,lesson).complete),goalReached:!!reached,context:c}}
 // Repeated renders restore computed results. Appending a line, or justifying
 // the last invalid line, can reuse the validated prefix. Edits to an accepted
 // line, geometry, givens, or installed lessons rebuild the context instead.
 const gradeCache=new WeakMap(),gradeFields=['valid','error','dependencies','derivation','reason','sourcePropositions'];
 function gradeSignature(state,lesson){return JSON.stringify([lesson,LESSONS.map(l=>EuclidBooks.key(l)),state.points,state.edges,state.rays,state.circles,state.arcs,state.topology,state.facts])}
 function grade(state,lesson){
  if(lesson.id<=5)return baseGrade(state,lesson);
  let geometry=gradeSignature(state,lesson),inputs=state.lines.map(l=>[l.s,l.j]),signature=geometry+'\0'+JSON.stringify(inputs),cached=gradeCache.get(state),reuse;
  const restore=count=>{for(let i=0;i<count;i++){let fields=structuredClone(cached.lines[i]);for(let field of gradeFields)state.lines[i][field]=fields[field]}};
  if(cached&&cached.result.context.facts.length===cached.accepted){
   if(cached.signature===signature){restore(state.lines.length);return cached.result}
   if(cached.geometry===geometry&&inputs.length>=cached.inputs.length){
    let count=cached.inputs.length;
    if(inputs.slice(0,count).every((v,i)=>v[0]===cached.inputs[i][0]&&v[1]===cached.inputs[i][1])){restore(count);reuse={context:cached.result.context,start:count}}
    else {let changed=inputs.findIndex((v,i)=>i<count&&(v[0]!==cached.inputs[i][0]||v[1]!==cached.inputs[i][1]));if(changed>=0&&cached.lines.slice(changed).every(line=>!line.valid)){restore(changed);reuse={context:cached.result.context,start:changed}}}
   }
  }
  let result=gradeUncached(state,lesson,reuse),afterGeometry=gradeSignature(state,lesson);gradeCache.set(state,{geometry:afterGeometry,signature:afterGeometry+'\0'+JSON.stringify(inputs),inputs,result,accepted:result.context.facts.length,lines:state.lines.map(line=>Object.fromEntries(gradeFields.map(field=>[field,structuredClone(line[field])]))) });return result;
 }

 return {parse,grade,context,span,subtract,expression,polygonKey,baseParse,statementNames:namesIn};
})();
EuclidLogic.parse=s=>BookOneLogic.parse(s)||BookOneLogic.baseParse(s);
EuclidLogic.grade=BookOneLogic.grade;
