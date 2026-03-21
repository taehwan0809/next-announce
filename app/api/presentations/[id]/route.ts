import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { deleteFromS3 } from '@/lib/s3';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  const { id } = await params;

  const presentation = await prisma.presentation.findFirst({
    where: {
      id,
      userId: user.id,
    },
    select: {
      id: true,
      audioUrl: true,
    },
  });

  if (!presentation) {
    return NextResponse.json(
      { error: '기록을 찾을 수 없습니다.' },
      { status: 404 }
    );
  }

  try {
    await deleteFromS3(presentation.audioUrl);
  } catch (error) {
    console.error('S3 delete error:', error);
    return NextResponse.json(
      { error: '녹음 파일 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    );
  }

  await prisma.presentation.delete({
    where: { id: presentation.id },
  });

  return NextResponse.json({ success: true });
}
