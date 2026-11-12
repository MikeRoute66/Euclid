import { COURSE_VERSION, createVerifier } from '../_shared/runtime.js';

const url=Deno.env.get('SUPABASE_URL')!;
const key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||Deno.env.get('SUPABASE_SECRET_KEY')||JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')||'{}').default;
const headers={apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'};
class Problem extends Error {constructor(message:string,public status=400){super(message)}}
async function request(path:string,options:RequestInit={}){
 const response=await fetch(url+path,{...options,headers:{...headers,...options.headers}});
 const body=await response.json().catch(()=>null);
 if(!response.ok)throw new Problem('The online service could not complete that request.',503);
 return body;
}
async function rpc(name:string,body:unknown){return request('/rest/v1/rpc/'+name,{method:'POST',body:JSON.stringify(body)})}
async function player(req:Request){
 const token=req.headers.get('Authorization');
 if(!token?.startsWith('Bearer '))throw new Problem('Please sign in.',401);
 const response=await fetch(url+'/auth/v1/user',{headers:{apikey:key,Authorization:token}});
 if(!response.ok)throw new Problem('Please sign in again.',401);
 const user=await response.json();
 const profiles=await request('/rest/v1/player_profiles?user_id=eq.'+encodeURIComponent(user.id)+'&select=username');
 if(!profiles[0])throw new Problem('This account does not have a player profile.',403);
 return {id:user.id,username:profiles[0].username};
}
function stage(value:unknown){if(typeof value!=='string'||!/^(?:1\.(?:[1-9]|[1-3]\d|4[0-8])|2\.(?:[1-9]|1[0-4]))$/.test(value))throw new Problem('Unknown proposition.');return value}
async function gate(req:Request,action:string,limit:number){
 const address=(req.headers.get('x-forwarded-for')||req.headers.get('cf-connecting-ip')||'unknown').split(',')[0].trim();
 const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(key+address));
 const bucket=action+':'+Array.from(new Uint8Array(hash),n=>n.toString(16).padStart(2,'0')).join('');
 if(!await rpc('online_rate_gate',{p_bucket:bucket,p_limit:limit,p_seconds:60}))throw new Problem('Too many requests. Please wait a minute.',429);
}
async function handle(req:Request){
 if(req.method!=='POST')throw new Problem('Use POST.',405);
 if(Number(req.headers.get('content-length')||0)>512000)throw new Problem('Attempt is too large.',413);
 const text=await req.text();if(text.length>512000)throw new Problem('Attempt is too large.',413);
 const received=new Date().toISOString();
 let body;try{body=JSON.parse(text)}catch{throw new Problem('Invalid request.')}
 if(!body||typeof body!=='object')throw new Problem('Invalid request.');
 if(body.action==='register'||body.action==='login'){
  await gate(req,body.action,body.action==='register'?5:30);
  const username=String(body.username||'').trim(),password=body.password;
  if(!/^[A-Za-z0-9_]{3,24}$/.test(username)||typeof password!=='string'||!password||password.length>128)throw new Problem('Use a username with 3–24 letters, numbers, or underscores.');
  const email=username.toLowerCase()+'@players.euclid.invalid';
  if(body.action==='register'){
   if(password.length<10)throw new Problem('Use a password with at least 10 characters.');
   const response=await fetch(url+'/auth/v1/admin/users',{method:'POST',headers,body:JSON.stringify({email,password,email_confirm:true,user_metadata:{username}})});
   if(!response.ok)throw new Problem('That username is unavailable, or the account could not be created.');
  }
  const response=await fetch(url+'/auth/v1/token?grant_type=password',{method:'POST',headers,body:JSON.stringify({email,password})});
  if(!response.ok)throw new Problem('Username or password is incorrect.',401);
  const session=await response.json();
  return {session};
 }
 if(body.action==='boards'){
  await gate(req,'board',120);
  return {courseVersion:COURSE_VERSION,boards:await rpc('ranked_leaderboards',{p_version:COURSE_VERSION})};
 }
 if(body.action==='board'){
  await gate(req,'board',120);
  const proposition=stage(body.proposition);
  const rows=await request('/rest/v1/best_times?proposition=eq.'+proposition+'&course_version=eq.'+COURSE_VERSION+'&select=elapsed_ms,achieved_at,player_profiles!inner(username)&order=elapsed_ms.asc,achieved_at.asc,user_id.asc&limit=100');
  return {courseVersion:COURSE_VERSION,rows:rows.map((r:any,i:number)=>({rank:i+1,username:r.player_profiles.username,elapsedMs:r.elapsed_ms}))};
 }
 const user=await player(req);
 if(body.action==='me')return {username:user.username,courseVersion:COURSE_VERSION};
 if(body.action==='start'){
  const proposition=stage(body.proposition);
  if(body.courseVersion!==COURSE_VERSION)throw new Problem('The course was updated. Refresh before starting a ranked attempt.',409);
  if(!await rpc('online_rate_gate',{p_bucket:'start:'+user.id,p_limit:30,p_seconds:60}))throw new Problem('Please wait before starting another attempt.',429);
  return {...await rpc('start_ranked_attempt',{p_user:user.id,p_proposition:proposition,p_version:COURSE_VERSION}),courseVersion:COURSE_VERSION,serverNow:Date.now()};
 }
 if(body.action==='finish'){
  if(typeof body.attempt!=='string'||!/^[0-9a-f-]{36}$/.test(body.attempt))throw new Problem('Invalid attempt.');
  if(!await rpc('online_rate_gate',{p_bucket:'finish:'+user.id,p_limit:240,p_seconds:60}))throw new Problem('Too many submissions. Please wait.',429);
  const rows=await request('/rest/v1/ranked_attempts?id=eq.'+body.attempt+'&user_id=eq.'+user.id+'&select=id,proposition,course_version,status,started_at,validation_state,validated_lines,submitted_at');
  const attempt=rows[0];
  if(!attempt||attempt.status==='abandoned'||Date.parse(attempt.started_at)<Date.now()-21600000)throw new Problem('This attempt expired or was replaced. Start over.',409);
  if(attempt.course_version!==COURSE_VERSION)throw new Problem('The course was updated. Start a fresh ranked attempt.',409);
  if(attempt.status==='finished')return await rpc('finish_ranked_attempt',{p_user:user.id,p_attempt:body.attempt,p_received:received});
  const verifier=createVerifier();let checkpoint={state:attempt.validation_state,cursor:attempt.validated_lines,received:attempt.submitted_at};
  if(!checkpoint.state){
   let replay;
   try{replay=verifier.replay(attempt.proposition,body.events)}catch{throw new Problem('The recorded actions are invalid.')}
   if(!verifier.constructionProgress(replay.state,replay.lesson).complete)throw new Problem('The construction is incomplete.');
   if(replay.state.lines.length>200)throw new Problem('Ranked proofs are limited to 200 lines.');
   checkpoint=await rpc('begin_ranked_validation',{p_user:user.id,p_attempt:body.attempt,p_state:replay.state,p_received:received});
  }
  let result;
  try{result=verifier.validatePart(attempt.proposition,checkpoint.state,checkpoint.cursor)}catch(error){throw new Problem('Not recorded: '+(error instanceof Error?error.message:'Invalid proof.'))}
  const cursor=await rpc('advance_ranked_validation',{p_user:user.id,p_attempt:body.attempt,p_from:checkpoint.cursor,p_to:result.cursor});
  if(!result.complete||cursor!==result.total)return {pending:true,cursor,total:result.total};
  return await rpc('finish_ranked_attempt',{p_user:user.id,p_attempt:body.attempt,p_received:checkpoint.received});
 }
 throw new Problem('Unknown request.');
}
Deno.serve(async req=>{
 const origin=req.headers.get('Origin')||'';
 const allowed=origin==='https://mikeroute66.github.io'||/^http:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/.test(origin);
 const cors={'Access-Control-Allow-Origin':allowed?origin:'https://mikeroute66.github.io','Access-Control-Allow-Headers':'authorization, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Vary':'Origin','Cache-Control':'no-store'};
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
 if(origin&&!allowed)return Response.json({error:'Origin is not allowed.'},{status:403,headers:cors});
 try{return Response.json(await handle(req),{headers:cors})}
 catch(error){return Response.json({error:error instanceof Problem?error.message:'The online service is temporarily unavailable.'},{status:error instanceof Problem?error.status:503,headers:cors})}
});
