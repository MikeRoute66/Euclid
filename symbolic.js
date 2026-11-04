/* Sparse polynomial identity checker for oriented Euclidean areas and squares.
 * Coefficients come from identities/hypotheses, not the drawn coordinates.
 * Drawing coordinates are used only to choose orientation and incidence. */
function symbolicConsequence(target,context){
 const {d}=context,epsilon=1e-8;
 const constant=n=>new Map(n?[['',n]]:[]),variable=n=>new Map([[n,1]]);
 function add(a,b,factor=1){let out=new Map(a);for(let [k,v] of b)out.set(k,(out.get(k)||0)+factor*v);for(let [k,v] of out)if(Math.abs(v)<epsilon)out.delete(k);return out}
 function multiply(a,b){let out=new Map();for(let [x,u] of a)for(let [y,v] of b){let key=[...x.split('*').filter(Boolean),...y.split('*').filter(Boolean)].sort().join('*');out.set(key,(out.get(key)||0)+u*v)}return out}
 function scale(a,n){return new Map([...a].map(([k,v])=>[k,v*n]))}
 const origin=d.names[0],unit=d.names[1];
 const coordinate=(name,axis)=>name===origin?constant(0):name===unit?constant(axis==='x'?1:0):variable(name+axis);
 const difference=(a,b)=>[add(coordinate(b,'x'),coordinate(a,'x'),-1),add(coordinate(b,'y'),coordinate(a,'y'),-1)];
 const cross=(u,v)=>add(multiply(u[0],v[1]),multiply(u[1],v[0]),-1),dot=(u,v)=>add(multiply(u[0],v[0]),multiply(u[1],v[1]));
 const signOf=p=>{let area=0;for(let i=0;i<p.length;i++){let a=d.points[p[i]],b=d.points[p[(i+1)%p.length]];if(!a||!b)return 0;area+=a[0]*b[1]-b[0]*a[1]}return Math.sign(area)};
 function area(p){let result=constant(0);for(let i=0;i<p.length;i++){let a=p[i],b=p[(i+1)%p.length];result=add(result,add(multiply(coordinate(a,'x'),coordinate(b,'y')),multiply(coordinate(b,'x'),coordinate(a,'y')),-1))}return scale(result,signOf(p)/2)}
 function term(t){if(t.startsWith('AREA('))return area(t.slice(5,-1));if(/^[A-Z]{2}\^2$/.test(t)){let v=difference(t[0],t[1]);return dot(v,v)}return null}
 function expression(items){let out=constant(0);for(let item of items){let p=term(item.term);if(!p)return null;out=add(out,p,item.coefficient)}return out}
 function equation(f){
  if(f.kind==='eq'){let left=expression(f.left),right=expression(f.right);return left&&right?add(left,right,-1):null}
  if(f.kind==='parallel')return cross(difference(f.a[0],f.a[1]),difference(f.b[0],f.b[1]));
  if(f.kind==='perpendicular')return dot(difference(f.a[0],f.a[1]),difference(f.b[0],f.b[1]));
  if(f.kind==='right')return dot(difference(f.angle[1],f.angle[0]),difference(f.angle[1],f.angle[2]));
  if(f.kind==='collinear')return cross(difference(f.points[0],f.points[1]),difference(f.points[0],f.points[2]));
  return null;
 }
 let goal=equation(target);if(!goal)return false;
 const facts=[...context.facts,...context.certificateClaims().map(c=>c.claim)],equations=[],linear=[];
 // Intersections of two pairs of established parallels form an affine
 // parallelogram. Discover the small figures appearing in the actual claim.
 const polygons=[target,...facts].flatMap(f=>f.kind==='eq'?[...f.left,...f.right].filter(v=>v.kind==='area').map(v=>v.term.slice(5,-1)):[]);
 function hull(names){let sorted=[...new Set(names)].sort((a,b)=>d.points[a][0]-d.points[b][0]||d.points[a][1]-d.points[b][1]);const turn=(a,b,c)=>(d.points[b][0]-d.points[a][0])*(d.points[c][1]-d.points[a][1])-(d.points[b][1]-d.points[a][1])*(d.points[c][0]-d.points[a][0]);let lower=[],upper=[];for(let p of sorted){while(lower.length>1&&turn(lower.at(-2),lower.at(-1),p)<=0)lower.pop();lower.push(p)}for(let p of [...sorted].reverse()){while(upper.length>1&&turn(upper.at(-2),upper.at(-1),p)<=0)upper.pop();upper.push(p)}return lower.slice(0,-1).concat(upper.slice(0,-1)).join('')}
 for(let i=0;i<polygons.length;i++)for(let j=i;j<polygons.length;j++){let names=[...new Set(polygons[i]+polygons[j])];if(names.length!==4)continue;let p=hull(names);if(p.length===4&&context.isParallelogram(p))facts.push({kind:'shape',property:'parallelogram',polygon:p})}
 for(let i=0;i<d.names.length;i++)for(let j=i+1;j<d.names.length;j++)for(let k=j+1;k<d.names.length;k++)for(let l=k+1;l<d.names.length;l++){let p=hull([d.names[i],d.names[j],d.names[k],d.names[l]]);if(p.length===4&&context.isParallelogram(p))facts.push({kind:'shape',property:'parallelogram',polygon:p})}

 function put(p){if(p&&p.size){equations.push(p);if([...p.keys()].every(k=>!k.includes('*')))linear.push(p)}}
 function support(line,other){return [...other].every(n=>line.includes(n)||d.collinear(line[0],line[1],n))}
 const parallel=(a,b)=>context.parallel(a,b)||facts.some(f=>f.kind==='parallel'&&(support(a,f.a)&&support(b,f.b)||support(a,f.b)&&support(b,f.a)));
 for(let f of facts){
  put(equation(f));
  if(f.kind==='eq'&&f.left.length===1&&f.right.length===1&&f.left[0].coefficient===1&&f.right[0].coefficient===1&&f.left[0].kind==='length'&&f.right[0].kind==='length'){
   let a=f.left[0].term,b=f.right[0].term,u=difference(a[0],a[1]),v=difference(b[0],b[1]);put(add(dot(u,u),dot(v,v),-1));
   if(parallel(a,b)){let av=[d.points[a[1]][0]-d.points[a[0]][0],d.points[a[1]][1]-d.points[a[0]][1]],bv=[d.points[b[1]][0]-d.points[b[0]][0],d.points[b[1]][1]-d.points[b[0]][1]],sign=av[0]*bv[0]+av[1]*bv[1]>=0?1:-1;put(add(u[0],v[0],-sign));put(add(u[1],v[1],-sign))}
  }
  if(f.kind==='shape'&&['parallelogram','square'].includes(f.property)){
   let [a,b,c,e]=f.polygon;if(!e)continue;for(let axis of ['x','y'])put(add(add(coordinate(a,axis),coordinate(c,axis)),add(coordinate(b,axis),coordinate(e,axis)),-1));
   if(f.property==='square'){let u=difference(a,b),v=difference(a,e),sign=signOf(f.polygon);put(add(v[0],u[1],sign));put(add(v[1],u[0],-sign))}
  }
 }
 // Collinear incidences are part of the constructed diagram, not length claims.
 for(let i=0;i<d.names.length;i++)for(let j=i+1;j<d.names.length;j++)for(let k=j+1;k<d.names.length;k++){let [a,b,c]=[d.names[i],d.names[j],d.names[k]];if(d.collinear(a,b,c)&&d.drawn(a,b))put(cross(difference(a,b),difference(a,c)))}
 // Midpoint construction is affine, not just equality of two measured halves.
 for(let certificate of context.certificateClaims())if(certificate.record.operation==='midpoint'){let [a,b]=certificate.record.inputs,m=certificate.record.outputs[0];for(let axis of ['x','y'])put(add(scale(coordinate(m,axis),2),add(coordinate(a,axis),coordinate(b,axis)),-1))}
 const variables=d.names.filter(n=>n!==origin&&n!==unit).flatMap(n=>[n+'x',n+'y']);for(let p of linear)for(let name of variables)equations.push(multiply(p,variable(name)));
 return BookOneLogic.span(goal,equations);
}
