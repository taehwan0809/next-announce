import { NextRequest, NextResponse } from 'next/server';
import { analyzeAudio } from '@/lib/analysis';
import { getSessionUser } from '@/lib/auth';
import { transcribeAudio, analyzePresentation, analyzePronunciation } from '@/lib/openai';
import { presentationInclude, serializePresentation } from '@/lib/presentations';
import { prisma } from '@/lib/prisma';
import { deleteFromS3, getFileFromS3, uploadToS3 } from '@/lib/s3';

export async function POST(request: NextRequest) {
  let uploadedKey: string | null = null;
  let shouldCleanupUploadedAudio = false;

  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const formData = await request.formData();
    const rawAudioFile = formData.get('audio');
    const audioFile = rawAudioFile instanceof File ? rawAudioFile : null;

    const presentationId = (formData.get('presentationId') as string | null)?.trim() ?? '';
    const title = (formData.get('title') as string | null)?.trim() ?? '';

    const rawScript = formData.get('script') as string | null;
    const script = rawScript?.trim() ? rawScript.trim() : null;

    const s3Key = (formData.get('s3Key') as string | null)?.trim() ?? '';

    const fileName = (formData.get('fileName') as string | null)?.trim() || 'recording.webm';
    const contentType = (formData.get('contentType') as string | null)?.trim() || 'audio/webm';

    const duration = Number.parseFloat(formData.get('duration') as string);

    const targetMinDurationSec = Number.parseFloat((formData.get('targetMinDurationSec') as string | null) ?? '');
    const targetMaxDurationSec = Number.parseFloat((formData.get('targetMaxDurationSec') as string | null) ?? '');

    const normalizedTargetMinDurationSec =
      Number.isFinite(targetMinDurationSec) && targetMinDurationSec > 0
        ? Math.round(targetMinDurationSec)
        : null;

    const normalizedTargetMaxDurationSec =
      Number.isFinite(targetMaxDurationSec) && targetMaxDurationSec > 0
        ? Math.round(targetMaxDurationSec)
        : null;

    if ((!audioFile && !s3Key) || !title || !Number.isFinite(duration) || duration <= 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const existingPresentation =
      presentationId.length > 0
        ? await prisma.presentation.findFirst({
            where: {
              id: presentationId,
              userId: user.id,
            },
            include: {
              analysisResult: {
                include: {
                  pronunciationAnalysis: true,
                },
              },
            },
          })
        : null;

    let audioKey: string;
    let transcriptionSource: File;

    // 파일 업로드
    if (audioFile) {
      const arrayBuffer = await audioFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      audioKey = await uploadToS3(buffer, audioFile.name, audioFile.type);
      uploadedKey = audioKey;
      shouldCleanupUploadedAudio = true;

      transcriptionSource = audioFile;
    } else {
      audioKey = s3Key;
      uploadedKey = audioKey;
      shouldCleanupUploadedAudio = true;

      transcriptionSource = await getFileFromS3(s3Key, fileName, contentType);
    }

    const transcript = await transcribeAudio(transcriptionSource);

    const audioAnalysis = analyzeAudio(
      transcript,
      duration,
      normalizedTargetMinDurationSec,
      normalizedTargetMaxDurationSec
    );

    const { feedback, questions } = await analyzePresentation(
      transcript.text,
      script || undefined
    );

    let pronunciationData = null;
    if (script) {
      pronunciationData = await analyzePronunciation(transcript.text, script);
    }

    const analysisPayload = {
      duration: Math.round(audioAnalysis.duration),
      speakingSpeedWpm: audioAnalysis.speakingSpeed.wpm,
      speakingSpeedRating: audioAnalysis.speakingSpeed.rating,
      fillerWordsTotal: audioAnalysis.fillerWords.total,
      fillerWords: audioAnalysis.fillerWords.words,
      silencesTotal: audioAnalysis.silences.total,
      silencesAvgDuration: audioAnalysis.silences.avgDuration,
      silencesLongest: audioAnalysis.silences.longest,
    };

    const presentation = existingPresentation
      ? await prisma.presentation.update({
          where: { id: existingPresentation.id },
          data: {
            title,
            script,
            audioUrl: audioKey,
            targetMinDurationSec: normalizedTargetMinDurationSec,
            targetMaxDurationSec: normalizedTargetMaxDurationSec,

            transcript: {
              upsert: {
                create: { text: transcript.text },
                update: { text: transcript.text },
              },
            },

            analysisResult: {
              upsert: {
                create: {
                  duration: analysisPayload.duration,
                  speakingSpeedWpm: analysisPayload.speakingSpeedWpm,
                  speakingSpeedRating: analysisPayload.speakingSpeedRating,
                  fillerWordsTotal: analysisPayload.fillerWordsTotal,
                  fillerWords: analysisPayload.fillerWords,
                  silencesTotal: analysisPayload.silencesTotal,
                  silencesAvgDuration: analysisPayload.silencesAvgDuration,
                  silencesLongest: analysisPayload.silencesLongest,

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

                update: {
                  duration: analysisPayload.duration,
                  speakingSpeedWpm: analysisPayload.speakingSpeedWpm,
                  speakingSpeedRating: analysisPayload.speakingSpeedRating,
                  fillerWordsTotal: analysisPayload.fillerWordsTotal,
                  fillerWords: analysisPayload.fillerWords,
                  silencesTotal: analysisPayload.silencesTotal,
                  silencesAvgDuration: analysisPayload.silencesAvgDuration,
                  silencesLongest: analysisPayload.silencesLongest,

                  pronunciationAnalysis: pronunciationData
                    ? {
                        upsert: {
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
                          update: {
                            accuracy: pronunciationData.accuracy,
                            wellPronounced: pronunciationData.wellPronounced,
                            mistakes: {
                              deleteMany: {},
                              create: pronunciationData.mistakes.map((mistake) => ({
                                expected: mistake.expected,
                                recognized: mistake.recognized,
                                position: mistake.position,
                                severity: mistake.severity,
                              })),
                            },
                          },
                        },
                      }
                    : existingPresentation?.analysisResult?.pronunciationAnalysis
                      ? { delete: true }
                      : undefined,
                },
              },
            },

            feedback: {
              upsert: {
                create: feedback,
                update: feedback,
              },
            },

            questions: {
              deleteMany: {},
              create: questions,
            },
          },
          include: presentationInclude,
        })
      : await prisma.presentation.create({
          data: {
            title,
            script,
            audioUrl: audioKey,
            targetMinDurationSec: normalizedTargetMinDurationSec,
            targetMaxDurationSec: normalizedTargetMaxDurationSec,
            userId: user.id,

            transcript: {
              create: { text: transcript.text },
            },

            analysisResult: {
              create: {
                duration: analysisPayload.duration,
                speakingSpeedWpm: analysisPayload.speakingSpeedWpm,
                speakingSpeedRating: analysisPayload.speakingSpeedRating,
                fillerWordsTotal: analysisPayload.fillerWordsTotal,
                fillerWords: analysisPayload.fillerWords,
                silencesTotal: analysisPayload.silencesTotal,
                silencesAvgDuration: analysisPayload.silencesAvgDuration,
                silencesLongest: analysisPayload.silencesLongest,

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
              create: feedback,
            },

            questions: {
              create: questions,
            },
          },
          include: presentationInclude,
        });

    shouldCleanupUploadedAudio = false;

    if (existingPresentation?.audioUrl && existingPresentation.audioUrl !== audioKey) {
      try {
        await deleteFromS3(existingPresentation.audioUrl);
      } catch (e) {
        console.error('Failed to delete old file:', e);
      }
    }

    return NextResponse.json(serializePresentation(presentation));

  } catch (error) {
    if (shouldCleanupUploadedAudio && uploadedKey) {
      try {
        await deleteFromS3(uploadedKey);
      } catch (e) {
        console.error('Cleanup failed:', e);
      }
    }

    console.error('Analysis error:', error);

    return NextResponse.json(
      {
        error: 'Failed to analyze presentation',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}