import type { AudioTranscript } from '@/lib/openai';

const FILLER_PATTERNS: Array<{ label: string; match: (word: string) => boolean }> = [
  { label: '음', match: (word) => /^음+$/.test(word) },
  { label: '으음', match: (word) => /^으?음+$/.test(word) },
  { label: '어', match: (word) => /^어+$/.test(word) },
  { label: '으어', match: (word) => /^으?어+$/.test(word) },
  { label: '아', match: (word) => /^아+$/.test(word) },
  { label: '그', match: (word) => /^그+$/.test(word) },
  { label: '근데', match: (word) => word === '근데' || word === '근데요' },
  { label: '저', match: (word) => /^저+$/.test(word) },
  { label: '뭐', match: (word) => /^뭐+$/.test(word) },
  { label: '이제', match: (word) => word === '이제' },
  { label: '좀', match: (word) => word === '좀' },
  { label: '막', match: (word) => word === '막' },
];

const RAW_FILLER_PATTERNS: Array<{ label: string; regex: RegExp }> = [
  { label: '음', regex: /(?:^|[\s,])음[음\.\,…~!]*/g },
  { label: '으음', regex: /(?:^|[\s,])으?음+[음\.\,…~!]*/g },
  { label: '어', regex: /(?:^|[\s,])어[어\.\,…~!]*/g },
  { label: '으어', regex: /(?:^|[\s,])으?어+[어\.\,…~!]*/g },
  { label: '아', regex: /(?:^|[\s,])아[아\.\,…~!]*/g },
  { label: '그', regex: /(?:^|[\s,])그[그\.\,…~!]*/g },
  { label: '저', regex: /(?:^|[\s,])저[저\.\,…~!]*/g },
  { label: '뭐', regex: /(?:^|[\s,])뭐[뭐\.\,…~!]*/g },
];

const SPEAKING_SPEED_THRESHOLDS = {
  slow: 80,
  fast: 145,
} as const;

function normalizeToken(word: string) {
  return word
    .trim()
    .replace(/[.。,…~!?,/\\-]+/g, '')
    .replace(/\s+/g, '');
}

function buildTargetDurationFeedback(
  duration: number,
  targetMinDurationSec?: number | null,
  targetMaxDurationSec?: number | null
) {
  const minSeconds = targetMinDurationSec && targetMinDurationSec > 0 ? targetMinDurationSec : undefined;
  const maxSeconds = targetMaxDurationSec && targetMaxDurationSec > 0 ? targetMaxDurationSec : undefined;

  if (!minSeconds && !maxSeconds) {
    return {
      minSeconds,
      maxSeconds,
      status: 'none' as const,
      message: '목표 발표 시간을 입력하지 않아 길이 평가는 생략했습니다.',
    };
  }

  if (minSeconds && duration < minSeconds) {
    return {
      minSeconds,
      maxSeconds,
      status: 'short' as const,
      message: `목표 시간보다 ${Math.ceil(minSeconds - duration)}초 짧습니다. 핵심 설명을 조금 더 보강해보세요.`,
    };
  }

  if (maxSeconds && duration > maxSeconds) {
    return {
      minSeconds,
      maxSeconds,
      status: 'long' as const,
      message: `목표 시간보다 ${Math.ceil(duration - maxSeconds)}초 깁니다. 중복 설명을 줄이면 더 좋아집니다.`,
    };
  }

  return {
    minSeconds,
    maxSeconds,
    status: 'good' as const,
    message: '설정한 목표 발표 시간 범위 안에서 잘 마무리했습니다.',
  };
}

export function analyzeAudio(
  transcript: AudioTranscript,
  fallbackDuration: number,
  targetMinDurationSec?: number | null,
  targetMaxDurationSec?: number | null
) {
  const duration =
    transcript.duration && Number.isFinite(transcript.duration) && transcript.duration > 0
      ? transcript.duration
      : fallbackDuration;

  const transcriptWords = transcript.text.trim().split(/\s+/).filter(Boolean);
  const timestampWords = transcript.words.filter(
    (word) => Number.isFinite(word.start) && Number.isFinite(word.end)
  );
  const compactCharCount = transcript.text.replace(/\s+/g, '').replace(/[^\p{L}\p{N}]/gu, '').length;
  const estimatedWordUnits = Math.max(
    transcriptWords.length,
    timestampWords.length,
    Math.round(compactCharCount / 2.5)
  );
  const measuredSeconds =
    timestampWords.length > 1
      ? Math.max(timestampWords[timestampWords.length - 1]!.end - timestampWords[0]!.start, 1)
      : duration;
  const wpm = Math.max(1, Math.round((estimatedWordUnits / measuredSeconds) * 60));

  let rating: 'slow' | 'normal' | 'fast';
  if (wpm < SPEAKING_SPEED_THRESHOLDS.slow) rating = 'slow';
  else if (wpm >= SPEAKING_SPEED_THRESHOLDS.fast) rating = 'fast';
  else rating = 'normal';

  const fillerCounts = new Map<string, number>();
  const candidateTokens =
    timestampWords.length > 0
      ? timestampWords.map((word) => normalizeToken(word.word))
      : transcriptWords.map(normalizeToken);

  candidateTokens.forEach((token) => {
    if (!token) {
      return;
    }

    const filler = FILLER_PATTERNS.find(({ match }) => match(token));

    if (filler) {
      fillerCounts.set(filler.label, (fillerCounts.get(filler.label) ?? 0) + 1);
    }
  });

  RAW_FILLER_PATTERNS.forEach(({ label, regex }) => {
    const matches = transcript.text.match(regex)?.length ?? 0;

    if (matches > 0) {
      fillerCounts.set(label, Math.max(fillerCounts.get(label) ?? 0, matches));
    }
  });

  const fillerWords = Array.from(fillerCounts.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count);
  const fillerWordsTotal = fillerWords.reduce((sum, item) => sum + item.count, 0);

  const silenceThreshold = 0.6;
  const silenceGaps =
    timestampWords.length > 1
      ? timestampWords
          .slice(1)
          .map((word, index) => Number((word.start - timestampWords[index]!.end).toFixed(2)))
          .filter((gap) => gap >= silenceThreshold)
      : [];

  const silencesTotal = silenceGaps.length;
  const silencesAvgDuration =
    silencesTotal > 0
      ? Number((silenceGaps.reduce((sum, gap) => sum + gap, 0) / silencesTotal).toFixed(2))
      : 0;
  const silencesLongest = silencesTotal > 0 ? Math.max(...silenceGaps) : 0;

  let silenceRating: 'stable' | 'balanced' | 'pause-heavy';
  if (silencesLongest >= 2.4 || silencesAvgDuration >= 1.4) silenceRating = 'pause-heavy';
  else if (silencesTotal >= 3 || silencesAvgDuration >= 0.8) silenceRating = 'balanced';
  else silenceRating = 'stable';

  return {
    speakingSpeed: {
      wpm,
      rating,
      measuredSeconds: Number(measuredSeconds.toFixed(2)),
    },
    fillerWords: {
      total: fillerWordsTotal,
      words: fillerWords,
    },
    silences: {
      total: silencesTotal,
      avgDuration: silencesAvgDuration,
      longest: Number(silencesLongest.toFixed(2)),
      rating: silenceRating,
    },
    duration: Number(duration.toFixed(2)),
    targetDuration: buildTargetDurationFeedback(
      duration,
      targetMinDurationSec,
      targetMaxDurationSec
    ),
  };
}
