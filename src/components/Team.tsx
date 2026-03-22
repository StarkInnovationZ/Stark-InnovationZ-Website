import { useEffect, useState, useRef } from 'react';
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

const ACCENT = ['#f97316','#ec4899','#8b5cf6','#06b6d4','#10b981','#f59e0b','#ef4444','#6366f1','#14b8a6','#e11d48','#7c3aed','#0ea5e9'];
const PBG    = ['linear-gradient(160deg,#fff0e6,#fed7aa)','linear-gradient(160deg,#fce7f3,#fda4af)','linear-gradient(160deg,#ede9fe,#c4b5fd)','linear-gradient(160deg,#cffafe,#67e8f9)','linear-gradient(160deg,#dcfce7,#86efac)','linear-gradient(160deg,#fef9c3,#fde047)','linear-gradient(160deg,#fee2e2,#fca5a5)','linear-gradient(160deg,#e0e7ff,#a5b4fc)','linear-gradient(160deg,#ccfbf1,#5eead4)','linear-gradient(160deg,#ffe4e6,#fda4af)','linear-gradient(160deg,#f3e8ff,#d8b4fe)','linear-gradient(160deg,#e0f2fe,#7dd3fc)'];
const CG     = ['linear-gradient(to top,#f97316 0%,rgba(249,115,22,0.5) 30%,transparent 100%)','linear-gradient(to top,#ec4899 0%,rgba(236,72,153,0.5) 30%,transparent 100%)','linear-gradient(to top,#8b5cf6 0%,rgba(139,92,246,0.5) 30%,transparent 100%)','linear-gradient(to top,#06b6d4 0%,rgba(6,182,212,0.5) 30%,transparent 100%)','linear-gradient(to top,#10b981 0%,rgba(16,185,129,0.5) 30%,transparent 100%)','linear-gradient(to top,#f59e0b 0%,rgba(245,158,11,0.5) 30%,transparent 100%)','linear-gradient(to top,#ef4444 0%,rgba(239,68,68,0.5) 30%,transparent 100%)','linear-gradient(to top,#6366f1 0%,rgba(99,102,241,0.5) 30%,transparent 100%)'];

const ac  = (i:number) => ACCENT[i%ACCENT.length];
const pbg = (i:number) => PBG[i%PBG.length];
const cg  = (i:number) => CG[i%CG.length];

/* spread positions in a zone grid — avoid center box */
function genPositions(count:number, W:number, H:number, cx:number, cy:number, cw:number, ch:number, nodeR:number) {
  const pad = nodeR + 8;
  const minD = nodeR * 2.6;
  const COLS = Math.ceil(Math.sqrt(count * (W/H)));
  const ROWS = Math.ceil(count / COLS);
  const zW = W / COLS, zH = H / ROWS;
  const zones = Array.from({length:COLS*ROWS},(_,i)=>i).sort(()=>Math.random()-0.5);
  const pos: {x:number;y:number}[] = [];

  for (let i = 0; i < count; i++) {
    let placed = false;
    for (const zi of zones) {
      if (pos[zi]) continue;
      const col = zi%COLS, row = Math.floor(zi/COLS);
      const x = Math.max(pad, Math.min(W-pad, pad + col*zW + Math.random()*Math.max(0,zW-pad*2)));
      const y = Math.max(pad, Math.min(H-pad, pad + row*zH + Math.random()*Math.max(0,zH-pad*2)));
      const inC = Math.abs(x-cx)<cw && Math.abs(y-cy)<ch;
      const ovlp = pos.some(p=>Math.hypot(p.x-x,p.y-y)<minD);
      if (!inC && !ovlp) { pos.push({x,y}); placed=true; break; }
    }
    if (!placed) {
      for (let t=0;t<400;t++) {
        const x=pad+Math.random()*(W-pad*2), y=pad+Math.random()*(H-pad*2);
        if (!(Math.abs(x-cx)<cw && Math.abs(y-cy)<ch) && !pos.some(p=>Math.hypot(p.x-x,p.y-y)<minD)) {
          pos.push({x,y}); placed=true; break;
        }
      }
    }
    if (!placed) pos.push({x:pad+Math.random()*(W*0.25), y:pad+Math.random()*(H-pad*2)});
  }
  return pos;
}

