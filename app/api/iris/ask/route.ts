import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';
import { isConsequential, routeDivisions } from '@/lib/agent-instructions';

function clean(value: unknown) {
  return String(value ?? '').replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function humanDivisionName(id: string) {
  return ({
    STRATOS: 'Strategy',
    OPS: 'Operations',
    VERA: 'Evidence',
    ATLAS: 'Back Office',
    DEALMAKER: 'Deals',
    GROWTH: 'Sales & Marketing',
    SOCIAL: 'Social & Content',
  } as Record<string,string>)[id] ?? id;
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ status: 'INCOMPLETE', reason: 'I could not read that request. Please try again.' }, { status: 400 });
  }

  const question = clean(body?.question);
  if (!question) {
    return NextResponse.json({ status: 'INCOMPLETE', reason: 'Tell me what you need help with.' }, { status: 400 });
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ status: 'INCOMPLETE', reason: 'I cannot reach the live ORVIA data right now, so I cannot answer reliably.' }, { status: 503 });
  }

  try {
    const routed = routeDivisions(question);
    const approvalRequired = isConsequential(question);

    const insert = await supabase.from('admin_work_queue').insert({
      work_type: 'command_instruction',
      title: question.slice(0, 180),
      detail: clean(`${question} | Routed: ${routed.join(', ')}`),
      status: 'open',
      priority: /\b(urgent|critical|immediately|today|launch)\b/i.test(question) ? 'high' : 'normal',
      assigned_to: 'IRIS',
      approval_required: approvalRequired,
      source_system: 'COMMAND',
      source_reference: 'command.orvia.org.uk',
    }).select('id,status,priority,approval_required').single();

    if (insert.error || !insert.data) {
      return NextResponse.json({ status: 'INCOMPLETE', reason: 'I could not add that to the ORVIA work queue. Please try again.' }, { status: 500 });
    }

    const isReview = /\b(review|brief|status|launch|critical|today|what.*need|ready|priority|priorities|finish|finished|where are we|how are we)\b/i.test(question);

    if (isReview) {
      const [tasks, approvals, work, integrations] = await Promise.all([
        supabase.from('admin_tasks').select('id,title,status,priority,owner,due_at,approval_required').neq('status', 'completed').order('due_at', { ascending: true, nullsFirst: false }).limit(20),
        supabase.from('admin_tasks').select('id', { count: 'exact', head: true }).neq('status', 'completed').eq('approval_required', true),
        supabase.from('admin_work_queue').select('id,title,status,priority,assigned_to,approval_required,created_at').not('status', 'in', '(done,cancelled)').order('created_at', { ascending: false }).limit(20),
        supabase.from('admin_integrations').select('name,status,updated_at').order('updated_at', { ascending: false }).limit(30),
      ]);

      const taskRows = tasks.data ?? [];
      const workRows = work.data ?? [];
      const blockers = workRows.filter((x: any) => ['blocked','failed','error','not accepted','not verified'].includes(String(x.status ?? '').toLowerCase()));
      const priority = [...taskRows, ...workRows]
        .filter((x: any) => ['high','urgent','critical'].includes(String(x.priority ?? '').toLowerCase()))
        .filter((x: any, i: number, arr: any[]) => arr.findIndex((y: any) => y.title === x.title) === i)
        .slice(0, 3);
      const integrationIssues = (integrations.data ?? [])
        .filter((x: any) => !['CONNECTED','LIVE VERIFIED','CONFIGURED','READY'].includes(String(x.status ?? '').toUpperCase()))
        .slice(0, 2);

      const answer: string[] = [];
      if (priority.length) answer.push(`The main priorities are ${priority.map((x: any) => x.title).join('; ')}.`);
      else answer.push('I cannot see any high-priority items in the current live view.');

      if ((approvals.count ?? 0) > 0) answer.push(`${approvals.count} item${approvals.count === 1 ? '' : 's'} need your approval.`);
      if (blockers.length) answer.push(`${blockers.length} blocked or unverified item${blockers.length === 1 ? '' : 's'} need attention.`);
      else if (integrationIssues.length) answer.push(`The main system issue is ${integrationIssues.map((x: any) => x.name).join(' and ')}.`);
      else answer.push('I cannot see a current system exception in the returned live set.');

      if (approvalRequired) answer.push('I will hold any consequential action for your approval.');
      answer.push('Ask me for the detail on any one item and I will drill into it.');

      return NextResponse.json({
        status: 'COMPLETE',
        model: 'IRIS',
        answer: answer.join(' '),
        workId: insert.data.id,
        routedTo: routed.map(humanDivisionName),
        approvalRequired,
      });
    }

    return NextResponse.json({
      status: 'COMPLETE',
      model: 'IRIS',
      answer: approvalRequired
        ? 'I have it. I have routed the work and will hold any consequential action for your approval.'
        : 'I have it. I have routed the work to the right part of ORVIA and will bring back only what matters.',
      workId: insert.data.id,
      routedTo: routed.map(humanDivisionName),
      approvalRequired,
    });
  } catch {
    return NextResponse.json({ status: 'INCOMPLETE', reason: 'I hit a problem while processing that. Please try again.' }, { status: 500 });
  }
}
