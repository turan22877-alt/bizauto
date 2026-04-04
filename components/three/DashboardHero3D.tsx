import React, { useEffect, useRef } from 'react';
import { mountBizScene } from './mountBizScene';

const DashboardHero3D: React.FC<{ className?: string }> = ({ className = '' }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return mountBizScene(el, 'dashboard');
  }, []);

  return (
    <div
      className={`relative rounded-[2rem] overflow-hidden border border-white/[0.08] bg-gradient-to-br from-blue-950/40 to-[#0a0a12] shadow-[0_20px_60px_rgba(0,102,255,0.12)] ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-[#06060a] via-transparent to-transparent z-10 pointer-events-none" />
      <div
        ref={ref}
        className="relative z-0 h-[min(280px,32vh)] w-full min-h-[200px]"
        aria-hidden
      />
    </div>
  );
};

export default DashboardHero3D;
