import { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Linkedin, Instagram, Mail, X, Briefcase, GraduationCap, MapPin } from 'lucide-react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

interface TeamMember {
  name: string; role: string; image: string; bio: string;
  category: string; qualification: string; currentPosition: string;
  linkedin?: string; instagram?: string; email?: string;
  priority?: number; initial: string; placeholderBg: string; cardGradient: string;
}

const ACCENT_COLORS = ['#f97316','#ec4899','#8b5cf6','#06b6d4','#10b981','#f59e0b','#ef4444','#6366f1','#14b8a6','#e11d48','#7c3aed','#0ea5e9'];
const PLACEHOLDER_BG = ['linear-gradient(160deg,#fff0e6,#fed7aa)','linear-gradient(160deg,#fce7f3,#fda4af)','linear-gradient(160deg,#ede9fe,#c4b5fd)','linear-gradient(160deg,#cffafe,#67e8f9)','linear-gradient(160deg,#dcfce7,#86efac)','linear-gradient(160deg,#fef9c3,#fde047)','linear-gradient(160deg,#fee2e2,#fca5a5)','linear-gradient(160deg,#e0e7ff,#a5b4fc)','linear-gradient(160deg,#ccfbf1,#5eead4)','linear-gradient(160deg,#ffe4e6,#fda4af)','linear-gradient(160deg,#f3e8ff,#d8b4fe)','linear-gradient(160deg,#e0f2fe,#7dd3fc)'];
const CARD_GRADIENTS = ['linear-gradient(to top,#f97316 0%,rgba(249,115,22,0.5) 30%,transparent 100%)','linear-gradient(to top,#ec4899 0%,rgba(236,72,153,0.5) 30%,transparent 100%)','linear-gradient(to top,#8b5cf6 0%,rgba(139,92,246,0.5) 30%,transparent 100%)','linear-gradient(to top,#06b6d4 0%,rgba(6,182,212,0.5) 30%,transparent 100%)','linear-gradient(to top,#10b981 0%,rgba(16,185,129,0.5) 30%,transparent 100%)','linear-gradient(to top,#f59e0b 0%,rgba(245,158,11,0.5) 30%,transparent 100%)','linear-gradient(to top,#ef4444 0%,rgba(239,68,68,0.5) 30%,transparent 100%)','linear-gradient(to top,#6366f1 0%,rgba(99,102,241,0.5) 30%,transparent 100%)','linear-gradient(to top,#14b8a6 0%,rgba(20,184,166,0.5) 30%,transparent 100%)','linear-gradient(to top,#e11d48 0%,rgba(225,29,72,0.5) 30%,transparent 100%)','linear-gradient(to top,#7c3aed 0%,rgba(124,58,237,0.5) 30%,transparent 100%)','linear-gradient(to top,#0ea5e9 0%,rgba(14,165,233,0.5) 30%,transparent 100%)'];

const getAccent = (i: number) => ACCENT_COLORS[i % ACCENT_COLORS.length];
const getPlaceholderBg = (i: number) => PLACEHOLDER_BG[i % PLACEHOLDER_BG.length];
const getCardGradient = (i: number) => CARD_GRADIENTS[i % CARD_GRADIENTS.length];

