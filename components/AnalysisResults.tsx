'use client';

import { AnalysisResult } from '@/types';

interface AnalysisResultsProps {
  analysis: AnalysisResult;
}

export default function AnalysisResults({ analysis }: AnalysisResultsProps) {
  const fillersPerMinute =
    analysis.duration > 0 ? (analysis.fillerWords.total / analysis.duration) * 60 : 0;

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

  const getDurationStatusColor = (status: 'short' | 'good' | 'long' | 'none') => {
    switch (status) {
      case 'short':
        return 'text-yellow-700 bg-yellow-50';
      case 'long':
        return 'text-red-700 bg-red-50';
      case 'good':
        return 'text-green-700 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getDurationStatusText = (status: 'short' | 'good' | 'long' | 'none') => {
    switch (status) {
      case 'short':
        return '짧음';
      case 'long':
        return '김';
      case 'good':
        return '적정';
      default:
        return '미설정';
    }
  };

  const getFillerStatus = () => {
    if (fillersPerMinute >= 8) {
      return {
        label: '많음',
        color: 'text-red-600 bg-red-50',
      };
    }

    if (fillersPerMinute >= 4 || analysis.fillerWords.total >= 8) {
      return {
        label: '보통',
        color: 'text-yellow-600 bg-yellow-50',
      };
    }

    return {
      label: '적음',
      color: 'text-green-600 bg-green-50',
    };
  };

  const fillerStatus = getFillerStatus();

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
            <p className="text-sm text-gray-600">분당 발화 속도 지표</p>
          </div>
          <p className="mt-3 text-xs text-gray-500">
            기준: 80 미만 느림, 80~144 적정, 145 이상 빠름
          </p>
          <p className="mt-4 text-sm text-gray-700">
            {analysis.speakingSpeed.rating === 'normal'
              ? `지금 속도는 ${analysis.speakingSpeed.wpm}로 비교적 안정적인 구간입니다. 청중이 따라가기 좋은 흐름이에요.`
              : analysis.speakingSpeed.rating === 'fast'
                ? `현재 속도는 ${analysis.speakingSpeed.wpm}로 빠른 편입니다. 청중이 문장을 소화하기 어려울 수 있으니 문장 끝 호흡을 조금 더 길게 가져가 보세요.`
                : `현재 속도는 ${analysis.speakingSpeed.wpm}로 비교적 느린 편입니다. 핵심 문장은 유지하되 연결 구간을 조금 더 리듬감 있게 말해보세요.`}
          </p>
        </div>

        {/* Duration */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">발표 시간</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDurationStatusColor(analysis.targetDuration.status)}`}>
              {getDurationStatusText(analysis.targetDuration.status)}
            </span>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 mb-1">
              {formatDuration(analysis.duration)}
            </div>
            <p className="text-sm text-gray-600">총 발표 시간</p>
          </div>
          <p className="mt-4 text-sm text-gray-700">
            {analysis.targetDuration.message}
          </p>
        </div>

        {/* Filler Words */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">추임새 사용</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${fillerStatus.color}`}>
              {fillerStatus.label}
            </span>
          </div>
          <div className="text-center mb-4">
            <div className="text-4xl font-bold text-orange-600 mb-1">
              {analysis.fillerWords.total}
            </div>
            <p className="text-sm text-gray-600">총 추임새 횟수</p>
            <p className="mt-2 text-xs text-gray-500">
              분당 약 {fillersPerMinute.toFixed(1)}회
            </p>
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
            <p className="text-sm text-gray-700">
              {analysis.silences.rating === 'stable'
                ? '호흡이 비교적 안정적입니다. 침묵이 흐름을 크게 끊지 않습니다.'
                : analysis.silences.rating === 'balanced'
                  ? '잠시 생각을 정리하는 멈춤은 있지만, 전체 흐름은 유지되고 있습니다.'
                  : '침묵이 길거나 잦은 편입니다. 문장 연결을 미리 연습하면 전달력이 더 좋아집니다.'}
            </p>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-gray-700">최장 침묵</span>
              <span className="text-gray-900 font-semibold">{analysis.silences.longest.toFixed(1)}초</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
