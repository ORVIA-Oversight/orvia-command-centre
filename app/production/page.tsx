import { IrisConsole } from '@/components/IrisConsole';
import { ProductionOS } from '@/components/ProductionOS';
import { Shell } from '@/components/Shell';
import { Topbar } from '@/components/Topbar';

export default function ProductionPage(){
  return <Shell><Topbar title="Production OS" eyebrow="ORVIA OVERSIGHT LTD · INTERNAL PRODUCTION WORKSPACE"/><div className="pageWrap"><IrisConsole/></div><ProductionOS/></Shell>;
}
