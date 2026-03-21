import { useEffect, useState, useRef } from 'react';
import { Linkedin, Instagram, Mail, X, Briefcase, GraduationCap, MapPin } from 'lucide-react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

interface TeamMember {
  name: string;
  role: string;
  image: string;
  bio: string;
  category: string;
  qualification: string;
  currentPosition: string;
  linkedin?: string;
  instagram?: string;
  email?: string;
  priority?: number;
  initial: string;
  cardGradient: string;
  placeholderBg: string;
}

const CARD_GRADIENTS = [
  'linear-gradient(to top, #f97316 0%, rgba(249,115,22,0.6) 10%, transparent 100%)',
  'linear-gradient(to top, #ec4899 0%, rgba(236,72,153,0.6) 10%, transparent 100%)',
  'linear-gradient(to top, #8b5cf6 0%, rgba(139,92,246,0.6) 10%, transparent 100%)',
  'linear-gradient(to top, #06b6d4 0%, rgba(6,182,212,0.6) 10%, transparent 100%)',
  'linear-gradient(to top, #10b981 0%, rgba(16,185,129,0.6) 10%, transparent 100%)',
  'linear-gradient(to top, #f59e0b 0%, rgba(245,158,11,0.6) 10%, transparent 100%)',
  'linear-gradient(to top, #ef4444 0%, rgba(239,68,68,0.6) 10%, transparent 100%)',
  'linear-gradient(to top, #6366f1 0%, rgba(99,102,241,0.6) 10%, transparent 100%)',
  'linear-gradient(to top, #14b8a6 0%, rgba(20,184,166,0.6) 10%, transparent 100%)',
  'linear-gradient(to top, #e11d48 0%, rgba(225,29,72,0.6)  10%, transparent 100%)',
  'linear-gradient(to top, #7c3aed 0%, rgba(124,58,237,0.6) 10%, transparent 100%)',
  'linear-gradient(to top, #0ea5e9 0%, rgba(14,165,233,0.6) 10%, transparent 100%)',
];
const PLACEHOLDER_BG = [
  'linear-gradient(160deg,#fff0e6,#fed7aa)',
  'linear-gradient(160deg,#fce7f3,#fda4af)',
  'linear-gradient(160deg,#ede9fe,#c4b5fd)',
  'linear-gradient(160deg,#cffafe,#67e8f9)',
  'linear-gradient(160deg,#dcfce7,#86efac)',
  'linear-gradient(160deg,#fef9c3,#fde047)',
  'linear-gradient(160deg,#fee2e2,#fca5a5)',
  'linear-gradient(160deg,#e0e7ff,#a5b4fc)',
  'linear-gradient(160deg,#ccfbf1,#5eead4)',
  'linear-gradient(160deg,#ffe4e6,#fda4af)',
  'linear-gradient(160deg,#f3e8ff,#d8b4fe)',
  'linear-gradient(160deg,#e0f2fe,#7dd3fc)',
];
const ACCENT_COLORS = [
  '#f97316','#ec4899','#8b5cf6','#06b6d4',
  '#10b981','#f59e0b','#ef4444','#6366f1',
  '#14b8a6','#e11d48','#7c3aed','#0ea5e9',
];

const getCardGradient  = (i: number) => CARD_GRADIENTS[i % CARD_GRADIENTS.length];
const getPlaceholderBg = (i: number) => PLACEHOLDER_BG[i % PLACEHOLDER_BG.length];
const getAccent        = (i: number) => ACCENT_COLORS[i % ACCENT_COLORS.length];

const INTRO_ANIMATIONS = [
  'introSlideUp','introSlideLeft','introSlideRight','introZoomIn',
  'introFlipY','introFlipX','introSpiral','introDrop',
];
const getIntroAnim = (i: number) => INTRO_ANIMATIONS[i % INTRO_ANIMATIONS.length];

