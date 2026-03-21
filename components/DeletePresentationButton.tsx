'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface DeletePresentationButtonProps {
  presentationId: string;
  redirectTo?: string;
}

export default function DeletePresentationButton({
  presentationId,
  redirectTo,
}: DeletePresentationButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('이 기록을 삭제할까요? 삭제 후에는 복구할 수 없습니다.')) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/presentations/${presentationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = (await response.json()) as { error?: string };
        throw new Error(result.error || '삭제에 실패했습니다.');
      }

      if (redirectTo) {
        router.push(redirectTo);
      }

      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : '삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isDeleting ? '삭제 중...' : '삭제'}
    </button>
  );
}
