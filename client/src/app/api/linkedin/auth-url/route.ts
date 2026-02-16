import { NextRequest, NextResponse } from 'next/server';
import { getLinkedInConfig, generateOAuthState } from '@/lib/linkedin';

export async function GET(request: NextRequest) {
  try {
    const config = getLinkedInConfig();

    if (!config.clientId) {
      return NextResponse.json(
        { success: false, error: 'LinkedIn Client ID not configured' },
        { status: 500 }
      );
    }

    const { searchParams } = request.nextUrl;
    const hashId = searchParams.get('hashId');

    const state = generateOAuthState({ hashId });

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      state: state,
      scope: 'openid profile email',
    });

    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;

    return NextResponse.json({ success: true, authUrl });
  } catch (error) {
    console.error('LinkedIn auth URL error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate auth URL' },
      { status: 500 }
    );
  }
}
