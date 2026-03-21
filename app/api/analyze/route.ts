import { NextRequest, NextResponse } from 'next/server';
import { uploadToS3 } from '@/lib/s3';
import { transcribeAudio, analyzePresentation, analyzePronunciation } from '@/lib/openai';
import { analyzeAudio } from '@/lib/analysis';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const title = formData.get('title') as string;
    const script = formData.get('script') as string | null;
    const duration = parseFloat(formData.get('duration') as string);
    const userId = formData.get('userId') as string; // 임시로 받음 (나중에 인증 추가)

    if (!audioFile || !title || !duration) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 1. S3에 음성 파일 업로드
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const audioUrl = await uploadToS3(buffer, audioFile.name, audioFile.type);

    // 2. Whisper로 음성 → 텍스트 변환
    const transcript = await transcribeAudio(audioFile);

    // 3. 음성 분석 (속도, 추임새, 침묵)
    const audioAnalysis = analyzeAudio(transcript, duration);

    // 4. GPT로 피드백 및 질문 생성
    const { feedback, questions } = await analyzePresentation(transcript, script || undefined);

    // 5. 발음 분석 (대본이 있는 경우만)
    let pronunciationData = null;
    if (script) {
      pronunciationData = await analyzePronunciation(transcript, script);
    }

    // 6. 데이터베이스에 저장
    const presentation = await prisma.presentation.create({
      data: {
        title,
        script,
        audioUrl,
        userId,
        transcript: {
          create: {
            text: transcript,
          },
        },
        analysisResult: {
          create: {
            duration: Math.floor(duration),
            speakingSpeedWpm: audioAnalysis.speakingSpeed.wpm,
            speakingSpeedRating: audioAnalysis.speakingSpeed.rating,
            fillerWordsTotal: audioAnalysis.fillerWords.total,
            fillerWords: audioAnalysis.fillerWords.words,
            silencesTotal: audioAnalysis.silences.total,
            silencesAvgDuration: audioAnalysis.silences.avgDuration,
            silencesLongest: audioAnalysis.silences.longest,
            pronunciationAnalysis: pronunciationData
              ? {
                  create: {
                    accuracy: pronunciationData.accuracy,
                    wellPronounced: pronunciationData.wellPronounced,
                    mistakes: {
                      create: pronunciationData.mistakes.map((mistake) => ({
                        expected: mistake.expected,
                        recognized: mistake.recognized,
                        position: mistake.position,
                        severity: mistake.severity,
                      })),
                    },
                  },
                }
              : undefined,
          },
        },
        feedback: {
          create: {
            overall: feedback.overall,
            score: feedback.score,
            strengths: feedback.strengths,
            improvements: feedback.improvements,
          },
        },
        questions: {
          create: questions.map((q) => ({
            question: q.question,
            category: q.category,
            difficulty: q.difficulty,
          })),
        },
      },
      include: {
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
      },
    });

    // 7. 응답 데이터 형식 변환
    const response = {
      id: presentation.id,
      title: presentation.title,
      script: presentation.script,
      audioUrl: presentation.audioUrl,
      transcript: presentation.transcript?.text || '',
      analysis: {
        speakingSpeed: {
          wpm: presentation.analysisResult!.speakingSpeedWpm,
          rating: presentation.analysisResult!.speakingSpeedRating as 'slow' | 'normal' | 'fast',
        },
        fillerWords: {
          total: presentation.analysisResult!.fillerWordsTotal,
          words: presentation.analysisResult!.fillerWords as { word: string; count: number }[],
        },
        silences: {
          total: presentation.analysisResult!.silencesTotal,
          avgDuration: presentation.analysisResult!.silencesAvgDuration,
          longest: presentation.analysisResult!.silencesLongest,
        },
        duration: presentation.analysisResult!.duration,
        pronunciation: presentation.analysisResult!.pronunciationAnalysis
          ? {
              accuracy: presentation.analysisResult!.pronunciationAnalysis.accuracy,
              mistakes: presentation.analysisResult!.pronunciationAnalysis.mistakes.map((m) => ({
                expected: m.expected,
                recognized: m.recognized,
                position: m.position,
                severity: m.severity as 'minor' | 'moderate' | 'major',
              })),
              wellPronounced: presentation.analysisResult!.pronunciationAnalysis.wellPronounced as string[],
            }
          : undefined,
      },
      feedback: {
        overall: presentation.feedback!.overall,
        strengths: presentation.feedback!.strengths as string[],
        improvements: presentation.feedback!.improvements as string[],
        score: presentation.feedback!.score,
      },
      questions: presentation.questions.map((q) => ({
        id: q.id,
        question: q.question,
        category: q.category as 'content' | 'clarification' | 'challenge',
        difficulty: q.difficulty as 'easy' | 'medium' | 'hard',
      })),
      createdAt: presentation.createdAt,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze presentation', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
