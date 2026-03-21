'use client';

import { useEffect, useRef, useState } from 'react';
import HomeFooter from '@/components/home/HomeFooter';
import HomeFlowSection from '@/components/home/HomeFlowSection';
import HomeHeroSection from '@/components/home/HomeHeroSection';
import HomeMotionStyles from '@/components/home/HomeMotionStyles';
import HomeNav from '@/components/home/HomeNav';
import HomeWhySection from '@/components/home/HomeWhySection';

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

interface HomePageClientProps {
  isAuthenticated: boolean;
}

export default function HomePageClient({ isAuthenticated }: HomePageClientProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const flowRef = useRef<HTMLDivElement>(null);
  const whyRef = useRef<HTMLDivElement>(null);
  const heroSectionRef = useRef<HTMLDivElement>(null);
  const flowSectionRef = useRef<HTMLDivElement>(null);
  const [navDark, setNavDark] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;

      setNavDark(scrollY > windowHeight * 0.45);

      if (heroRef.current) {
        const progress = clamp(scrollY / (windowHeight * 1.05), 0, 1);
        const eased = easeOutCubic(progress);
        heroRef.current.style.transform = `translateY(${-eased * 42}px) scale(${1 - eased * 0.02})`;
        heroRef.current.style.opacity = String(1 - eased * 0.26);
      }

      if (flowRef.current && heroSectionRef.current) {
        const heroHeight = heroSectionRef.current.offsetHeight;
        const start = heroHeight - windowHeight * 1.02;
        const end = heroHeight - windowHeight * 0.04;
        const progress = clamp((scrollY - start) / (end - start), 0, 1);
        flowRef.current.style.transform = `translateY(${(1 - easeOutCubic(progress)) * 125}px)`;
      }

      if (whyRef.current && heroSectionRef.current && flowSectionRef.current) {
        const heroHeight = heroSectionRef.current.offsetHeight;
        const flowHeight = flowSectionRef.current.offsetHeight;
        const start = heroHeight + flowHeight - windowHeight * 1.02;
        const end = heroHeight + flowHeight - windowHeight * 0.04;
        const progress = clamp((scrollY - start) / (end - start), 0, 1);
        whyRef.current.style.transform = `translateY(${(1 - easeOutCubic(progress)) * 125}px)`;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <HomeMotionStyles />
      <div className="bg-[#0d0d0d] text-slate-900">
        <HomeNav navDark={navDark} isAuthenticated={isAuthenticated} />

        <main className="relative">
          <HomeHeroSection heroSectionRef={heroSectionRef} heroRef={heroRef} />
          <HomeFlowSection flowSectionRef={flowSectionRef} flowRef={flowRef} />
          <HomeWhySection whyRef={whyRef} />
        </main>

        <HomeFooter />
      </div>
    </>
  );
}