/* ── Zoomable + Pannable Image Panel ── */
function ImagePanel({ member, accent }: { member: TeamMember; accent: string }) {
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 15 }); // default: focus top (face area)
  const [pan,    setPan]    = useState({ x: 50, y: 15 });
  const rafRef              = useRef<number>(0);
  const imgRef              = useRef<HTMLImageElement>(null);

  /* click — zoom in at cursor point, zoom out resets */
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!member.image) return;
    if (!zoomed) {
      const r  = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
      const ox = parseFloat(((e.clientX - r.left) / r.width  * 100).toFixed(1));
      const oy = parseFloat(((e.clientY - r.top)  / r.height * 100).toFixed(1));
      setOrigin({ x: ox, y: oy });
      setPan({ x: ox, y: oy });
    } else {
      setOrigin({ x: 50, y: 15 });
      setPan({ x: 50, y: 15 });
    }
    setZoomed(z => !z);
  };

  /* mouse move while zoomed — smoothly pan around face */
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!zoomed || !member.image) return;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const r  = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
      const nx = parseFloat(((e.clientX - r.left) / r.width  * 100).toFixed(1));
      const ny = parseFloat(((e.clientY - r.top)  / r.height * 100).toFixed(1));
      setPan({ x: nx, y: ny });
    });
  };

  return (
    <div
      className="relative min-h-[320px] md:min-h-[480px] overflow-hidden"
      style={{ cursor: member.image ? (zoomed ? 'zoom-out' : 'zoom-in') : 'default' }}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
    >
      {member.image ? (
        <>
          <img
            ref={imgRef}
            src={member.image}
            alt={member.name}
            className="absolute inset-0 w-full h-full object-cover object-top"
            style={{
              transition: zoomed ? 'transform-origin 0.15s ease' : 'transform 0.5s cubic-bezier(.16,1,.3,1), transform-origin 0.15s ease',
              transform: zoomed ? 'scale(2.4)' : 'scale(1)',
              transformOrigin: zoomed ? `${pan.x}% ${pan.y}%` : `${origin.x}% ${origin.y}%`,
              willChange: 'transform',
            }}
          />
          {/* zoom-in hint */}
          {!zoomed && (
            <div
              className="absolute bottom-20 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-[10px] font-bold"
              style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
              </svg>
              Tap to zoom
            </div>
          )}
          {/* zoom-out hint + move hint */}
          {zoomed && (
            <div
              className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-[10px] font-bold"
              style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                <line x1="8" y1="11" x2="14" y2="11"/>
              </svg>
              Move mouse · tap to zoom out
            </div>
          )}
        </>
      ) : (
        <div className="absolute inset-0 flex items-end justify-start" style={{ background: member.placeholderBg }}>
          <span className="font-grotesk font-black" style={{ fontSize: 160, color: 'rgba(15,13,10,0.08)', lineHeight: 1, paddingLeft: 16, paddingBottom: 48 }}>
            {member.initial}
          </span>
        </div>
      )}

      {/* gradient overlay — hidden when zoomed so face is clear */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: member.cardGradient,
          opacity: zoomed ? 0 : 1,
          transition: 'opacity 0.35s',
        }}
      />

      {/* category badge */}
      {member.category && !zoomed && (
        <div
          className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-full text-[10px] font-black tracking-[2px] text-white"
          style={{ background: `${accent}cc`, backdropFilter: 'blur(8px)' }}
        >
          {member.category.toUpperCase()}
        </div>
      )}

      {/* name + role — hidden when zoomed */}
      <div
        className="absolute bottom-0 left-0 right-0 px-6 pb-6 z-10"
        style={{ opacity: zoomed ? 0 : 1, transition: 'opacity 0.3s' }}
      >
        <h2 className="font-grotesk font-black text-white text-2xl leading-tight mb-1">{member.name}</h2>
        <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>{member.role}</p>
      </div>
    </div>
  );
}

