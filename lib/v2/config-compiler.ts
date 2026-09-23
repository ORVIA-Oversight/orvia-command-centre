import type { TenantConfig, ValidationIssue } from './types';

function detectEscalationCycle(edges: TenantConfig['escalations']) {
  const graph = new Map<string, string[]>();
  for (const edge of edges) graph.set(edge.fromRole, [...(graph.get(edge.fromRole) ?? []), edge.toRole]);
  const visiting = new Set<string>();
  const visited = new Set<string>();

  const visit = (node: string): boolean => {
    if (visiting.has(node)) return true;
    if (visited.has(node)) return false;
    visiting.add(node);
    for (const next of graph.get(node) ?? []) if (visit(next)) return true;
    visiting.delete(node);
    visited.add(node);
    return false;
  };

  return [...graph.keys()].some(visit);
}

export function validateTenantConfig(config: TenantConfig): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const roles = new Map(config.roles.map((role) => [role.code, role.activeUsers]));

  if (!config.version.trim()) issues.push({ code: 'CONFIG_VERSION_REQUIRED', severity: 'error', message: 'Configuration version is required.' });
  if (detectEscalationCycle(config.escalations)) {
    issues.push({ code: 'CIRCULAR_ESCALATION', severity: 'error', message: 'Escalation graph contains a cycle.' });
  }

  for (const [index, workflow] of config.workflows.entries()) {
    const path = `workflows[${index}]`;
    if (!workflow.enabled) continue;

    if (!workflow.accountableRole) {
      issues.push({ code: 'NO_ACCOUNTABLE_ROLE', severity: 'error', path, message: `Workflow ${workflow.code} has no accountable role.` });
    } else if (!roles.has(workflow.accountableRole)) {
      issues.push({ code: 'UNKNOWN_ACCOUNTABLE_ROLE', severity: 'error', path, message: `Workflow ${workflow.code} references an unknown accountable role.` });
    } else if ((roles.get(workflow.accountableRole) ?? 0) < 1) {
      issues.push({ code: 'ACCOUNTABLE_ROLE_UNSTAFFED', severity: 'error', path, message: `Workflow ${workflow.code} has no active human in its accountable role.` });
    }

    if (workflow.requiresAi && !config.aiEnabled) {
      issues.push({ code: 'AI_REMOVAL_FAILURE', severity: 'error', path, message: `Workflow ${workflow.code} requires AI while tenant AI is disabled.` });
    }
    if (workflow.slaMinutes != null && workflow.slaMinutes <= 0) {
      issues.push({ code: 'INVALID_SLA', severity: 'error', path, message: `Workflow ${workflow.code} has a non-positive SLA.` });
    }
    if (!workflow.notificationChannels?.length) {
      issues.push({ code: 'NO_NOTIFICATION_ROUTE', severity: 'warning', path, message: `Workflow ${workflow.code} has no configured notification channel.` });
    }
    if (workflow.code.toLowerCase().includes('serious')) {
      const tracks = new Set(workflow.seriousConcernTracks ?? []);
      if (!tracks.has('PROTECTION') || !tracks.has('INQUIRY')) {
        issues.push({ code: 'SERIOUS_TRACKS_INCOMPLETE', severity: 'error', path, message: 'Serious Concern workflow requires PROTECTION and INQUIRY tracks.' });
      }
    }
  }

  for (const edge of config.escalations) {
    if (!roles.has(edge.fromRole) || !roles.has(edge.toRole)) {
      issues.push({ code: 'ESCALATION_ROLE_UNKNOWN', severity: 'error', message: `Escalation ${edge.fromRole} -> ${edge.toRole} references an unknown role.` });
    }
  }

  return issues;
}

export function configCanPublish(config: TenantConfig) {
  const issues = validateTenantConfig(config);
  return { ok: !issues.some((issue) => issue.severity === 'error'), issues };
}
