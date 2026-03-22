import { NextRequest, NextResponse } from 'next/server';
import { buildSessionToken, setSessionCookie } from '@/lib/auth';
import { confirmCognitoSignUp, loginWithCognito, upsertCognitoUser } from '@/lib/cognito';

function parseIdToken(idToken: string) {
  return JSON.parse(
    Buffer.from(idToken.split('.')[1], 'base64').toString()
  );
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, code } = (await request.json()) as {
      email?: string;
      password?: string;
      code?: string;
    };

    const normalizedEmail = email?.trim().toLowerCase() ?? '';
    const trimmedCode = code?.trim() ?? '';

    if (!normalizedEmail || !password || !trimmedCode) {
      return NextResponse.json(
        { error: '이메일, 비밀번호, 인증 코드를 입력해주세요.' },
        { status: 400 }
      );
    }

    await confirmCognitoSignUp({ email: normalizedEmail, code: trimmedCode });

    const authResult = await loginWithCognito({
      email: normalizedEmail,
      password,
    });

    const idToken = authResult.AuthenticationResult?.IdToken;

    if (!idToken) {
      throw new Error('인증 완료 후 로그인에 실패했습니다.');
    }

    const payload = parseIdToken(idToken);

    const user = await upsertCognitoUser({
      sub: payload.sub,
      email: payload.email || normalizedEmail,
      name: payload.name || null,
      emailVerified:
        payload.email_verified === true || payload.email_verified === 'true',
    });

    const response = NextResponse.json({ user });
    setSessionCookie(response, buildSessionToken(user.id));

    return response;
  } catch (error) {
    console.error('Confirm signup error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : '인증 코드 확인에 실패했습니다.',
      },
      { status: 500 }
    );
  }
}