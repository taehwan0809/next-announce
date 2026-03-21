import { redirect } from 'next/navigation';
import AuthForm from '@/components/AuthForm';
import BrandLogo from '@/components/BrandLogo';
import { getSessionUser } from '@/lib/auth';

export default async function LoginPage() {
  const user = await getSessionUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#fff1df,transparent_28%),radial-gradient(circle_at_top_right,#dbeafe,transparent_32%),linear-gradient(180deg,#fffaf5_0%,#f5f9ff_48%,#f8fbff_100%)] px-4 py-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 lg:flex-row lg:items-center">
        <div className="max-w-xl pt-8">
          <BrandLogo href="/" size="lg" />
          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.24em] text-[#2f74dd]">
            발표 기록 관리
          </p>
          <h1 className="mt-4 text-5xl font-bold leading-tight text-slate-950">
            로그인하고
            <br />
            내 발표 기록을
            <br />
            한곳에서 관리하세요
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            분석 결과, 녹음 파일, 발표 대본까지 다시 확인하면서 다음 발표를 더 편하게 준비할 수 있어요.
          </p>
        </div>

        <AuthForm mode="login" />
      </div>
    </div>
  );
}
