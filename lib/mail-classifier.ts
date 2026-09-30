export type MailClassificationInput = {
  subject?: string | null;
  preview?: string | null;
  fromAddress?: string | null;
  accountType?: string | null;
};

export function classifyMail(input: MailClassificationInput) {
  const text = `${input.subject || ''} ${input.preview || ''} ${input.fromAddress || ''}`.toLowerCase();
  const from = (input.fromAddress || '').toLowerCase();

  const contains = (...terms: string[]) => terms.some((term) => text.includes(term));
  const automatedSender = /no-?reply|notifications?|mailer-daemon|donotreply/.test(from);

  if (contains('safeguard', 'disciplinary', 'grievance', 'solicitor', 'legal notice', 'court', 'ico ', 'cqc ', 'complaint', 'contract variation')) {
    return {
      classification: 'high_consequence',
      business_area: 'Governance',
      priority: contains('urgent', 'deadline', 'today') ? 'urgent' : 'high',
      state: 'needs_john',
      risk_level: 'red',
      assigned_agent: 'Governance Agent',
      requires_human: true,
    };
  }

  if (contains('receipt', 'payment received', 'paid invoice', 'vat receipt', 'order confirmation')) {
    return {
      classification: 'financial_evidence',
      business_area: 'Finance',
      priority: 'low',
      state: 'automated',
      risk_level: 'green',
      assigned_agent: 'Finance Agent',
      requires_human: false,
    };
  }

  if (contains('invoice', 'payment due', 'renewal', 'subscription', 'overdue', 'direct debit', 'statement')) {
    return {
      classification: 'finance_action',
      business_area: 'Finance',
      priority: contains('overdue', 'final notice', 'failed') ? 'high' : 'normal',
      state: 'needs_john',
      risk_level: 'amber',
      assigned_agent: 'Finance Agent',
      requires_human: true,
    };
  }

  if (contains('enquiry', 'inquiry', 'quote', 'quotation', 'proposal', 'demo', 'pricing', 'price', 'sales', 'interested in', 'book a call')) {
    return {
      classification: 'sales',
      business_area: 'Sales',
      priority: 'normal',
      state: 'reply_ready',
      risk_level: 'amber',
      assigned_agent: 'Sales Agent',
      requires_human: true,
    };
  }

  if (contains('candidate', 'interview', 'recruitment', 'application', 'employee', 'staff', 'absence', 'holiday request', 'hr ')) {
    return {
      classification: 'people',
      business_area: 'HR / People',
      priority: 'normal',
      state: 'reply_ready',
      risk_level: 'amber',
      assigned_agent: 'HR / People Agent',
      requires_human: true,
    };
  }

  if (contains('vercel', 'github', 'supabase', 'domain', 'dns', 'ssl', 'deployment', 'build failed', 'incident')) {
    return {
      classification: 'technical',
      business_area: 'Technical',
      priority: contains('failed', 'incident', 'outage') ? 'high' : 'normal',
      state: 'reply_ready',
      risk_level: 'amber',
      assigned_agent: 'Technical Agent',
      requires_human: true,
    };
  }

  if (contains('newsletter', 'unsubscribe', 'marketing preferences', 'weekly digest') || automatedSender) {
    return {
      classification: 'routine',
      business_area: 'Routine',
      priority: 'low',
      state: 'automated',
      risk_level: 'green',
      assigned_agent: 'Inbox Agent',
      requires_human: false,
    };
  }

  if (input.accountType === 'personal') {
    return {
      classification: 'personal',
      business_area: 'Personal',
      priority: 'normal',
      state: 'needs_john',
      risk_level: 'amber',
      assigned_agent: 'Personal Agent',
      requires_human: true,
    };
  }

  if (input.accountType === 'legacy') {
    return {
      classification: 'legacy_review',
      business_area: 'Legacy Migration',
      priority: 'normal',
      state: 'needs_review',
      risk_level: 'amber',
      assigned_agent: 'Legacy Migration Agent',
      requires_human: false,
    };
  }

  return {
    classification: 'review',
    business_area: 'IRIS Triage',
    priority: 'normal',
    state: 'needs_review',
    risk_level: 'amber',
    assigned_agent: 'Inbox Agent',
    requires_human: false,
  };
}
