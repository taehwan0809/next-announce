'use client';

import { Question } from '@/types';

interface QuestionsSectionProps {
  questions: Question[];
}

export default function QuestionsSection({ questions }: QuestionsSectionProps) {
  const getCategoryIcon = (category: Question['category']) => {
    switch (category) {
      case 'content':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'clarification':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'challenge':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
    }
  };

  const getCategoryColor = (category: Question['category']) => {
    switch (category) {
      case 'content': return 'text-blue-600 bg-blue-50';
      case 'clarification': return 'text-purple-600 bg-purple-50';
      case 'challenge': return 'text-orange-600 bg-orange-50';
    }
  };

  const getCategoryText = (category: Question['category']) => {
    switch (category) {
      case 'content': return '내용 질문';
      case 'clarification': return '명확화 질문';
      case 'challenge': return '도전 질문';
    }
  };

  const getDifficultyColor = (difficulty: Question['difficulty']) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'hard': return 'text-red-600 bg-red-50';
    }
  };

  const getDifficultyText = (difficulty: Question['difficulty']) => {
    switch (difficulty) {
      case 'easy': return '쉬움';
      case 'medium': return '보통';
      case 'hard': return '어려움';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          예상 질문
        </h2>
        <span className="text-sm text-gray-500">
          총 {questions.length}개의 질문
        </span>
      </div>

      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
        <p className="text-sm text-gray-700">
          <strong className="text-gray-900">💡 활용 팁:</strong> 실제 질의응답에서 이런 질문이 나올 수 있다는 점을 먼저 떠올려 보고, 발표 내용 중 어떤 부분이 꼬리 질문으로 이어질지 생각해보세요.
        </p>
      </div>

      <div className="space-y-4">
        {questions.map((question) => (
          <div
            key={question.id}
            className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(question.category)}`}>
                    {getCategoryIcon(question.category)}
                    {getCategoryText(question.category)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                    {getDifficultyText(question.difficulty)}
                  </span>
                </div>
                <p className="text-lg font-medium text-gray-900">
                  {question.question}
                </p>
                <p className="mt-3 text-sm text-gray-600">
                  {question.category === 'content' && '발표 핵심 내용을 더 구체적으로 물어볼 수 있는 질문입니다.'}
                  {question.category === 'clarification' && '청중이 이해가 덜 된 부분을 다시 짚을 때 나올 수 있는 질문입니다.'}
                  {question.category === 'challenge' && '근거, 한계, 반대 관점을 묻는 상황에서 나올 수 있는 질문입니다.'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">
            {questions.filter(q => q.category === 'content').length}
          </div>
          <div className="text-sm text-gray-600 mt-1">내용 질문</div>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600">
            {questions.filter(q => q.category === 'clarification').length}
          </div>
          <div className="text-sm text-gray-600 mt-1">명확화 질문</div>
        </div>
        <div className="p-4 bg-orange-50 rounded-lg text-center">
          <div className="text-2xl font-bold text-orange-600">
            {questions.filter(q => q.category === 'challenge').length}
          </div>
          <div className="text-sm text-gray-600 mt-1">도전 질문</div>
        </div>
      </div>
    </div>
  );
}
