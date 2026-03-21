'use client';

import { PronunciationAnalysis } from '@/types';

interface PronunciationFeedbackProps {
  pronunciation: PronunciationAnalysis;
}

export default function PronunciationFeedback({ pronunciation }: PronunciationFeedbackProps) {
  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return 'text-green-600 bg-green-50';
    if (accuracy >= 75) return 'text-blue-600 bg-blue-50';
    if (accuracy >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getAccuracyRing = (accuracy: number) => {
    if (accuracy >= 90) return 'stroke-green-600';
    if (accuracy >= 75) return 'stroke-blue-600';
    if (accuracy >= 60) return 'stroke-yellow-600';
    return 'stroke-red-600';
  };

  const getSeverityColor = (severity: 'minor' | 'moderate' | 'major') => {
    switch (severity) {
      case 'minor': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'moderate': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'major': return 'bg-red-100 text-red-800 border-red-300';
    }
  };

  const getSeverityText = (severity: 'minor' | 'moderate' | 'major') => {
    switch (severity) {
      case 'minor': return '경미';
      case 'moderate': return '보통';
      case 'major': return '심각';
    }
  };

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (pronunciation.accuracy / 100) * circumference;

  return (
    <div className="bg-white rounded-xl shadow-sm p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        발음 분석 결과
      </h2>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* Accuracy Score */}
        <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
          <div className="relative w-32 h-32 mb-4">
            <svg className="transform -rotate-90 w-32 h-32">
              <circle
                cx="64"
                cy="64"
                r="45"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-gray-200"
              />
              <circle
                cx="64"
                cy="64"
                r="45"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className={`${getAccuracyRing(pronunciation.accuracy)} transition-all duration-1000`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{pronunciation.accuracy}</div>
                <div className="text-xs text-gray-500">%</div>
              </div>
            </div>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getAccuracyColor(pronunciation.accuracy)}`}>
            {pronunciation.accuracy >= 90 ? '우수' : pronunciation.accuracy >= 75 ? '양호' : pronunciation.accuracy >= 60 ? '보통' : '개선 필요'}
          </span>
          <p className="text-sm text-gray-600 mt-2">발음 정확도</p>
        </div>

        {/* Statistics */}
        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          <div className="p-6 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl">
            <div className="text-center">
              <div className="text-4xl font-bold text-red-600 mb-2">
                {pronunciation.mistakes.length}
              </div>
              <p className="text-sm text-gray-600">발음 오류</p>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {pronunciation.wellPronounced.length}
              </div>
              <p className="text-sm text-gray-600">정확한 발음</p>
            </div>
          </div>

          {/* Well Pronounced Words Preview */}
          <div className="col-span-2 p-4 bg-white rounded-lg border border-green-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              잘 발음한 단어
            </h4>
            <div className="flex flex-wrap gap-2">
              {pronunciation.wellPronounced.slice(0, 10).map((word, index) => (
                <span key={index} className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full border border-green-200">
                  {word}
                </span>
              ))}
              {pronunciation.wellPronounced.length > 10 && (
                <span className="px-3 py-1 bg-gray-50 text-gray-600 text-sm rounded-full">
                  +{pronunciation.wellPronounced.length - 10}개 더
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pronunciation Mistakes */}
      {pronunciation.mistakes.length > 0 ? (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            발음 오류 상세 ({pronunciation.mistakes.length}개)
          </h3>

          <div className="space-y-3">
            {pronunciation.mistakes.map((mistake, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${getSeverityColor(mistake.severity)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">
                      #{mistake.position}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      mistake.severity === 'major' ? 'bg-red-200 text-red-900' :
                      mistake.severity === 'moderate' ? 'bg-orange-200 text-orange-900' :
                      'bg-yellow-200 text-yellow-900'
                    }`}>
                      {getSeverityText(mistake.severity)}
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-3 bg-white rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">대본 (정답)</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {mistake.expected}
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">인식된 발음</p>
                    <p className="text-lg font-semibold text-red-600">
                      {mistake.recognized}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2 text-sm text-gray-700">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span>
                    &quot;{mistake.expected}&quot;를 정확히 발음하도록 연습하세요
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl text-center">
          <svg className="w-16 h-16 text-green-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            완벽한 발음입니다!
          </h3>
          <p className="text-gray-700">
            모든 단어를 정확하게 발음하셨습니다. 훌륭합니다!
          </p>
        </div>
      )}
    </div>
  );
}
