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
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nextPath = searchParams.get('next') || '/dashboard';
  const isSignup = mode === 'signup';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
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

      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(result.error || '요청에 실패했습니다.');
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
          {isSignup ? '내 발표 기록을 시작해보세요' : '다시 돌아와서 기록을 이어가세요'}
        </h1>
        <p className="text-sm leading-6 text-slate-600">
          {isSignup
            ? '회원가입 후 발표 기록과 분석 결과를 한곳에서 저장하고 다시 볼 수 있어요.'
            : '로그인하면 저장된 발표 기록과 분석 결과를 바로 확인할 수 있어요.'}
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {isSignup ? (
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
              ? '가입 중...'
              : '로그인 중...'
            : isSignup
              ? '회원가입'
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
