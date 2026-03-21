'use client';

import { AnalysisResult } from '@/types';

interface AnalysisResultsProps {
  analysis: AnalysisResult;
}

export default function AnalysisResults({ analysis }: AnalysisResultsProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}분 ${secs}초`;
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'slow': return 'text-yellow-600 bg-yellow-50';
      case 'fast': return 'text-orange-600 bg-orange-50';
      default: return 'text-green-600 bg-green-50';
    }
  };

  const getRatingText = (rating: string) => {
    switch (rating) {
      case 'slow': return '느림';
      case 'fast': return '빠름';
      default: return '적정';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        음성 분석 결과
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Speaking Speed */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">말하기 속도</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRatingColor(analysis.speakingSpeed.rating)}`}>
              {getRatingText(analysis.speakingSpeed.rating)}
            </span>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-1">
              {analysis.speakingSpeed.wpm}
            </div>
            <p className="text-sm text-gray-600">분당 단어 수 (WPM)</p>
          </div>
          <p className="mt-4 text-sm text-gray-700">
            {analysis.speakingSpeed.rating === 'normal'
              ? '적절한 속도로 발표하고 있습니다. 청중이 이해하기 좋은 속도입니다.'
              : analysis.speakingSpeed.rating === 'fast'
                ? '조금 빠르게 말하고 있습니다. 속도를 늦춰보세요.'
                : '조금 느리게 말하고 있습니다. 좀 더 활기차게 발표해보세요.'}
          </p>
        </div>

        {/* Duration */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">발표 시간</h3>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 mb-1">
              {formatDuration(analysis.duration)}
            </div>
            <p className="text-sm text-gray-600">총 발표 시간</p>
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-700">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            적절한 발표 길이입니다
          </div>
        </div>

        {/* Filler Words */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">추임새 사용</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              analysis.fillerWords.total > 20 ? 'text-red-600 bg-red-50' :
              analysis.fillerWords.total > 10 ? 'text-yellow-600 bg-yellow-50' :
              'text-green-600 bg-green-50'
            }`}>
              {analysis.fillerWords.total > 20 ? '많음' : analysis.fillerWords.total > 10 ? '보통' : '적음'}
            </span>
          </div>
          <div className="text-center mb-4">
            <div className="text-4xl font-bold text-orange-600 mb-1">
              {analysis.fillerWords.total}
            </div>
            <p className="text-sm text-gray-600">총 추임새 횟수</p>
          </div>
          <div className="space-y-2">
            {analysis.fillerWords.words.slice(0, 3).map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-gray-700 font-medium">&quot;{item.word}&quot;</span>
                <span className="text-gray-600">{item.count}회</span>
              </div>
            ))}
          </div>
        </div>

        {/* Silences */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">침묵 구간</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-green-600 mb-1">
                {analysis.silences.total}
              </div>
              <p className="text-sm text-gray-600">총 침묵 횟수</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-1">
                {analysis.silences.avgDuration.toFixed(1)}s
              </div>
              <p className="text-sm text-gray-600">평균 침묵 길이</p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-white rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700">최장 침묵</span>
              <span className="text-gray-900 font-semibold">{analysis.silences.longest.toFixed(1)}초</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
