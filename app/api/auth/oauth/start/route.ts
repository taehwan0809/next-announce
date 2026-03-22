import { NextRequest, NextResponse } from 'next/server';
import { buildOAuthState } from '@/lib/auth';
import { getOAuthAuthorizeUrl } from '@/lib/cognito';

export async function GET(request: NextRequest) {
  const provider = request.nextUrl.searchParams.get('provider');
  const nextPath = request.nextUrl.searchParams.get('next') || '/dashboard';

  if (provider !== 'Google' && provider !== 'SignInWithApple') {
    return NextResponse.json({ error: '지원하지 않는 OAuth 제공자입니다.' }, { status: 400 });
  }

  const state = buildOAuthState(nextPath);
  const authorizeUrl = getOAuthAuthorizeUrl(provider, state);

  return NextResponse.redirect(authorizeUrl);
}
