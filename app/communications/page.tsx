import { Shell } from '@/components/Shell';
import { Topbar } from '@/components/Topbar';
import { CommunicationsDashboard } from '@/components/CommunicationsDashboard';
import './communications.css';

export default function CommunicationsPage() {
  return (
    <Shell>
      <Topbar title="Command Communications" eyebrow="ORVIA OVERSIGHT · COMMUNICATIONS CONTROL" />
      <CommunicationsDashboard />
    </Shell>
  );
}
