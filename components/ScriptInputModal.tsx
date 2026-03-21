'use client';

import { useState } from 'react';

interface ScriptInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (script: string | null) => void;
}

export default function ScriptInputModal({ isOpen, onClose, onSubmit }: ScriptInputModalProps) {
  const [script, setScript] = useState('');
  const [useScript, setUseScript] = useState<boolean | null>(null);

  if (!isOpen) return null;

  const handleSubmitWithScript = () => {
    if (script.trim()) {
      onSubmit(script.trim());
      onClose();
    }
  };

  const handleSkipScript = () => {
    onSubmit(null);
    onClose();
  };

  const handleBack = () => {
    setUseScript(null);
    setScript('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-900">발표 대본 입력</h2>
          <p className="text-sm text-gray-600 mt-1">
            대본을 입력하면 발음 정확도를 분석해드립니다
          </p>
        </div>

        <div className="p-6">
          {/* Step 1: Choose whether to use script */}
          {useScript === null && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
                <div className="flex items-start gap-3 mb-4">
                  <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">대본을 입력하시겠습니까?</h3>
                    <p className="text-sm text-gray-700">
                      대본을 입력하면 발표 중 발음한 내용과 대본을 비교하여 발음 정확도를 분석하고 틀린 발음을 지적해드립니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* Options */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Option 1: With Script */}
                <button
                  onClick={() => setUseScript(true)}
                  className="group p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-blue-100 group-hover:bg-blue-500 rounded-full flex items-center justify-center transition-colors">
                      <svg className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">대본 입력하기</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    발표할 내용을 미리 입력하고 발음 정확도를 분석받습니다
                  </p>
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>발음 피드백 제공</span>
                  </div>
                </button>

                {/* Option 2: Without Script */}
                <button
                  onClick={() => setUseScript(false)}
                  className="group p-6 border-2 border-gray-200 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all text-left"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gray-100 group-hover:bg-gray-400 rounded-full flex items-center justify-center transition-colors">
                      <svg className="w-6 h-6 text-gray-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">건너뛰기</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    대본 없이 바로 녹음을 시작합니다
                  </p>
                  <div className="flex items-center gap-2 text-sm text-orange-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>발음 피드백 제공 불가</span>
                  </div>
                </button>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="px-6 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  취소
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Input script (if user chose to use script) */}
          {useScript === true && (
            <div className="space-y-6">
              <div>
                <label htmlFor="script" className="block text-sm font-medium text-gray-700 mb-2">
                  발표 대본을 입력하세요
                </label>
                <textarea
                  id="script"
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  placeholder="예: 안녕하세요, 오늘 제가 발표할 주제는 인공지능의 미래입니다. 인공지능 기술은 우리 삶의 많은 부분을 변화시키고 있으며..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                  rows={12}
                  autoFocus
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-500">
                    {script.length} 글자 {script.trim().split(/\s+/).filter(Boolean).length} 단어
                  </span>
                  {script.length > 0 && (
                    <button
                      onClick={() => setScript('')}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      전체 지우기
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  팁
                </h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• 실제 발표할 내용을 정확하게 입력하세요</li>
                  <li>• 문장 부호와 띄어쓰기를 정확하게 작성하세요</li>
                  <li>• 최소 100자 이상 입력을 권장합니다</li>
                </ul>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={handleBack}
                  className="px-6 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  뒤로
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="px-6 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleSubmitWithScript}
                    disabled={!script.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    대본 입력 완료
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Confirm skip (if user chose not to use script) */}
          {useScript === false && (
            <div className="space-y-6">
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">대본 없이 진행하시겠습니까?</h3>
                    <p className="text-sm text-gray-700 mb-3">
                      대본을 입력하지 않으면 다음 기능을 사용할 수 없습니다:
                    </p>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 mt-0.5">✗</span>
                        <span>발음 정확도 분석</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 mt-0.5">✗</span>
                        <span>잘못 발음한 단어 지적</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 mt-0.5">✗</span>
                        <span>대본 대비 실제 발표 비교</span>
                      </li>
                    </ul>
                    <p className="text-sm text-gray-700 mt-3">
                      단, 말하기 속도, 추임새, 침묵 구간 등의 기본 분석은 정상적으로 제공됩니다.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={handleBack}
                  className="px-6 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  뒤로
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="px-6 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleSkipScript}
                    className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    대본 없이 진행
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
