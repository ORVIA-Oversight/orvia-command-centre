'use client';
import { useMemo, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { documents } from '@/lib/data';

const SHAREPOINT_GOVERNANCE='https://orviahealthcare.sharepoint.com/sites/ORVIAHUB/Shared%20Documents/01%20ORVIA%20Central%20Governance';
const SHAREPOINT_MASTER_REGISTER='https://orviahealthcare.sharepoint.com/sites/ORVIAHUB/_layouts/15/Doc.aspx?sourcedoc=%7B9CDAF48A-7C30-4921-9C5C-4ED9E5039F9E%7D&file=ORVIA_Master_Document_Register_v1.0.xlsx&action=default&mobileredirect=true&web=1';

export function LibraryTable(){
 const [q,setQ]=useState('');
 const rows=useMemo(()=>documents.filter(d=>`${d.reference} ${d.title} ${d.status} ${d.source}`.toLowerCase().includes(q.toLowerCase())),[q]);
 return <>
  <div className="tableTools">
   <input placeholder="Search indexed reference, title or state…" value={q} onChange={e=>setQ(e.target.value)}/>
   <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
    <a className="buttonLink" href={SHAREPOINT_MASTER_REGISTER} target="_blank" rel="noreferrer">Open master register <ExternalLink size={13}/></a>
    <a className="buttonLink" href={SHAREPOINT_GOVERNANCE} target="_blank" rel="noreferrer">Open live SharePoint <ExternalLink size={13}/></a>
   </div>
  </div>
  <div className="tableScroll"><table className="dataTable"><thead><tr><th>Reference / state</th><th>Title</th><th>Version</th><th>Status</th><th>Owner</th><th>Source</th></tr></thead><tbody>{rows.map((d,i)=><tr key={`${d.reference}-${i}`}><td>{d.reference}</td><td>{d.title}</td><td>{d.version}</td><td><span className={d.status.toLowerCase().includes('draft')?'draftTag':'approvedTag'}>{d.status}</span></td><td>{d.owner}</td><td>{d.source}</td></tr>)}{rows.length===0&&<tr><td colSpan={6}><div style={{padding:'18px 4px'}}><b>No indexed Command record matches that search.</b><div style={{marginTop:6,opacity:.7}}>The live controlled estate is in SharePoint. Use “Open live SharePoint” above while the Command index is being rebuilt.</div></div></td></tr>}</tbody></table></div>
 </>
}
