import Link from 'next/link';
import { ExternalLink, FolderKanban, Globe2, ShieldAlert } from 'lucide-react';
import { Shell } from '@/components/Shell';
import { Topbar } from '@/components/Topbar';
import { loadOrviaAssets, isCurrentAsset, isLegacyAsset } from '@/lib/asset-registry';

function accentClass(key:string|null){
 return key==='r'?'visual-teal':key==='v'?'visual-gold':key==='i'?'visual-purple':key==='a'?'visual-orange':'visual-navy';
}

export default async function ProjectsPage(){
 const state=await loadOrviaAssets();
 const current=state.assets.filter(isCurrentAsset).filter(a=>!isLegacyAsset(a));
 const legacy=state.assets.filter(isLegacyAsset);
 return <Shell><Topbar title="ORVIA Landscape"/><div className="pageWrap">
  <section className="pageIntro projectIntro">
   <div className="eyebrow">LIVE ASSET REGISTRY</div>
   <h2>One controlled view of the ORVIA estate.</h2>
   <p>This screen is generated from the live Asset Registry. It shows what ORVIA currently keeps, what still needs reconciliation and what is being held for retirement.</p>
  </section>

  <section className="projectGroup">
   <div className="projectGroupHead"><div><span>CURRENT ESTATE</span><h3>{current.length} controlled assets</h3></div></div>
   <div className="projectGrid">
    {current.map(asset=><article className={'projectTile '+accentClass(asset.accent_key)} key={asset.asset_key}>
      <Link href={'/projects/'+asset.asset_key} className="projectTileMain">
       <div className="projectWindowBar"><i/><i/><i/><span>{asset.canonical_domain||asset.asset_type}</span></div>
       <div className="projectVisual"><div className="projectMark">{(asset.accent_key||'o').toUpperCase()}</div><div><small>{asset.asset_type.replaceAll('_',' ')}</small><h4>{asset.display_name}</h4></div></div>
       <p>{asset.notes||'Controlled ORVIA asset.'}</p>
       <div className="projectTileFoot"><span className="projectStatus">{asset.estate_disposition.toUpperCase()}</span><span className="openProject"><FolderKanban size={14}/> Open asset</span></div>
      </Link>
      {asset.canonical_url&&<a className="projectQuickLink" href={asset.canonical_url} target="_blank" rel="noreferrer"><Globe2 size={14}/> Open <ExternalLink size={12}/></a>}
    </article>)}
   </div>
  </section>

  {legacy.length>0&&<section className="projectGroup">
   <div className="projectGroupHead"><div><span>CLEANUP QUEUE</span><h3>{legacy.length} legacy / retirement candidates</h3></div><ShieldAlert size={18}/></div>
   <div className="projectGrid">
    {legacy.map(asset=><article className="projectTile visual-navy" key={asset.asset_key}>
      <Link href={'/projects/'+asset.asset_key} className="projectTileMain">
       <div className="projectWindowBar"><i/><i/><i/><span>{asset.deployment_project_name||asset.asset_type}</span></div>
       <div className="projectVisual"><div className="projectMark">LEG</div><div><small>{asset.asset_type.replaceAll('_',' ')}</small><h4>{asset.display_name}</h4></div></div>
       <p>{asset.notes||'Legacy asset awaiting controlled retirement.'}</p>
       <div className="projectTileFoot"><span className="projectStatus">{asset.estate_disposition.toUpperCase()}</span><span className="openProject"><FolderKanban size={14}/> Review</span></div>
      </Link>
    </article>)}
   </div>
  </section>}
 </div></Shell>
}