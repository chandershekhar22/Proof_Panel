import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getLinkedInConfig } from '@/lib/linkedin';

export async function GET() {
  try {
    const config = getLinkedInConfig();
    const state = crypto.randomBytes(16).toString('hex');
    const scope = 'openid profile email';

    const authUrl =
      `https://www.linkedin.com/oauth/v2/authorization?` +
      `response_type=code&` +
      `client_id=${config.clientId}&` +
      `redirect_uri=${encodeURIComponent(config.redirectUri)}&` +
      `state=${state}&` +
      `scope=${encodeURIComponent(scope)}`;

    return NextResponse.json({ success: true, authUrl, state });
  } catch (error) {
    console.error('LinkedIn auth URL error:', error);
    return NextResponse.json({ success: false, error: 'Failed to generate auth URL' }, { status: 500 });
  }
}
