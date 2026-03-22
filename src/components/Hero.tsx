import { ArrowRight, Play } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

import { Link } from 'react-router-dom';

const SERVICES = ['Hardware Dev', 'Website Dev', 'App Dev', '3D Design', '3D Printing', 'Documentation', 'Patent Docs', 'Poster Design', 'Training'];

/* ── Video background ── */
function VideoBg() {
  return (
    <video
      autoPlay
      loop
      muted
      playsInline
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.18,
      }}
    >
      <source src="/assets/BG.mp4" type="video/mp4" />
    </video>
  );
}


export default function Hero() {
  const countRef = useRef<HTMLDivElement>(null);
  const [reviewCount, setReviewCount] = useState(0);
  const [avgRating, setAvgRating]     = useState<number | null>(null);

  /* live review count + average rating */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'reviews'), snap => {
      setReviewCount(snap.size);
      if (snap.size === 0) { setAvgRating(null); return; }
      const total = snap.docs.reduce((sum, d) => {
        const r = d.data().rating;
        return sum + (typeof r === 'number' ? r : 0);
      }, 0);
      setAvgRating(Math.round((total / snap.size) * 10) / 10);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    countRef.current?.querySelectorAll<HTMLElement>('[data-count]').forEach(el => {
      const target = parseInt(el.dataset.count!);
      let cur = 0;
      const step = Math.ceil(target / 60);
      const t = setInterval(() => {
        cur = Math.min(cur + step, target);
        el.textContent = cur + '+';
        if (cur >= target) clearInterval(t);
      }, 25);
    });
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden pt-14" style={{ background: 'var(--bg)' }}>

      {/* ── Video background ── */}
      <VideoBg />

      {/* ── Top marquee ticker ── */}
      <div
        className="overflow-hidden py-2.5 border-b"
        style={{ background: 'var(--orange)', borderColor: 'transparent' }}
      >
        <div className="inline-flex gap-10 whitespace-nowrap marquee-track">
          {[...SERVICES, ...SERVICES, ...SERVICES].map((s, i) => (
            <span key={i} className="inline-flex items-center gap-3 text-white text-[11px] font-semibold tracking-[1.5px]">
              <span className="opacity-60">✦</span> {s}
            </span>
          ))}
        </div>
      </div>

      {/* ── Main hero ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-5 lg:px-10 py-20 grid lg:grid-cols-[1fr_1fr] gap-10 items-center min-h-[calc(100vh-80px)]">

        {/* Left */}
        <div className="relative z-10">
          {/* Label chip */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-[2px] mb-6 hero-fade d1"
            style={{ background: 'var(--orange3)', color: 'var(--orange)', border: '1px solid var(--orange4)' }}
          >
            <span className="relative flex w-2 h-2">
              <span className="ping-dot absolute inline-flex w-full h-full rounded-full opacity-75" style={{ background: 'var(--orange)' }} />
              <span className="relative inline-flex w-2 h-2 rounded-full" style={{ background: 'var(--orange)' }} />
            </span>
            AI-POWERED PROJECT DEVELOPMENT
          </div>

          {/* Headline */}
          <h1
            className="font-grotesk font-bold leading-[1.03] tracking-tight mb-5 hero-fade d2"
            style={{ fontSize: 'clamp(40px,5.5vw,72px)', color: 'var(--text)' }}
          >
            The Team That Turns<br />
            <span style={{ color: 'var(--orange)' }}>Ideas Into Reality</span>
          </h1>

          {/* Desc */}
          <p
            className="text-base font-normal leading-relaxed max-w-md mb-8 hero-fade d3"
            style={{ color: 'var(--text3)' }}
          >
            We build hardware, software, 3D designs and more — end-to-end project development
            with expert engineers. Turn your concept into a working product.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap gap-3 mb-12 hero-fade d4">
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSeroqFJS2JF4nDOCfTm4sSG4zYFPfz_xYjAjatxEpOlajwVCw/viewform"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-white font-bold text-sm tracking-wide transition-all duration-300 hover:-translate-y-0.5 hover:opacity-95"
              style={{
                padding: '12px 28px', borderRadius: '10px',
                background: 'linear-gradient(135deg,var(--orange),var(--orange2))',
                boxShadow: '0 6px 24px rgba(249,115,22,0.3)',
              }}
            >
              GET STARTED <ArrowRight className="w-4 h-4" />
            </a>
            <Link
              to="/services"
              className="inline-flex items-center gap-2 font-semibold text-sm transition-all duration-300 hover:-translate-y-0.5"
              style={{
                padding: '12px 28px', borderRadius: '10px',
                background: 'var(--bg2)', color: 'var(--text)',
                border: '1px solid var(--border)',
                boxShadow: '0 2px 8px rgba(15,13,10,0.06)',
              }}
            >
              <Play className="w-3.5 h-3.5" style={{ fill: 'var(--orange)', color: 'var(--orange)' }} />
              WATCH DEMO
            </Link>
          </div>

          {/* Stats row */}
          <div ref={countRef} className="flex gap-8 hero-fade d5">
            {/* Projects — static count-up */}
            <div className="pr-8" style={{ borderRight: '1px solid var(--border)' }}>
              <div className="font-grotesk font-bold text-2xl leading-none" style={{ color: 'var(--text)' }} data-count={100}>0+</div>
              <div className="text-xs mt-1" style={{ color: 'var(--text3)' }}>Projects Delivered</div>
            </div>
            {/* Happy Clients — LIVE review count from Firestore */}
            <div className="pr-8" style={{ borderRight: '1px solid var(--border)' }}>
              <div className="font-grotesk font-bold text-2xl leading-none flex items-baseline gap-1" style={{ color: 'var(--text)' }}>
                {reviewCount}
                <span className="text-sm">+</span>
                <span className="w-1.5 h-1.5 rounded-full ml-1" style={{ background: '#22c55e', display: 'inline-block', animation: 'ping-dot 2s cubic-bezier(0,0,.2,1) infinite' }} />
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--text3)' }}>Happy Clients</div>
            </div>
            {/* Services — static count-up */}
            <div>
              <div className="font-grotesk font-bold text-2xl leading-none" style={{ color: 'var(--text)' }} data-count={10}>0+</div>
              <div className="text-xs mt-1" style={{ color: 'var(--text3)' }}>Services Offered</div>
            </div>
          </div>
        </div>

        {/* Right — floating UI cards like adleap */}
        <div className="hidden lg:block relative h-[520px]">

          {/* Main center card */}
          <div
            className="absolute top-12 left-16 right-0 bottom-12 rounded-2xl p-6 shadow-card-lg"
            style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
          >
            {/* Top bar */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full" style={{ background: 'linear-gradient(135deg,var(--orange),var(--orange2))' }} />
                <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>Stark InnovationZ</span>
                <span className="text-[9px] px-2 py-0.5 rounded-full font-bold" style={{ background: 'var(--orange3)', color: 'var(--orange)' }}>● LIVE</span>
              </div>
              <span className="text-[10px]" style={{ color: 'var(--text3)' }}>10+ Services</span>
            </div>

            {/* Service icon grid */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { icon: '🔧', label: 'Hardware',    bg: 'var(--orange3)' },
                { icon: '🌐', label: 'Web Dev',     bg: '#eff6ff' },
                { icon: '📱', label: 'App Dev',     bg: '#f0fdf4' },
                { icon: '🧊', label: '3D Design',   bg: '#fdf4ff' },
                { icon: '🖨️', label: '3D Print',    bg: 'var(--orange3)' },
                { icon: '📄', label: 'Docs',        bg: '#fffbeb' },
                { icon: '🛡️', label: 'Patent',      bg: '#eff6ff' },
                { icon: '🎨', label: 'Poster',      bg: '#fdf2f8' },
                { icon: '🎓', label: 'Training',    bg: '#f0fdf4' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl cursor-default transition-transform duration-200 hover:scale-105"
                  style={{ background: item.bg }}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-[9px] font-semibold text-center" style={{ color: 'var(--text2)' }}>{item.label}</span>
                </div>
              ))}
            </div>

            {/* Bottom bar */}
            <div
              className="flex items-center justify-between p-3 rounded-xl"
              style={{ background: 'var(--bg3)', border: '1px solid var(--border)' }}
            >
              <span className="text-xs" style={{ color: 'var(--text3)' }}>Projects completed</span>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-24 rounded-full overflow-hidden" style={{ background: 'var(--bg4)' }}>
                  <div className="h-full rounded-full" style={{ width: '80%', background: 'linear-gradient(90deg,var(--orange),var(--orange2))' }} />
                </div>
                <span className="text-xs font-bold" style={{ color: 'var(--orange)' }}>100+</span>
              </div>
            </div>
          </div>

          {/* Float card top-left */}
          <div
            className="absolute top-0 left-0 w-44 rounded-2xl p-4 shadow-card float-a"
            style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
          >
            <div className="text-[9px] font-bold tracking-[1.5px] mb-2" style={{ color: 'var(--text3)' }}>DELIVERY RATE</div>
            <div className="font-grotesk font-bold text-2xl mb-1" style={{ color: 'var(--text)' }}>+127%</div>
            <div className="flex gap-1">
              {[70, 85, 60, 95, 80, 100].map((h, i) => (
                <div key={i} className="flex-1 rounded-sm" style={{ height: `${h * 0.28}px`, background: i === 5 ? 'var(--orange)' : 'var(--orange4)' }} />
              ))}
            </div>
          </div>

          {/* Float card bottom-right — LIVE rating */}
          <div
            className="absolute bottom-0 right-0 w-48 rounded-2xl p-4 shadow-card float-b"
            style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-[9px] font-bold tracking-[1.5px]" style={{ color: 'var(--text3)' }}>CLIENT RATING</div>
              {/* live indicator */}
              <span className="flex items-center gap-1 text-[8px] font-bold" style={{ color: '#22c55e' }}>
                <span style={{ width:5,height:5,borderRadius:'50%',background:'#22c55e',display:'inline-block',animation:'ping-dot 2s cubic-bezier(0,0,.2,1) infinite' }}/>
                LIVE
              </span>
            </div>
            <div className="flex items-end gap-1 mb-2">
              <span className="font-grotesk font-bold text-3xl leading-none" style={{ color: 'var(--text)' }}>
                {avgRating !== null ? avgRating.toFixed(1) : '—'}
              </span>
              <span className="text-sm mb-0.5" style={{ color: 'var(--orange)' }}>★</span>
            </div>
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map((s, i) => (
                <span key={i} className="text-sm" style={{ color: 'var(--orange)' }}>{s}</span>
              ))}
            </div>
          </div>

          {/* Float card mid-left */}
          <div
            className="absolute top-52 left-0 w-36 rounded-2xl p-3.5 shadow-card float-c"
            style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <span className="w-2 h-2 rounded-full" style={{ background: 'var(--orange)' }} />
              <span className="text-[9px] font-bold" style={{ color: 'var(--text3)' }}>24/7 AVAILABLE</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: '#22c55e' }} />
              <span className="text-[9px] font-bold" style={{ color: 'var(--text3)' }}>INDIA-WIDE</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats banner — Happy Clients is LIVE review count ── */}
      <div style={{ background: 'var(--bg2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-5 lg:px-10 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {/* Projects Delivered */}
          <div className="text-center">
            <div className="font-grotesk font-bold text-2xl mb-1" style={{ color: 'var(--text)' }}>100+</div>
            <div className="text-xs" style={{ color: 'var(--text3)' }}>Projects Delivered</div>
          </div>

          {/* Happy Clients — live from Firestore reviews */}
          <div className="text-center">
            <div className="font-grotesk font-bold text-2xl mb-1 inline-flex items-center gap-1.5" style={{ color: 'var(--text)' }}>
              {reviewCount}+
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ background: '#22c55e', animation: 'ping-dot 2s cubic-bezier(0,0,.2,1) infinite' }}
              />
            </div>
            <div className="text-xs" style={{ color: 'var(--text3)' }}>Happy Clients</div>
          </div>

          {/* Service Available */}
          <div className="text-center">
            <div className="font-grotesk font-bold text-2xl mb-1" style={{ color: 'var(--text)' }}>24/7</div>
            <div className="text-xs" style={{ color: 'var(--text3)' }}>Service Available</div>
          </div>

          {/* Client Rating — LIVE avg from reviews */}
          <div className="text-center">
            <div className="font-grotesk font-bold text-2xl mb-1 inline-flex items-center gap-1" style={{ color: 'var(--text)' }}>
              {avgRating !== null ? avgRating.toFixed(1) : '—'}
              <span style={{ color: 'var(--orange)', fontSize: '18px' }}>★</span>
            </div>
            <div className="text-xs" style={{ color: 'var(--text3)' }}>Client Rating</div>
          </div>
        </div>
      </div>

      {/* ── Feature tags row ── */}
      <div className="max-w-7xl mx-auto px-5 lg:px-10 py-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: '🔍', label: 'Custom Solutions' },
            { icon: '⚡', label: 'Fast Delivery' },
            { icon: '🛡️', label: 'Quality Assured' },
            { icon: '🌐', label: 'End-to-End Service' },
          ].map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium"
              style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text2)' }}
            >
              <span>{f.icon}</span> {f.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}