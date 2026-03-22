import { NextRequest, NextResponse } from 'next/server';
import { signUpWithCognito } from '@/lib/cognito';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = (await request.json()) as {
      email?: string;
      password?: string;
      name?: string;
    };

    const normalizedEmail = email?.trim().toLowerCase() ?? '';
    const trimmedName = name?.trim() || null;

    if (!normalizedEmail || !password || password.length < 8) {
      return NextResponse.json(
        { error: '이메일과 8자 이상의 비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    const result = await signUpWithCognito({
      email: normalizedEmail,
      password,
      name: trimmedName,
    });

    return NextResponse.json({
      requiresConfirmation: true,
      email: normalizedEmail,
      destination: result.CodeDeliveryDetails?.Destination ?? normalizedEmail,
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '회원가입에 실패했습니다.' },
      { status: 500 }
    );
  }
}
