import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import AnalysisResults from '@/components/AnalysisResults';
import BrandLogo from '@/components/BrandLogo';
import DeletePresentationButton from '@/components/DeletePresentationButton';
import FeedbackSection from '@/components/FeedbackSection';
import PronunciationFeedback from '@/components/PronunciationFeedback';
import QuestionsSection from '@/components/QuestionsSection';
import { getSessionUser } from '@/lib/auth';
import { presentationInclude, serializePresentation } from '@/lib/presentations';
import { prisma } from '@/lib/prisma';

export default async function DashboardDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSessionUser();

  if (!user) {
    redirect('/login?next=/dashboard');
  }

  const { id } = await params;

  const presentation = await prisma.presentation.findFirst({
    where: {
      id,
      userId: user.id,
    },
    include: presentationInclude,
  });

  if (!presentation) {
    notFound();
  }

  const data = serializePresentation(presentation);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fff9f0_0%,#f4f9ff_24%,#f8fbff_100%)]">
      <header className="border-b border-[#2f74dd]/10 bg-white/82 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <div className="mb-4 flex items-center gap-4">
              <BrandLogo href="/" size="sm" />
              <Link href="/dashboard" className="text-sm font-semibold text-[#2f74dd] hover:text-[#225fbb]">
                대시보드로 돌아가기
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-slate-950">{data.title}</h1>
            <p className="mt-2 text-sm text-slate-500">
              {new Intl.DateTimeFormat('ko-KR', {
                dateStyle: 'full',
                timeStyle: 'short',
              }).format(new Date(data.createdAt))}
            </p>
          </div>
          <DeletePresentationButton presentationId={data.id} redirectTo="/dashboard" />
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_24px_60px_-40px_rgba(47,116,221,0.42)]">
            <h2 className="mb-4 text-xl font-semibold text-slate-950">녹음 파일</h2>
            <audio controls src={data.audioUrl} className="w-full" />
            <p className="mt-3 text-sm leading-6 text-slate-500">
              저장된 녹음 파일을 다시 들으면서 발표의 흐름과 전달감을 함께 점검할 수 있어요.
            </p>
          </div>

          <div className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_24px_60px_-40px_rgba(47,116,221,0.42)]">
            <h2 className="mb-4 text-xl font-semibold text-slate-950">발표 대본</h2>
            {data.script ? (
              <p className="whitespace-pre-wrap leading-7 text-slate-700">{data.script}</p>
            ) : (
              <p className="text-slate-500">이 발표는 대본 없이 진행되었습니다.</p>
            )}
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_24px_60px_-40px_rgba(47,116,221,0.42)]">
          <h2 className="mb-4 text-xl font-semibold text-slate-950">전사 결과</h2>
          <p className="whitespace-pre-wrap leading-7 text-slate-700">{data.transcript}</p>
        </section>

        <AnalysisResults analysis={data.analysis} />
        {data.analysis.pronunciation ? (
          <PronunciationFeedback pronunciation={data.analysis.pronunciation} />
        ) : null}
        <FeedbackSection feedback={data.feedback} />
        <QuestionsSection questions={data.questions} />
      </main>
    </div>
  );
}
