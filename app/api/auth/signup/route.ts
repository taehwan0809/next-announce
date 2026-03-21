import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { buildSessionToken, setSessionCookie } from '@/lib/auth';
import { hashPassword } from '@/lib/password';
import { prisma } from '@/lib/prisma';

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

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: trimmedName,
        passwordHash: hashPassword(password),
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    const response = NextResponse.json({ user });
    setSessionCookie(response, buildSessionToken(user.id));

    return response;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return NextResponse.json(
        { error: '이미 가입된 이메일입니다.' },
        { status: 409 }
      );
    }

    console.error('Signup error:', error);
    return NextResponse.json(
      { error: '회원가입에 실패했습니다.' },
      { status: 500 }
    );
  }
}
