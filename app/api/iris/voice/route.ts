import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';

type ToolCall = {
  id?: string;
  name?: string;
  arguments?: Record<string, unknown>;
  parameters?: Record<string, unknown>;
  function?: { name?: string; arguments?: Record<string, unknown> };
};

type GatewayAuthMode = 'x-orvia-iris-key' | 'bearer' | 'authorization-other' | 'none';

type GatewayAuth = {
  secret: string;
  mode: GatewayAuthMode;
};

function oneLine(value: unknown) {
  return String(value ?? '').replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function toolResult(toolCallId: string, result?: string, error?: string) {
  return NextResponse.json({
    results: [error ? { toolCallId, error: oneLine(error) } : { toolCallId, result: oneLine(result ?? 'No result returned.') }],
  });
}

function getToolCall(body: any): ToolCall | null {
  const message = body?.message ?? {};
  return message?.toolCallList?.[0] ?? message?.toolWithToolCallList?.[0]?.toolCall ?? body?.toolCallList?.[0] ?? body?.toolCall ?? null;
}

function getName(call: ToolCall) {
  return call.name ?? call.function?.name ?? '';
}

function getArgs(call: ToolCall) {
  return call.arguments ?? call.parameters ?? call.function?.arguments ?? {};
}

function asString(value: unknown) {
  return typeof value === 'string' ? value.trim() : value == null ? '' : String(value).trim();
}

function asBool(value: unknown, fallback = false) {
  return typeof value === 'boolean' ? value : fallback;
}

function suppliedGatewayAuth(req: NextRequest): GatewayAuth {
  const customHeader = req.headers.get('x-orvia-iris-key')?.trim() ?? '';
  if (customHeader) return { secret: customHeader, mode: 'x-orvia-iris-key' };

  const authorization = req.headers.get('authorization')?.trim() ?? '';
  if (/^Bearer\s+/i.test(authorization)) {
    return {
      secret: authorization.replace(/^Bearer\s+/i, '').trim(),
      mode: 'bearer',
    };
  }
  if (authorization) return { secret: '', mode: 'authorization-other' };

  return { secret: '', mode: 'none' };
}

function authFailureMessage(mode: GatewayAuthMode) {
  if (mode === 'x-orvia-iris-key') {
    return 'IRIS voice gateway authentication failed: x-orvia-iris-key was received, but its credential value did not match the Command production secret.';
  }
  if (mode === 'bearer') {
    return 'IRIS voice gateway authentication failed: Bearer authentication was received, but its credential value did not match the Command production secret.';
  }
  if (mode === 'authorization-other') {
    return 'IRIS voice gateway authentication failed: an Authorization header was received, but it was not a supported Bearer credential.';
  }
  return 'IRIS voice gateway authentication failed: no supported authentication header was received.';
}

export async function POST(req: NextRequest) {
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return toolResult('unknown', undefined, 'IRIS gateway received invalid JSON.');
  }

  const call = getToolCall(body);
  const toolCallId = call?.id ?? body?.message?.toolCallList?.[0]?.id ?? 'unknown';

  const expectedSecret = process.env.IRIS_VOICE_GATEWAY_SECRET;
  const suppliedAuth = suppliedGatewayAuth(req);
  if (!expectedSecret) {
    return toolResult(toolCallId, undefined, 'IRIS voice gateway is deployed but its server secret is not configured.');
  }
  if (suppliedAuth.secret !== expectedSecret) {
    return toolResult(toolCallId, undefined, authFailureMessage(suppliedAuth.mode));
  }

  if (!call) return toolResult(toolCallId, undefined, 'No Vapi tool call was found in the request.');

  const name = getName(call);
  const args = getArgs(call);
  const supabase = getServerSupabase();
  if (!supabase) {
    return toolResult(toolCallId, undefined, 'IRIS cannot reach the live ORVIA data layer because Supabase server credentials are not configured on Command.');
  }

  try {
    if (name === 'iris_today_brief') {
      const [tasks, approvals, work, integrations] = await Promise.all([
        supabase.from('admin_tasks').select('id,title,status,priority,owner,due,approval_required').neq('status', 'completed').order('due', { ascending: true, nullsFirst: false }).limit(12),
        supabase.from('admin_tasks').select('id,title,priority,owner,due', { count: 'exact' }).neq('status', 'completed').eq('approval_required', true).limit(8),
        supabase.from('admin_work_queue').select('id,title,status,priority,assigned_to,approval_required,created_at').neq('status', 'completed').order('created_at', { ascending: false }).limit(10),
        supabase.from('admin_integrations').select('name,status,updated_at').order('updated_at', { ascending: false }).limit(12),
      ]);

      const taskRows = tasks.data ?? [];
      const workRows = work.data ?? [];
      const priorityItems = [...taskRows, ...workRows].filter((x: any) => ['high', 'urgent', 'critical'].includes(String(x.priority ?? '').toLowerCase())).slice(0, 5);
      const blocked = workRows.filter((x: any) => ['blocked', 'failed', 'error'].includes(String(x.status ?? '').toLowerCase())).slice(0, 5);
      const integrationIssues = (integrations.data ?? []).filter((x: any) => !['CONNECTED', 'LIVE VERIFIED', 'CONFIGURED'].includes(String(x.status ?? '').toUpperCase())).slice(0, 5);

      const result = `IRIS live brief: ${taskRows.length} current tasks returned; ${approvals.count ?? 0} tasks require approval; ${workRows.length} active work-queue items returned. High-priority items: ${priorityItems.length ? priorityItems.map((x: any) => x.title).join('; ') : 'none in the returned set'}. Blocked work: ${blocked.length ? blocked.map((x: any) => x.title).join('; ') : 'none in the returned set'}. Integration exceptions: ${integrationIssues.length ? integrationIssues.map((x: any) => `${x.name} (${x.status})`).join('; ') : 'none in the returned set'}. This is live operational data, not a fabricated summary.`;
      return toolResult(toolCallId, result);
    }

    if (name === 'iris_search_orvia') {
      const query = asString(args.query);
      if (!query) return toolResult(toolCallId, undefined, 'A search query is required.');
      const pattern = `%${query.replace(/[%_,]/g, ' ')}%`;
      const [tasks, work, integrations] = await Promise.all([
        supabase.from('admin_tasks').select('id,title,status,priority,owner,due,source').ilike('title', pattern).limit(10),
        supabase.from('admin_work_queue').select('id,title,detail,status,priority,assigned_to,source,reference').or(`title.ilike.${pattern},detail.ilike.${pattern}`).limit(10),
        supabase.from('admin_integrations').select('code,name,category,status,updated_at').ilike('name', pattern).limit(10),
      ]);
      const hits = [
        ...(tasks.data ?? []).map((x: any) => `Task: ${x.title} [${x.status}]`),
        ...(work.data ?? []).map((x: any) => `Work: ${x.title} [${x.status}]${x.detail ? ` - ${x.detail}` : ''}`),
        ...(integrations.data ?? []).map((x: any) => `Integration: ${x.name} [${x.status}]`),
      ];
      return toolResult(toolCallId, hits.length ? `IRIS found ${hits.length} live operational matches for ${query}: ${hits.slice(0, 12).join(' | ')}` : `IRIS found no live operational match for ${query} in Command's indexed tasks, work queue or integrations. This does not prove that no ORVIA document or external record exists.`);
    }

    if (name === 'iris_get_project_status') {
      const project = asString(args.project_name);
      if (!project) return toolResult(toolCallId, undefined, 'project_name is required.');
      const pattern = `%${project.replace(/[%_,]/g, ' ')}%`;
      const [tasks, work] = await Promise.all([
        supabase.from('admin_tasks').select('id,title,status,priority,owner,due,approval_required,source').ilike('title', pattern).limit(20),
        supabase.from('admin_work_queue').select('id,title,detail,status,priority,assigned_to,approval_required,created_at,source,reference').or(`title.ilike.${pattern},detail.ilike.${pattern}`).order('created_at', { ascending: false }).limit(20),
      ]);
      const rows = [...(tasks.data ?? []), ...(work.data ?? [])];
      if (!rows.length) return toolResult(toolCallId, `IRIS has no matching live Command records for ${project}. Treat the project status as unverified until another source is checked.`);
      const blockers = rows.filter((x: any) => ['blocked', 'failed', 'error', 'not accepted', 'not verified'].includes(String(x.status ?? '').toLowerCase()));
      const approvals = rows.filter((x: any) => x.approval_required === true);
      const recent = rows.slice(0, 5).map((x: any) => `${x.title} [${x.status}]`).join('; ');
      return toolResult(toolCallId, `${project}: ${rows.length} matching live Command records; ${blockers.length} blockers or failed/unverified records; ${approvals.length} items requiring approval. Recent/matching work: ${recent}.`);
    }

    if (name === 'iris_route_instruction') {
      const instruction = asString(args.instruction);
      if (!instruction) return toolResult(toolCallId, undefined, 'An instruction is required.');
      const priority = asString(args.priority) || 'normal';
      const context = asString(args.context);
      const approvalRequired = asBool(args.approval_required, false);
      const callId = asString(body?.message?.call?.id) || asString(body?.call?.id) || 'unknown';
      const insert = await supabase.from('admin_work_queue').insert({
        work_type: 'aria_instruction',
        title: instruction.slice(0, 180),
        detail: context || instruction,
        status: 'queued',
        priority,
        assigned_to: 'IRIS',
        approval_required: approvalRequired,
        source: 'ARIA',
        reference: `VAPI:${callId}`,
      }).select('id,title,status,priority,assigned_to,approval_required').single();
      if (insert.error || !insert.data) return toolResult(toolCallId, undefined, `IRIS could not create the work item: ${insert.error?.message ?? 'unknown database error'}`);
      return toolResult(toolCallId, `Instruction accepted by IRIS. Work ID ${insert.data.id}. Status ${insert.data.status}. Priority ${insert.data.priority}. Assigned to ${insert.data.assigned_to}. ${insert.data.approval_required ? 'Human approval is required before consequential completion.' : 'No explicit approval flag was requested.'}`);
    }

    if (name === 'iris_report_back') {
      const workId = asString(args.work_id);
      if (!workId) return toolResult(toolCallId, undefined, 'work_id is required.');
      const work = await supabase.from('admin_work_queue').select('*').eq('id', workId).maybeSingle();
      if (work.error) return toolResult(toolCallId, undefined, `IRIS could not retrieve that work item: ${work.error.message}`);
      if (!work.data) return toolResult(toolCallId, `No Command work item was found for ID ${workId}.`);
      const row: any = work.data;
      return toolResult(toolCallId, `Work ${workId}: ${row.title}. Status ${row.status}. Priority ${row.priority ?? 'not stated'}. Assigned to ${row.assigned_to ?? 'unassigned'}. ${row.detail ? `Detail: ${row.detail}.` : ''} ${row.approval_required ? 'Human approval is required.' : ''}`);
    }

    return toolResult(toolCallId, undefined, `Unknown IRIS tool: ${name || 'unnamed tool'}.`);
  } catch (error: any) {
    return toolResult(toolCallId, undefined, `IRIS gateway error: ${error?.message ?? 'unknown error'}`);
  }
}
