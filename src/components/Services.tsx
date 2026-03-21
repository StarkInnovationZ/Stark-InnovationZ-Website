import { Cpu, Globe, Smartphone, Box, Printer, FileText, Shield, ImageIcon, GraduationCap, Wrench, ArrowUpRight, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState, useRef, useCallback } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import Reviews from './Reviews';

/* ── per-service config ── */
const CFG: Record<string, { icon: React.ElementType; accent: string; light: string; dark: string; emoji: string; tag: string }> = {
  'Hardware':             { icon: Cpu,          accent: '#f97316', light: '#fff7ed', dark: '#7c2d12', emoji: '⚡', tag: 'Electronics' },
  'Website Development':  { icon: Globe,         accent: '#3b82f6', light: '#eff6ff', dark: '#1e3a8a', emoji: '🌐', tag: 'Web' },
  'App Development':      { icon: Smartphone,    accent: '#10b981', light: '#ecfdf5', dark: '#064e3b', emoji: '📲', tag: 'Mobile' },
  '3D Design':            { icon: Box,           accent: '#8b5cf6', light: '#f5f3ff', dark: '#4c1d95', emoji: '🧊', tag: 'Design' },
  '3D Printing':          { icon: Printer,       accent: '#f43f5e', light: '#fff1f2', dark: '#881337', emoji: '🖨️', tag: 'Fabrication' },
  'Documentation':        { icon: FileText,      accent: '#f59e0b', light: '#fffbeb', dark: '#78350f', emoji: '📋', tag: 'Technical' },
  'Patent Documentation': { icon: Shield,        accent: '#0ea5e9', light: '#f0f9ff', dark: '#0c4a6e', emoji: '🛡️', tag: 'Legal' },
  'Poster Design':        { icon: ImageIcon,     accent: '#ec4899', light: '#fdf2f8', dark: '#831843', emoji: '🎨', tag: 'Visual' },
  'Hands-on Training':    { icon: Wrench,        accent: '#22c55e', light: '#f0fdf4', dark: '#14532d', emoji: '🛠️', tag: 'Workshop' },
  'Education & Training': { icon: GraduationCap, accent: '#f97316', light: '#fff7ed', dark: '#7c2d12', emoji: '🎓', tag: 'Learning' },
};
const FALLBACK_ACCENTS = ['#f97316','#3b82f6','#10b981','#8b5cf6','#f43f5e','#f59e0b','#0ea5e9','#ec4899','#22c55e'];
const getFallback = (i: number) => ({
  icon: Box, accent: FALLBACK_ACCENTS[i % FALLBACK_ACCENTS.length],
  light: '#fff7ed', dark: '#1c1917', emoji: '✦', tag: 'Service',
});

