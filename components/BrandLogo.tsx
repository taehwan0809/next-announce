'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

type BrandLogoSize = 'sm' | 'md' | 'lg';

interface BrandLogoProps {
  href?: string;
  size?: BrandLogoSize;
  showTagline?: boolean;
  className?: string;
}

const imageSizes: Record<
  BrandLogoSize,
  { width: number; height: number; title: string; tagline: string; imageClassName: string }
> = {
  sm: {
    width: 260,
    height: 140,
    title: 'text-base',
    tagline: 'text-[11px]',
    imageClassName: 'h-14 w-auto',
  },
  md: {
    width: 216,
    height: 122,
    title: 'text-2xl',
    tagline: 'text-sm',
    imageClassName: 'h-14 w-auto',
  },
  lg: {
    width: 320,
    height: 181,
    title: 'text-[2rem]',
    tagline: 'text-base',
    imageClassName: 'h-20 w-auto',
  },
};

export default function BrandLogo({
  href = '/',
  size = 'md',
  showTagline = false,
  className = '',
}: BrandLogoProps) {
  const [imageError, setImageError] = useState(false);
  const selected = imageSizes[size];

  const content = (
    <div className={`inline-flex items-center ${className}`}>
      {imageError ? (
        <div className="flex flex-col">
          <span className={`font-black tracking-[-0.05em] text-slate-950 ${selected.title}`}>
            다음 순서는
          </span>
          {showTagline ? (
            <span className={`font-medium text-slate-500 ${selected.tagline}`}>
              발표 연습을 더 선명하게
            </span>
          ) : null}
        </div>
      ) : (
        <Image
          src="/logo.png"
          alt="다음 순서는 로고"
          width={selected.width}
          height={selected.height}
          className={`${selected.imageClassName} max-w-full object-contain`}
          priority={size === 'lg'}
          onError={() => setImageError(true)}
        />
      )}
    </div>
  );

  return href ? (
    <Link href={href} className="inline-flex items-center">
      {content}
    </Link>
  ) : (
    content
  );
}
