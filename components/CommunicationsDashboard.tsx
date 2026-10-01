'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Archive,
  Bot,
  CheckCircle2,
  Clock3,
  FileText,
  Inbox,
  Mail,
  MessageSquareReply,
  RefreshCw,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UserRoundCheck,
  WalletCards,
} from 'lucide-react';

type MailAccount = {
  id: string;
  provider: string;
  address: string;
  display_name?: string | null;
  account_type: 'personal' | 'business' | 'legacy' | 'shared';
  business_area?: string | null;
  status: string;
  last_sync_at?: string | null;
};

type MailItem = {
  id: string;
  from_address?: string | null;
  from_name?: string | null;
  subject?: string | null;
  preview?: string | null;
  received_at?: string | null;
  business_area?: string | null;
  priority: string;
  state: string;
  risk_level: 'green' | 'amber' | 'red';
  assigned_agent?: string | null;
  summary?: string | null;
  deadline_at?: string | null;
};

type MailDraft = {
  id: string;
  option_label: string;
  tone?: string | null;
  subject?: string | null;
  body: string;
  recommended?: boolean;
};

type DashboardData = {
  live: boolean;
  providerReadiness: { microsoft: boolean; google: boolean; encryption: boolean; ai: boolean };
  counts: { needsJohn: number; replyReady: number; waiting: number; automated: number };
  accounts: MailAccount[];
  items: MailItem[];
  rules: any[];
  voiceProfile: any;
  signature: any;
};

const states = [
  { key: 'needs_review', label: 'Triage', icon: Inbox },
  { key: 'needs_john', label: 'Needs me', icon: UserRoundCheck },
  { key: 'reply_ready', label: 'Replies ready', icon: MessageSquareReply },
  { key: 'waiting', label: 'Waiting', icon: Clock3 },
  { key: 'filed', label: 'Filed', icon: Archive },
];

function riskLabel(level: string) {
  if (level === 'red') return 'John required';
  if (level === 'amber') return 'Prepare';
  return 'Agent can handle';
}

