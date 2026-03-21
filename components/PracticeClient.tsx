'use client';

import Link from 'next/link';
import { useState } from 'react';
import AnalysisResults from '@/components/AnalysisResults';
import BrandLogo from '@/components/BrandLogo';
import FeedbackSection from '@/components/FeedbackSection';
import PronunciationFeedback from '@/components/PronunciationFeedback';
import QuestionsSection from '@/components/QuestionsSection';
import RecordingControls from '@/components/RecordingControls';
import ScriptInputModal from '@/components/ScriptInputModal';
import { PresentationData, RecordingStatus } from '@/types';

export default function PracticeClient() {
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const [presentationData, setPresentationData] = useState<PresentationData | null>(null);
  const [activePresentationId, setActivePresentationId] = useState<string | null>(null);
  const [script, setScript] = useState<string | null>(null);
  const [showScriptModal, setShowScriptModal] = useState(true);
  const [scriptDecisionMade, setScriptDecisionMade] = useState(false);
  const [title, setTitle] = useState('');
  const [targetMinMinutes, setTargetMinMinutes] = useState('');
  const [targetMaxMinutes, setTargetMaxMinutes] = useState('');

  const targetMinDurationSec = targetMinMinutes ? Math.round(Number(targetMinMinutes) * 60) : null;
  const targetMaxDurationSec = targetMaxMinutes ? Math.round(Number(targetMaxMinutes) * 60) : null;

  const handleScriptSubmit = (userScript: string | null) => {
    setScript(userScript);
    setScriptDecisionMade(true);
  };

  const handleAnalysisComplete = (data: PresentationData) => {
    setPresentationData(data);
    setActivePresentationId(data.id);
  };

  const handleRecordingReset = () => {
    setPresentationData(null);
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fff8f0_0%,#f4f9ff_20%,#f8fbff_100%)]">
      <ScriptInputModal
        isOpen={showScriptModal}
        onClose={() => setShowScriptModal(false)}
        onSubmit={handleScriptSubmit}
      />

      <header className="sticky top-0 z-10 border-b border-[#2f74dd]/10 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="flex items-center gap-3 text-slate-600 transition hover:text-[#2f74dd]">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-sm font-semibold">대시보드로</span>
          </Link>
          <BrandLogo href="/" size="sm" />
          <div className="w-24" />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-[2rem] border border-white/70 bg-white/88 p-6 shadow-[0_24px_60px_-40px_rgba(47,116,221,0.4)]">
              <label htmlFor="title" className="mb-2 block text-sm font-medium text-slate-700">
                발표 제목
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 프로젝트 최종 발표"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#2f74dd] focus:ring-4 focus:ring-[#2f74dd]/10"
              />

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="targetMinMinutes" className="mb-2 block text-sm font-medium text-slate-700">
                    최소 발표 시간
                  </label>
                  <input
                    id="targetMinMinutes"
                    type="number"
                    min="0"
                    step="0.5"
                    value={targetMinMinutes}
                    onChange={(event) => setTargetMinMinutes(event.target.value)}
                    placeholder="예: 2"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#2f74dd] focus:ring-4 focus:ring-[#2f74dd]/10"
                  />
                </div>
                <div>
                  <label htmlFor="targetMaxMinutes" className="mb-2 block text-sm font-medium text-slate-700">
                    최대 발표 시간
                  </label>
                  <input
                    id="targetMaxMinutes"
                    type="number"
                    min="0"
                    step="0.5"
                    value={targetMaxMinutes}
                    onChange={(event) => setTargetMaxMinutes(event.target.value)}
                    placeholder="예: 3"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#ff8a1f] focus:ring-4 focus:ring-[#ff8a1f]/10"
                  />
                </div>
              </div>

              <p className="mt-3 text-sm text-slate-500">
                목표 시간을 입력하면 발표 길이에 대한 피드백도 함께 받을 수 있어요.
              </p>
            </div>

            {scriptDecisionMade ? (
              <div
                className={`rounded-[2rem] p-6 shadow-[0_24px_60px_-40px_rgba(47,116,221,0.35)] ${
                  script
                    ? 'border border-emerald-200 bg-gradient-to-r from-emerald-50 to-white'
                    : 'border border-[#ffcf9e] bg-gradient-to-r from-[#fff3e6] to-white'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    {script ? (
                      <svg className="mt-0.5 h-6 w-6 flex-shrink-0 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="mt-0.5 h-6 w-6 flex-shrink-0 text-[#ff8a1f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    )}
                    <div>
                      <h3 className="mb-1 font-semibold text-slate-950">
                        {script ? '대본 입력 완료' : '대본 없이 진행'}
                      </h3>
                      <p className="text-sm text-slate-700">
                        {script
                          ? `발음 피드백이 포함됩니다. (${script.length}자)`
                          : '발음 피드백 없이 발표 흐름 중심으로 분석합니다.'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowScriptModal(true)}
                    className="whitespace-nowrap text-sm font-semibold text-[#2f74dd] hover:text-[#225fbb]"
                  >
                    {script ? '대본 수정' : '대본 추가'}
                  </button>
                </div>
                {script ? (
                  <div className="mt-4 rounded-2xl bg-white/85 p-4">
                    <p className="line-clamp-3 text-sm leading-6 text-slate-700">{script}</p>
                  </div>
                ) : null}
              </div>
            ) : null}

            <RecordingControls
              status={status}
              setStatus={setStatus}
              presentationId={activePresentationId}
              title={title}
              script={script}
              targetMinDurationSec={targetMinDurationSec}
              targetMaxDurationSec={targetMaxDurationSec}
              onAnalysisComplete={handleAnalysisComplete}
              onReset={handleRecordingReset}
            />

            {status === 'completed' && presentationData ? (
              <AnalysisResults analysis={presentationData.analysis} />
            ) : null}
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-white/70 bg-white/88 p-6 shadow-[0_24px_60px_-40px_rgba(47,116,221,0.4)]">
              <h3 className="mb-4 text-lg font-semibold text-slate-950">현재 상태</h3>
              <div className="space-y-3">
                <StatusIndicator
                  label="녹음"
                  active={status === 'recording'}
                  completed={status === 'processing' || status === 'completed'}
                />
                <StatusIndicator
                  label="음성 분석"
                  active={status === 'processing'}
                  completed={status === 'completed'}
                />
                {script ? (
                  <StatusIndicator
                    label="발음 분석"
                    active={status === 'processing'}
                    completed={status === 'completed'}
                  />
                ) : null}
                <StatusIndicator
                  label="AI 피드백"
                  active={status === 'processing'}
                  completed={status === 'completed'}
                />
                <StatusIndicator
                  label="예상 질문"
                  active={status === 'processing'}
                  completed={status === 'completed'}
                />
              </div>
            </div>

            <div className="rounded-[2rem] border border-[#2f74dd]/10 bg-[linear-gradient(145deg,#fff6ec_0%,#edf5ff_100%)] p-6 shadow-[0_24px_60px_-40px_rgba(47,116,221,0.35)]">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-950">
                <svg className="h-5 w-5 text-[#2f74dd]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                사용 방법
              </h3>
              <ul className="space-y-3 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#2f74dd] text-xs font-bold text-white">1</span>
                  <span>발표 제목과 목표 시간을 입력하세요.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#2f74dd] text-xs font-bold text-white">2</span>
                  <span>필요하면 대본을 추가하고 녹음을 시작하세요.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#2f74dd] text-xs font-bold text-white">3</span>
                  <span>발표가 끝나면 정지 버튼을 눌러 분석을 요청하세요.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#2f74dd] text-xs font-bold text-white">4</span>
                  <span>결과를 보고 바로 다시 녹음해 변화를 비교해보세요.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {status === 'completed' && presentationData ? (
          <div className="mt-8 space-y-8">
            {presentationData.analysis.pronunciation ? (
              <PronunciationFeedback pronunciation={presentationData.analysis.pronunciation} />
            ) : null}
            <FeedbackSection feedback={presentationData.feedback} />
            <QuestionsSection questions={presentationData.questions} />
          </div>
        ) : null}
      </main>
    </div>
  );
}

function StatusIndicator({
  label,
  active,
  completed,
}: {
  label: string;
  active: boolean;
  completed: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full transition-all ${
          completed ? 'bg-emerald-500' : active ? 'animate-pulse bg-[#2f74dd]' : 'bg-slate-200'
        }`}
      >
        {completed ? (
          <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : active ? (
          <div className="h-2 w-2 rounded-full bg-white" />
        ) : null}
      </div>
      <span className={`text-sm font-medium ${completed || active ? 'text-slate-900' : 'text-slate-500'}`}>
        {label}
      </span>
    </div>
  );
}
