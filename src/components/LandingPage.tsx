import { useEffect, useRef, useState } from 'react';

interface LandingPageProps {
  onEnter: () => void;
}

export default function LandingPage({ onEnter }: LandingPageProps) {
  const canvasRef            = useRef<HTMLCanvasElement>(null);
  const [progress, setProgress] = useState(0);
  const [leaving, setLeaving]   = useState(false);
  const [countdown, setCountdown] = useState(5);

  /* ── Canvas particle field ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let W = canvas.width  = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    let raf: number;
    const onResize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    window.addEventListener('resize', onResize);
    const P = Array.from({ length: 100 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5,
      r: Math.random() * 1.5 + 0.5, a: Math.random() * 0.5 + 0.15,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      P.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(249,115,22,${p.a})`; ctx.fill();
        P.forEach(p2 => {
          const d = Math.hypot(p2.x - p.x, p2.y - p.y);
          if (d < 130) {
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(249,115,22,${(1 - d / 130) * 0.1})`;
            ctx.lineWidth = 0.5; ctx.stroke();
          }
        });
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
  }, []);

  /* ── 5 second auto progress + transition ── */
  useEffect(() => {
    const DURATION = 5000; // 5 seconds
    const startTs  = performance.now();

    // smooth progress bar 0→100 over 5s
    let rafId: number;
    const tick = (now: number) => {
      const elapsed = now - startTs;
      const pct     = Math.min((elapsed / DURATION) * 100, 100);
      setProgress(Math.round(pct));
      if (pct < 100) {
        rafId = requestAnimationFrame(tick);
      }
    };
    rafId = requestAnimationFrame(tick);

    // countdown 5→0
    const countdownInterval = setInterval(() => {
      setCountdown(c => Math.max(c - 1, 0));
    }, 1000);

    // at 5s — start leaving
    const leaveTimer = setTimeout(() => {
      setLeaving(true);
      setTimeout(onEnter, 700);
    }, DURATION);

    return () => {
      cancelAnimationFrame(rafId);
      clearInterval(countdownInterval);
      clearTimeout(leaveTimer);
    };
  }, [onEnter]);

  /* skip on click or Enter */
  const skip = () => {
    if (leaving) return;
    setLeaving(true);
    setTimeout(onEnter, 700);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') skip();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[999] flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: '#0a0704',
        opacity:    leaving ? 0 : 1,
        transform:  leaving ? 'scale(1.04)' : 'scale(1)',
        transition: leaving ? 'opacity 0.7s ease, transform 0.7s ease' : 'none',
        cursor: 'pointer',
      }}
      onClick={skip}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(249,115,22,0.07), transparent 70%)' }} />

      {/* ── Content ── */}
      <div className="relative z-10 flex flex-col items-center text-center px-6"
        style={{ animation: 'ldUp 0.9s cubic-bezier(.16,1,.3,1) both' }}>

        {/* Logo */}
        <div className="mb-8 relative" style={{ animation: 'ldUp 0.9s 0.05s cubic-bezier(.16,1,.3,1) both' }}>
          <div className="w-24 h-24 rounded-3xl flex items-center justify-center relative"
            style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)', boxShadow: '0 0 60px rgba(249,115,22,0.5)', animation: 'logoPulse 2s ease-in-out infinite' }}>
            <img src="/assets/Logo.png" alt="Logo" className="w-14 h-14 object-contain"
              onError={e => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
                const fb = e.currentTarget.nextElementSibling as HTMLElement;
                if (fb) fb.style.display = 'block';
              }} />
            <span className="text-white font-black text-4xl" style={{ display: 'none' }}>S</span>
          </div>
          {/* pulse ring */}
          <div className="absolute rounded-3xl pointer-events-none"
            style={{ inset: '-10px', border: '1px solid rgba(249,115,22,0.25)', animation: 'ringPulse 2s ease-in-out infinite' }} />
        </div>

        {/* Name */}
        <h1 className="font-grotesk font-black text-white mb-3"
          style={{ fontSize: 'clamp(38px,6vw,76px)', letterSpacing: '-2px', lineHeight: 1, animation: 'ldUp 0.9s 0.1s cubic-bezier(.16,1,.3,1) both' }}>
          STARK
          <span style={{ background: 'linear-gradient(90deg,#f97316,#fb923c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {' '}INNOVATION
          </span>Z
        </h1>

        {/* Tagline */}
        <p className="text-sm font-semibold tracking-[4px] mb-14"
          style={{ color: 'rgba(255,255,255,0.35)', animation: 'ldUp 0.9s 0.18s cubic-bezier(.16,1,.3,1) both' }}>
          INNOVATE · BUILD · DELIVER
        </p>

        {/* Progress bar */}
        <div className="w-72 mb-5" style={{ animation: 'ldUp 0.9s 0.25s cubic-bezier(.16,1,.3,1) both' }}>
          {/* bar track */}
          <div className="relative h-[3px] rounded-full overflow-hidden mb-3"
            style={{ background: 'rgba(255,255,255,0.07)' }}>
            <div className="absolute inset-y-0 left-0 rounded-full transition-none"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg,#f97316,#fb923c)',
                boxShadow: '0 0 10px rgba(249,115,22,0.7)',
                transition: 'width 0.1s linear',
              }} />
          </div>

          {/* step labels */}
          <div className="flex justify-between text-[9px] font-bold tracking-[1.5px]"
            style={{ color: 'rgba(255,255,255,0.18)' }}>
            {['INIT','SERVICES','DATABASE','READY'].map((label, i) => {
              const threshold = [0, 33, 66, 90][i];
              return (
                <span key={label} style={{ color: progress >= threshold ? 'rgba(249,115,22,0.7)' : 'rgba(255,255,255,0.18)', transition: 'color 0.3s' }}>
                  {label}
                </span>
              );
            })}
          </div>
        </div>

        {/* Countdown ring */}
        <div className="relative flex items-center justify-center" style={{ animation: 'ldUp 0.9s 0.3s cubic-bezier(.16,1,.3,1) both' }}>
          <svg width="64" height="64" viewBox="0 0 64 64" style={{ transform: 'rotate(-90deg)' }}>
            {/* track */}
            <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="3" />
            {/* progress arc */}
            <circle cx="32" cy="32" r="28" fill="none"
              stroke="#f97316" strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 28}`}
              strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress / 100)}`}
              style={{ transition: 'stroke-dashoffset 0.1s linear', filter: 'drop-shadow(0 0 4px rgba(249,115,22,0.8))' }}
            />
          </svg>
          {/* number inside */}
          <div className="absolute flex flex-col items-center">
            <span className="font-grotesk font-black text-white" style={{ fontSize: '20px', lineHeight: 1 }}>
              {countdown}
            </span>
            <span className="text-[8px] tracking-[1px]" style={{ color: 'rgba(255,255,255,0.3)' }}>SEC</span>
          </div>
        </div>

        {/* skip hint */}
        <p className="mt-6 text-[9px] tracking-[2px]"
          style={{ color: 'rgba(255,255,255,0.15)', animation: 'ldUp 0.9s 0.5s cubic-bezier(.16,1,.3,1) both' }}>
          CLICK ANYWHERE OR PRESS ENTER TO SKIP
        </p>
      </div>

      {/* bottom tags */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4 flex-wrap px-6"
        style={{ animation: 'ldUp 0.9s 0.4s cubic-bezier(.16,1,.3,1) both' }}>
        {['Hardware','Software','3D Design','3D Printing','Training','Documentation'].map(s => (
          <span key={s} className="text-[9px] font-bold tracking-[2px]" style={{ color: 'rgba(255,255,255,0.12)' }}>{s}</span>
        ))}
      </div>

      <style>{`
        @keyframes ldUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes logoPulse {
          0%,100% { box-shadow:0 0 40px rgba(249,115,22,0.4); }
          50%      { box-shadow:0 0 80px rgba(249,115,22,0.7); }
        }
        @keyframes ringPulse {
          0%,100% { opacity:0.25; transform:scale(1); }
          50%      { opacity:0.6;  transform:scale(1.08); }
        }
      `}</style>
    </div>
  );
}