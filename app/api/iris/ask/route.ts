import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';

function clean(value: unknown) {
  return String(value ?? '').replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function requiresApproval(question: string) {
  return /\b(delete|publish|deploy|send|email|message|spend|purchase|pay|approve|sign|release|remove|terminate)\b/i.test(question);
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ status: 'INCOMPLETE', reason: 'Command received invalid JSON.' }, { status: 400 });
  }

  const question = clean(body?.question);
  if (!question) {
    return NextResponse.json({ status: 'INCOMPLETE', reason: 'Enter an instruction for IRIS.' }, { status: 400 });
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ status: 'INCOMPLETE', reason: 'Command cannot reach the live ORVIA data layer.' }, { status: 503 });
  }

  try {
    const approvalRequired = requiresApproval(question);

    const insert = await supabase.from('admin_work_queue').insert({
      work_type: 'command_instruction',
      title: question.slice(0, 180),
      detail: clean(body?.context?.lens ? `${question} | Context: ${body.context.lens}` : question),
      status: 'queued',
      priority: /\b(urgent|critical|immediately|today|launch)\b/i.test(question) ? 'high' : 'normal',
      assigned_to: 'IRIS',
      approval_required: approvalRequired,
      source_system: 'COMMAND',
      source_reference: 'command.orvia.org.uk',
    }).select('id,status,priority,approval_required').single();

    if (insert.error || !insert.data) {
      return NextResponse.json({ status: 'INCOMPLETE', reason: `IRIS could not queue the instruction: ${insert.error?.message ?? 'unknown database error'}` }, { status: 500 });
    }

    const isReview = /\b(review|brief|status|launch|critical|today|what.*need|ready)\b/i.test(question);
    if (isReview) {
      const [tasks, approvals, work, integrations] = await Promise.all([
        supabase.from('admin_tasks').select('id,title,status,priority,owner,due_at,approval_required').neq('status', 'completed').order('due_at', { ascending: true, nullsFirst: false }).limit(12),
        supabase.from('admin_tasks').select('id', { count: 'exact', head: true }).neq('status', 'completed').eq('approval_required', true),
        supabase.from('admin_work_queue').select('id,title,status,priority,assigned_to,approval_required,created_at').neq('status', 'completed').order('created_at', { ascending: false }).limit(12),
        supabase.from('admin_integrations').select('name,status,updated_at').order('updated_at', { ascending: false }).limit(20),
      ]);

      const taskRows = tasks.data ?? [];
      const workRows = work.data ?? [];
      const blockers = workRows.filter((x: any) => ['blocked','failed','error','not accepted','not verified'].includes(String(x.status ?? '').toLowerCase()));
      const priority = [...taskRows, ...workRows].filter((x: any) => ['high','urgent','critical'].includes(String(x.priority ?? '').toLowerCase())).slice(0, 5);
      const integrationIssues = (integrations.data ?? []).filter((x: any) => !['CONNECTED','LIVE VERIFIED','CONFIGURED','READY'].includes(String(x.status ?? '').toUpperCase())).slice(0, 5);

      const answer = [
        `Instruction accepted by IRIS as work ${insert.data.id}.`,
        `Live picture: ${taskRows.length} current tasks returned; ${approvals.count ?? 0} require human approval; ${workRows.length} active work items returned.`,
        `Priority: ${priority.length ? priority.map((x: any) => x.title).join('; ') : 'no high-priority items in the returned set'}.`,
        `Blocked/unverified work: ${blockers.length ? blockers.map((x: any) => x.title).join('; ') : 'none in the returned set'}.`,
        `Integration exceptions: ${integrationIssues.length ? integrationIssues.map((x: any) => `${x.name} (${x.status})`).join('; ') : 'none in the returned set'}.`,
        approvalRequired ? 'This instruction is human-gated before any consequential action.' : 'No consequential action was authorised by this response.'
      ].join(' ');

      return NextResponse.json({ status: 'COMPLETE', model: 'IRIS / Command live route', answer, workId: insert.data.id });
    }

    return NextResponse.json({
      status: 'COMPLETE',
      model: 'IRIS / Command live route',
      answer: `Instruction accepted by IRIS. Work ID ${insert.data.id}. Status ${insert.data.status}. Priority ${insert.data.priority}. ${insert.data.approval_required ? 'Human approval is required before consequential action.' : 'The request has been routed into the controlled work queue.'}`,
      workId: insert.data.id,
    });
  } catch (error: any) {
    return NextResponse.json({ status: 'INCOMPLETE', reason: `IRIS Command route error: ${error?.message ?? 'unknown error'}` }, { status: 500 });
  }
}
