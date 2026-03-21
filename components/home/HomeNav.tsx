import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';
import LogoutButton from '@/components/LogoutButton';

interface HomeNavProps {
  navDark: boolean;
  isAuthenticated: boolean;
}

export default function HomeNav({ navDark, isAuthenticated }: HomeNavProps) {
  return (
    <header
      className={`nav-bar fixed left-0 right-0 top-0 z-[100] border-b ${
        navDark
          ? 'border-white/[0.08] bg-[rgba(13,13,13,0.88)] shadow-[0_14px_48px_-28px_rgba(0,0,0,0.75)] backdrop-blur-xl'
          : 'border-[#2f74dd]/10 bg-white/70 shadow-[0_12px_36px_-28px_rgba(47,116,221,0.38)] backdrop-blur-xl'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <BrandLogo href="/" size="sm" className={navDark ? 'brightness-0 invert opacity-95' : ''} />
        <nav className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/dashboard"
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              navDark
                ? 'text-white/70 hover:bg-white/10 hover:text-white'
                : 'text-slate-600 hover:bg-[#edf5ff] hover:text-[#2f74dd]'
            }`}
          >
            내 발표 기록
          </Link>
          {isAuthenticated ? (
            <LogoutButton
              className={
                navDark
                  ? 'rounded-full border border-white/15 bg-transparent px-4 py-2 text-sm font-semibold text-white/88 transition hover:bg-white/10 hover:text-white'
                  : 'rounded-full border border-[#2f74dd]/15 bg-transparent px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#2f74dd]/25 hover:bg-[#edf5ff] hover:text-[#2f74dd]'
              }
            />
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-[#2f74dd] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#225fbb]"
            >
              로그인
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
