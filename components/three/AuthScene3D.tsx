import React, { useEffect, useRef } from 'react';
import { mountBizScene } from './mountBizScene';

const AuthScene3D: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return mountBizScene(el, 'auth');
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none opacity-90">
      <div ref={ref} className="absolute inset-0" aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-b from-[#06060a]/75 via-[#06060a]/55 to-[#06060a]/90" />
    </div>
  );
};

export default AuthScene3D;
