import type { RefObject } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Jua } from 'next/font/google';

const jua = Jua({ subsets: ['latin'], weight: '400' });

const waveBars = [0, 10, 20, 30, 40, 50, 60];

interface HomeHeroSectionProps {
  heroSectionRef: RefObject<HTMLDivElement | null>;
  heroRef: RefObject<HTMLDivElement | null>;
}

export default function HomeHeroSection({
  heroSectionRef,
  heroRef,
}: HomeHeroSectionProps) {
  return (
    <div ref={heroSectionRef} style={{ height: '150svh' }}>
      <div
        ref={heroRef}
        className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden pt-16"
        style={{
          zIndex: 1,
          transformOrigin: '50% 60%',
          background:
            'linear-gradient(155deg, #fff7ed 0%, #fffaf5 22%, #eff6ff 60%, #eef8ff 100%)',
        }}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="orb-a absolute rounded-full"
            style={{
              width: 500,
              height: 500,
              top: '-12%',
              left: '-12%',
              background: 'radial-gradient(circle, rgba(255,138,31,0.18) 0%, transparent 65%)',
              filter: 'blur(64px)',
            }}
          />
          <div
            className="orb-b absolute rounded-full"
            style={{
              width: 560,
              height: 560,
              top: '-14%',
              right: '-14%',
              background: 'radial-gradient(circle, rgba(47,116,221,0.22) 0%, transparent 65%)',
              filter: 'blur(72px)',
            }}
          />
          <div
            className="orb-c absolute rounded-full"
            style={{
              width: 380,
              height: 380,
              bottom: '4%',
              left: '30%',
              background: 'radial-gradient(circle, rgba(114,214,182,0.15) 0%, transparent 68%)',
              filter: 'blur(52px)',
            }}
          />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center px-4 text-center sm:px-6 lg:px-8">
          <div className="logo-float mb-6">
            <Image
              src="/logo.png"
              alt="다음 순서는"
              width={640}
              height={200}
              className="h-auto w-[min(500px,82vw)] object-contain"
              style={{
                filter:
                  'drop-shadow(0 20px 40px rgba(255,138,31,0.18)) drop-shadow(0 8px 16px rgba(47,116,221,0.12))',
              }}
              priority
            />
          </div>

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#2f74dd]/15 bg-white/70 px-5 py-2 text-sm font-semibold text-[#2f74dd] backdrop-blur-md">
            녹음하고 바로 분석하는 AI 발표 코치
          </div>

          <h1 className={`${jua.className} text-5xl leading-[1.08] text-slate-950 sm:text-6xl lg:text-7xl`}>
            발표 준비를
            <br />
            더 가볍고, 더 선명하게
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
            말하기 속도, 추임새, 침묵 구간, AI 피드백, 예상 질문까지 한 번에 확인하고
            다음 발표에서 바로 고칠 포인트를 잡아보세요.
          </p>

          <div className="my-6 flex items-end gap-[3px]">
            {waveBars.map((x) => (
              <div
                key={x}
                className="wave-bar rounded-full"
                style={{
                  width: 5,
                  height: 22,
                  background: 'linear-gradient(to top, #ff8a1f, #2f74dd)',
                }}
              />
            ))}
          </div>

          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <Link
              href="/practice"
              className="inline-flex items-center justify-center rounded-full px-12 py-5 text-lg font-bold text-white transition hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(90deg, #ff8a1f, #2f74dd)',
                boxShadow: '0 20px 45px -20px rgba(47,116,221,0.55)',
              }}
            >
              발표 연습 시작하기
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-full border border-[#2f74dd]/15 bg-white/75 px-8 py-5 text-base font-semibold text-slate-700 transition hover:border-[#2f74dd]/30 hover:text-[#2f74dd]"
            >
              내 기록 보기
            </Link>
          </div>

          <p className="nudge mt-6 text-sm text-slate-400">아래로 스크롤</p>
        </div>
      </div>
    </div>
  );
}
