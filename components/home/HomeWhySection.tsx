import type { RefObject } from 'react';
import Link from 'next/link';
import { Jua } from 'next/font/google';

const jua = Jua({ subsets: ['latin'], weight: '400' });

const strengths = [
  '발표 속도, 추임새, 침묵 구간을 한눈에 정리',
  'AI 피드백과 예상 질문으로 다음 연습 방향까지 연결',
  '녹음과 결과를 대시보드에 저장하고 다시 확인',
];

interface HomeWhySectionProps {
  whyRef: RefObject<HTMLDivElement | null>;
}

export default function HomeWhySection({ whyRef }: HomeWhySectionProps) {
  return (
    <div style={{ height: '118svh' }}>
      <div
        ref={whyRef}
        className="panel-lip sticky top-0 flex h-screen items-center overflow-hidden text-white"
        style={{
          zIndex: 4,
          background: '#101317',
          borderRadius: '3rem 3rem 0 0',
          willChange: 'transform',
        }}
      >
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_1.08fr] lg:px-8">
          <div
            className="rounded-[2.5rem] p-8 lg:p-12"
            style={{ border: '1px solid rgba(255,255,255,0.08)', background: '#171c22' }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#ffb056]">
              Why Next Order
            </p>
            <h2 className={`${jua.className} mt-5 text-4xl leading-tight sm:text-5xl`}>
              발표는 한 번 말하고 끝나는 일이 아니라
              <br />
              다시 보는 과정까지 포함됩니다
            </h2>
            <p className="mt-7 text-lg leading-8 text-white/60">
              어디서 말이 빨라졌는지, 어느 구간에서 머뭇거렸는지, 어떤 질문이 나올 수
              있는지까지 정리해 두면 다음 발표 준비가 훨씬 가벼워집니다.
            </p>
          </div>

          <div className="flex flex-col justify-center gap-4">
            {strengths.map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-[1.75rem] border border-white/10 bg-[#171c22] px-6 py-5 text-lg font-medium text-white/90 transition hover:border-[#2f74dd]/40 hover:bg-[#1d2430]"
              >
                <div
                  className="mt-2 shrink-0 rounded-full"
                  style={{ width: 8, height: 8, minWidth: 8, background: '#ff8a1f' }}
                />
                {item}
              </div>
            ))}

            <Link
              href="/practice"
              className="inline-flex items-center justify-center rounded-full px-12 py-5 text-lg font-bold text-white transition hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(90deg, #ff8a1f, #2f74dd)',
                boxShadow: '0 20px 45px -20px rgba(47,116,221,0.55)',
              }}
            >
              지금 바로 연습 시작하기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
