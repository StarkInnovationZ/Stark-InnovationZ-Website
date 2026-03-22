import { Menu, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';

/* ── Animated running text next to logo ── */
const RUNNING_WORDS = [
  'InnovationZ',
  'Hardware',
  'InnovationZ',
  'Software',
  'InnovationZ',
  '3D Design',
  'InnovationZ',
  '3D Printing',
  'InnovationZ',
  'Training',
  'InnovationZ',
  'Solutions',
  'InnovationZ',
  'Excellence',
];

function RunningText() {
  const [idx, setIdx]         = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused]   = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (isPaused) return;

    const current = RUNNING_WORDS[idx];

    if (!isDeleting) {
      // typing
      if (displayed.length < current.length) {
        timerRef.current = setTimeout(() => {
          setDisplayed(current.slice(0, displayed.length + 1));
        }, 80);
      } else {
        // fully typed — pause then start deleting
        timerRef.current = setTimeout(() => setIsDeleting(true), 1800);
      }
    } else {
      // deleting
      if (displayed.length > 0) {
        timerRef.current = setTimeout(() => {
          setDisplayed(current.slice(0, displayed.length - 1));
        }, 40);
      } else {
        // done deleting — move to next word
        setIsDeleting(false);
        setIdx(i => (i + 1) % RUNNING_WORDS.length);
      }
    }

    return () => clearTimeout(timerRef.current);
  }, [displayed, isDeleting, idx, isPaused]);

  return (
    <span
      className="font-grotesk font-black"
      style={{
        background: 'linear-gradient(90deg,var(--orange),var(--orange2))',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        fontSize: 'inherit',
        minWidth: '120px',
        display: 'inline-block',
      }}
    >
      {displayed}
      {/* blinking cursor */}
      <span
        style={{
          display: 'inline-block',
          width: '2px',
          height: '1em',
          background: 'var(--orange)',
          marginLeft: '2px',
          verticalAlign: 'middle',
          animation: 'cursorBlink 0.9s step-end infinite',
        }}
      />
    </span>
  );
}

export default function Header() {
  const [open, setOpen]         = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const nav = [
    { path: '/',         label: 'Home' },
    { path: '/services', label: 'Services' },
    { path: '/about',    label: 'About Us' },
    { path: '/team',     label: 'Team' },
    { path: '/contact',  label: 'Contact' },
  ];

  const active = (p: string) => location.pathname === p;

  return (
    <>
      <style>{`
        @keyframes cursorBlink {
          0%,100% { opacity:1; }
          50%      { opacity:0; }
        }
        @keyframes logoSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>

      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(245,243,240,0.95)' : 'rgba(245,243,240,0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${scrolled ? 'var(--border)' : 'transparent'}`,
        }}
      >
        <div className="max-w-7xl mx-auto px-5 lg:px-10 h-14 flex items-center justify-between">

          {/* ── Logo + Animated Name ── */}
          <Link to="/" className="flex items-center gap-2.5 group">
            {/* logo image */}
            <div className="relative flex-shrink-0">
              <img
                src="/assets/Logo.png"
                alt="Stark InnovationZ"
                className="w-8 h-8 object-contain transition-all duration-500"
                style={{ filter: 'drop-shadow(0 0 6px rgba(249,115,22,0.4))' }}
                onError={e => {
                  // fallback S badge
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                  const fb = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fb) fb.style.display = 'flex';
                }}
              />
              {/* fallback */}
              <div
                className="w-8 h-8 rounded-lg items-center justify-center font-black text-white text-sm"
                style={{ display: 'none', background: 'linear-gradient(135deg,var(--orange),var(--orange2))' }}
              >S</div>
            </div>

            {/* STARK + animated word */}
            <div className="flex items-baseline gap-1.5" style={{ fontSize: '17px', lineHeight: 1 }}>
              <span
                className="font-grotesk font-black tracking-tight"
                style={{ color: 'var(--text)', letterSpacing: '-0.5px' }}
              >
                Stark
              </span>
              <RunningText />
            </div>
          </Link>

          {/* ── Desktop nav ── */}
          <nav className="hidden md:flex items-center gap-7">
            {nav.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className="relative text-xs font-semibold tracking-wide transition-colors duration-200"
                style={{ color: active(item.path) ? 'var(--orange)' : 'var(--text2)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--orange)')}
                onMouseLeave={e => (e.currentTarget.style.color = active(item.path) ? 'var(--orange)' : 'var(--text2)')}
              >
                {item.label}
                {/* active underline */}
                {active(item.path) && (
                  <span
                    className="absolute -bottom-0.5 left-0 right-0 h-0.5 rounded-full"
                    style={{ background: 'linear-gradient(90deg,var(--orange),var(--orange2))' }}
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* ── CTA + Hamburger ── */}
          <div className="flex items-center gap-3">
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSeroqFJS2JF4nDOCfTm4sSG4zYFPfz_xYjAjatxEpOlajwVCw/viewform"
              target="_blank" rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 text-white text-xs font-bold tracking-wide transition-all duration-200 hover:-translate-y-px hover:opacity-90"
              style={{
                padding: '8px 18px', borderRadius: '8px',
                background: 'linear-gradient(135deg,var(--orange),var(--orange2))',
                boxShadow: '0 4px 16px rgba(249,115,22,0.3)',
              }}
            >
              GET STARTED →
            </a>

            <button
              onClick={() => setOpen(!open)}
              className="md:hidden p-1.5 rounded-lg transition-colors"
              style={{ color: 'var(--text2)', background: open ? 'var(--bg3)' : 'transparent' }}
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile menu ── */}
      {open && (
        <div
          className="fixed top-14 left-0 right-0 z-40 px-5 py-5 shadow-card-lg"
          style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)' }}
        >
          <div className="flex flex-col gap-1">
            {nav.map(item => (
              <Link
                key={item.path} to={item.path}
                onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-200"
                style={{
                  color:      active(item.path) ? 'var(--orange)' : 'var(--text2)',
                  background: active(item.path) ? 'var(--orange3)' : 'transparent',
                }}
              >
                {item.label}
              </Link>
            ))}
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSeroqFJS2JF4nDOCfTm4sSG4zYFPfz_xYjAjatxEpOlajwVCw/viewform"
              target="_blank" rel="noopener noreferrer"
              className="mt-2 text-center text-white text-sm font-bold py-3 rounded-xl"
              style={{ background: 'linear-gradient(135deg,var(--orange),var(--orange2))' }}
            >
              GET STARTED →
            </a>
          </div>
        </div>
      )}
    </>
  );
} 