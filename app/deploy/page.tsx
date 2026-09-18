import { DeployOps } from '@/components/DeployOps';
import { Shell } from '@/components/Shell';
import { Topbar } from '@/components/Topbar';

export default function DeployPage(){
  return <Shell><Topbar title="Deploy & Search" eyebrow="ORVIA OVERSIGHT LTD · RAPID DEPLOYMENT & SEARCH SUPPORT"/><div className="pageWrap deployPage"><DeployOps/></div></Shell>;
}