export function CommunicationsDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [active, setActive] = useState('needs_review');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<MailItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [drafts, setDrafts] = useState<MailDraft[]>([]);
  const [selectedDraft, setSelectedDraft] = useState<string | null>(null);
  const [drafting, setDrafting] = useState(false);
  const [sending, setSending] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [writingOwn, setWritingOwn] = useState(false);
  const [customBody, setCustomBody] = useState('');

  async function load() {
    setLoading(true);
    try {
      const response = await fetch('/api/communications/dashboard', { cache: 'no-store' });
      setData(await response.json());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function syncMail() {
    setSyncing(true);
    setSyncMessage('');
    try {
      const response = await fetch('/api/communications/sync', { method: 'POST' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || 'Sync failed');
      const synced = Array.isArray(payload?.synced) ? payload.synced : [];
      const checked = synced.reduce((sum: number, row: any) => sum + Number(row.checked || 0), 0);
      const inserted = synced.reduce((sum: number, row: any) => sum + Number(row.inserted || 0), 0);
      const updated = synced.reduce((sum: number, row: any) => sum + Number(row.updated || 0), 0);
      const errors = synced.filter((row: any) => row.error).map((row: any) => row.error);
      setSyncMessage(errors.length
        ? `Sync finished with an issue · ${errors.join(' · ')}`
        : `Sync complete · ${checked} checked · ${inserted} new · ${updated} refreshed`);
      await load();
    } catch (error) {
      setSyncMessage(error instanceof Error ? error.message : 'Sync failed');
    } finally {
      setSyncing(false);
    }
  }

  const visible = useMemo(() => {
    const items = data?.items ?? [];
    return items.filter((item) => {
      const inState = active === 'filed'
        ? ['filed', 'automated'].includes(item.state)
        : item.state === active;
      const haystack = `${item.subject ?? ''} ${item.from_name ?? ''} ${item.from_address ?? ''} ${item.business_area ?? ''}`.toLowerCase();
      return inState && haystack.includes(query.toLowerCase());
    });
  }, [data, active, query]);

  useEffect(() => {
    if (!selected || !visible.some((item) => item.id === selected.id)) {
      setSelected(visible[0] ?? null);
    }
  }, [visible, selected]);

  useEffect(() => {
    let cancelled = false;
    async function prepareDrafts() {
      setDrafts([]);
      setSelectedDraft(null);
      setActionMessage('');
      setWritingOwn(false);
      setCustomBody('');
      if (!selected || !['needs_john', 'reply_ready'].includes(selected.state)) return;
      setDrafting(true);
      try {
        let response = await fetch(`/api/communications/items/${selected.id}/drafts`, { cache: 'no-store' });
        let payload = await response.json();
        if (!response.ok) throw new Error(payload?.error || 'Could not load reply drafts');
        let nextDrafts = Array.isArray(payload?.drafts) ? payload.drafts : [];
        if (nextDrafts.length < 3) {
          response = await fetch(`/api/communications/items/${selected.id}/drafts`, { method: 'POST' });
          payload = await response.json();
          if (!response.ok) throw new Error(payload?.error || 'Could not prepare reply drafts');
          nextDrafts = Array.isArray(payload?.drafts) ? payload.drafts : [];
        }
        if (!cancelled) {
          setDrafts(nextDrafts);
          setSelectedDraft(nextDrafts.find((d: MailDraft) => d.recommended)?.id || nextDrafts[0]?.id || null);
        }
      } catch (error) {
        if (!cancelled) setActionMessage(error instanceof Error ? error.message : 'Could not prepare replies');
      } finally {
        if (!cancelled) setDrafting(false);
      }
    }
    prepareDrafts();
    return () => { cancelled = true; };
  }, [selected?.id, selected?.state]);

  async function sendReply() {
    if (!selected) return;
    const chosen = drafts.find((draft) => draft.id === selectedDraft);
    const body = writingOwn ? customBody : chosen?.body || '';
    if (!body.trim()) {
      setActionMessage('Choose a reply or write your own first.');
      return;
    }

    let confirmHuman = false;
    if (selected.risk_level === 'red') {
      confirmHuman = window.confirm('This is high-consequence correspondence. Confirm that you have reviewed the reply and want to send it from the connected mailbox.');
      if (!confirmHuman) return;
    }

    setSending(true);
    setActionMessage('');
    try {
      const response = await fetch(`/api/communications/items/${selected.id}/send`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(writingOwn
          ? { body, subject: selected.subject ? `Re: ${selected.subject}` : 'Re: Your email', confirm_human: confirmHuman }
          : { draft_id: selectedDraft, confirm_human: confirmHuman }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || 'Reply could not be sent');
      setActionMessage('Reply sent · moved to Waiting');
      await load();
      setActive('waiting');
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : 'Reply could not be sent');
    } finally {
      setSending(false);
    }
  }

  const counts = data?.counts ?? { needsJohn: 0, replyReady: 0, waiting: 0, automated: 0 };
  const metric = [
    ['Needs me', counts.needsJohn, 'red'],
    ['Replies ready', counts.replyReady, 'purple'],
    ['Waiting', counts.waiting, 'gold'],
    ['Handled quietly', counts.automated, 'teal'],
  ];

  return (
    <div className="mailPage">
      <section className="mailHero">
        <div>
          <small>COMMAND MAIL</small>
          <h2>Your inbox becomes decisions, not noise.</h2>
          <p>All connected email accounts feed one controlled queue. IRIS routes work to specialist agents, keeps high-consequence replies human-approved, and preserves the original message trail.</p>
        </div>
        <div className="mailHeroPills">
          <span><Smartphone size={15}/> Phone-first PWA</span>
          <span><ShieldCheck size={15}/> Human approval gates</span>
          <span><Sparkles size={15}/> John Voice</span>
        </div>
      </section>

      <section className="mailMetrics">
        {metric.map(([label, value, tone]) => (
          <article className={`mailMetric ${tone}`} key={String(label)}>
            <small>{label}</small>
            <strong>{value}</strong>
          </article>
        ))}
      </section>

      <section className="mailControlStrip">
        <div>
          <b>Platform readiness</b>
          <span className={data?.providerReadiness.microsoft ? 'ok' : 'pending'}>Microsoft</span>
          <span className={data?.providerReadiness.google ? 'ok' : 'pending'}>Google</span>
          <span className={data?.providerReadiness.encryption ? 'ok' : 'pending'}>Token vault</span>
          <span className={data?.providerReadiness.ai ? 'ok' : 'pending'}>AI drafting</span>
        </div>
        <div className="mailControlActions">
          {data?.providerReadiness.microsoft && <a href="/api/communications/connect/microsoft">+ Microsoft</a>}
          {data?.providerReadiness.google && <a href="/api/communications/connect/google">+ Google</a>}
          <button onClick={syncMail} disabled={syncing || !data?.accounts?.length}><Mail size={14}/>{syncing ? 'Syncing…' : 'Sync mail'}</button>
          <button onClick={load} disabled={loading}><RefreshCw size={14}/>{loading ? 'Refreshing…' : 'Refresh'}</button>
        </div>
      </section>
      {syncMessage ? <div className="mailSyncMessage">{syncMessage}</div> : null}

      <section className="mailWorkspace">
        <aside className="mailRail">
          <div className="mailRailTitle">Queues</div>
          {states.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setActive(key)} className={active === key ? 'active' : ''}>
              <Icon size={16}/><span>{label}</span>
            </button>
          ))}
          <div className="mailRailTitle">Agents</div>
          {['Sales','Client','Finance','HR / People','Governance','Technical','Vanguard','Personal'].map((x) => (
            <div className="mailAgent" key={x}><Bot size={14}/><span>{x}</span></div>
          ))}
        </aside>

        <div className="mailList">
          <div className="mailListHead">
            <div>
              <small>UNIFIED INBOX</small>
              <h3>{states.find((x) => x.key === active)?.label}</h3>
            </div>
            <label><Search size={15}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search this queue"/></label>
          </div>

          <div className="mailAccounts">
            {(data?.accounts?.length ?? 0) === 0 ? (
              <div className="mailEmptyAccount"><Mail size={17}/><span>No live mailbox connections yet. When Microsoft or Google readiness turns green, use the connect buttons above to add each current, personal and legacy mailbox.</span></div>
            ) : data!.accounts.map((account) => (
              <span key={account.id} className={`mailAccount ${account.status}`}>
                {account.address}<em>{account.account_type}</em>
              </span>
            ))}
          </div>

          <div className="mailRows">
            {visible.length === 0 ? (
              <div className="mailEmpty">
                <Inbox size={28}/>
                <b>No items in this queue</b>
                <span>When mail sync is active, classified messages will appear here automatically.</span>
              </div>
            ) : visible.map((item) => (
              <button className={selected?.id === item.id ? 'mailRow selected' : 'mailRow'} onClick={() => setSelected(item)} key={item.id}>
                <span className={`riskDot ${item.risk_level}`}/>
                <div className="mailRowMain">
                  <div><b>{item.from_name || item.from_address || 'Unknown sender'}</b><small>{item.business_area || 'Review'}</small></div>
                  <strong>{item.subject || '(No subject)'}</strong>
                  <p>{item.summary || item.preview || 'No summary available yet.'}</p>
                </div>
                <div className="mailRowMeta">
                  <span className={`riskTag ${item.risk_level}`}>{riskLabel(item.risk_level)}</span>
                  <small>{item.assigned_agent || 'IRIS'}</small>
                </div>
              </button>
            ))}
          </div>
        </div>

        <aside className="mailDetail">
          {!selected ? (
            <div className="mailDetailEmpty"><FileText size={30}/><b>Select a message</b><span>Context, agent assessment and reply choices will appear here.</span></div>
          ) : (
            <>
              <div className="mailDetailHead">
                <span className={`riskTag ${selected.risk_level}`}>{riskLabel(selected.risk_level)}</span>
                <h3>{selected.subject || '(No subject)'}</h3>
                <p>{selected.from_name || selected.from_address}</p>
              </div>
              <div className="mailDecision">
                <small>AGENT ASSESSMENT</small>
                <p>{selected.summary || selected.preview || 'Awaiting AI summary.'}</p>
              </div>
              <div className="mailDecision">
                <small>OWNER</small>
                <b>{selected.assigned_agent || 'IRIS triage'}</b>
                <p>{selected.business_area || 'Unclassified'} · {selected.priority} priority</p>
              </div>
              {['needs_john', 'reply_ready'].includes(selected.state) ? (
                <>
                  <div className="replyCards">
                    {drafting ? <div className="mailDrafting"><Sparkles size={16}/>Preparing three John Voice options…</div> : null}
                    {drafts.map((draft) => (
                      <button key={draft.id} className={selectedDraft === draft.id && !writingOwn ? 'chosen' : ''} onClick={() => { setSelectedDraft(draft.id); setWritingOwn(false); }}>
                        <span>{draft.option_label}</span>
                        <div>
                          <b>{draft.recommended ? 'Recommended · ' : ''}{draft.tone || 'John Voice'}</b>
                          <small>{draft.body.slice(0, 150)}{draft.body.length > 150 ? '…' : ''}</small>
                        </div>
                      </button>
                    ))}
                  </div>
                  {writingOwn ? (
                    <textarea className="mailOwnReply" value={customBody} onChange={(e) => setCustomBody(e.target.value)} placeholder="Write your own reply here…" rows={8}/>
                  ) : selectedDraft ? (
                    <div className="mailDraftPreview">
                      <small>SELECTED REPLY</small>
                      <p>{drafts.find((draft) => draft.id === selectedDraft)?.body}</p>
                    </div>
                  ) : null}
                  {actionMessage ? <div className="mailActionMessage">{actionMessage}</div> : null}
                  <div className="mailDetailActions">
                    <button className="primary" onClick={sendReply} disabled={sending || drafting}>{sending ? 'Sending…' : selected.risk_level === 'red' ? 'Review & send' : 'Send selected'}</button>
                    <button onClick={() => setWritingOwn((value) => !value)}>{writingOwn ? 'Use prepared reply' : 'Write my own'}</button>
                  </div>
                </>
              ) : (
                <div className="mailDecision"><small>STATUS</small><p>This item is not awaiting a reply. Use its queue state to track or review it.</p></div>
              )}
            </>
          )}
        </aside>
      </section>

      <section className="mailFoundation">
        <article><WalletCards size={18}/><div><b>Accounts capture</b><p>Receipts and invoices can be routed into Finance without filling your working inbox.</p></div></article>
        <article><AlertTriangle size={18}/><div><b>Legacy migration</b><p>Old personal addresses remain monitored until every business dependency is identified and moved.</p></div></article>
        <article><CheckCircle2 size={18}/><div><b>Controlled sending</b><p>Legal, safeguarding, HR, complaints, contractual and significant financial replies stay human-approved.</p></div></article>
      </section>
    </div>
  );
}
