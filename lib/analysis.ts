// 음성 분석 유틸리티

export function analyzeAudio(transcript: string, duration: number) {
  // 말하기 속도 분석 (WPM - Words Per Minute)
  const words = transcript.trim().split(/\s+/);
  const wordCount = words.length;
  const wpm = Math.round((wordCount / duration) * 60);

  let rating: 'slow' | 'normal' | 'fast';
  if (wpm < 120) rating = 'slow';
  else if (wpm > 160) rating = 'fast';
  else rating = 'normal';

  // 추임새 분석
  const fillerWordsList = ['음', '어', '그', '이제', '아', '뭐', '저', '좀', '막'];
  const fillerWords: { word: string; count: number }[] = [];
  let fillerWordsTotal = 0;

  fillerWordsList.forEach((filler) => {
    const regex = new RegExp(`\\b${filler}\\b`, 'gi');
    const matches = transcript.match(regex);
    const count = matches ? matches.length : 0;

    if (count > 0) {
      fillerWords.push({ word: filler, count });
      fillerWordsTotal += count;
    }
  });

  // 침묵 구간 분석 (추정치 - 실제로는 오디오 파일 분석 필요)
  // 여기서는 간단하게 문장 개수로 추정
  const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const silencesTotal = Math.max(0, sentences.length - 1);
  const silencesAvgDuration = silencesTotal > 0 ? duration / silencesTotal / 10 : 0;
  const silencesLongest = silencesAvgDuration * 1.5;

  return {
    speakingSpeed: {
      wpm,
      rating,
    },
    fillerWords: {
      total: fillerWordsTotal,
      words: fillerWords.sort((a, b) => b.count - a.count),
    },
    silences: {
      total: silencesTotal,
      avgDuration: Number(silencesAvgDuration.toFixed(2)),
      longest: Number(silencesLongest.toFixed(2)),
    },
    duration,
  };
}
