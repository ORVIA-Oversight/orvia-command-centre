export type MailProvider = 'microsoft' | 'google';

export function commandBaseUrl() {
  return (process.env.COMMAND_BASE_URL || process.env.NEXT_PUBLIC_COMMAND_URL || 'https://command.orvia.org.uk').replace(/\/$/, '');
}

export function providerConfig(provider: MailProvider) {
  const base = commandBaseUrl();
  if (provider === 'microsoft') {
    const clientId = process.env.MICROSOFT_CLIENT_ID;
    const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
    const tenant = process.env.MICROSOFT_TENANT_ID || 'organizations';
    if (!clientId || !clientSecret) throw new Error('Microsoft OAuth is not configured');
    return {
      provider,
      clientId,
      clientSecret,
      redirectUri: `${base}/api/communications/oauth/microsoft/callback`,
      authorizeUrl: `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize`,
      tokenUrl: `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`,
      scope: 'openid profile email offline_access User.Read Mail.ReadWrite Mail.Send Calendars.ReadWrite',
    };
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error('Google OAuth is not configured');
  return {
    provider,
    clientId,
    clientSecret,
    redirectUri: `${base}/api/communications/oauth/google/callback`,
    authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scope: 'openid email profile https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/calendar',
  };
}

export function providerFromString(value: string): MailProvider | null {
  if (value === 'microsoft' || value === 'google') return value;
  return null;
}
