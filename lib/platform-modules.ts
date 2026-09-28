import type { ComponentType } from 'react';

export type PlatformMode = 'internal' | 'customer';
export type PlatformModule = {
  id:string;
  label:string;
  description:string;
  href:string;
  audiences:PlatformMode[];
  serviceCodes?:string[];
  internalOnly?:boolean;
  accent:'navy'|'teal'|'gold'|'purple'|'orange';
};

export const PLATFORM_MODULES:PlatformModule[]=[
  {id:'command',label:'Talk to IRIS',description:'Ask, route and approve work through the ORVIA conductor.',href:'/',audiences:['internal'],internalOnly:true,accent:'navy'},
  {id:'workspace',label:'My Workspace',description:'Your active work, priorities and approvals.',href:'/workspace',audiences:['internal','customer'],accent:'teal'},
  {id:'work',label:'Work',description:'Tracked work objects, tasks and outcomes.',href:'/work',audiences:['internal','customer'],accent:'gold'},
  {id:'landscape',label:'ORVIA Landscape',description:'Products, systems and operating estate.',href:'/projects',audiences:['internal'],internalOnly:true,accent:'purple'},
  {id:'clients',label:'Client Workspaces',description:'Customer environments and service delivery.',href:'/clients',audiences:['internal'],internalOnly:true,accent:'orange'},
  {id:'library',label:'Evidence & Library',description:'Controlled evidence, documents and knowledge.',href:'/library',audiences:['internal','customer'],accent:'navy'},
  {id:'systems',label:'Systems & Access',description:'Connections, access and service health.',href:'/systems',audiences:['internal'],internalOnly:true,accent:'teal'},
  {id:'brand',label:'Brand Control',description:'Approved brand, media, website and document controls.',href:'https://brand-control.orvia.org.uk',audiences:['internal'],internalOnly:true,accent:'purple'},
  {id:'reports',label:'Reports & KPI',description:'Verified outputs, KPI packs and downloadable reports.',href:'/portal/reports',audiences:['internal','customer'],accent:'gold'},
  {id:'voice',label:'Voice',description:'Calls, receptionist activity, summaries and outcomes.',href:'/portal/service/voice',audiences:['customer'],serviceCodes:['voice','aria'],accent:'teal'},
  {id:'web',label:'Web',description:'Website activity, changes, SEO and support.',href:'/portal/service/web',audiences:['customer'],serviceCodes:['web'],accent:'purple'},
  {id:'oversight',label:'Oversight',description:'Assurance activity, actions, evidence and verification.',href:'/portal/service/oversight',audiences:['customer'],serviceCodes:['oversight','complete','connect'],accent:'navy'},
  {id:'witness',label:'Witness Room',description:'Evidence capture and controlled case outputs.',href:'/portal/service/witness',audiences:['customer'],serviceCodes:['witness','witness-room'],accent:'orange'},
  {id:'mia',label:'MIA',description:'Your MIA workspace, records and authorised outputs.',href:'/portal/service/mia',audiences:['customer'],serviceCodes:['mia'],accent:'gold'},
  {id:'academy',label:'Academy',description:'Training, learning activity and completion records.',href:'/portal/service/academy',audiences:['customer'],serviceCodes:['academy'],accent:'teal'}
];

export function modulesForContext(mode:PlatformMode, services:string[]=[]){
  const normalized=services.map(x=>x.toLowerCase());
  return PLATFORM_MODULES.filter(module=>{
    if(!module.audiences.includes(mode)) return false;
    if(mode==='internal') return true;
    if(module.internalOnly) return false;
    if(!module.serviceCodes?.length) return true;
    return module.serviceCodes.some(code=>normalized.includes(code));
  });
}
