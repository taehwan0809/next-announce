import { Prisma } from '@prisma/client';

export const presentationInclude = {
  transcript: true,
  analysisResult: {
    include: {
      pronunciationAnalysis: {
        include: {
          mistakes: true,
        },
      },
    },
  },
  feedback: true,
  questions: true,
} satisfies Prisma.PresentationInclude;

export type PresentationWithRelations = Prisma.PresentationGetPayload<{
  include: typeof presentationInclude;
}>;

export function serializePresentation(presentation: PresentationWithRelations) {
  const analysisResult = presentation.analysisResult;
  const feedback = presentation.feedback;

  if (!analysisResult || !feedback) {
    throw new Error('Presentation is missing analysis data.');
  }

  return {
    id: presentation.id,
    title: presentation.title,
    script: presentation.script,
    audioUrl: presentation.audioUrl,
    transcript: presentation.transcript?.text || '',
    analysis: {
      speakingSpeed: {
        wpm: analysisResult.speakingSpeedWpm,
        rating: analysisResult.speakingSpeedRating as
          | 'slow'
          | 'normal'
          | 'fast',
        measuredSeconds: analysisResult.duration,
      },
      fillerWords: {
        total: analysisResult.fillerWordsTotal,
        words: analysisResult.fillerWords as {
          word: string;
          count: number;
        }[],
      },
      silences: {
        total: analysisResult.silencesTotal,
        avgDuration: analysisResult.silencesAvgDuration,
        longest: analysisResult.silencesLongest,
        rating: (
          analysisResult.silencesLongest >= 2.4 ||
          analysisResult.silencesAvgDuration >= 1.4
            ? 'pause-heavy'
            : analysisResult.silencesTotal >= 3 ||
                analysisResult.silencesAvgDuration >= 0.8
              ? 'balanced'
              : 'stable'
        ) as 'pause-heavy' | 'balanced' | 'stable',
      },
      duration: analysisResult.duration,
      targetDuration: {
        minSeconds: presentation.targetMinDurationSec ?? undefined,
        maxSeconds: presentation.targetMaxDurationSec ?? undefined,
        status: (
          presentation.targetMinDurationSec &&
          analysisResult.duration < presentation.targetMinDurationSec
            ? 'short'
            : presentation.targetMaxDurationSec &&
                analysisResult.duration > presentation.targetMaxDurationSec
              ? 'long'
              : presentation.targetMinDurationSec || presentation.targetMaxDurationSec
                ? 'good'
                : 'none'
        ) as 'short' | 'long' | 'good' | 'none',
        message:
          presentation.targetMinDurationSec &&
          analysisResult.duration < presentation.targetMinDurationSec
            ? `목표 시간보다 ${Math.ceil(presentation.targetMinDurationSec - analysisResult.duration)}초 짧습니다. 핵심 설명을 조금 더 보강해보세요.`
            : presentation.targetMaxDurationSec &&
                analysisResult.duration > presentation.targetMaxDurationSec
              ? `목표 시간보다 ${Math.ceil(analysisResult.duration - presentation.targetMaxDurationSec)}초 깁니다. 중복 설명을 줄이면 더 좋아집니다.`
              : presentation.targetMinDurationSec || presentation.targetMaxDurationSec
                ? '설정한 목표 발표 시간 범위 안에서 잘 마무리했습니다.'
                : '목표 발표 시간을 입력하지 않아 길이 평가는 생략했습니다.',
      },
      pronunciation: analysisResult.pronunciationAnalysis
        ? {
            accuracy: analysisResult.pronunciationAnalysis.accuracy,
            mistakes: analysisResult.pronunciationAnalysis.mistakes.map(
              (mistake) => ({
                expected: mistake.expected,
                recognized: mistake.recognized,
                position: mistake.position,
                severity: mistake.severity as
                  | 'minor'
                  | 'moderate'
                  | 'major',
              })
            ),
            wellPronounced:
              analysisResult.pronunciationAnalysis.wellPronounced as string[],
          }
        : undefined,
    },
    feedback: {
      overall: feedback.overall,
      strengths: feedback.strengths as string[],
      improvements: feedback.improvements as string[],
      score: feedback.score,
    },
    questions: presentation.questions.map((question) => ({
      id: question.id,
      question: question.question,
      category: question.category as 'content' | 'clarification' | 'challenge',
      difficulty: question.difficulty as 'easy' | 'medium' | 'hard',
    })),
    createdAt: presentation.createdAt.toISOString(),
  };
}