/* ── Member Popup ── */
function MemberPopup({ member, idx, onClose }: { member: TeamMember; idx: number; onClose: () => void }) {
  const accent = getAccent(idx);

  /* close on backdrop click or Escape */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,13,10,0.65)', backdropFilter: 'blur(8px)', animation: 'backdropIn 0.25s ease' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-3xl rounded-3xl overflow-hidden"
        style={{
          background: 'var(--bg2)',
          boxShadow: '0 32px 80px rgba(15,13,10,0.35)',
          animation: 'popupIn 0.35s cubic-bezier(.16,1,.3,1)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Close btn */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
          style={{ background: 'var(--bg3)', color: 'var(--text2)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = accent; (e.currentTarget as HTMLButtonElement).style.color = '#fff'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg3)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text2)'; }}
        >
          <X className="w-4 h-4" />
        </button>

        <div className="grid md:grid-cols-2">

          {/* ── LEFT — Zoomable Photo ── */}
          <ImagePanel member={member} accent={accent} />

          {/* ── RIGHT — Info ── */}
          <div className="p-7 flex flex-col gap-5">

            {/* accent top bar */}
            <div className="h-1 w-16 rounded-full mb-1" style={{ background: accent }} />

            {/* Qualification */}
            {member.qualification && (
              <div
                className="p-4 rounded-2xl"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${accent}18` }}>
                    <GraduationCap className="w-3.5 h-3.5" style={{ color: accent }} />
                  </div>
                  <span className="text-[9px] font-black tracking-[2px]" style={{ color: 'var(--text3)' }}>QUALIFICATION</span>
                </div>
                <p className="text-sm font-semibold font-grotesk" style={{ color: 'var(--text)' }}>{member.qualification}</p>
              </div>
            )}

            {/* Current Position */}
            {member.currentPosition && (
              <div
                className="p-4 rounded-2xl"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${accent}18` }}>
                    <Briefcase className="w-3.5 h-3.5" style={{ color: accent }} />
                  </div>
                  <span className="text-[9px] font-black tracking-[2px]" style={{ color: 'var(--text3)' }}>CURRENT POSITION</span>
                </div>
                <p className="text-sm font-semibold font-grotesk" style={{ color: 'var(--text)' }}>{member.currentPosition}</p>
              </div>
            )}

            {/* Role at Stark */}
            <div
              className="p-4 rounded-2xl"
              style={{ background: `${accent}10`, border: `1px solid ${accent}28` }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${accent}18` }}>
                  <MapPin className="w-3.5 h-3.5" style={{ color: accent }} />
                </div>
                <span className="text-[9px] font-black tracking-[2px]" style={{ color: accent }}>ROLE AT STARK</span>
              </div>
              <p className="text-sm font-bold font-grotesk" style={{ color: 'var(--text)' }}>{member.role}</p>
            </div>

            {/* Bio / Description */}
            {member.bio && (
              <div>
                <div className="text-[9px] font-black tracking-[2px] mb-2" style={{ color: 'var(--text3)' }}>ABOUT</div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text2)' }}>{member.bio}</p>
              </div>
            )}

            {/* Social links */}
            <div className="flex gap-2 mt-auto pt-2">
              {member.linkedin && (
                <a href={member.linkedin} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200"
                  style={{ background: `${accent}14`, color: accent, border: `1px solid ${accent}28` }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = accent; (e.currentTarget as HTMLAnchorElement).style.color = '#fff'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = `${accent}14`; (e.currentTarget as HTMLAnchorElement).style.color = accent; }}>
                  <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                </a>
              )}
              {member.instagram && (
                <a href={member.instagram} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200"
                  style={{ background: `${accent}14`, color: accent, border: `1px solid ${accent}28` }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = accent; (e.currentTarget as HTMLAnchorElement).style.color = '#fff'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = `${accent}14`; (e.currentTarget as HTMLAnchorElement).style.color = accent; }}>
                  <Instagram className="w-3.5 h-3.5" /> Instagram
                </a>
              )}
              {member.email && (
                <a href={`mailto:${member.email}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200"
                  style={{ background: `${accent}14`, color: accent, border: `1px solid ${accent}28` }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = accent; (e.currentTarget as HTMLAnchorElement).style.color = '#fff'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = `${accent}14`; (e.currentTarget as HTMLAnchorElement).style.color = accent; }}>
                  <Mail className="w-3.5 h-3.5" /> Email
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main Team Component ── */
export default function Team() {
  const [team, setTeam]           = useState<TeamMember[]>([]);
  const [visible, setVisible]     = useState<boolean[]>([]);
  const [selected, setSelected]   = useState<number | null>(null);
  const cardRefs                  = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const q    = query(collection(db, 'members'), orderBy('Priority', 'asc'));
        const snap = await getDocs(q);
        const data: TeamMember[] = snap.docs.map((doc, idx) => {
          const d = doc.data();
          return {
            name:            d.Name             || 'Team Member',
            role:            d.Role             || 'Member',
            image:           d.Image            || '',
            bio:             d.Bio              || '',
            category:        d.Category         || '',
            qualification:   d.Qualification    || '',
            currentPosition: d.CurrentPosition  || '',
            linkedin:        d.LinkedIn         || '',
            instagram:       d.Instagram        || '',
            email:           d.Email            || '',
            priority:        d.Priority         ?? 999,
            initial:         (d.Name || 'U')[0].toUpperCase(),
            cardGradient:    getCardGradient(idx),
            placeholderBg:   getPlaceholderBg(idx),
          };
        });
        setTeam(data);
        setVisible(new Array(data.length).fill(false));
      } catch (err) {
        console.error('Error fetching team:', err);
      }
    };
    fetchTeam();
  }, []);

  useEffect(() => {
    if (team.length === 0) return;
    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const idx = parseInt((entry.target as HTMLElement).dataset.idx || '0');
            setTimeout(() => {
              setVisible(prev => { const n = [...prev]; n[idx] = true; return n; });
            }, idx * 120);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    cardRefs.current.forEach(el => { if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, [team]);

  return (
    <section className="py-20 px-5 lg:px-10" style={{ background: 'var(--bg)' }}>

      <style>{`
        @keyframes backdropIn { from{opacity:0} to{opacity:1} }
        @keyframes popupIn {
          from { opacity:0; transform:scale(0.92) translateY(20px); }
          to   { opacity:1; transform:scale(1)    translateY(0); }
        }
        @keyframes introSlideUp {
          0%{opacity:0;transform:translateY(80px) scale(0.92)} 60%{transform:translateY(-8px) scale(1.01)} 100%{opacity:1;transform:translateY(0) scale(1)}
        }
        @keyframes introSlideLeft {
          0%{opacity:0;transform:translateX(100px) rotate(4deg)} 60%{transform:translateX(-6px) rotate(-1deg)} 100%{opacity:1;transform:translateX(0) rotate(0)}
        }
        @keyframes introSlideRight {
          0%{opacity:0;transform:translateX(-100px) rotate(-4deg)} 60%{transform:translateX(6px) rotate(1deg)} 100%{opacity:1;transform:translateX(0) rotate(0)}
        }
        @keyframes introZoomIn {
          0%{opacity:0;transform:scale(0.5) rotate(-6deg)} 65%{transform:scale(1.06) rotate(2deg)} 100%{opacity:1;transform:scale(1) rotate(0)}
        }
        @keyframes introFlipY {
          0%{opacity:0;transform:perspective(600px) rotateY(90deg)} 60%{transform:perspective(600px) rotateY(-8deg)} 100%{opacity:1;transform:perspective(600px) rotateY(0)}
        }
        @keyframes introFlipX {
          0%{opacity:0;transform:perspective(600px) rotateX(90deg) translateY(40px)} 60%{transform:perspective(600px) rotateX(-8deg)} 100%{opacity:1;transform:perspective(600px) rotateX(0) translateY(0)}
        }
        @keyframes introSpiral {
          0%{opacity:0;transform:scale(0.3) rotate(-180deg)} 65%{transform:scale(1.05) rotate(8deg)} 100%{opacity:1;transform:scale(1) rotate(0)}
        }
        @keyframes introDrop {
          0%{opacity:0;transform:translateY(-120px) scaleY(0.8)} 55%{transform:translateY(12px) scaleY(1.03)} 75%{transform:translateY(-5px) scaleY(0.99)} 100%{opacity:1;transform:translateY(0) scaleY(1)}
        }
        @keyframes scanLine {
          0%{transform:translateY(-100%);opacity:0.6} 100%{transform:translateY(200%);opacity:0}
        }
        .card-scan::after {
          content:''; position:absolute; inset:0;
          background:linear-gradient(to bottom,transparent 0%,rgba(255,255,255,0.18) 50%,transparent 100%);
          height:40%; animation:scanLine 0.7s ease forwards; pointer-events:none; z-index:20;
        }
        @keyframes badgeSlide {
          from{opacity:0;transform:translateX(-16px)} to{opacity:1;transform:translateX(0)}
        }
        .team-card-cursor { cursor: pointer; }
        .team-card-cursor:hover .click-hint { opacity:1 !important; }
      `}</style>

      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-[2px] mb-4"
            style={{ background: 'var(--orange3)', color: 'var(--orange)', border: '1px solid var(--orange4)' }}>
            ◆ WHO MADE IT
          </div>
          <h2 className="font-grotesk font-black tracking-tight"
            style={{ fontSize: 'clamp(38px,5.5vw,68px)', color: 'var(--text)', letterSpacing: '-2px', lineHeight: 1.0 }}>
            MEET THE TEAM
          </h2>
          <p className="mt-3 text-sm" style={{ color: 'var(--text3)' }}>
            Click on any card to learn more about each member.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((member, i) => {
            const isVis = visible[i];
            const accent = getAccent(i);

            return (
              <div
                key={i}
                data-idx={i}
                ref={el => { cardRefs.current[i] = el; }}
                className={`team-card-cursor group relative rounded-3xl overflow-hidden select-none ${isVis ? 'card-scan' : ''}`}
                style={{
                  aspectRatio: '3 / 4',
                  boxShadow: '0 4px 20px rgba(15,13,10,0.1)',
                  opacity:   isVis ? 1 : 0,
                  animation: isVis ? `${getIntroAnim(i)} 0.85s cubic-bezier(.16,1,.3,1) forwards` : 'none',
                  transition: 'transform 0.4s cubic-bezier(.16,1,.3,1), box-shadow 0.4s',
                }}
                onClick={() => setSelected(i)}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-10px) scale(1.02)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = `0 28px 60px ${accent}33`;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0) scale(1)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(15,13,10,0.1)';
                }}
              >
                {/* Photo / Placeholder */}
                {member.image ? (
                  <img src={member.image} alt={member.name}
                    className="absolute inset-0 w-full h-full object-cover object-top"
                    style={{ transition: 'transform 0.7s cubic-bezier(.16,1,.3,1)' }} />
                ) : (
                  <div className="absolute inset-0 flex items-end justify-start" style={{ background: member.placeholderBg }}>
                    <span className="font-grotesk font-black select-none"
                      style={{ fontSize: 'clamp(100px,22vw,180px)', color: 'rgba(15,13,10,0.08)', lineHeight: 1, paddingLeft: 12, paddingBottom: 60 }}>
                      {member.initial}
                    </span>
                  </div>
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 pointer-events-none" style={{ background: member.cardGradient }} />

                {/* "Click to view" hint */}
                <div
                  className="click-hint absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-2 rounded-full text-white text-xs font-bold tracking-wide pointer-events-none"
                  style={{
                    background: 'rgba(0,0,0,0.45)',
                    backdropFilter: 'blur(8px)',
                    opacity: 0,
                    transition: 'opacity 0.25s',
                    whiteSpace: 'nowrap',
                  }}
                >
                  View Profile →
                </div>

                {/* Info block */}
                <div className="absolute bottom-0 left-0 right-0 px-5 pb-5 z-10">
                  <h3 className="font-grotesk font-bold text-white leading-snug" style={{ fontSize: 19 }}>
                    {member.name}
                  </h3>
                  <p
                    className="text-xs font-bold tracking-wider mt-0.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                    style={{
                      background: 'rgba(255,255,255,0.18)',
                      backdropFilter: 'blur(8px)',
                      color: 'rgba(255,255,255,0.92)',
                      animation: isVis ? 'badgeSlide 0.5s cubic-bezier(.16,1,.3,1) 0.45s both' : 'none',
                      opacity: isVis ? undefined : 0,
                    }}
                  >
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#fff', display: 'inline-block', opacity: 0.7 }} />
                    {member.role}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Popup */}
      {selected !== null && (
        <MemberPopup
          member={team[selected]}
          idx={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </section>
  );
}