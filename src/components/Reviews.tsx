import { Star, Send, User, Phone, Briefcase, ArrowRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { db } from '../firebase';

export default function Reviews() {
  const [form, setForm]     = useState({ name:'', mobile:'', category:[] as string[], rating:5, comment:'' });
  const [reviews, setReviews] = useState<any[]>([]);
  const [sent, setSent]     = useState(false);
  const [paused, setPaused] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    return onSnapshot(query(collection(db,'reviews'), orderBy('date','desc')), snap => {
      setReviews(snap.docs.map(d => ({ id:d.id, ...d.data() })));
    });
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.07 }
    );
    ref.current?.querySelectorAll('.reveal').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [reviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db,'reviews'), { ...form, date: Timestamp.now() });
      setSent(true);
      setForm({ name:'', mobile:'', category:[], rating:5, comment:'' });
      setTimeout(() => setSent(false), 3000);
    } catch(err) { console.error(err); }
  };

  const input  = "w-full px-3.5 py-3 rounded-xl text-sm outline-none transition-all duration-300";
  const istyle = { background:'var(--bg)', border:'1px solid var(--border)', color:'var(--text)' };
  const iFocus = (e: React.FocusEvent<any>) => { e.target.style.borderColor='var(--orange)'; e.target.style.boxShadow='0 0 0 3px rgba(249,115,22,0.12)'; };
  const iBlur  = (e: React.FocusEvent<any>) => { e.target.style.borderColor='var(--border)'; e.target.style.boxShadow='none'; };

  /* last 10 reviews for marquee */
  const marqueeReviews = reviews.slice(0, 10);
  /* duplicate for seamless loop */
  const loopItems = [...marqueeReviews, ...marqueeReviews];

  return (
    <section ref={ref} style={{ background:'var(--bg)' }}>

      {/* Service marquee */}
      <div className="overflow-hidden py-3" style={{ background:'var(--orange)', borderTop:'1px solid rgba(0,0,0,0.1)' }}>
        <div className="inline-flex gap-10 whitespace-nowrap marquee-track">
          {['HARDWARE','WEB DEV','APP DEV','3D DESIGN','3D PRINT','DOCUMENTATION','PATENT','POSTER','TRAINING',
            'HARDWARE','WEB DEV','APP DEV','3D DESIGN','3D PRINT','DOCUMENTATION','PATENT','POSTER','TRAINING'].map((s,i) => (
            <span key={i} className="inline-flex items-center gap-3 text-white text-[10px] font-bold tracking-[2px]">
              <span className="opacity-60">✦</span> {s}
            </span>
          ))}
        </div>
      </div>

      <div className="py-20 px-5 lg:px-10">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="flex items-end justify-between mb-10 reveal">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-[2px] mb-4"
                style={{ background:'var(--orange3)', color:'var(--orange)', border:'1px solid var(--orange4)' }}>
                ◆ TESTIMONIALS
              </div>
              <h2 className="font-grotesk font-bold tracking-tight mb-3"
                style={{ fontSize:'clamp(32px,4vw,52px)', color:'var(--text)', lineHeight:1.1 }}>
                Real clients,<br /><span style={{ color:'var(--orange)' }}>real results.</span>
              </h2>
            </div>
            <Link to="/reviews"
              className="inline-flex items-center gap-2 font-bold text-sm flex-shrink-0 transition-all duration-200 hover:-translate-y-0.5"
              style={{ padding:'10px 20px', borderRadius:10, background:'var(--orange3)', color:'var(--orange)', border:'1px solid var(--orange4)' }}
              onMouseEnter={e=>{(e.currentTarget as HTMLAnchorElement).style.background='var(--orange)';(e.currentTarget as HTMLAnchorElement).style.color='#fff';}}
              onMouseLeave={e=>{(e.currentTarget as HTMLAnchorElement).style.background='var(--orange3)';(e.currentTarget as HTMLAnchorElement).style.color='var(--orange)';}}>
              All Reviews <ArrowRight className="w-4 h-4"/>
            </Link>
          </div>

          {/* ── Horizontal auto-scroll review strip ── */}
          {marqueeReviews.length > 0 ? (
            <div className="reveal">
              <style>{`
                @keyframes reviewScroll {
                  from { transform: translateX(0); }
                  to   { transform: translateX(-50%); }
                }
                .review-track {
                  display: flex;
                  gap: 16px;
                  width: max-content;
                  animation: reviewScroll ${Math.max(marqueeReviews.length * 5, 30)}s linear infinite;
                }
                .review-track.paused { animation-play-state: paused; }
              `}</style>

              {/* fade edges */}
              <div className="relative overflow-hidden" style={{ WebkitMaskImage:'linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)', maskImage:'linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)' }}>
                <div
                  className={`review-track ${paused ? 'paused' : ''}`}
                  onMouseEnter={() => setPaused(true)}
                  onMouseLeave={() => setPaused(false)}
                >
                  {loopItems.map((r, i) => (
                    <div key={i}
                      className="flex-none flex flex-col p-5 rounded-2xl"
                      style={{ width:280, background:'var(--bg2)', border:'1px solid var(--border)', minHeight:180 }}>
                      {/* Stars */}
                      <div className="flex gap-0.5 mb-3">
                        {[...Array(5)].map((_,j) => (
                          <Star key={j} className="w-3.5 h-3.5"
                            fill={j<r.rating?'#f97316':'transparent'}
                            stroke={j<r.rating?'#f97316':'#d1d5db'}/>
                        ))}
                      </div>
                      {/* Comment — fixed 3 lines */}
                      <p className="text-xs leading-relaxed italic flex-1 mb-3"
                        style={{ color:'var(--text2)', display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                        "{r.comment}"
                      </p>
                      {/* Categories */}
                      {r.category && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {(Array.isArray(r.category)?r.category:[r.category]).slice(0,2).map((c:string,ci:number) => (
                            <span key={ci} className="px-2 py-0.5 rounded-full text-[9px] font-bold"
                              style={{ background:'var(--orange3)', color:'var(--orange)' }}>{c}</span>
                          ))}
                        </div>
                      )}
                      {/* Author */}
                      <div className="flex items-center gap-2 pt-3 mt-auto" style={{ borderTop:'1px solid var(--border)' }}>
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0"
                          style={{ background:'linear-gradient(135deg,var(--orange),var(--orange2))' }}>
                          {r.name?.[0]||'?'}
                        </div>
                        <span className="font-grotesk font-bold text-xs" style={{ color:'var(--text)' }}>{r.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>


            </div>
          ) : (
            <div className="text-center py-12 rounded-2xl reveal" style={{ background:'var(--bg2)', border:'1px solid var(--border)' }}>
              <div className="text-4xl mb-3">💬</div>
              <p className="font-grotesk font-bold" style={{ color:'var(--text)' }}>No reviews yet</p>
              <p className="text-sm mt-1" style={{ color:'var(--text3)' }}>Be the first to share your experience!</p>
            </div>
          )}

          {/* ── Review Form ── */}
          <div className="max-w-xl mx-auto mt-16 p-8 rounded-2xl reveal"
            style={{ background:'var(--bg2)', border:'1px solid var(--border)' }}>
            <h3 className="font-grotesk font-bold text-xl mb-1" style={{ color:'var(--text)' }}>Write a Review</h3>
            <p className="text-xs mb-7" style={{ color:'var(--text3)' }}>Share your experience with us.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold tracking-[2px] mb-1.5" style={{ color:'var(--orange)' }}>NAME</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color:'var(--text3)' }}/>
                    <input type="text" required placeholder="Your name" value={form.name}
                      onChange={e=>setForm({...form,name:e.target.value})}
                      className={`${input} pl-9`} style={istyle} onFocus={iFocus} onBlur={iBlur}/>
                  </div>
                </div>
                <div>
                  <label className="block text-[9px] font-bold tracking-[2px] mb-1.5" style={{ color:'var(--orange)' }}>MOBILE</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color:'var(--text3)' }}/>
                    <input type="tel" required placeholder="+91 XXXXX XXXXX" value={form.mobile}
                      onChange={e=>setForm({...form,mobile:e.target.value})}
                      className={`${input} pl-9`} style={istyle} onFocus={iFocus} onBlur={iBlur}/>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold tracking-[2px] mb-1.5" style={{ color:'var(--orange)' }}>PROJECT CATEGORY</label>
                <div className="p-3 rounded-xl" style={{ background:'var(--bg)', border:'1px solid var(--border)' }}>
                  <div className="relative pl-6">
                    <Briefcase className="absolute left-0 top-0.5 w-3.5 h-3.5" style={{ color:'var(--text3)' }}/>
                    <div className="grid grid-cols-2 gap-2">
                      {['Hardware','Website Development','App Development','3D Design','3D Printing','Documentation','Patent Documentation','Poster Design','Hands-on Training','Education & Training','Other'].map(cat => (
                        <label key={cat} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={form.category.includes(cat)}
                            onChange={()=>{const cats=form.category.includes(cat)?form.category.filter(c=>c!==cat):[...form.category,cat];setForm({...form,category:cats});}}
                            className="w-3.5 h-3.5 rounded cursor-pointer accent-orange-500"/>
                          <span className="text-[11px]" style={{ color:'var(--text2)' }}>{cat}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold tracking-[2px] mb-1.5" style={{ color:'var(--orange)' }}>RATING</label>
                <div className="flex gap-1.5">
                  {[1,2,3,4,5].map(s=>(
                    <button key={s} type="button" onClick={()=>setForm({...form,rating:s})}
                      className="transition-transform duration-150 hover:scale-125">
                      <Star className="w-7 h-7" fill={s<=form.rating?'#f97316':'transparent'} stroke={s<=form.rating?'#f97316':'#d1d5db'}/>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold tracking-[2px] mb-1.5" style={{ color:'var(--orange)' }}>YOUR REVIEW</label>
                <textarea required rows={3} placeholder="Tell us about your experience..." value={form.comment}
                  onChange={e=>setForm({...form,comment:e.target.value})}
                  className={`${input} resize-none`} style={istyle} onFocus={iFocus} onBlur={iBlur}/>
              </div>

              <button type="submit"
                className="w-full py-3.5 rounded-xl text-white text-sm font-bold tracking-wide flex items-center justify-center gap-2 transition-all duration-300 hover:-translate-y-0.5"
                style={{ background:sent?'linear-gradient(135deg,#22c55e,#16a34a)':'linear-gradient(135deg,var(--orange),var(--orange2))', boxShadow:'0 6px 20px rgba(249,115,22,0.25)' }}>
                {sent?'✓ REVIEW SUBMITTED!':<><span>SUBMIT REVIEW</span><Send className="w-4 h-4"/></>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}