/* ── 3D tilt card ── */
function TiltCard({ children, accent, className = '', style = {}, onMouseEnter, onMouseLeave }: {
  children: React.ReactNode;
  accent: string;
  className?: string;
  style?: React.CSSProperties;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const rafRef  = useRef<number>(0);

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const r   = el.getBoundingClientRect();
      const x   = (e.clientX - r.left) / r.width  - 0.5;
      const y   = (e.clientY - r.top)  / r.height - 0.5;
      const rx  = -y * 14;
      const ry  =  x * 14;
      const sx  = (e.clientX - r.left).toFixed(1);
      const sy  = (e.clientY - r.top ).toFixed(1);
      el.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.03,1.03,1.03)`;
      el.style.setProperty('--sx', sx + 'px');
      el.style.setProperty('--sy', sy + 'px');
      el.style.setProperty('--so', '1');
    });
  }, []);

  const onLeave = useCallback(() => {
    const el = cardRef.current;
    if (!el) return;
    el.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
    el.style.setProperty('--so', '0');
  }, []);

  const handleMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    onMove(e);
  }, [onMove]);

  const handleLeave = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    onLeave();
    onMouseLeave?.();
  }, [onLeave, onMouseLeave]);

  const handleEnter = useCallback(() => {
    onMouseEnter?.();
  }, [onMouseEnter]);

  return (
    <div
      ref={cardRef}
      className={`tilt-card ${className}`}
      style={{
        transition: 'transform 0.12s ease, box-shadow 0.3s ease',
        transformStyle: 'preserve-3d',
        '--accent': accent,
        ...style,
      } as React.CSSProperties}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onMouseEnter={handleEnter}
    >
      <div className="tilt-spotlight" />
      {children}
    </div>
  );
}

export default function Services() {
  const [services, setServices]   = useState<any[]>([]);
  const [active, setActive]       = useState<number | null>(null);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    getDocs(query(collection(db, 'services'), orderBy('Priority', 'asc'))).then(snap => {
      setServices(snap.docs.map((d, i) => {
        const data = d.data();
        const cfg  = CFG[data.Title] ?? getFallback(i);
        return { ...cfg, title: data.Title, description: data.Description, idx: i };
      }));
    });
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.05 }
    );
    ref.current?.querySelectorAll('.reveal,.reveal-l,.reveal-r').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [services]);

  /* bento layout — spans */
  const getSpan = (i: number) => {
    const pattern = [
      'lg:col-span-2 lg:row-span-2', // big
      'lg:col-span-1 lg:row-span-1',
      'lg:col-span-1 lg:row-span-1',
      'lg:col-span-2 lg:row-span-1',
      'lg:col-span-1 lg:row-span-1',
      'lg:col-span-2 lg:row-span-1', // wide
      'lg:col-span-1 lg:row-span-1',
      'lg:col-span-2 lg:row-span-1',
      'lg:col-span-1 lg:row-span-1', // wide
      'lg:col-span-1 lg:row-span-1',
    ];
    return pattern[i % pattern.length];
  };

  const isBig  = (i: number) => i === 0;
  const isWide = (i: number) => i === 5 || i === 8;

  return (
    <section ref={ref} className="relative min-h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>

      {/* ── Global styles injected once ── */}
      <style>{`
        /* Tilt card spotlight */
        .tilt-card { position: relative; overflow: hidden; cursor: default; }
        .tilt-spotlight {
          position: absolute; inset: 0; pointer-events: none; z-index: 10;
          background: radial-gradient(circle 200px at var(--sx,50%) var(--sy,50%),
            rgba(255,255,255,0.12), transparent 70%);
          opacity: var(--so,0);
          transition: opacity 0.3s;
          border-radius: inherit;
        }

        /* Floating orbs */
        @keyframes orb1 { 0%,100%{transform:translate(0,0)} 33%{transform:translate(40px,-30px)} 66%{transform:translate(-20px,40px)} }
        @keyframes orb2 { 0%,100%{transform:translate(0,0)} 40%{transform:translate(-35px,25px)} 70%{transform:translate(25px,-40px)} }
        @keyframes orb3 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(20px,30px)} }

        /* Text shimmer */
        @keyframes shimmer {
          0%   { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        .shimmer-text {
          background: linear-gradient(90deg, var(--orange), #ec4899, #8b5cf6, #3b82f6, var(--orange));
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 5s linear infinite;
        }

        /* Card entry */
        @keyframes cardIn {
          from { opacity:0; transform: translateY(24px) scale(0.97); }
          to   { opacity:1; transform: translateY(0)    scale(1); }
        }
        .card-in { animation: cardIn 0.6s cubic-bezier(.16,1,.3,1) both; }

        /* Icon float */
        @keyframes iconFloat {
          0%,100% { transform: translateY(0) rotate(0deg); }
          50%     { transform: translateY(-6px) rotate(4deg); }
        }

        /* Pulse ring */
        @keyframes pulseRing {
          0%  { transform: scale(1);   opacity: 0.5; }
          100%{ transform: scale(1.8); opacity: 0; }
        }

        /* Tag scroll */
        @keyframes tagScroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        /* Number count */
        @keyframes countUp {
          from { opacity:0; transform:translateY(8px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>

      {/* ── Background floating orbs ── */}
      <div aria-hidden className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div style={{ position:'absolute', top:'10%', left:'-5%', width:400, height:400,
          background:'var(--orange)', borderRadius:'50%', filter:'blur(120px)', opacity:0.06,
          animation:'orb1 16s ease-in-out infinite' }} />
        <div style={{ position:'absolute', top:'50%', right:'-8%', width:350, height:350,
          background:'#8b5cf6', borderRadius:'50%', filter:'blur(120px)', opacity:0.05,
          animation:'orb2 20s ease-in-out infinite 3s' }} />
        <div style={{ position:'absolute', bottom:'5%', left:'30%', width:300, height:300,
          background:'#3b82f6', borderRadius:'50%', filter:'blur(120px)', opacity:0.04,
          animation:'orb3 14s ease-in-out infinite 6s' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-5 lg:px-10 pt-20 pb-10">

        {/* ── HEADER ── */}
        <div className="mb-16 reveal">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              {/* eyebrow */}
              <div className="inline-flex items-center gap-2 mb-5 px-3.5 py-2 rounded-full text-[10px] font-black tracking-[3px]"
                style={{ background:'var(--orange3)', color:'var(--orange)', border:'1px solid var(--orange4)' }}>
                <span style={{ width:6,height:6,borderRadius:'50%',background:'var(--orange)',
                  animation:'pulseRing 1.6s ease-out infinite', display:'inline-block' }} />
                OUR EXPERTISE
              </div>

              <h2 className="font-grotesk font-black" style={{ fontSize:'clamp(40px,5.5vw,72px)', letterSpacing:'-2.5px', lineHeight:0.95 }}>
                <span style={{ color:'var(--text)' }}>We Build</span><br />
                <span className="shimmer-text">Anything.</span>
              </h2>
            </div>

            {/* right side stats */}
            <div className="flex gap-6 lg:pb-2">
              {[['10+','Services'],['100+','Projects'],['24/7','Support']].map(([n,l]) => (
                <div key={l} className="text-center">
                  <div className="font-grotesk font-black text-2xl" style={{ color:'var(--text)' }}>{n}</div>
                  <div className="text-[10px] tracking-[1.5px] mt-0.5" style={{ color:'var(--text3)' }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* thin separator */}
          <div className="mt-8 h-px" style={{ background:'linear-gradient(90deg,var(--orange),#ec4899,#8b5cf6,transparent)' }} />
        </div>

        {/* ── BENTO GRID ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:auto-rows-[180px] gap-4 reveal">
          {services.map((svc, i) => {
            const Icon     = svc.icon;
            const span     = getSpan(i);
            const big      = isBig(i);
            const wide     = isWide(i);
            const isActive = active === i;

            return (
              <TiltCard
                key={i}
                accent={svc.accent}
                className={`${span} rounded-3xl p-6 card-in`}
                style={{
                  animationDelay: `${i * 0.07}s`,
                  background: isActive ? svc.light : 'var(--bg2)',
                  border: `1.5px solid ${isActive ? svc.accent + '44' : 'var(--border)'}`,
                  boxShadow: isActive
                    ? `0 20px 60px ${svc.accent}28, inset 0 1px 0 rgba(255,255,255,0.6)`
                    : '0 2px 16px rgba(15,13,10,0.06), inset 0 1px 0 rgba(255,255,255,0.5)',
                  transition: 'background 0.35s, border-color 0.35s, box-shadow 0.35s',
                }}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
              >
                {/* ── BIG card (first) ── */}
                {big && (
                  <div className="h-full flex flex-col justify-between">
                    {/* top row */}
                    <div className="flex items-start justify-between">
                      {/* icon with ring */}
                      <div className="relative">
                        {isActive && (
                          <div className="absolute inset-0 rounded-2xl"
                            style={{ background: svc.accent, opacity:0.2, animation:'pulseRing 1.5s ease-out infinite' }} />
                        )}
                        <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center"
                          style={{
                            background: `${svc.accent}18`,
                            border: `2px solid ${svc.accent}33`,
                            animation: isActive ? 'iconFloat 2.5s ease-in-out infinite' : 'none',
                          }}>
                          <Icon className="w-7 h-7" style={{ color: svc.accent }} />
                        </div>
                      </div>

                      {/* tag pill */}
                      <div className="px-3 py-1 rounded-full text-[9px] font-black tracking-[2px]"
                        style={{ background:`${svc.accent}14`, color: svc.accent }}>
                        {svc.tag}
                      </div>
                    </div>

                    {/* emoji watermark */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[120px] select-none pointer-events-none opacity-[0.07]
                      transition-all duration-500"
                      style={{ filter:'grayscale(10%)', transform: isActive ? 'translateY(-50%) scale(1.1) rotate(8deg)' : 'translateY(-50%)' }}>
                      {svc.emoji}
                    </div>

                    {/* bottom */}
                    <div>
                      <div className="text-[9px] font-black tracking-[3px] mb-2 opacity-30" style={{ color: svc.accent }}>
                        {String(i + 1).padStart(2,'0')} / {String(services.length).padStart(2,'0')}
                      </div>
                      <h3 className="font-grotesk font-black mb-2" style={{ fontSize:22, color:'var(--text)', lineHeight:1.1 }}>
                        {svc.title}
                      </h3>
                      <p className="text-xs leading-relaxed mb-4" style={{ color:'var(--text3)', maxWidth:260 }}>
                        {svc.description}
                      </p>
                    </div>
                  </div>
                )}

                {/* ── WIDE card ── */}
                {wide && !big && (
                  <div className="h-full flex items-center gap-6">
                    <div className="relative flex-shrink-0">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                        style={{
                          background:`${svc.accent}15`, border:`1.5px solid ${svc.accent}28`,
                          animation: isActive ? 'iconFloat 2s ease-in-out infinite' : 'none',
                        }}>
                        <Icon className="w-6 h-6" style={{ color: svc.accent }} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold mb-2"
                        style={{ background:`${svc.accent}12`, color: svc.accent }}>
                        {svc.tag}
                      </div>
                      <h3 className="font-grotesk font-bold text-base mb-1" style={{ color:'var(--text)' }}>
                        {svc.title}
                      </h3>
                      <p className="text-xs leading-relaxed truncate" style={{ color:'var(--text3)' }}>
                        {svc.description}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-4xl transition-transform duration-500"
                      style={{ transform: isActive ? 'rotate(10deg) scale(1.15)' : 'none' }}>
                      {svc.emoji}
                    </div>
                  </div>
                )}

                {/* ── NORMAL card ── */}
                {!big && !wide && (
                  <div className="h-full flex flex-col justify-between">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                        style={{
                          background:`${svc.accent}14`, border:`1.5px solid ${svc.accent}25`,
                          animation: isActive ? 'iconFloat 2s ease-in-out infinite' : 'none',
                        }}>
                        <Icon className="w-5 h-5" style={{ color: svc.accent }} />
                      </div>
                      <span className="text-2xl transition-transform duration-400"
                        style={{ transform: isActive ? 'rotate(12deg) scale(1.2)' : 'none' }}>
                        {svc.emoji}
                      </span>
                    </div>

                    <div>
                      <div className="text-[9px] font-black tracking-[2px] mb-1.5 opacity-35"
                        style={{ color: svc.accent }}>
                        {String(i + 1).padStart(2,'0')}
                      </div>
                      <h3 className="font-grotesk font-bold text-sm leading-tight mb-1" style={{ color:'var(--text)' }}>
                        {svc.title}
                      </h3>
                      <p className="text-[11px] leading-relaxed line-clamp-2" style={{ color:'var(--text3)' }}>
                        {svc.description}
                      </p>
                    </div>

                    {/* bottom accent bar */}
                    <div className="mt-3 h-0.5 rounded-full transition-all duration-500"
                      style={{
                        width: isActive ? '100%' : '28px',
                        background: `linear-gradient(90deg,${svc.accent},${svc.accent}44)`,
                      }} />
                  </div>
                )}
              </TiltCard>
            );
          })}
        </div>
      </div>

      {/* ── SCROLLING PILL TICKER ── */}
      <div className="overflow-hidden py-5 my-6 border-y" style={{ borderColor:'var(--border)' }}>
        <div className="inline-flex gap-3 whitespace-nowrap" style={{ animation:'tagScroll 28s linear infinite' }}>
          {[...Array(3)].flatMap(() =>
            services.map((s, i) => (
              <div key={`t${i}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold flex-shrink-0 cursor-default transition-transform hover:scale-105"
                style={{ background:`${s.accent}10`, border:`1px solid ${s.accent}22`, color: s.accent }}>
                <span>{s.emoji}</span>{s.title}
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── DARK CTA ── */}
      <div className="max-w-7xl mx-auto px-5 lg:px-10 pb-20 reveal">
        <div className="relative overflow-hidden rounded-3xl" style={{
          background:'linear-gradient(135deg,#0f0d0a 0%,#1c1209 50%,#0f0d0a 100%)',
          boxShadow:'0 32px 80px rgba(15,13,10,0.25)',
        }}>
          {/* glow blobs inside CTA */}
          <div style={{ position:'absolute',top:'-20%',left:'20%',width:300,height:300,
            borderRadius:'50%',background:'var(--orange)',filter:'blur(80px)',opacity:0.12,pointerEvents:'none' }} />
          <div style={{ position:'absolute',bottom:'-20%',right:'15%',width:250,height:250,
            borderRadius:'50%',background:'#8b5cf6',filter:'blur(80px)',opacity:0.1,pointerEvents:'none' }} />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 px-10 py-14">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black tracking-[3px] mb-5"
                style={{ background:'rgba(249,115,22,0.15)', color:'var(--orange)', border:'1px solid rgba(249,115,22,0.25)' }}>
                <Zap className="w-3 h-3" /> START TODAY
              </div>
              <h3 className="font-grotesk font-black text-white mb-2"
                style={{ fontSize:'clamp(26px,4vw,48px)', letterSpacing:'-1.5px', lineHeight:1.05 }}>
                Turn your idea into<br />
                <span style={{ color:'var(--orange)' }}>a real product.</span>
              </h3>
              <p className="text-sm" style={{ color:'rgba(255,255,255,0.4)' }}>
                Hardware · Software · Design · Training — all under one roof.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
              <Link to="/contact"
                className="inline-flex items-center gap-2 text-white font-bold text-sm tracking-wide transition-all duration-300 hover:-translate-y-1"
                style={{ padding:'14px 30px', borderRadius:'14px',
                  background:'linear-gradient(135deg,var(--orange),var(--orange2))',
                  boxShadow:'0 10px 30px rgba(249,115,22,0.45)' }}>
                Get in Touch <ArrowUpRight className="w-4 h-4" />
              </Link>
              <Link to="/"
                className="inline-flex items-center gap-2 font-semibold text-sm transition-all duration-300 hover:-translate-y-1"
                style={{ padding:'14px 30px', borderRadius:'14px',
                  background:'rgba(255,255,255,0.07)',
                  color:'rgba(255,255,255,0.75)',
                  border:'1px solid rgba(255,255,255,0.12)' }}>
                Reviews
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}