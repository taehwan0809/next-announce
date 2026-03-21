'use client';

import { useState, useRef, useEffect } from 'react';
import { PresentationData, RecordingStatus } from '@/types';

interface RecordingControlsProps {
  status: RecordingStatus;
  setStatus: (status: RecordingStatus) => void;
  presentationId?: string | null;
  title: string;
  script: string | null;
  targetMinDurationSec?: number | null;
  targetMaxDurationSec?: number | null;
  onAnalysisComplete: (data: PresentationData) => void;
  onReset: () => void;
}

export default function RecordingControls({
  status,
  setStatus,
  presentationId,
  title,
  script,
  targetMinDurationSec,
  targetMaxDurationSec,
  onAnalysisComplete,
  onReset,
}: RecordingControlsProps) {
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setStatus('recording');
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('마이크 접근 권한이 필요합니다.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setStatus('idle');
    }
  };

  const analyzeRecording = async () => {
    if (!audioBlob || !title) {
      alert('발표 제목을 입력해주세요.');
      return;
    }

    setStatus('processing');

    try {
      // FormData 생성
      const formData = new FormData();

      // 음성 파일을 webm에서 mp3로 변환 (Whisper는 mp3, mp4, mpeg, mpga, m4a, wav, webm 지원)
      const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });

      formData.append('audio', audioFile);
      formData.append('title', title);
      formData.append('duration', recordingTime.toString());
      if (presentationId) {
        formData.append('presentationId', presentationId);
      }
      if (targetMinDurationSec) {
        formData.append('targetMinDurationSec', targetMinDurationSec.toString());
      }
      if (targetMaxDurationSec) {
        formData.append('targetMaxDurationSec', targetMaxDurationSec.toString());
      }

      if (script) {
        formData.append('script', script);
      }

      // API 호출
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || 'Analysis failed');
      }

      const result = await response.json();

      // 분석 완료
      setStatus('completed');
      onAnalysisComplete(result);
    } catch (error) {
      console.error('Analysis error:', error);
      setStatus('idle');
      alert(`분석 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  };

  const resetRecording = () => {
    setAudioBlob(null);
    setRecordingTime(0);
    setStatus('idle');
    onReset();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-8">
      <div className="flex flex-col items-center space-y-6">
        {/* Recording Visualizer */}
        <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${
          status === 'recording'
            ? 'bg-red-100 ring-4 ring-red-300 ring-opacity-50 animate-pulse'
            : status === 'processing'
              ? 'bg-blue-100 ring-4 ring-blue-300 ring-opacity-50'
              : 'bg-gray-100'
        }`}>
          {status === 'recording' ? (
            <div className="relative">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
              </div>
              <div className="absolute inset-0 w-16 h-16 bg-red-500 rounded-full animate-ping opacity-20"></div>
            </div>
          ) : status === 'processing' ? (
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : audioBlob ? (
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ) : (
            <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
          )}
        </div>

        {/* Timer */}
        <div className="text-center">
          <div className="text-4xl font-mono font-bold text-gray-900">
            {formatTime(recordingTime)}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {status === 'recording'
              ? '녹음 중...'
              : status === 'processing'
                ? 'AI 분석 중...'
                : status === 'completed'
                  ? '분석 완료'
                  : audioBlob
                    ? '녹음 완료'
                    : '녹음 대기'}
          </p>
        </div>

        {/* Audio Player */}
        {audioBlob && status !== 'processing' && (
          <div className="w-full max-w-md">
            <audio
              controls
              src={URL.createObjectURL(audioBlob)}
              className="w-full"
            />
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex gap-4">
          {status === 'idle' && !audioBlob && (
            <button
              onClick={startRecording}
              className="px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="8"/>
              </svg>
              녹음 시작
            </button>
          )}

          {status === 'recording' && (
            <button
              onClick={stopRecording}
              className="px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="1"/>
              </svg>
              녹음 종료
            </button>
          )}

          {audioBlob && status === 'idle' && (
            <>
              <button
                onClick={analyzeRecording}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                AI 분석 시작
              </button>
              <button
                onClick={resetRecording}
                className="px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                다시 녹음
              </button>
            </>
          )}

          {status === 'processing' && (
            <div className="px-8 py-4 bg-gray-100 text-gray-500 font-semibold rounded-xl flex items-center gap-2">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              분석 진행 중...
            </div>
          )}

          {status === 'completed' && (
            <button
              onClick={resetRecording}
              className="px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              다시 녹음하기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
