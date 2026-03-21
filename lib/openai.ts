import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// 음성 → 텍스트 변환 (Whisper)
export async function transcribeAudio(audioFile: File): Promise<string> {
  const transcription = await openai.audio.transcriptions.create({
    file: audioFile,
    model: 'whisper-1',
    language: 'ko',
  });

  return transcription.text;
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
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  });

  const result = JSON.parse(completion.choices[0].message.content || '{}');
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
`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  });

  const result = JSON.parse(completion.choices[0].message.content || '{}');
  return result;
}
