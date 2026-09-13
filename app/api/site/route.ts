import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

async function probe(url:string){
 const started=Date.now();
 try{
  const r=await fetch(url,{cache:'no-store',redirect:'follow',signal:AbortSignal.timeout(8000)});
  return {ok:r.ok,status:r.status,ms:Date.now()-started,url:r.url};
 }catch(e){
  return {ok:false,status:0,ms:Date.now()-started,error:e instanceof Error?e.message:'unreachable'};
 }
}

export async function GET(){
 const [homepage,sitemap,stats]=await Promise.all([
  probe('https://orvia.org.uk/'),
  probe('https://orvia.org.uk/sitemap.xml'),
  probe('https://orvia.org.uk/api/stats')
 ]);
 return NextResponse.json({
  ok:homepage.ok&&sitemap.ok,
  homepage,
  sitemap,
  stats,
  checkedAt:new Date().toISOString(),
  source:'live-http-probe'
 },{headers:{'cache-control':'no-store'}});
}
