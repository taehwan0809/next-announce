import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';

export default function HomeFooter() {
  return (
    <footer className="relative z-40 border-t border-white/5 bg-[#0d0d0d] py-14 text-white/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-5">
            <BrandLogo href="/" size="sm" className="brightness-0 invert opacity-80" />
            <div className="text-sm leading-7">
              <p>© 2026 다음 순서는. All rights reserved.</p>
              <p className="mt-1">발표 연습, 분석, 피드백을 돕는 AI 발표 코치 서비스</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-10 gap-y-4 text-sm font-medium">
            <Link href="/dashboard" className="transition hover:text-white">
              대시보드
            </Link>
            <Link href="/practice" className="transition hover:text-white">
              발표 연습
            </Link>
            <Link href="/login" className="transition hover:text-white">
              로그인
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
