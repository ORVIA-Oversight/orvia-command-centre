import { ProductionOS } from '@/components/ProductionOS';
import { Shell } from '@/components/Shell';
import { Topbar } from '@/components/Topbar';

export default function ProductionPage(){
  return <Shell><Topbar title="Production OS" eyebrow="ORVIA OVERSIGHT LTD · INTERNAL PRODUCTION WORKSPACE"/><ProductionOS/></Shell>;
}
