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

  // Family / Mia evidence is deliberately its own protected evidence stream.
  // It must never be auto-replied to, silently filed, or mixed into ordinary business triage.
  if (contains(
    'mia', 'jama', 'dowrick', 'cafcass', 'family court', 'child arrangements',
    'parental responsibility', 'section 7', 'section 47', 'c100',
    'lincolnshire family', 'dr stevenson', 'carter brown', 'lorna smith'
  )) {
    return {
      classification: 'mia_family_evidence',
      business_area: 'Mia / Family Evidence',
      priority: contains('hearing', 'deadline', 'order', 'urgent', 'today') ? 'urgent' : 'high',
      state: 'needs_john',
      risk_level: 'red',
      assigned_agent: 'Evidence Review Agent',
      requires_human: true,
    };
  }

  if (contains('solicitor', 'barrister', 'legal notice', 'court', 'hearing', 'court order', 'ico ', 'cqc ', 'complaint', 'contract variation', 'safeguard', 'disciplinary', 'grievance')) {
    return {
      classification: 'legal_governance',
      business_area: 'Legal / Governance',
      priority: contains('urgent', 'deadline', 'today', 'hearing') ? 'urgent' : 'high',
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

  if (contains('enquiry', 'inquiry', 'quote', 'quotation', 'proposal', 'demo', 'pricing', 'price', 'sales', 'interested in', 'book a call', 'lead', 'prospect')) {
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

  if (contains('vanguard', 'airsoft', 'milsim', 'six troop', '6 troop', 'atac')) {
    return {
      classification: 'vanguard',
      business_area: 'Vanguard',
      priority: 'normal',
      state: 'needs_review',
      risk_level: 'amber',
      assigned_agent: 'Vanguard Agent',
      requires_human: false,
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
