import { NextRequest } from 'next/server';
import { errorResponse } from '@/lib/response';
import { exchangeCodeForToken } from '@/lib/linkedin';
import { NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return errorResponse('Authorization code is required', 400);
    }

    const tokenData = await exchangeCodeForToken(code);
    const accessToken = tokenData.access_token;

    // Fetch user profile
    const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const profileData = await profileResponse.json();

    if (profileData.error) {
      console.error('LinkedIn profile error:', profileData);
      return errorResponse('Failed to fetch profile', 400);
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: profileData.sub,
        name: profileData.name,
        email: profileData.email,
        picture: profileData.picture,
        emailVerified: profileData.email_verified,
      },
    });
  } catch (error) {
    console.error('LinkedIn OAuth error:', error);
    return errorResponse('OAuth process failed');
  }
}