/* generate well-spread positions using zone grid avoiding center */
function generatePositions(count: number, W: number, H: number, centerW: number, centerH: number): { x: number; y: number }[] {
  const nodeR  = 60;
  const pad    = nodeR + 10;
  const cx     = W / 2, cy = H / 2;
  const cw     = centerW / 2 + 60, ch = centerH / 2 + 60;
  const minDist = nodeR * 2.5; // minimum distance between nodes

  // Divide scene into zones and place one node per zone
  // Zone grid: 4 cols × 3 rows = 12 zones
  const COLS = 4, ROWS = 3;
  const zoneW = W / COLS, zoneH = H / ROWS;

  // Shuffle zone indices
  const zoneIndices = Array.from({ length: COLS * ROWS }, (_, i) => i)
    .sort(() => Math.random() - 0.5);

  const positions: { x: number; y: number }[] = [];

  for (let i = 0; i < count; i++) {
    let placed = false;

    // Try zones in shuffled order
    for (const zi of zoneIndices) {
      if (positions.length > zi && positions.some((_, k) => k === zi)) continue;
      const col = zi % COLS;
      const row = Math.floor(zi / COLS);

      // Random point within zone with padding
      const x = pad + col * zoneW + Math.random() * Math.max(0, zoneW - pad * 2);
      const y = pad + row * zoneH + Math.random() * Math.max(0, zoneH - pad * 2);

      // Clamp to bounds
      const bx = Math.max(pad, Math.min(W - pad, x));
      const by = Math.max(pad, Math.min(H - pad, y));

      // Avoid center
      const inCenter = Math.abs(bx - cx) < cw && Math.abs(by - cy) < ch;
      // Avoid overlap
      const overlaps = positions.some(p => Math.hypot(p.x - bx, p.y - by) < minDist);

      if (!inCenter && !overlaps) {
        positions.push({ x: bx, y: by });
        placed = true;
        break;
      }
    }

    // Fallback: try completely random with high min-distance
    if (!placed) {
      for (let t = 0; t < 500; t++) {
        const bx = pad + Math.random() * (W - pad * 2);
        const by = pad + Math.random() * (H - pad * 2);
        const inCenter = Math.abs(bx - cx) < cw && Math.abs(by - cy) < ch;
        const overlaps = positions.some(p => Math.hypot(p.x - bx, p.y - by) < minDist);
        if (!inCenter && !overlaps) {
          positions.push({ x: bx, y: by });
          placed = true;
          break;
        }
      }
    }

    if (!placed) {
      // Last resort — place anywhere not center
      positions.push({ x: pad + Math.random() * (W * 0.3), y: pad + Math.random() * (H - pad * 2) });
    }
  }
  return positions;
}

/* ── Zoomable Image Panel ── */
function ImagePanel({ member, accent }: { member: TeamMember; accent: string }) {
  const [zoomed, setZoomed] = useState(false);
  const [pan, setPan] = useState({ x: 50, y: 15 });
  const [origin, setOrigin] = useState({ x: 50, y: 15 });
  const rafRef = useRef<number>(0);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!member.image) return;
    if (!zoomed) {
      const r = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
      const ox = parseFloat(((e.clientX - r.left) / r.width * 100).toFixed(1));
      const oy = parseFloat(((e.clientY - r.top) / r.height * 100).toFixed(1));
      setOrigin({ x: ox, y: oy }); setPan({ x: ox, y: oy });
    } else { setOrigin({ x: 50, y: 15 }); setPan({ x: 50, y: 15 }); }
    setZoomed(z => !z);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!zoomed || !member.image) return;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const r = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
      setPan({ x: parseFloat(((e.clientX - r.left) / r.width * 100).toFixed(1)), y: parseFloat(((e.clientY - r.top) / r.height * 100).toFixed(1)) });
    });
  };

  return (
    <div className="relative min-h-[300px] md:min-h-[440px] overflow-hidden"
      style={{ cursor: member.image ? (zoomed ? 'zoom-out' : 'zoom-in') : 'default' }}
      onClick={handleClick} onMouseMove={handleMouseMove}>
      {member.image ? (
        <>
          <img src={member.image} alt={member.name}
            className="absolute inset-0 w-full h-full object-cover object-top"
            style={{ transition: zoomed ? 'transform-origin 0.15s ease' : 'transform 0.5s cubic-bezier(.16,1,.3,1)',
              transform: zoomed ? 'scale(2.4)' : 'scale(1)',
              transformOrigin: zoomed ? `${pan.x}% ${pan.y}%` : `${origin.x}% ${origin.y}%` }} />
          {!zoomed && <div className="absolute bottom-20 right-3 z-20 flex items-center gap-1 px-2.5 py-1 rounded-full text-white text-[9px] font-bold" style={{ background:'rgba(0,0,0,0.5)', backdropFilter:'blur(8px)' }}>🔍 Tap to zoom</div>}
          {zoomed && <div className="absolute top-3 right-3 z-20 px-2.5 py-1 rounded-full text-white text-[9px] font-bold" style={{ background:'rgba(0,0,0,0.6)', backdropFilter:'blur(8px)' }}>Move · tap out</div>}
        </>
      ) : (
        <div className="absolute inset-0 flex items-end justify-start" style={{ background: member.placeholderBg }}>
          <span className="font-grotesk font-black" style={{ fontSize:140, color:'rgba(15,13,10,0.08)', lineHeight:1, paddingLeft:12, paddingBottom:40 }}>{member.initial}</span>
        </div>
      )}
      <div className="absolute inset-0 pointer-events-none" style={{ background: member.cardGradient, opacity: zoomed ? 0 : 1, transition: 'opacity 0.35s' }} />
      {member.category && !zoomed && <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full text-[9px] font-black tracking-[2px] text-white" style={{ background:`${accent}cc`, backdropFilter:'blur(8px)' }}>{member.category.toUpperCase()}</div>}
      <div className="absolute bottom-0 left-0 right-0 px-5 pb-5 z-10" style={{ opacity: zoomed ? 0 : 1, transition: 'opacity 0.3s' }}>
        <h2 className="font-grotesk font-black text-white text-xl leading-tight mb-1">{member.name}</h2>
        <p className="text-sm font-medium" style={{ color:'rgba(255,255,255,0.85)' }}>{member.role}</p>
      </div>
    </div>
  );
}