/* ── Image Panel (popup left) ── */
function ImagePanel({member,accent}:{member:TeamMember;accent:string}) {
  const [zoomed,setZoomed]=useState(false);
  const [pan,setPan]=useState({x:50,y:15});
  const [origin,setOrigin]=useState({x:50,y:15});
  const raf=useRef<number>(0);
  const click=(e:React.MouseEvent<HTMLDivElement>)=>{
    if(!member.image)return;
    if(!zoomed){const r=(e.currentTarget as HTMLDivElement).getBoundingClientRect();setOrigin({x:parseFloat(((e.clientX-r.left)/r.width*100).toFixed(1)),y:parseFloat(((e.clientY-r.top)/r.height*100).toFixed(1))});setPan({x:parseFloat(((e.clientX-r.left)/r.width*100).toFixed(1)),y:parseFloat(((e.clientY-r.top)/r.height*100).toFixed(1))});}
    else{setOrigin({x:50,y:15});setPan({x:50,y:15});}
    setZoomed(z=>!z);
  };
  const move=(e:React.MouseEvent<HTMLDivElement>)=>{
    if(!zoomed||!member.image)return;
    cancelAnimationFrame(raf.current);
    raf.current=requestAnimationFrame(()=>{const r=(e.currentTarget as HTMLDivElement).getBoundingClientRect();setPan({x:parseFloat(((e.clientX-r.left)/r.width*100).toFixed(1)),y:parseFloat(((e.clientY-r.top)/r.height*100).toFixed(1))});});
  };
  return(
    <div className="relative overflow-hidden" style={{minHeight:280,cursor:member.image?(zoomed?'zoom-out':'zoom-in'):'default'}} onClick={click} onMouseMove={move}>
      {member.image?<>
        <img src={member.image} alt={member.name} className="absolute inset-0 w-full h-full object-cover object-top"
          style={{transition:zoomed?'transform-origin 0.15s':'transform 0.5s cubic-bezier(.16,1,.3,1)',transform:zoomed?'scale(2.4)':'scale(1)',transformOrigin:zoomed?`${pan.x}% ${pan.y}%`:`${origin.x}% ${origin.y}%`}}/>
        {!zoomed&&<div className="absolute bottom-14 right-3 z-20 px-2.5 py-1 rounded-full text-white text-[9px] font-bold" style={{background:'rgba(0,0,0,0.5)',backdropFilter:'blur(8px)'}}>🔍 Tap to zoom</div>}
        {zoomed&&<div className="absolute top-3 right-3 z-20 px-2.5 py-1 rounded-full text-white text-[9px] font-bold" style={{background:'rgba(0,0,0,0.6)',backdropFilter:'blur(8px)'}}>Move · tap out</div>}
      </>:<div className="absolute inset-0 flex items-end justify-start" style={{background:member.placeholderBg}}><span className="font-grotesk font-black" style={{fontSize:120,color:'rgba(15,13,10,0.08)',lineHeight:1,paddingLeft:12,paddingBottom:36}}>{member.initial}</span></div>}
      <div className="absolute inset-0 pointer-events-none" style={{background:member.cardGradient,opacity:zoomed?0:1,transition:'opacity 0.35s'}}/>
      {member.category&&!zoomed&&<div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full text-[9px] font-black tracking-[2px] text-white" style={{background:`${accent}cc`,backdropFilter:'blur(8px)'}}>{member.category.toUpperCase()}</div>}
      <div className="absolute bottom-0 left-0 right-0 px-5 pb-4 z-10" style={{opacity:zoomed?0:1,transition:'opacity 0.3s'}}>
        <h2 className="font-grotesk font-black text-white text-xl leading-tight mb-0.5">{member.name}</h2>
        <p className="text-xs font-medium" style={{color:'rgba(255,255,255,0.85)'}}>{member.role}</p>
      </div>
    </div>
  );
}

/* ── Full Popup ── */
function MemberPopup({member,idx,onClose}:{member:TeamMember;idx:number;onClose:()=>void}) {
  const accent=ac(idx);
  useEffect(()=>{
    const fn=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose();};
    document.addEventListener('keydown',fn);
    document.body.style.overflow='hidden';
    return()=>{document.removeEventListener('keydown',fn);document.body.style.overflow='';};
  },[onClose]);
  return createPortal(
    <div onClick={e=>{if(e.target===e.currentTarget)onClose();}}
      style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',zIndex:99999,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(15,13,10,0.76)',backdropFilter:'blur(10px)',WebkitBackdropFilter:'blur(10px)',animation:'bdIn 0.25s ease',padding:16,boxSizing:'border-box' as const}}>
      <div onClick={e=>e.stopPropagation()}
        style={{position:'relative',width:'100%',maxWidth:720,borderRadius:20,overflow:'hidden',background:'var(--bg2)',boxShadow:'0 32px 80px rgba(15,13,10,0.5)',animation:'ppIn 0.35s cubic-bezier(.16,1,.3,1)',maxHeight:'90vh',overflowY:'auto'}}>
        <button onClick={onClose} className="absolute top-3 right-3 z-20 w-8 h-8 rounded-xl flex items-center justify-center" style={{background:'var(--bg3)',color:'var(--text2)',transition:'all 0.2s'}} onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.background=accent;(e.currentTarget as HTMLButtonElement).style.color='#fff';}} onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.background='var(--bg3)';(e.currentTarget as HTMLButtonElement).style.color='var(--text2)';}}>
          <X className="w-3.5 h-3.5"/>
        </button>
        <div className="grid md:grid-cols-2">
          <ImagePanel member={member} accent={accent}/>
          <div className="p-5 flex flex-col gap-3">
            <div className="h-1 w-12 rounded-full" style={{background:accent}}/>
            {member.qualification&&<div className="p-3 rounded-xl" style={{background:'var(--bg)',border:'1px solid var(--border)'}}><div className="flex items-center gap-2 mb-1.5"><div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{background:`${accent}18`}}><GraduationCap className="w-3 h-3" style={{color:accent}}/></div><span className="text-[8px] font-black tracking-[2px]" style={{color:'var(--text3)'}}>QUALIFICATION</span></div><p className="text-xs font-semibold font-grotesk" style={{color:'var(--text)'}}>{member.qualification}</p></div>}
            {member.currentPosition&&<div className="p-3 rounded-xl" style={{background:'var(--bg)',border:'1px solid var(--border)'}}><div className="flex items-center gap-2 mb-1.5"><div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{background:`${accent}18`}}><Briefcase className="w-3 h-3" style={{color:accent}}/></div><span className="text-[8px] font-black tracking-[2px]" style={{color:'var(--text3)'}}>CURRENT POSITION</span></div><p className="text-xs font-semibold font-grotesk" style={{color:'var(--text)'}}>{member.currentPosition}</p></div>}
            <div className="p-3 rounded-xl" style={{background:`${accent}10`,border:`1px solid ${accent}28`}}><div className="flex items-center gap-2 mb-1.5"><div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{background:`${accent}18`}}><MapPin className="w-3 h-3" style={{color:accent}}/></div><span className="text-[8px] font-black tracking-[2px]" style={{color:accent}}>ROLE AT STARK</span></div><p className="text-xs font-bold font-grotesk" style={{color:'var(--text)'}}>{member.role}</p></div>
            {member.bio&&<div><div className="text-[8px] font-black tracking-[2px] mb-1" style={{color:'var(--text3)'}}>ABOUT</div><p className="text-xs leading-relaxed" style={{color:'var(--text2)'}}>{member.bio}</p></div>}
            <div className="flex gap-2 mt-auto flex-wrap">
              {member.linkedin&&<a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold" style={{background:`${accent}14`,color:accent,border:`1px solid ${accent}28`,transition:'all 0.2s'}} onMouseEnter={e=>{(e.currentTarget as HTMLAnchorElement).style.background=accent;(e.currentTarget as HTMLAnchorElement).style.color='#fff';}} onMouseLeave={e=>{(e.currentTarget as HTMLAnchorElement).style.background=`${accent}14`;(e.currentTarget as HTMLAnchorElement).style.color=accent;}}><Linkedin className="w-3 h-3"/>LinkedIn</a>}
              {member.instagram&&<a href={member.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold" style={{background:`${accent}14`,color:accent,border:`1px solid ${accent}28`,transition:'all 0.2s'}} onMouseEnter={e=>{(e.currentTarget as HTMLAnchorElement).style.background=accent;(e.currentTarget as HTMLAnchorElement).style.color='#fff';}} onMouseLeave={e=>{(e.currentTarget as HTMLAnchorElement).style.background=`${accent}14`;(e.currentTarget as HTMLAnchorElement).style.color=accent;}}><Instagram className="w-3 h-3"/>Instagram</a>}
              {member.email&&<a href={`mailto:${member.email}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold" style={{background:`${accent}14`,color:accent,border:`1px solid ${accent}28`,transition:'all 0.2s'}} onMouseEnter={e=>{(e.currentTarget as HTMLAnchorElement).style.background=accent;(e.currentTarget as HTMLAnchorElement).style.color='#fff';}} onMouseLeave={e=>{(e.currentTarget as HTMLAnchorElement).style.background=`${accent}14`;(e.currentTarget as HTMLAnchorElement).style.color=accent;}}><Mail className="w-3 h-3"/>Email</a>}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ── Main ── */
export default function Team() {
  const [team,setTeam]         = useState<TeamMember[]>([]);
  const [active,setActive]     = useState<number|null>(null);
  const [selected,setSelected] = useState<number|null>(null);
  const [visible,setVisible]   = useState(false);
  const [winW,setWinW]         = useState(typeof window!=='undefined'?window.innerWidth:1024);
  const [positions,setPositions] = useState<{x:number;y:number}[]>([]);
  const [floats,setFloats]     = useState<{x:number;y:number;dur:number}[]>([]);
  const secRef = useRef<HTMLElement>(null);

  /* responsive breakpoints */
  const isMob = winW < 480;
  const isTab = winW < 768;

  /* scene geometry */
  const SW  = isMob ? Math.min(winW-16, 380) : isTab ? Math.min(winW-32, 620) : 1000;
  const SH  = isMob ? 500 : isTab ? 540 : 640;
  const NR  = isMob ? 32  : isTab ? 42  : 52;   /* node radius */
  const CW  = isMob ? 140 : isTab ? 170 : 220;  /* center card width */
  const CH  = isMob ? 300 : isTab ? 340 : 420;  /* center card height */
  const CX  = SW/2;
  const CY  = SH/2;

  useEffect(()=>{
    const fn=()=>setWinW(window.innerWidth);
    window.addEventListener('resize',fn);
    return()=>window.removeEventListener('resize',fn);
  },[]);

  useEffect(()=>{
    const obs=new IntersectionObserver(es=>{if(es[0].isIntersecting)setVisible(true);},{threshold:0.1});
    if(secRef.current)obs.observe(secRef.current);
    return()=>obs.disconnect();
  },[]);

  useEffect(()=>{
    getDocs(query(collection(db,'members'),orderBy('Priority','asc'))).then(snap=>{
      const data:TeamMember[]=snap.docs.map((doc,i)=>{
        const d=doc.data();
        return{name:d.Name||'Team Member',role:d.Role||'Member',image:d.Image||'',bio:d.Bio||'',category:d.Category||'',qualification:d.Qualification||'',currentPosition:d.CurrentPosition||'',linkedin:d.LinkedIn||'',instagram:d.Instagram||'',email:d.Email||'',priority:d.Priority??999,initial:(d.Name||'U')[0].toUpperCase(),placeholderBg:pbg(i),cardGradient:cg(i)};
      });
      setTeam(data);
      setFloats(data.map(()=>({x:(Math.random()-0.5)*14,y:(Math.random()-0.5)*14,dur:3+Math.random()*3})));
    });
  },[]);

  /* recalculate positions when team or screen size changes */
  useEffect(()=>{
    if(team.length===0)return;
    setPositions(genPositions(team.length,SW,SH,CX,CY,CW/2+50,CH/2+40,NR));
  },[team.length,SW,SH,NR]);

  const activeMember = active!==null?team[active]:null;
  const activeAccent = active!==null?ac(active):'var(--orange)';

  /* photo size in center */
  const photoW = isMob?100:isTab?130:150;
  const photoH = isMob?120:isTab?158:185;

  return(
    <section ref={secRef} className="py-16 overflow-x-hidden" style={{background:'var(--bg)'}}>
      <style>{`
        @keyframes bdIn{from{opacity:0}to{opacity:1}}
        @keyframes ppIn{from{opacity:0;transform:scale(0.93) translateY(18px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes cPop{from{opacity:0;transform:scale(0.87)}to{opacity:1;transform:scale(1)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes nIn{from{opacity:0;transform:scale(0.5)}to{opacity:1;transform:scale(1)}}
        @keyframes gl{0%,100%{opacity:0.4;transform:scale(1)}50%{opacity:0.75;transform:scale(1.08)}}
        @keyframes lf{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
        ${Array.from({length:12},(_,i)=>`@keyframes nf${i}{0%,100%{transform:translate(0,0)}50%{transform:translate(${(Math.random()-.5)*14|0}px,${(Math.random()-.5)*14|0}px)}}`).join('')}
        .nbtn{cursor:pointer;transition:transform 0.3s cubic-bezier(.16,1,.3,1);}
        .nbtn:hover{transform:scale(1.1)!important;}
      `}</style>

      {/* Header */}
      <div className="text-center mb-10 px-4" style={{animation:visible?'fadeUp 0.7s ease both':'none',opacity:visible?1:0}}>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-[2px] mb-4" style={{background:'var(--orange3)',color:'var(--orange)',border:'1px solid var(--orange4)'}}>◆ WHO MADE IT</div>
        <h2 className="font-grotesk font-black tracking-tight" style={{fontSize:'clamp(32px,5.5vw,64px)',color:'var(--text)',letterSpacing:'-2px',lineHeight:1}}>MEET THE TEAM</h2>
        <p className="mt-2 text-sm" style={{color:'var(--text3)'}}>Click a member · tap background to reset</p>
      </div>

      {/* Scene */}
      <div style={{position:'relative',width:SW,height:SH,margin:'0 auto',maxWidth:'100%',touchAction:'manipulation'}}
        onClick={()=>setActive(null)}>

        {/* SVG lines */}
        {active!==null&&positions[active]&&(
          <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none',zIndex:1}}>
            {positions.map((p,i)=>(
              <line key={i} x1={CX} y1={CY} x2={p.x} y2={p.y}
                stroke={ac(i)} strokeWidth="1" strokeDasharray="4 6"
                opacity={i===active?0.45:0.18}/>
            ))}
          </svg>
        )}

        {/* Center */}
        <div style={{position:'absolute',left:CX,top:CY,transform:'translate(-50%,-50%)',zIndex:10,width:CW,textAlign:'center',pointerEvents:'auto'}}
          onClick={e=>e.stopPropagation()}>

          {/* Logo */}
          {active===null&&(
            <div key="logo" style={{animation:'cPop 0.5s cubic-bezier(.16,1,.3,1)'}}>
              <div style={{position:'relative',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:10}}>
                <div style={{position:'absolute',width:isMob?120:150,height:isMob?120:150,borderRadius:'50%',border:'1.5px dashed rgba(249,115,22,0.16)',animation:'gl 3s ease-in-out infinite'}}/>
                <div style={{position:'absolute',width:isMob?94:118,height:isMob?94:118,borderRadius:'50%',border:'1px solid rgba(249,115,22,0.08)',animation:'gl 3s ease-in-out infinite 1s'}}/>
                <div style={{width:isMob?70:88,height:isMob?70:88,borderRadius:18,background:'linear-gradient(135deg,#fff8f3,#fff)',boxShadow:'0 6px 28px rgba(249,115,22,0.14),0 0 0 1.5px rgba(249,115,22,0.1)',display:'flex',alignItems:'center',justifyContent:'center',animation:'lf 3s ease-in-out infinite'}}>
                  <img src="/assets/Logo.png" alt="Logo" style={{width:isMob?44:56,height:isMob?44:56,objectFit:'contain'}}
                    onError={e=>{(e.currentTarget as HTMLImageElement).style.display='none';const fb=e.currentTarget.nextElementSibling as HTMLElement;if(fb)fb.style.display='flex';}}/>
                  <span style={{display:'none',alignItems:'center',justifyContent:'center',fontFamily:'Space Grotesk,sans-serif',fontWeight:900,fontSize:isMob?24:30,color:'var(--orange)'}}>S</span>
                </div>
              </div>
              <div style={{fontFamily:'Space Grotesk,sans-serif',fontWeight:800,fontSize:isMob?11:13,color:'var(--text)',marginBottom:3}}>Stark InnovationZ</div>
              <div style={{fontSize:8,letterSpacing:'2px',fontWeight:700,color:'var(--orange)',marginBottom:5}}>INNOVATE · BUILD · DELIVER</div>
              <div style={{fontSize:9,color:'var(--text3)'}}>Tap a member</div>
            </div>
          )}

          {/* Member */}
          {active!==null&&activeMember&&(
            <div key={`m${active}`} style={{animation:'cPop 0.38s cubic-bezier(.16,1,.3,1)'}}>
              <div style={{position:'relative',display:'inline-block',marginBottom:7}}>
                <div style={{position:'absolute',inset:-5,borderRadius:14,border:`2px solid ${activeAccent}`,opacity:0.4,animation:'gl 2s ease-in-out infinite'}}/>
                <div style={{width:photoW,height:photoH,borderRadius:12,overflow:'hidden',cursor:'pointer',boxShadow:`0 8px 28px ${activeAccent}40`}}
                  onClick={()=>setSelected(active)}>
                  {activeMember.image
                    ?<img src={activeMember.image} alt={activeMember.name} style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'top'}}/>
                    :<div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',background:activeMember.placeholderBg,fontFamily:'Space Grotesk,sans-serif',fontWeight:900,fontSize:42,color:'rgba(15,13,10,0.14)'}}>{activeMember.initial}</div>
                  }
                </div>
              </div>
              <div style={{fontFamily:'Space Grotesk,sans-serif',fontWeight:800,fontSize:isMob?13:15,color:'var(--text)',marginBottom:3,lineHeight:1.2}}>{activeMember.name}</div>
              <div style={{display:'inline-block',padding:'4px 10px',borderRadius:100,fontSize:9,fontWeight:700,letterSpacing:'0.5px',marginBottom:6,background:`${activeAccent}14`,color:activeAccent,lineHeight:1.4}}>{activeMember.role}</div>
              <div style={{display:'flex',gap:5,justifyContent:'center',marginBottom:7}}>
                {activeMember.linkedin&&<a href={activeMember.linkedin} target="_blank" rel="noopener noreferrer" style={{width:26,height:26,borderRadius:7,display:'flex',alignItems:'center',justifyContent:'center',background:`${activeAccent}14`,color:activeAccent,border:`1px solid ${activeAccent}28`,transition:'all 0.2s'}} onMouseEnter={e=>{(e.currentTarget as HTMLAnchorElement).style.background=activeAccent;(e.currentTarget as HTMLAnchorElement).style.color='#fff';}} onMouseLeave={e=>{(e.currentTarget as HTMLAnchorElement).style.background=`${activeAccent}14`;(e.currentTarget as HTMLAnchorElement).style.color=activeAccent;}}><Linkedin style={{width:11,height:11}}/></a>}
                {activeMember.instagram&&<a href={activeMember.instagram} target="_blank" rel="noopener noreferrer" style={{width:26,height:26,borderRadius:7,display:'flex',alignItems:'center',justifyContent:'center',background:`${activeAccent}14`,color:activeAccent,border:`1px solid ${activeAccent}28`,transition:'all 0.2s'}} onMouseEnter={e=>{(e.currentTarget as HTMLAnchorElement).style.background=activeAccent;(e.currentTarget as HTMLAnchorElement).style.color='#fff';}} onMouseLeave={e=>{(e.currentTarget as HTMLAnchorElement).style.background=`${activeAccent}14`;(e.currentTarget as HTMLAnchorElement).style.color=activeAccent;}}><Instagram style={{width:11,height:11}}/></a>}
                {activeMember.email&&<a href={`mailto:${activeMember.email}`} style={{width:26,height:26,borderRadius:7,display:'flex',alignItems:'center',justifyContent:'center',background:`${activeAccent}14`,color:activeAccent,border:`1px solid ${activeAccent}28`,transition:'all 0.2s'}} onMouseEnter={e=>{(e.currentTarget as HTMLAnchorElement).style.background=activeAccent;(e.currentTarget as HTMLAnchorElement).style.color='#fff';}} onMouseLeave={e=>{(e.currentTarget as HTMLAnchorElement).style.background=`${activeAccent}14`;(e.currentTarget as HTMLAnchorElement).style.color=activeAccent;}}><Mail style={{width:11,height:11}}/></a>}
              </div>
              <button onClick={()=>setSelected(active)}
                style={{padding:'6px 16px',borderRadius:100,border:'none',cursor:'pointer',fontSize:10,fontWeight:700,color:'#fff',background:`linear-gradient(135deg,${activeAccent},${activeAccent}bb)`,boxShadow:`0 4px 14px ${activeAccent}44`,transition:'transform 0.2s'}}
                onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.transform='scale(1.05)'}
                onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.transform='scale(1)'}>
                View Profile →
              </button>
            </div>
          )}
        </div>

        {/* Orbit nodes */}
        {team.map((m,i)=>{
          const p=positions[i];
          if(!p)return null;
          const isAct=i===active;
          const accent=ac(i);
          const fo=floats[i]||{x:0,y:0,dur:4};
          const D=NR*2;
          return(
            <div key={i}>
              <style>{`@keyframes nf${i%12}{0%,100%{transform:translate(0,0)}50%{transform:translate(${fo.x.toFixed(0)}px,${fo.y.toFixed(0)}px)}}`}</style>
              <div className="nbtn"
                onClick={e=>{e.stopPropagation();setActive(prev=>prev===i?null:i);}}
                style={{position:'absolute',left:p.x-NR,top:p.y-NR,width:D,height:D,zIndex:isAct?15:5,
                  animation:isAct?'none':`nf${i%12} ${fo.dur}s ease-in-out infinite ${i*0.18}s, nIn 0.5s ${i*0.06}s cubic-bezier(.16,1,.3,1) both`,
                  transform:isAct?'scale(1.2)':'scale(1)'}}>
                {/* ring */}
                <div style={{position:'absolute',inset:0,borderRadius:'50%',border:`2.5px solid ${isAct?accent:'rgba(15,13,10,0.1)'}`,boxShadow:isAct?`0 0 16px ${accent}50`:'none',transition:'border-color 0.35s,box-shadow 0.35s'}}/>
                {/* photo */}
                <div style={{position:'absolute',inset:3,borderRadius:'50%',overflow:'hidden',filter:isAct?'none':'grayscale(30%) brightness(0.88)',transition:'filter 0.35s'}}>
                  {m.image
                    ?<img src={m.image} alt={m.name} style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'top'}}/>
                    :<div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',background:m.placeholderBg,fontFamily:'Space Grotesk,sans-serif',fontWeight:900,fontSize:NR*0.38,color:'rgba(15,13,10,0.18)'}}>{m.initial}</div>
                  }
                </div>
                {/* name */}
                <div style={{position:'absolute',left:'50%',transform:'translateX(-50%)',
                  top:p.y<SH/2?'105%':'auto',bottom:p.y>=SH/2?'105%':'auto',
                  marginTop:p.y<SH/2?4:0,marginBottom:p.y>=SH/2?4:0,
                  whiteSpace:'nowrap',fontSize:isMob?9:10,fontWeight:700,
                  color:isAct?accent:'var(--text3)',transition:'color 0.3s',
                  textShadow:'0 1px 4px rgba(255,255,255,0.9)'}}>
                  {m.name.split(' ')[0]}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selected!==null&&<MemberPopup member={team[selected]} idx={selected} onClose={()=>setSelected(null)}/>}
    </section>
  );
}