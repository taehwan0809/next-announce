import { redirect } from 'next/navigation';
import AuthForm from '@/components/AuthForm';
import BrandLogo from '@/components/BrandLogo';
import { getSessionUser } from '@/lib/auth';

export default async function SignupPage() {
  const user = await getSessionUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#fff1df,transparent_28%),radial-gradient(circle_at_top_right,#dbeafe,transparent_32%),linear-gradient(180deg,#fff9f0_0%,#f5f9ff_45%,#f8fbff_100%)] px-4 py-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 lg:flex-row lg:items-center">
        <div className="max-w-xl pt-8">
          <BrandLogo href="/" size="lg" />
          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.24em] text-[#ff8a1f]">
            발표 연습 시작하기
          </p>
          <h1 className="mt-4 text-5xl font-bold leading-tight text-slate-950">
            계정을 만들고
            <br />
            발표 연습 기록을
            <br />
            차곡차곡 쌓아보세요
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            녹음, 분석 결과, 발표 대본, 예상 질문까지 저장해두고 다음 발표 전에 다시 꺼내볼 수 있어요.
          </p>
        </div>

        <AuthForm mode="signup" />
      </div>
    </div>
  );
}
