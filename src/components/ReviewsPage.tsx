import { Star, ArrowLeft, Send, User, Phone, Briefcase } from 'lucide-react';
import { useState, useEffect } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { db } from '../firebase';

const CATS = ['Hardware','Website Development','App Development','3D Design','3D Printing','Documentation','Patent Documentation','Poster Design','Hands-on Training','Education & Training','Other'];

function ReviewCardPage({ review: r }: { review: any }) {
  const [expanded, setExpanded] = useState(false);
  const LIMIT = 120;
  const isLong = r.comment && r.comment.length > LIMIT;
  return (
    <div className="flex flex-col p-5 rounded-2xl border card-hover"
      style={{ background:'var(--bg2)', borderColor:'var(--border)', minHeight:200 }}>
      <div className="flex gap-0.5 mb-3 flex-shrink-0">
        {[...Array(5)].map((_,j) => (
          <Star key={j} className="w-3.5 h-3.5"
            fill={j<r.rating?'#f97316':'transparent'}
            stroke={j<r.rating?'#f97316':'#d1d5db'}/>
        ))}
      </div>
      <div className="flex-1 mb-2">
        <p className="text-xs leading-relaxed italic" style={{ color:'var(--text2)' }}>
          "{expanded || !isLong ? r.comment : r.comment.slice(0, LIMIT) + '...'}"
        </p>
        {isLong && (
          <button onClick={() => setExpanded(v => !v)}
            className="text-[10px] font-bold mt-1.5 hover:opacity-70 transition-opacity"
            style={{ color:'var(--orange)', background:'none', border:'none', cursor:'pointer', padding:0 }}>
            {expanded ? '↑ Show Less' : '↓ Show More'}
          </button>
        )}
      </div>
      {r.category && (
        <div className="flex flex-wrap gap-1 mb-3 flex-shrink-0">
          {(Array.isArray(r.category)?r.category:[r.category]).map((c:string,ci:number) => (
            <span key={ci} className="px-2 py-0.5 rounded-full text-[9px] font-bold"
              style={{ background:'var(--orange3)', color:'var(--orange)' }}>{c}</span>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2.5 mt-auto pt-3 flex-shrink-0"
        style={{ borderTop:'1px solid var(--border)' }}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
          style={{ background:'linear-gradient(135deg,var(--orange),var(--orange2))' }}>
          {r.name?.[0]||'?'}
        </div>
        <div className="font-grotesk font-bold text-xs" style={{ color:'var(--text)' }}>{r.name}</div>
      </div>
    </div>
  );
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [filter, setFilter]   = useState<string>('All');
  const [sort, setSort]       = useState<'newest'|'oldest'|'1star'|'2star'|'3star'|'4star'|'5star'>('newest');
  const [form, setForm]       = useState({ name:'', mobile:'', category:[] as string[], rating:5, comment:'' });
  const [sent, setSent]       = useState(false);

  useEffect(() => {
    return onSnapshot(query(collection(db,'reviews'), orderBy('date','desc')), snap => {
      setReviews(snap.docs.map(d => ({ id:d.id, ...d.data() })));
    });
  }, []);

  useEffect(() => { window.scrollTo(0,0); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db,'reviews'), { ...form, date: Timestamp.now() });
      setSent(true);
      setForm({ name:'', mobile:'', category:[], rating:5, comment:'' });
      setTimeout(() => setSent(false), 3000);
    } catch(err) { console.error(err); }
  };

  /* filter + sort */
  const allCats = ['All', ...Array.from(new Set(reviews.flatMap(r => Array.isArray(r.category) ? r.category : [r.category]).filter(Boolean)))];
  let filtered = filter === 'All' ? reviews : reviews.filter(r => (Array.isArray(r.category)?r.category:[r.category]).includes(filter));
  if (sort === 'oldest')  filtered = [...filtered].sort((a,b) => (a.date?.seconds||0) - (b.date?.seconds||0));
  if (['1star','2star','3star','4star','5star'].includes(sort)) {
    const starVal = parseInt(sort[0]);
    filtered = filtered.filter(r => r.rating === starVal);
  }

  const avgRating = reviews.length ? (reviews.reduce((s,r) => s + (r.rating||0), 0) / reviews.length).toFixed(1) : null;

  const input  = "w-full px-3.5 py-3 rounded-xl text-sm outline-none transition-all duration-300";
  const ist    = { background:'var(--bg)', border:'1px solid var(--border)', color:'var(--text)' };
  const iFocus = (e: React.FocusEvent<any>) => { e.target.style.borderColor='var(--orange)'; e.target.style.boxShadow='0 0 0 3px rgba(249,115,22,0.12)'; };
  const iBlur  = (e: React.FocusEvent<any>) => { e.target.style.borderColor='var(--border)'; e.target.style.boxShadow='none'; };

  return (
    <div className="min-h-screen pt-20 pb-20 px-5 lg:px-10" style={{ background:'var(--bg)' }}>
      <div className="max-w-7xl mx-auto">

        {/* Back + header */}
        <div className="mb-10">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold mb-6 transition-colors hover:opacity-70"
            style={{ color:'var(--text3)' }}>
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-[2px] mb-3"
                style={{ background:'var(--orange3)', color:'var(--orange)', border:'1px solid var(--orange4)' }}>
                ◆ ALL REVIEWS
              </div>
              <h1 className="font-grotesk font-black tracking-tight"
                style={{ fontSize:'clamp(32px,5vw,56px)', color:'var(--text)', letterSpacing:'-2px', lineHeight:1 }}>
                What Our Clients Say
              </h1>
            </div>

            {/* Stats */}
            {avgRating && (
              <div className="flex items-center gap-4 p-4 rounded-2xl flex-shrink-0"
                style={{ background:'var(--bg2)', border:'1px solid var(--border)' }}>
                <div className="text-center">
                  <div className="font-grotesk font-black text-3xl" style={{ color:'var(--orange)', lineHeight:1 }}>{avgRating}</div>
                  <div className="flex gap-0.5 mt-1 justify-center">
                    {[...Array(5)].map((_,i) => <Star key={i} className="w-3 h-3" fill={i < Math.round(+avgRating) ? '#f97316':'transparent'} stroke={i < Math.round(+avgRating) ? '#f97316':'#d1d5db'}/>)}
                  </div>
                </div>
                <div style={{ borderLeft:'1px solid var(--border)', paddingLeft:16 }}>
                  <div className="font-grotesk font-bold text-xl" style={{ color:'var(--text)', lineHeight:1 }}>{reviews.length}</div>
                  <div className="text-xs mt-0.5" style={{ color:'var(--text3)' }}>Total Reviews</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Filter + Sort bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          {/* Category filter chips */}
          <div className="flex gap-2 flex-wrap flex-1">
            {allCats.slice(0,8).map(cat => (
              <button key={cat} onClick={() => setFilter(cat)}
                className="text-[10px] font-bold px-3 py-1.5 rounded-full transition-all duration-200"
                style={{
                  background: filter===cat ? 'var(--orange)' : 'var(--bg2)',
                  color: filter===cat ? '#fff' : 'var(--text3)',
                  border: `1px solid ${filter===cat ? 'var(--orange)' : 'var(--border)'}`,
                }}>
                {cat}
              </button>
            ))}
          </div>
          {/* Sort */}
          <select value={sort} onChange={e => setSort(e.target.value as any)}
            className="text-xs font-semibold px-3 py-2 rounded-xl outline-none cursor-pointer"
            style={{ background:'var(--bg2)', border:'1px solid var(--border)', color:'var(--text)', minWidth:160 }}>
            <optgroup label="Sort by Date">
              <option value="newest">🆕 Newest First</option>
              <option value="oldest">📅 Oldest First</option>
            </optgroup>
            <optgroup label="Filter by Stars">
              <option value="5star">⭐⭐⭐⭐⭐ 5 Stars</option>
              <option value="4star">⭐⭐⭐⭐ 4 Stars</option>
              <option value="3star">⭐⭐⭐ 3 Stars</option>
              <option value="2star">⭐⭐ 2 Stars</option>
              <option value="1star">⭐ 1 Star</option>
            </optgroup>
          </select>
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-16">
            {filtered.map((r, i) => (
              <ReviewCardPage key={i} review={r} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 rounded-2xl mb-16" style={{ background:'var(--bg2)', border:'1px solid var(--border)' }}>
            <div className="text-4xl mb-3">🔍</div>
            <p className="font-grotesk font-bold" style={{ color:'var(--text)' }}>No reviews for this category</p>
          </div>
        )}

        {/* Review form */}
        <div className="max-w-xl mx-auto p-8 rounded-2xl" style={{ background:'var(--bg2)', border:'1px solid var(--border)' }}>
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
                    className={`${input} pl-9`} style={ist} onFocus={iFocus} onBlur={iBlur}/>
                </div>
              </div>
              <div>
                <label className="block text-[9px] font-bold tracking-[2px] mb-1.5" style={{ color:'var(--orange)' }}>MOBILE</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color:'var(--text3)' }}/>
                  <input type="tel" required placeholder="+91 XXXXX XXXXX" value={form.mobile}
                    onChange={e=>setForm({...form,mobile:e.target.value})}
                    className={`${input} pl-9`} style={ist} onFocus={iFocus} onBlur={iBlur}/>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-[9px] font-bold tracking-[2px] mb-1.5" style={{ color:'var(--orange)' }}>PROJECT CATEGORY</label>
              <div className="p-3 rounded-xl" style={{ background:'var(--bg)', border:'1px solid var(--border)' }}>
                <div className="relative pl-6">
                  <Briefcase className="absolute left-0 top-0.5 w-3.5 h-3.5" style={{ color:'var(--text3)' }}/>
                  <div className="grid grid-cols-2 gap-2">
                    {CATS.map(cat=>(
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
                  <button key={s} type="button" onClick={()=>setForm({...form,rating:s})} className="transition-transform duration-150 hover:scale-125">
                    <Star className="w-7 h-7" fill={s<=form.rating?'#f97316':'transparent'} stroke={s<=form.rating?'#f97316':'#d1d5db'}/>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[9px] font-bold tracking-[2px] mb-1.5" style={{ color:'var(--orange)' }}>YOUR REVIEW</label>
              <textarea required rows={3} placeholder="Tell us about your experience..." value={form.comment}
                onChange={e=>setForm({...form,comment:e.target.value})}
                className={`${input} resize-none`} style={ist} onFocus={iFocus} onBlur={iBlur}/>
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
  );
}