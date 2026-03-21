import type { RefObject } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Jua } from 'next/font/google';

const jua = Jua({ subsets: ['latin'], weight: '400' });

const flowPoints = [
  {
    label: '즉시 분석',
    title: '녹음 후 바로 말하기 패턴 확인',
    description: '말하기 속도, 추임새, 침묵 구간을 먼저 보여줘서 어디서 흔들렸는지 바로 알 수 있어요.',
    color: 'text-[#8fb9ff]',
  },
  {
    label: 'AI 피드백',
    title: '막연한 불안 대신 구체적인 조언',
    description: '강점과 보완점을 분리해서 정리해 주기 때문에 다음 연습에서 고칠 포인트가 분명해집니다.',
    color: 'text-[#ffb056]',
  },
  {
    label: '예상 질문',
    title: '발표 직전까지 질문 감각 유지',
    description: '발표 내용을 바탕으로 나올 법한 질문을 미리 보고 생각해볼 수 있습니다.',
    color: 'text-[#72d6b6]',
  },
];

interface HomeFlowSectionProps {
  flowSectionRef: RefObject<HTMLDivElement | null>;
  flowRef: RefObject<HTMLDivElement | null>;
}

export default function HomeFlowSection({
  flowSectionRef,
  flowRef,
}: HomeFlowSectionProps) {
  return (
    <div ref={flowSectionRef} style={{ height: '126svh' }}>
      <div
        ref={flowRef}
        className="panel-lip sticky top-0 flex h-screen items-center overflow-hidden text-white"
        style={{
          zIndex: 3,
          background: '#151820',
          borderRadius: '3rem 3rem 0 0',
          willChange: 'transform',
        }}
      >
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#8fb9ff]">
                Presentation Flow
              </p>
              <h2 className={`${jua.className} mt-4 text-4xl leading-tight sm:text-5xl`}>
                복잡한 설명보다
                <br />
                바로 보이는 결과가 먼저
              </h2>
            </div>
            <Link
              href="/practice"
              className="inline-flex items-center text-base font-medium text-white/70 transition hover:text-[#8fb9ff]"
            >
              발표 연습하러 가기
            </Link>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
            <div className="space-y-5">
              <p className="max-w-2xl text-base leading-8 text-white/70">
                제목과 목표 시간을 정하고 녹음을 마치면 결과가 바로 이어집니다. 사용자는
                긴 설명을 읽기보다, 지금 점검해야 할 신호를 먼저 보게 됩니다.
              </p>
              <div className="overflow-hidden rounded-[2.25rem] border border-white/10 bg-[#20242e]">
                <Image
                  src="/insight-dashboard.svg"
                  alt="발표 분석 결과 대시보드 프리뷰"
                  width={860}
                  height={620}
                  className="h-[280px] w-full object-cover"
                />
              </div>
            </div>

            <div className="space-y-5 border-t border-white/10 pt-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              {flowPoints.map((item, index) => (
                <div key={item.title} className="border-b border-white/10 pb-5 last:border-b-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-white/30">0{index + 1}</span>
                    <p className={`text-sm font-semibold uppercase tracking-[0.18em] ${item.color}`}>
                      {item.label}
                    </p>
                  </div>
                  <h3 className="mt-3 text-2xl font-bold text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/60">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
