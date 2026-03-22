import { Star, ArrowLeft, Send, User, Phone, Briefcase } from 'lucide-react';
import { useState, useEffect } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { db } from '../firebase';

const CATS = ['Hardware','Website Development','App Development','3D Design','3D Printing','Documentation','Patent Documentation','Poster Design','Hands-on Training','Education & Training','Other'];

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [filter, setFilter]   = useState<string>('All');
  const [sort, setSort]       = useState<'newest'|'highest'|'lowest'>('newest');
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
  if (sort === 'highest') filtered = [...filtered].sort((a,b) => b.rating - a.rating);
  if (sort === 'lowest')  filtered = [...filtered].sort((a,b) => a.rating - b.rating);

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
            style={{ background:'var(--bg2)', border:'1px solid var(--border)', color:'var(--text)', minWidth:140 }}>
            <option value="newest">Newest First</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
          </select>
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-16">
            {filtered.map((r, i) => (
              <div key={i} className="flex flex-col p-5 rounded-2xl border card-hover"
                style={{ background:'var(--bg2)', borderColor:'var(--border)', minHeight:220 }}>
                <div className="flex gap-0.5 mb-3 flex-shrink-0">
                  {[...Array(5)].map((_,j) => (
                    <Star key={j} className="w-3.5 h-3.5"
                      fill={j<r.rating?'#f97316':'transparent'}
                      stroke={j<r.rating?'#f97316':'#d1d5db'}/>
                  ))}
                </div>
                <p className="text-xs leading-relaxed italic flex-1 mb-3"
                  style={{ color:'var(--text2)', display:'-webkit-box', WebkitLineClamp:5, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                  "{r.comment}"
                </p>
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
            ))}
          </div>
        ) : (
          <div className="text-center py-16 rounded-2xl mb-16" style={{ background:'var(--bg2)', border:'1px solid var(--border)' }}>
            <div className="text-4xl mb-3">🔍</div>
            <p className="font-grotesk font-bold" style={{ color:'var(--text)' }}>No reviews for this category</p>
          </div>
        )}
      </div>
    </div>
  );
}