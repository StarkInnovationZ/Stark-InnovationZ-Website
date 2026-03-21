import { Target, Lightbulb, Users, TrendingUp } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const FEATS = [
  { icon: Target,     title: 'Client-Focused',  desc: 'Every project tailored to your exact requirements' },
  { icon: Lightbulb,  title: 'Innovation First', desc: 'Cutting-edge technology in every solution' },
  { icon: Users,      title: 'Expert Team',      desc: 'Skilled professionals across all domains' },
  { icon: TrendingUp, title: 'Quality Results',  desc: 'Excellence with attention to every detail' },
];

/* smooth count-up hook */
function useCountUp(target: number, duration = 1400) {
  const [val, setVal]   = useState(0);
  const prevRef         = useRef(0);
  const startedRef      = useRef(false);

  useEffect(() => {
    if (target === 0) return;
    if (startedRef.current && target === prevRef.current) return;
    startedRef.current = true;
    const from    = prevRef.current;
    const diff    = target - from;
    const startTs = performance.now();
    const tick = (now: number) => {
      const p    = Math.min((now - startTs) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(from + diff * ease));
      if (p < 1) requestAnimationFrame(tick);
      else { prevRef.current = target; setVal(target); }
    };
    requestAnimationFrame(tick);
  }, [target, duration]);

  return val;
}

/* single animated stat card */
function StatCard({
  numericVal, suffix, label, accent, isStatic, staticVal,
}: {
  numericVal: number; suffix: string; label: string;
  accent: string; isStatic?: boolean; staticVal?: string;
}) {
  const counted = useCountUp(numericVal);
  return (
    <div
      className="p-6 rounded-2xl text-center card-hover cursor-default"
      style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
    >
      <div className="font-grotesk font-bold text-3xl mb-1" style={{ color: accent }}>
        {isStatic ? staticVal : `${counted}${suffix}`}
      </div>
      <div className="text-xs" style={{ color: 'var(--text3)' }}>{label}</div>
    </div>
  );
}

export default function About() {
  const [reviewCount, setReviewCount] = useState(0);
  const ref = useRef<HTMLElement>(null);

  /* live review count — real-time */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'reviews'), snap => {
      setReviewCount(snap.size);
    });
    return () => unsub();
  }, []);

  /* scroll reveal */
  useEffect(() => {
    const obs = new IntersectionObserver(
      es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.1 }
    );
    ref.current?.querySelectorAll('.reveal,.reveal-l,.reveal-r').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-20 px-5 lg:px-10" style={{ background: 'var(--bg2)' }}>
      <div className="max-w-7xl mx-auto">

        <div className="mb-16">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-[2px] mb-5 reveal"
            style={{ background: 'var(--orange3)', color: 'var(--orange)', border: '1px solid var(--orange4)' }}
          >
            ◆ WHY STARK INNOVATIONZ
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left */}
            <div className="reveal-l">
              <h2
                className="font-grotesk font-bold tracking-tight mb-4"
                style={{ fontSize: 'clamp(30px,4vw,50px)', color: 'var(--text)', lineHeight: 1.1 }}
              >
                Where great projects<br />
                <span style={{ color: 'var(--orange)' }}>actually get built</span>
              </h2>
              <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text3)' }}>
                At Stark InnovationZ, we are specialized project developers committed to transforming
                your ideas into reality. From initial concept through final delivery — we handle
                hardware, software, design, and documentation with equal expertise.
              </p>
              <p className="text-sm leading-relaxed mb-8" style={{ color: 'var(--text3)' }}>
                Based in India, we operate 24/7 — offering on-site troubleshooting, doorstep
                delivery, and citywide service to ensure your project never stalls.
              </p>
              <div className="flex flex-col gap-3">
                {[
                  'On-site troubleshooting & support',
                  'Doorstep product delivery',
                  'Competitive pricing always',
                  'On-time project delivery guaranteed',
                ].map(item => (
                  <div key={item} className="flex items-center gap-3 text-sm" style={{ color: 'var(--text2)' }}>
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-white text-[10px] font-bold"
                      style={{ background: 'linear-gradient(135deg,var(--orange),var(--orange2))' }}
                    >
                      ✓
                    </div>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Right */}
            <div className="reveal-r">
              {/* ── Stats grid — review count is LIVE ── */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <StatCard
                  numericVal={100} suffix="+" label="Projects Delivered"
                  accent="var(--orange)"
                />
                {/* Happy Clients = live review count */}
                <StatCard
                  numericVal={reviewCount} suffix="+" label="Happy Clients"
                  accent="var(--text)"
                />
                <StatCard
                  numericVal={10} suffix="+" label="Services Offered"
                  accent="var(--orange)"
                />
                <StatCard
                  numericVal={0} suffix="" label="Always Available"
                  accent="var(--text)" isStatic staticVal="24/7"
                />
              </div>

              {/* Key insight card */}
              <div className="p-6 rounded-2xl" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                <div
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold tracking-[1.5px] mb-3"
                  style={{ background: 'var(--orange3)', color: 'var(--orange)' }}
                >
                  ◆ KEY INSIGHT
                </div>
                <div
                  className="font-grotesk font-black mb-1"
                  style={{ fontSize: '52px', color: 'var(--orange)', lineHeight: 1 }}
                >
                  90%
                </div>
                <div className="font-grotesk font-bold text-base mb-2" style={{ color: 'var(--text)' }}>
                  Client retention rate
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text3)' }}>
                  Our clients keep coming back because we deliver exactly what we promise —
                  on time, every time, with quality that exceeds expectations.
                </p>

                {/* live reviews badge */}
                <div
                  className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold"
                  style={{ background: 'var(--orange3)', color: 'var(--orange)', border: '1px solid var(--orange4)' }}
                >
                  <span
                    style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e',
                      display: 'inline-block', animation: 'pulse-ring 1.8s ease-out infinite' }}
                  />
                  {reviewCount} verified reviews
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 reveal">
          {FEATS.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className={`p-5 rounded-2xl border card-hover cursor-default rd${i + 1}`}
                style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: 'var(--orange3)' }}>
                  <Icon className="w-4 h-4" style={{ color: 'var(--orange)' }} />
                </div>
                <div className="font-grotesk font-bold text-sm mb-1" style={{ color: 'var(--text)' }}>{f.title}</div>
                <div className="text-xs leading-relaxed" style={{ color: 'var(--text3)' }}>{f.desc}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}