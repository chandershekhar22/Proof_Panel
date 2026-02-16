import crypto from 'crypto';

export function getLinkedInConfig() {
  return {
    clientId: process.env.LINKEDIN_CLIENT_ID || '',
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
    redirectUri: process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:3000/verify/callback',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  };
}

export function generateOAuthState(payload?: Record<string, unknown>): string {
  const data = {
    ...payload,
    nonce: crypto.randomBytes(16).toString('hex'),
  };
  return Buffer.from(JSON.stringify(data)).toString('base64');
}

export async function exchangeCodeForToken(code: string): Promise<{
  access_token: string;
  id_token?: string;
}> {
  const config = getLinkedInConfig();
  const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
    }),
  });

  const data = await response.json();
  if (!response.ok || data.error) {
    throw new Error(data.error_description || 'Failed to exchange code for token');
  }
  return data;
}

export async function getLinkedInProfile(accessToken: string, idToken?: string) {
  // Try id_token decode first
  if (idToken) {
    try {
      const payload = idToken.split('.')[1];
      const decoded = JSON.parse(Buffer.from(payload, 'base64').toString());
      return {
        sub: decoded.sub,
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture,
        email_verified: decoded.email_verified,
        given_name: decoded.given_name,
        family_name: decoded.family_name,
      };
    } catch {
      // Fall through to userinfo endpoint
    }
  }

  // Fallback to userinfo endpoint
  const response = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch LinkedIn profile');
  }
  return response.json();
}
