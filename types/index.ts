export interface AnalysisResult {
  speakingSpeed: {
    wpm: number; // words per minute
    rating: 'slow' | 'normal' | 'fast';
  };
  fillerWords: {
    total: number;
    words: { word: string; count: number }[];
  };
  silences: {
    total: number;
    avgDuration: number; // seconds
    longest: number; // seconds
  };
  duration: number; // total recording duration in seconds
  pronunciation?: PronunciationAnalysis; // Optional: only if script is provided
}

export interface PronunciationAnalysis {
  accuracy: number; // 0-100
  mistakes: PronunciationMistake[];
  wellPronounced: string[];
}

export interface PronunciationMistake {
  expected: string; // 대본의 단어
  recognized: string; // 인식된 발음
  position: number; // 문장에서의 위치
  severity: 'minor' | 'moderate' | 'major';
}

export interface Feedback {
  overall: string;
  strengths: string[];
  improvements: string[];
  score: number; // 0-100
}

export interface Question {
  id: string;
  question: string;
  category: 'content' | 'clarification' | 'challenge';
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface PresentationData {
  id: string;
  title: string;
  script?: string; // Optional: user's prepared script
  audioUrl: string;
  transcript: string; // AI-recognized speech
  analysis: AnalysisResult;
  feedback: Feedback;
  questions: Question[];
  createdAt: Date;
}

export type RecordingStatus = 'idle' | 'recording' | 'processing' | 'completed' | 'error';
