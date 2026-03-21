import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const ANALYSIS_MODEL = 'gpt-4o-mini';

export interface AudioTranscriptWord {
  word: string;
  start: number;
  end: number;
}

export interface AudioTranscript {
  text: string;
  duration: number;
  words: AudioTranscriptWord[];
}

function parseJsonResponse(content: string | null) {
  if (!content) {
    throw new Error('OpenAI returned an empty response.');
  }

  return JSON.parse(content);
}

function normalizePronunciationToken(value: string) {
  return value
    .normalize('NFC')
    .replace(/\s+/g, '')
    .replace(/[.,!?'"`~:;()\[\]{}<>_-]/g, '')
    .trim()
    .toLowerCase();
}

// 음성 → 텍스트 변환 (Whisper)
export async function transcribeAudio(audioFile: File): Promise<AudioTranscript> {
  const transcription = await openai.audio.transcriptions.create({
    file: audioFile,
    model: 'whisper-1',
    language: 'ko',
    prompt:
      '발표 음성을 최대한 그대로 적어주세요. "음", "어", "아", "그", "저", "이제" 같은 추임새와 망설임 표현도 생략하지 말고 그대로 적어주세요.',
    response_format: 'verbose_json',
    timestamp_granularities: ['word', 'segment'],
  });

  return {
    text: transcription.text,
    duration: transcription.duration,
    words:
      transcription.words?.map((word) => ({
        word: word.word,
        start: word.start,
        end: word.end,
      })) ?? [],
  };
}

// 발표 분석 및 피드백 생성 (GPT-4)
export async function analyzePresentation(
  transcript: string,
  script?: string
): Promise<{
  feedback: {
    overall: string;
    strengths: string[];
    improvements: string[];
    score: number;
  };
  questions: Array<{
    question: string;
    category: 'content' | 'clarification' | 'challenge';
    difficulty: 'easy' | 'medium' | 'hard';
  }>;
}> {
  const prompt = `
다음은 발표 음성을 인식한 텍스트입니다:

"""
${transcript}
"""

${script ? `\n발표자가 준비한 대본:\n"""\n${script}\n"""\n` : ''}

위 발표 내용을 분석하여 다음 형식의 JSON으로 응답해주세요:

{
  "feedback": {
    "overall": "전체적인 발표에 대한 종합 평가 (2-3문장)",
    "strengths": ["강점 1", "강점 2", "강점 3"],
    "improvements": ["개선점 1", "개선점 2", "개선점 3"],
    "score": 85 (0-100 점수)
  },
  "questions": [
    {
      "question": "청중이 물어볼 만한 질문",
      "category": "content" | "clarification" | "challenge",
      "difficulty": "easy" | "medium" | "hard"
    }
  ]
}

다음 사항을 고려하여 분석해주세요:
1. 발표 내용의 명확성과 논리성
2. 핵심 메시지 전달력
3. 청중의 이해도
4. 예상 질문은 5-7개 정도 생성
`;

  const completion = await openai.chat.completions.create({
    model: ANALYSIS_MODEL,
    messages: [{ role: 'user', content: prompt }],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'presentation_analysis',
        strict: true,
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            feedback: {
              type: 'object',
              additionalProperties: false,
              properties: {
                overall: { type: 'string' },
                strengths: {
                  type: 'array',
                  items: { type: 'string' },
                },
                improvements: {
                  type: 'array',
                  items: { type: 'string' },
                },
                score: { type: 'number' },
              },
              required: ['overall', 'strengths', 'improvements', 'score'],
            },
            questions: {
              type: 'array',
              items: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  question: { type: 'string' },
                  category: {
                    type: 'string',
                    enum: ['content', 'clarification', 'challenge'],
                  },
                  difficulty: {
                    type: 'string',
                    enum: ['easy', 'medium', 'hard'],
                  },
                },
                required: ['question', 'category', 'difficulty'],
              },
            },
          },
          required: ['feedback', 'questions'],
        },
      },
    },
  });

  const result = parseJsonResponse(completion.choices[0].message.content);
  return result;
}

// 발음 분석 (대본과 비교)
export async function analyzePronunciation(
  transcript: string,
  script: string
): Promise<{
  accuracy: number;
  mistakes: Array<{
    expected: string;
    recognized: string;
    position: number;
    severity: 'minor' | 'moderate' | 'major';
  }>;
  wellPronounced: string[];
}> {
  const prompt = `
대본과 실제 발표 내용을 비교하여 발음 정확도를 분석해주세요.

대본:
"""
${script}
"""

실제 발표 (음성 인식 결과):
"""
${transcript}
"""

다음 형식의 JSON으로 응답해주세요:

{
  "accuracy": 92 (0-100, 발음 정확도 점수),
  "mistakes": [
    {
      "expected": "대본의 단어",
      "recognized": "인식된 단어",
      "position": 3 (단어 위치),
      "severity": "minor" | "moderate" | "major"
    }
  ],
  "wellPronounced": ["정확하게 발음한 단어들"]
}

분석 기준:
1. 단어 단위로 비교
2. 발음이 완전히 다른 경우: major
3. 발음이 비슷하지만 다른 경우: moderate
4. 미세한 차이: minor
5. 잘 발음한 단어 10-15개 정도 선정
6. 띄어쓰기 차이만 있는 경우는 발음 오류로 간주하지 마세요.
7. 조사나 어미가 붙어서 띄어쓰기만 달라진 경우도 같은 발화로 보고 오류에서 제외하세요.
`;

  const completion = await openai.chat.completions.create({
    model: ANALYSIS_MODEL,
    messages: [{ role: 'user', content: prompt }],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'pronunciation_analysis',
        strict: true,
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            accuracy: { type: 'number' },
            mistakes: {
              type: 'array',
              items: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  expected: { type: 'string' },
                  recognized: { type: 'string' },
                  position: { type: 'number' },
                  severity: {
                    type: 'string',
                    enum: ['minor', 'moderate', 'major'],
                  },
                },
                required: ['expected', 'recognized', 'position', 'severity'],
              },
            },
            wellPronounced: {
              type: 'array',
              items: { type: 'string' },
            },
          },
          required: ['accuracy', 'mistakes', 'wellPronounced'],
        },
      },
    },
  });

  const result = parseJsonResponse(completion.choices[0].message.content) as {
    accuracy: number;
    mistakes: Array<{
      expected: string;
      recognized: string;
      position: number;
      severity: 'minor' | 'moderate' | 'major';
    }>;
    wellPronounced: string[];
  };

  const originalMistakeCount = result.mistakes.length;
  const filteredMistakes = result.mistakes.filter((mistake) => {
    const normalizedExpected = normalizePronunciationToken(mistake.expected);
    const normalizedRecognized = normalizePronunciationToken(mistake.recognized);

    if (!normalizedExpected || !normalizedRecognized) {
      return true;
    }

    return normalizedExpected !== normalizedRecognized;
  });

  const removedCount = originalMistakeCount - filteredMistakes.length;
  const adjustedAccuracy =
    removedCount > 0
      ? Math.min(100, Math.round(result.accuracy + removedCount * 2))
      : result.accuracy;

  return {
    ...result,
    accuracy: adjustedAccuracy,
    mistakes: filteredMistakes,
  };
}
