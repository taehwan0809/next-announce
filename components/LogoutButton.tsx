'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

interface LogoutButtonProps {
  className?: string;
  pendingLabel?: string;
  label?: string;
}

export default function LogoutButton({
  className = 'rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#2f74dd]/20 hover:text-[#2f74dd]',
  pendingLabel = '로그아웃 중...',
  label = '로그아웃',
}: LogoutButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() =>
        startTransition(async () => {
          await fetch('/api/auth/logout', { method: 'POST' });
          router.push('/');
          router.refresh();
        })
      }
      className={className}
      disabled={isPending}
    >
      {isPending ? pendingLabel : label}
    </button>
  );
}
