'use client';
import { useMemo, useState } from 'react';
import { documents } from '@/lib/data';
export function LibraryTable(){
 const [q,setQ]=useState('');
 const rows=useMemo(()=>documents.filter(d=>`${d.reference} ${d.title} ${d.status}`.toLowerCase().includes(q.toLowerCase())),[q]);
 return <><div className="tableTools"><input placeholder="Search reference, title or state…" value={q} onChange={e=>setQ(e.target.value)}/><button>New controlled output</button></div><div className="tableScroll"><table className="dataTable"><thead><tr><th>Reference / state</th><th>Title</th><th>Version</th><th>Status</th><th>Owner</th><th>Source</th></tr></thead><tbody>{rows.map((d,i)=><tr key={`${d.reference}-${i}`}><td>{d.reference}</td><td>{d.title}</td><td>{d.version}</td><td><span className={d.status.toLowerCase().includes('draft')?'draftTag':'approvedTag'}>{d.status}</span></td><td>{d.owner}</td><td>{d.source}</td></tr>)}</tbody></table></div></>
}
