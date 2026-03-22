import { NextRequest, NextResponse } from 'next/server';
import { buildSessionToken, parseOAuthState, setSessionCookie } from '@/lib/auth';
import { exchangeAuthorizationCode, upsertCognitoUser } from '@/lib/cognito';

function parseIdToken(idToken: string) {
  return JSON.parse(Buffer.from(idToken.split('.')[1], 'base64').toString());
}

export async function GET(request: NextRequest) {
  const error = request.nextUrl.searchParams.get('error');
  const errorDescription = request.nextUrl.searchParams.get('error_description');

  if (error) {
    const loginUrl = new URL('/login', request.nextUrl.origin);
    loginUrl.searchParams.set('error', errorDescription || error);
    return NextResponse.redirect(loginUrl);
  }

  const code = request.nextUrl.searchParams.get('code');
  const nextPath = parseOAuthState(request.nextUrl.searchParams.get('state'));

  if (!code) {
    const loginUrl = new URL('/login', request.nextUrl.origin);
    loginUrl.searchParams.set('error', 'OAuth 인증 코드가 없습니다.');
    return NextResponse.redirect(loginUrl);
  }

  try {
    const tokenResult = await exchangeAuthorizationCode(code);
    const profile = parseIdToken(tokenResult.id_token);

    if (!profile.email) {
      throw new Error('OAuth 계정에서 이메일 정보를 가져오지 못했습니다.');
    }

    const user = await upsertCognitoUser({
      sub: profile.sub,
      email: profile.email,
      name: profile.name || null,
      emailVerified: profile.email_verified === true || profile.email_verified === 'true',
    });

    const destination = nextPath.startsWith('/') ? nextPath : '/dashboard';
    const response = NextResponse.redirect(new URL(destination, request.nextUrl.origin));
    setSessionCookie(response, buildSessionToken(user.id));

    return response;
  } catch (callbackError) {
    console.error('OAuth callback error:', callbackError);
    const loginUrl = new URL('/login', request.nextUrl.origin);
    loginUrl.searchParams.set(
      'error',
      callbackError instanceof Error ? callbackError.message : 'OAuth 로그인에 실패했습니다.'
    );
    return NextResponse.redirect(loginUrl);
  }
}
