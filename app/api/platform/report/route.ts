import { getPlatformContext } from '@/lib/platform-context';

export const dynamic='force-dynamic';

export async function GET(req:Request){
  const context=await getPlatformContext();
  const url=new URL(req.url);
  const format=url.searchParams.get('format')||'json';

  const payload={
    generated_at:new Date().toISOString(),
    source:'ORVIA Platform Context',
    identity:{email:context.email,role:context.role,organisation:context.organisation},
    services:context.services,
    modules:context.modules.map(m=>({id:m.id,label:m.label,href:m.href})),
    note:'Bootstrap report contains verified session and service-assignment context only. Service KPI adapters are not connected yet.'
  };

  if(format==='csv'){
    const rows=[
      ['field','value'],
      ['generated_at',payload.generated_at],
      ['email',payload.identity.email||''],
      ['role',payload.identity.role||''],
      ['organisation',payload.identity.organisation||''],
      ['services',payload.services.join(';')],
      ['modules',payload.modules.map(x=>x.label).join(';')]
    ];
    const csv=rows.map(row=>row.map(value=>'"'+String(value).replaceAll('"','""')+'"').join(',')).join('\n');
    return new Response(csv,{headers:{
      'content-type':'text/csv; charset=utf-8',
      'content-disposition':'attachment; filename="orvia-workspace-summary.csv"',
      'cache-control':'no-store'
    }});
  }

  return new Response(JSON.stringify(payload,null,2),{headers:{
    'content-type':'application/json; charset=utf-8',
    'content-disposition':'attachment; filename="orvia-workspace-summary.json"',
    'cache-control':'no-store'
  }});
}
