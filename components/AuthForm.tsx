'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useState } from 'react';

interface AuthFormProps {
  mode: 'login' | 'signup';
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [step, setStep] = useState<'form' | 'confirm'>('form');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nextPath = searchParams.get('next') || '/dashboard';
  const isSignup = mode === 'signup';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setIsSubmitting(true);

    try {
      if (isSignup && step === 'confirm') {
        const response = await fetch('/api/auth/confirm-signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: pendingEmail || email,
            password,
            code,
          }),
        });

        const result = (await response.json()) as { error?: string };

        if (!response.ok) {
          throw new Error(result.error || '인증 코드 확인에 실패했습니다.');
        }

        router.push(nextPath);
        router.refresh();
        return;
      }

      const response = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const result = (await response.json()) as {
        error?: string;
        requiresConfirmation?: boolean;
        email?: string;
        destination?: string;
      };

      if (!response.ok) {
        throw new Error(result.error || '요청에 실패했습니다.');
      }

      if (isSignup && result.requiresConfirmation) {
        setPendingEmail(result.email || email);
        setStep('confirm');
        setNotice(`인증 코드가 ${result.destination || result.email || email}로 전송되었습니다.`);
        return;
      }

      router.push(nextPath);
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : '요청에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-[2rem] border border-[#2f74dd]/10 bg-white/90 p-8 shadow-[0_24px_60px_-32px_rgba(47,116,221,0.35)] backdrop-blur-xl">
      <div className="mb-8 space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#2f74dd]">
          Next Order
        </p>
        <h1 className="text-3xl font-bold text-slate-950">
          {isSignup
            ? step === 'confirm'
              ? '이메일 인증을 완료해주세요'
              : '내 발표 기록을 시작해보세요'
            : '다시 돌아와서 기록을 이어가세요'}
        </h1>
        <p className="text-sm leading-6 text-slate-600">
          {isSignup
            ? step === 'confirm'
              ? '회원가입 시 입력한 이메일로 받은 인증 코드를 입력하면 바로 로그인됩니다.'
              : '회원가입 후 이메일 인증을 마치면 발표 기록과 분석 결과를 저장할 수 있어요.'
            : '로그인하면 저장된 발표 기록과 분석 결과를 바로 확인할 수 있어요.'}
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {isSignup && step === 'form' ? (
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-700">
              이름
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="예: 박태환"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-[#2f74dd] focus:ring-4 focus:ring-[#2f74dd]/10"
            />
          </div>
        ) : null}

        {(step === 'form' || !isSignup) ? (
          <>
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
                이메일
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-[#2f74dd] focus:ring-4 focus:ring-[#2f74dd]/10"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="8자 이상 입력"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-[#ff8a1f] focus:ring-4 focus:ring-[#ff8a1f]/10"
                minLength={8}
                required
              />
            </div>
          </>
        ) : null}

        {isSignup && step === 'confirm' ? (
          <>
            <div>
              <label htmlFor="pendingEmail" className="mb-2 block text-sm font-medium text-slate-700">
                인증 이메일
              </label>
              <input
                id="pendingEmail"
                type="email"
                value={pendingEmail || email}
                disabled
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500 outline-none"
              />
            </div>
            <div>
              <label htmlFor="code" className="mb-2 block text-sm font-medium text-slate-700">
                인증 코드
              </label>
              <input
                id="code"
                type="text"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="이메일로 받은 6자리 코드"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-[#2f74dd] focus:ring-4 focus:ring-[#2f74dd]/10"
                required
              />
            </div>
          </>
        ) : null}

        {notice ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {notice}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-2xl px-4 py-3 font-semibold text-white shadow-[0_18px_35px_-18px_rgba(47,116,221,0.65)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          style={{ background: 'linear-gradient(90deg, #ff8a1f, #2f74dd)' }}
        >
          {isSubmitting
            ? isSignup
              ? step === 'confirm'
                ? '인증 중...'
                : '가입 중...'
              : '로그인 중...'
            : isSignup
              ? step === 'confirm'
                ? '이메일 인증 완료'
                : '회원가입'
              : '로그인'}
        </button>
      </form>

      <p className="mt-6 text-sm text-slate-600">
        {isSignup ? '이미 계정이 있나요?' : '처음 사용하시나요?'}{' '}
        <Link
          href={`${isSignup ? '/login' : '/signup'}${nextPath ? `?next=${encodeURIComponent(nextPath)}` : ''}`}
          className="font-semibold text-[#2f74dd] hover:text-[#225fbb]"
        >
          {isSignup ? '로그인하기' : '회원가입하기'}
        </Link>
      </p>
    </div>
  );
}
