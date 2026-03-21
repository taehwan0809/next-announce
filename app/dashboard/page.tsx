import Link from 'next/link';
import { redirect } from 'next/navigation';
import BrandLogo from '@/components/BrandLogo';
import DeletePresentationButton from '@/components/DeletePresentationButton';
import LogoutButton from '@/components/LogoutButton';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function DashboardPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect('/login?next=/dashboard');
  }

  const presentations = await prisma.presentation.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      transcript: true,
      feedback: true,
      analysisResult: {
        include: {
          pronunciationAnalysis: true,
        },
      },
      _count: {
        select: {
          questions: true,
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fff9f0_0%,#f4f9ff_24%,#f8fbff_100%)]">
      <header className="border-b border-[#2f74dd]/10 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-4">
            <BrandLogo href="/" size="sm" />
            <div>
              <p className="text-sm font-medium text-[#2f74dd]">{user.email}</p>
              <h1 className="text-2xl font-bold text-slate-950">내 발표 기록</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/practice"
              className="rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-[0_16px_30px_-16px_rgba(47,116,221,0.65)] transition hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(90deg, #ff8a1f, #2f74dd)' }}
            >
              새 발표 녹음
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {presentations.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-[#2f74dd]/20 bg-white/80 p-12 text-center shadow-[0_24px_60px_-40px_rgba(47,116,221,0.4)]">
            <h2 className="text-2xl font-bold text-slate-950">아직 저장된 발표가 없어요</h2>
            <p className="mt-3 text-slate-600">
              첫 발표를 녹음하면 분석 결과와 녹음 파일이 여기 차곡차곡 쌓입니다.
            </p>
            <Link
              href="/practice"
              className="mt-6 inline-flex rounded-full bg-[#2f74dd] px-5 py-3 font-semibold text-white transition hover:bg-[#225fbb]"
            >
              첫 발표 녹음하기
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {presentations.map((presentation) => (
              <div
                key={presentation.id}
                className="flex flex-col gap-4 rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_24px_60px_-40px_rgba(47,116,221,0.4)] transition hover:-translate-y-0.5 hover:shadow-[0_30px_80px_-42px_rgba(47,116,221,0.48)] lg:flex-row lg:items-start lg:justify-between"
              >
                <Link href={`/dashboard/${presentation.id}`} className="block flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-semibold text-slate-950">{presentation.title}</h2>
                    <span className="rounded-full bg-[#edf5ff] px-3 py-1 text-xs font-medium text-[#2f74dd]">
                      {new Intl.DateTimeFormat('ko-KR', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      }).format(presentation.createdAt)}
                    </span>
                    {presentation.analysisResult?.pronunciationAnalysis ? (
                      <span className="rounded-full bg-[#fff2e5] px-3 py-1 text-xs font-medium text-[#ff8a1f]">
                        발음 분석 포함
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                    {presentation.transcript?.text || '전사 결과가 아직 없습니다.'}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
                    <span className="rounded-full bg-slate-100 px-3 py-1">
                      점수 {presentation.feedback?.score ?? '-'}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1">
                      질문 {presentation._count.questions}개
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1">
                      대본 {presentation.script ? '있음' : '없음'}
                    </span>
                  </div>
                </Link>

                <div className="flex shrink-0 items-center justify-end">
                  <DeletePresentationButton presentationId={presentation.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
