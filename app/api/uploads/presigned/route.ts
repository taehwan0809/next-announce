import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { createPresignedUploadUrl } from '@/lib/s3';

export async function POST(request: NextRequest) {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  const body = (await request.json()) as {
    fileName?: string;
    contentType?: string;
  };

  const fileName = body.fileName?.trim();
  const contentType = body.contentType?.trim();

  if (!fileName || !contentType) {
    return NextResponse.json(
      { error: '파일 이름과 타입이 필요합니다.' },
      { status: 400 }
    );
  }

  const result = await createPresignedUploadUrl(fileName, contentType);

  return NextResponse.json(result);
}