/* ── Popup ── */
function MemberPopup({ member, idx, onClose }: { member: TeamMember; idx: number; onClose: () => void }) {
  const accent = getAccent(idx);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);

  const modal = (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position:'fixed',top:0,left:0,width:'100%',height:'100%',zIndex:99999,
        display:'flex',alignItems:'center',justifyContent:'center',
        background:'rgba(15,13,10,0.75)',backdropFilter:'blur(10px)',
        WebkitBackdropFilter:'blur(10px)',animation:'backdropIn 0.25s ease',
        padding:'20px',boxSizing:'border-box' as const }}>
      <div onClick={e => e.stopPropagation()}
        style={{ position:'relative',width:'100%',maxWidth:'740px',borderRadius:'24px',
          overflow:'hidden',background:'var(--bg2)',boxShadow:'0 32px 80px rgba(15,13,10,0.5)',
          animation:'popupIn 0.35s cubic-bezier(.16,1,.3,1)',maxHeight:'85vh',overflowY:'auto' }}>
        <button onClick={onClose} className="absolute top-4 right-4 z-20 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
          style={{ background:'var(--bg3)',color:'var(--text2)' }}
          onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.background=accent;(e.currentTarget as HTMLButtonElement).style.color='#fff';}}
          onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.background='var(--bg3)';(e.currentTarget as HTMLButtonElement).style.color='var(--text2)';}}><X className="w-4 h-4"/></button>
        <div className="grid md:grid-cols-2">
          <ImagePanel member={member} accent={accent}/>
          <div className="p-7 flex flex-col gap-4">
            <div className="h-1 w-16 rounded-full" style={{ background:accent }}/>
            {member.qualification && <div className="p-4 rounded-2xl" style={{ background:'var(--bg)',border:'1px solid var(--border)' }}><div className="flex items-center gap-2 mb-2"><div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background:`${accent}18` }}><GraduationCap className="w-3.5 h-3.5" style={{ color:accent }}/></div><span className="text-[9px] font-black tracking-[2px]" style={{ color:'var(--text3)' }}>QUALIFICATION</span></div><p className="text-sm font-semibold font-grotesk" style={{ color:'var(--text)' }}>{member.qualification}</p></div>}
            {member.currentPosition && <div className="p-4 rounded-2xl" style={{ background:'var(--bg)',border:'1px solid var(--border)' }}><div className="flex items-center gap-2 mb-2"><div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background:`${accent}18` }}><Briefcase className="w-3.5 h-3.5" style={{ color:accent }}/></div><span className="text-[9px] font-black tracking-[2px]" style={{ color:'var(--text3)' }}>CURRENT POSITION</span></div><p className="text-sm font-semibold font-grotesk" style={{ color:'var(--text)' }}>{member.currentPosition}</p></div>}
            <div className="p-4 rounded-2xl" style={{ background:`${accent}10`,border:`1px solid ${accent}28` }}><div className="flex items-center gap-2 mb-2"><div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background:`${accent}18` }}><MapPin className="w-3.5 h-3.5" style={{ color:accent }}/></div><span className="text-[9px] font-black tracking-[2px]" style={{ color:accent }}>ROLE AT STARK</span></div><p className="text-sm font-bold font-grotesk" style={{ color:'var(--text)' }}>{member.role}</p></div>
            {member.bio && <div><div className="text-[9px] font-black tracking-[2px] mb-2" style={{ color:'var(--text3)' }}>ABOUT</div><p className="text-sm leading-relaxed" style={{ color:'var(--text2)' }}>{member.bio}</p></div>}
            <div className="flex gap-2 mt-auto pt-1 flex-wrap">
              {member.linkedin && <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200" style={{ background:`${accent}14`,color:accent,border:`1px solid ${accent}28` }} onMouseEnter={e=>{(e.currentTarget as HTMLAnchorElement).style.background=accent;(e.currentTarget as HTMLAnchorElement).style.color='#fff';}} onMouseLeave={e=>{(e.currentTarget as HTMLAnchorElement).style.background=`${accent}14`;(e.currentTarget as HTMLAnchorElement).style.color=accent;}}><Linkedin className="w-3.5 h-3.5"/>LinkedIn</a>}
              {member.instagram && <a href={member.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200" style={{ background:`${accent}14`,color:accent,border:`1px solid ${accent}28` }} onMouseEnter={e=>{(e.currentTarget as HTMLAnchorElement).style.background=accent;(e.currentTarget as HTMLAnchorElement).style.color='#fff';}} onMouseLeave={e=>{(e.currentTarget as HTMLAnchorElement).style.background=`${accent}14`;(e.currentTarget as HTMLAnchorElement).style.color=accent;}}><Instagram className="w-3.5 h-3.5"/>Instagram</a>}
              {member.email && <a href={`mailto:${member.email}`} className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200" style={{ background:`${accent}14`,color:accent,border:`1px solid ${accent}28` }} onMouseEnter={e=>{(e.currentTarget as HTMLAnchorElement).style.background=accent;(e.currentTarget as HTMLAnchorElement).style.color='#fff';}} onMouseLeave={e=>{(e.currentTarget as HTMLAnchorElement).style.background=`${accent}14`;(e.currentTarget as HTMLAnchorElement).style.color=accent;}}><Mail className="w-3.5 h-3.5"/>Email</a>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  return createPortal(modal, document.body);
}

/* ── Main ── */
export default function Team() {
  const [team, setTeam]         = useState<TeamMember[]>([]);
  const [active, setActive]     = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [positions, setPositions] = useState<{ x: number; y: number }[]>([]);
  const [floatOffsets, setFloatOffsets] = useState<{ x: number; y: number; dur: number }[]>([]);
  const sceneRef = useRef<HTMLDivElement>(null);

  const SCENE_W = 1100;
  const SCENE_H = 680;
  const CENTER_W = 280;
  const CENTER_H = 400;

  useEffect(() => {
    getDocs(query(collection(db, 'members'), orderBy('Priority', 'asc'))).then(snap => {
      const data: TeamMember[] = snap.docs.map((doc, idx) => {
        const d = doc.data();
        return {
          name: d.Name||'Team Member', role: d.Role||'Member', image: d.Image||'',
          bio: d.Bio||'', category: d.Category||'', qualification: d.Qualification||'',
          currentPosition: d.CurrentPosition||'', linkedin: d.LinkedIn||'',
          instagram: d.Instagram||'', email: d.Email||'', priority: d.Priority??999,
          initial: (d.Name||'U')[0].toUpperCase(),
          placeholderBg: getPlaceholderBg(idx), cardGradient: getCardGradient(idx),
        };
      });
      setTeam(data);
      // generate random positions
      const pos = generatePositions(data.length, SCENE_W, SCENE_H, CENTER_W, CENTER_H);
      setPositions(pos);
      // random float animation offsets per node
      setFloatOffsets(data.map(() => ({
        x: (Math.random() - 0.5) * 16,
        y: (Math.random() - 0.5) * 16,
        dur: 3 + Math.random() * 3,
      })));
    });
  }, []);

  const handleBgClick = () => setActive(null);
  const handleNodeClick = (e: React.MouseEvent, i: number) => {
    e.stopPropagation();
    setActive(prev => prev === i ? null : i);
  };

  const activeMember = active !== null ? team[active] : null;
  const activeAccent = active !== null ? getAccent(active) : 'var(--orange)';

  return (
    <section className="py-20 overflow-hidden" style={{ background:'var(--bg)', width:'100%' }}>
      <style>{`
        @keyframes backdropIn{from{opacity:0}to{opacity:1}}
        @keyframes popupIn{from{opacity:0;transform:scale(0.92) translateY(20px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes centerPop{from{opacity:0;transform:scale(0.88)}to{opacity:1;transform:scale(1)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes nodeFadeIn{from{opacity:0;transform:scale(0.6)}to{opacity:1;transform:scale(1)}}
        @keyframes pulsGlow{0%,100%{opacity:0.4;transform:scale(1)}50%{opacity:0.8;transform:scale(1.08)}}
        @keyframes logoFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        @keyframes connLine{from{stroke-dashoffset:200}to{stroke-dashoffset:0}}
      `}</style>

      {/* Header */}
      <div className="text-center mb-12 px-5" style={{ animation:'fadeUp 0.7s ease both' }}>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-[2px] mb-4"
          style={{ background:'var(--orange3)',color:'var(--orange)',border:'1px solid var(--orange4)' }}>◆ WHO MADE IT</div>
        <h2 className="font-grotesk font-black tracking-tight"
          style={{ fontSize:'clamp(36px,5.5vw,64px)',color:'var(--text)',letterSpacing:'-2px',lineHeight:1 }}>MEET THE TEAM</h2>
        <p className="mt-2 text-sm" style={{ color:'var(--text3)' }}>Click any member · click background to reset</p>
      </div>

      {/* ── Scene ── */}
      <div ref={sceneRef}
        style={{ position:'relative', width:`${SCENE_W}px`, height:`${SCENE_H}px`,
          margin:'0 auto', maxWidth:'100%', cursor: active !== null ? 'pointer' : 'default' }}
        onClick={handleBgClick}>

        {/* SVG connection lines from active member to others */}
        {active !== null && positions[active] && (
          <svg style={{ position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none',zIndex:1 }}>
            {positions.map((pos, i) => {
              if (i === active) return null;
              const ax = positions[active].x, ay = positions[active].y;
              return (
                <line key={i} x1={SCENE_W/2} y1={SCENE_H/2} x2={pos.x} y2={pos.y}
                  stroke={getAccent(i)} strokeWidth="1" strokeDasharray="4 5" opacity="0.25"
                  style={{ animation:`connLine 0.6s ease ${i*0.05}s both` }} />
              );
            })}
          </svg>
        )}

        {/* ── CENTER — logo or member info ── */}
        <div style={{ position:'absolute', left:'50%', top:'50%',
          transform:'translate(-50%,-50%)', zIndex:10,
          width: CENTER_W, textAlign:'center' }}
          onClick={e => e.stopPropagation()}>

          {/* LOGO default */}
          {active === null && (
            <div style={{ animation:'centerPop 0.5s cubic-bezier(.16,1,.3,1)' }}>
              <div style={{ position:'relative',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:14 }}>
                <div style={{ position:'absolute',width:160,height:160,borderRadius:'50%',border:'1.5px dashed rgba(249,115,22,0.18)',animation:'pulsGlow 3s ease-in-out infinite' }}/>
                <div style={{ position:'absolute',width:125,height:125,borderRadius:'50%',border:'1px solid rgba(249,115,22,0.1)',animation:'pulsGlow 3s ease-in-out infinite 1s' }}/>
                <div style={{ position:'relative',width:96,height:96,borderRadius:22,
                  background:'linear-gradient(135deg,#fff8f3,#fff)',
                  boxShadow:'0 6px 32px rgba(249,115,22,0.16),0 0 0 1.5px rgba(249,115,22,0.1)',
                  display:'flex',alignItems:'center',justifyContent:'center',
                  animation:'logoFloat 3s ease-in-out infinite' }}>
                  <img src="/assets/Logo.png" alt="Stark InnovationZ" style={{ width:60,height:60,objectFit:'contain' }}
                    onError={e=>{(e.currentTarget as HTMLImageElement).style.display='none';const fb=e.currentTarget.nextElementSibling as HTMLElement;if(fb)fb.style.display='flex';}}/>
                  <span style={{ display:'none',alignItems:'center',justifyContent:'center',width:60,height:60,fontFamily:'Syne,sans-serif',fontWeight:900,fontSize:32,color:'var(--orange)' }}>S</span>
                </div>
              </div>
              <div style={{ fontFamily:'Space Grotesk,sans-serif',fontWeight:800,fontSize:15,color:'var(--text)',marginBottom:4 }}>Stark InnovationZ</div>
              <div style={{ fontSize:9,letterSpacing:'2px',fontWeight:700,color:'var(--orange)',marginBottom:6 }}>INNOVATE · BUILD · DELIVER</div>
              <div style={{ fontSize:10,color:'var(--text3)' }}>Click a member to explore</div>
            </div>
          )}

          {/* MEMBER info */}
          {active !== null && activeMember && (
            <div key={active} style={{ animation:'centerPop 0.4s cubic-bezier(.16,1,.3,1)' }}>
              {/* photo */}
              <div style={{ position:'relative',marginBottom:10,display:'inline-block' }}>
                <div style={{ position:'absolute',inset:-6,borderRadius:18,border:`2px solid ${activeAccent}`,opacity:0.45,animation:'pulsGlow 2s ease-in-out infinite' }}/>
                <div style={{ width:160,height:195,borderRadius:16,overflow:'hidden',cursor:'pointer',
                  boxShadow:`0 8px 36px ${activeAccent}44` }}
                  onClick={() => setSelected(active)}>
                  {activeMember.image
                    ? <img src={activeMember.image} alt={activeMember.name} style={{ width:'100%',height:'100%',objectFit:'cover',objectPosition:'top' }}/>
                    : <div style={{ width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',background:activeMember.placeholderBg,fontFamily:'Space Grotesk,sans-serif',fontWeight:900,fontSize:56,color:'rgba(15,13,10,0.15)' }}>{activeMember.initial}</div>
                  }
                </div>
              </div>
              {/* name */}
              <div style={{ fontFamily:'Space Grotesk,sans-serif',fontWeight:800,fontSize:16,color:'var(--text)',marginBottom:4,lineHeight:1.2 }}>{activeMember.name}</div>
              {/* role pill */}
              <div style={{ display:'inline-block',padding:'5px 12px',borderRadius:100,fontSize:10,fontWeight:700,letterSpacing:'0.5px',marginBottom:8,
                background:`${activeAccent}14`,color:activeAccent }}>{activeMember.role}</div>
              {/* socials */}
              <div style={{ display:'flex',gap:6,justifyContent:'center',marginBottom:10 }}>
                {activeMember.linkedin && <a href={activeMember.linkedin} target="_blank" rel="noopener noreferrer" style={{ width:30,height:30,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',background:`${activeAccent}14`,color:activeAccent,border:`1px solid ${activeAccent}28`,transition:'all 0.2s' }} onMouseEnter={e=>{(e.currentTarget as HTMLAnchorElement).style.background=activeAccent;(e.currentTarget as HTMLAnchorElement).style.color='#fff';}} onMouseLeave={e=>{(e.currentTarget as HTMLAnchorElement).style.background=`${activeAccent}14`;(e.currentTarget as HTMLAnchorElement).style.color=activeAccent;}}><Linkedin style={{ width:13,height:13 }}/></a>}
                {activeMember.instagram && <a href={activeMember.instagram} target="_blank" rel="noopener noreferrer" style={{ width:30,height:30,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',background:`${activeAccent}14`,color:activeAccent,border:`1px solid ${activeAccent}28`,transition:'all 0.2s' }} onMouseEnter={e=>{(e.currentTarget as HTMLAnchorElement).style.background=activeAccent;(e.currentTarget as HTMLAnchorElement).style.color='#fff';}} onMouseLeave={e=>{(e.currentTarget as HTMLAnchorElement).style.background=`${activeAccent}14`;(e.currentTarget as HTMLAnchorElement).style.color=activeAccent;}}><Instagram style={{ width:13,height:13 }}/></a>}
                {activeMember.email && <a href={`mailto:${activeMember.email}`} style={{ width:30,height:30,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',background:`${activeAccent}14`,color:activeAccent,border:`1px solid ${activeAccent}28`,transition:'all 0.2s' }} onMouseEnter={e=>{(e.currentTarget as HTMLAnchorElement).style.background=activeAccent;(e.currentTarget as HTMLAnchorElement).style.color='#fff';}} onMouseLeave={e=>{(e.currentTarget as HTMLAnchorElement).style.background=`${activeAccent}14`;(e.currentTarget as HTMLAnchorElement).style.color=activeAccent;}}><Mail style={{ width:13,height:13 }}/></a>}
              </div>
              {/* view profile btn */}
              <button onClick={() => setSelected(active)}
                style={{ padding:'7px 20px',borderRadius:100,border:'none',cursor:'pointer',fontSize:11,fontWeight:700,color:'#fff',
                  background:`linear-gradient(135deg,${activeAccent},${activeAccent}bb)`,
                  boxShadow:`0 4px 16px ${activeAccent}44`,transition:'transform 0.2s' }}
                onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.transform='scale(1.05)'}
                onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.transform='scale(1)'}>
                View Profile →
              </button>
            </div>
          )}
        </div>

        {/* ── FLOATING MEMBER NODES ── */}
        {team.map((member, i) => {
          const pos = positions[i];
          if (!pos) return null;
          const isAct = active === i;
          const accent = getAccent(i);
          const fo = floatOffsets[i] || { x: 0, y: 0, dur: 4 };
          const floatAnim = `floatNode${i}`;

          return (
            <div key={i}>
              <style>{`
                @keyframes ${floatAnim} {
                  0%,100%{transform:translate(0,0)}
                  50%{transform:translate(${fo.x}px,${fo.y}px)}
                }
              `}</style>
              <div
                onClick={e => handleNodeClick(e, i)}
                style={{
                  position:'absolute',
                  left: pos.x - 60, top: pos.y - 60,
                  width:120, height:120,
                  zIndex: isAct ? 15 : 5,
                  cursor:'pointer',
                  animation: isAct
                    ? 'none'
                    : `${floatAnim} ${fo.dur}s ease-in-out infinite, nodeFadeIn 0.5s ${i*0.06}s ease both`,
                  transition:'transform 0.35s cubic-bezier(.16,1,.3,1)',
                  transform: isAct ? 'scale(1.18)' : 'scale(1)',
                }}
                onMouseEnter={e => { if (!isAct) (e.currentTarget as HTMLDivElement).style.transform='scale(1.12)'; }}
                onMouseLeave={e => { if (!isAct) (e.currentTarget as HTMLDivElement).style.transform='scale(1)'; }}
              >
                {/* ring */}
                <div style={{ position:'absolute',inset:0,borderRadius:'50%',
                  border:`2.5px solid ${isAct ? accent : 'rgba(15,13,10,0.1)'}`,
                  boxShadow: isAct ? `0 0 20px ${accent}55` : 'none',
                  transition:'border-color 0.4s,box-shadow 0.4s' }}/>
                {/* photo */}
                <div style={{ position:'absolute',inset:4,borderRadius:'50%',overflow:'hidden',
                  filter: isAct ? 'none' : 'grayscale(35%) brightness(0.88)',
                  transition:'filter 0.4s' }}>
                  {member.image
                    ? <img src={member.image} alt={member.name} style={{ width:'100%',height:'100%',objectFit:'cover',objectPosition:'top' }}/>
                    : <div style={{ width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',background:member.placeholderBg,fontFamily:'Space Grotesk,sans-serif',fontWeight:900,fontSize:22,color:'rgba(15,13,10,0.18)' }}>{member.initial}</div>
                  }
                </div>
                {/* name label */}
                <div style={{ position:'absolute',left:'50%',transform:'translateX(-50%)',
                  top: pos.y < SCENE_H / 2 ? '100%' : 'auto',
                  bottom: pos.y >= SCENE_H / 2 ? '100%' : 'auto',
                  marginTop: pos.y < SCENE_H / 2 ? 6 : 0,
                  marginBottom: pos.y >= SCENE_H / 2 ? 6 : 0,
                  whiteSpace:'nowrap',fontSize:10,fontWeight:700,
                  color: isAct ? accent : 'var(--text3)',
                  transition:'color 0.3s' }}>
                  {member.name.split(' ')[0]}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Popup */}
      {selected !== null && (
        <MemberPopup member={team[selected]} idx={selected} onClose={() => setSelected(null)}/>
      )}
    </section>
  );
}