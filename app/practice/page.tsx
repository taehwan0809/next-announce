'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import RecordingControls from '@/components/RecordingControls';
import AnalysisResults from '@/components/AnalysisResults';
import FeedbackSection from '@/components/FeedbackSection';
import QuestionsSection from '@/components/QuestionsSection';
import ScriptInputModal from '@/components/ScriptInputModal';
import PronunciationFeedback from '@/components/PronunciationFeedback';
import { RecordingStatus, PresentationData } from '@/types';

export default function PracticePage() {
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const [presentationData, setPresentationData] = useState<PresentationData | null>(null);
  const [script, setScript] = useState<string | null>(null);
  const [showScriptModal, setShowScriptModal] = useState(false);
  const [scriptDecisionMade, setScriptDecisionMade] = useState(false);
  const [title, setTitle] = useState('');

  // Show script modal on page load
  useEffect(() => {
    setShowScriptModal(true);
  }, []);

  const handleScriptSubmit = (userScript: string | null) => {
    setScript(userScript);
    setScriptDecisionMade(true);
  };

  const handleAnalysisComplete = (data: any) => {
    setPresentationData(data);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Script Input Modal */}
      <ScriptInputModal
        isOpen={showScriptModal}
        onClose={() => setShowScriptModal(false)}
        onSubmit={handleScriptSubmit}
      />

      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>홈으로</span>
            </Link>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              발표 연습
            </h1>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Recording Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title Input */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                발표 제목
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 프로젝트 최종 발표"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* Script Status Card */}
            {scriptDecisionMade && (
              <div className={`rounded-xl shadow-sm p-6 ${script ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200' : 'bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {script ? (
                      <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {script ? '대본 입력 완료' : '대본 없이 진행'}
                      </h3>
                      <p className="text-sm text-gray-700">
                        {script ? (
                          <>발음 피드백이 포함됩니다 ({script.length}자)</>
                        ) : (
                          '발음 피드백은 제공되지 않습니다'
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowScriptModal(true)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap"
                  >
                    {script ? '대본 수정' : '대본 추가'}
                  </button>
                </div>
                {script && (
                  <div className="mt-4 p-3 bg-white rounded-lg">
                    <p className="text-sm text-gray-700 line-clamp-3">
                      {script}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Recording Controls */}
            <RecordingControls
              status={status}
              setStatus={setStatus}
              hasScript={!!script}
              title={title}
              script={script}
              onAnalysisComplete={handleAnalysisComplete}
            />

            {/* Analysis Results - Only show when completed */}
            {status === 'completed' && presentationData && (
              <AnalysisResults analysis={presentationData.analysis} />
            )}
          </div>

          {/* Right Column - Status & Instructions */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                현재 상태
              </h3>
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
                {script && (
                  <StatusIndicator
                    label="발음 분석"
                    active={status === 'processing'}
                    completed={status === 'completed'}
                  />
                )}
                <StatusIndicator
                  label="AI 피드백"
                  active={status === 'processing'}
                  completed={status === 'completed'}
                />
                <StatusIndicator
                  label="질문 생성"
                  active={status === 'processing'}
                  completed={status === 'completed'}
                />
              </div>
            </div>

            {/* Instructions Card */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                사용 방법
              </h3>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                    1
                  </span>
                  <span>발표 제목을 입력하세요</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                    2
                  </span>
                  <span>녹음 버튼을 클릭하고 발표를 시작하세요</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                    3
                  </span>
                  <span>발표가 끝나면 정지 버튼을 누르세요</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                    4
                  </span>
                  <span>AI 분석이 완료될 때까지 기다리세요</span>
                </li>
              </ul>
            </div>

            {/* Tips Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                팁
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>조용한 환경에서 녹음하세요</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>마이크와 적당한 거리를 유지하세요</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>최소 1분 이상 발표하세요</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>자연스럽게 발표하세요</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Feedback & Questions - Full Width */}
        {status === 'completed' && presentationData && (
          <div className="mt-8 space-y-8">
            {/* Pronunciation Feedback - Only if script was provided */}
            {presentationData.analysis.pronunciation && (
              <PronunciationFeedback pronunciation={presentationData.analysis.pronunciation} />
            )}

            <FeedbackSection feedback={presentationData.feedback} />
            <QuestionsSection questions={presentationData.questions} />
          </div>
        )}
      </main>
    </div>
  );
}

function StatusIndicator({ label, active, completed }: { label: string; active: boolean; completed: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
        completed
          ? 'bg-green-500'
          : active
            ? 'bg-blue-500 animate-pulse'
            : 'bg-gray-200'
      }`}>
        {completed ? (
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : active ? (
          <div className="w-2 h-2 bg-white rounded-full"></div>
        ) : null}
      </div>
      <span className={`text-sm font-medium ${
        completed || active ? 'text-gray-900' : 'text-gray-500'
      }`}>
        {label}
      </span>
    </div>
  );
}
