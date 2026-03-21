import { Mail, Phone, MapPin, Send, Clock, Truck, Wrench, Check } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

const SERVICES = [
  { label: 'Hardware',             emoji: '🔧' },
  { label: 'Website Development',  emoji: '🌐' },
  { label: 'App Development',      emoji: '📱' },
  { label: '3D Design',            emoji: '🧊' },
  { label: '3D Printing',          emoji: '🖨️' },
  { label: 'Documentation',        emoji: '📄' },
  { label: 'Patent Documentation', emoji: '🛡️' },
  { label: 'Poster Design',        emoji: '🎨' },
  { label: 'Hands-on Training',    emoji: '🛠️' },
  { label: 'Education & Training', emoji: '🎓' },
];

export default function Contact() {
  const [form, setForm]       = useState({
    name: '', email: '', phone: '', services: [] as string[], message: '',
  });
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.07 }
    );
    ref.current?.querySelectorAll('.reveal,.reveal-l,.reveal-r').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const toggleService = (label: string) => {
    setForm(prev => ({
      ...prev,
      services: prev.services.includes(label)
        ? prev.services.filter(s => s !== label)
        : [...prev.services, label],
    }));
  };

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.services.length === 0) {
      setError('Please select at least one service.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await addDoc(collection(db, 'Send a message'), {
        name:      form.name,
        email:     form.email,
        phone:     form.phone,
        services:  form.services,          // array of selected services
        message:   form.message,
        createdAt: Timestamp.now(),
      });
      setSent(true);
      setForm({ name: '', email: '', phone: '', services: [], message: '' });
      setTimeout(() => setSent(false), 4000);
    } catch (err) {
      console.error('Error saving message:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const ic  = 'w-full px-3.5 py-3 rounded-xl text-sm outline-none transition-all duration-300';
  const is  = { background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' };
  const iF  = (e: React.FocusEvent<any>) => {
    e.target.style.borderColor = 'var(--orange)';
    e.target.style.boxShadow   = '0 0 0 3px rgba(249,115,22,0.1)';
  };
  const iB  = (e: React.FocusEvent<any>) => {
    e.target.style.borderColor = 'var(--border)';
    e.target.style.boxShadow   = 'none';
  };

  return (
    <section ref={ref} className="py-20 px-5 lg:px-10" style={{ background: 'var(--bg2)' }}>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-14 reveal">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-[2px] mb-4"
            style={{ background: 'var(--orange3)', color: 'var(--orange)', border: '1px solid var(--orange4)' }}
          >
            ◆ GET IN TOUCH
          </div>
          <h2
            className="font-grotesk font-bold tracking-tight mb-3"
            style={{ fontSize: 'clamp(32px,4vw,52px)', color: 'var(--text)', lineHeight: 1.1 }}
          >
            Let's Build<br />
            <span style={{ color: 'var(--orange)' }}>Together.</span>
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text3)' }}>
            Have a project in mind? Reach out and we'll get back to you within hours.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">

          {/* ── Left info ── */}
          <div className="reveal-l">
            {[
              { icon: Mail,   label: 'EMAIL US',  val: 'office.starkinnovationz@gmail.com' },
              { icon: Phone,  label: 'CALL US',   val: '+91 94428 79062 / +91 94860 43621' },
              { icon: MapPin, label: 'LOCATION',  val: 'India — Serving Nationwide' },
            ].map(info => {
              const Icon = info.icon;
              return (
                <div
                  key={info.label}
                  className="flex items-start gap-4 p-4 rounded-2xl border mb-3 card-hover cursor-default"
                  style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--orange3)' }}>
                    <Icon className="w-4 h-4" style={{ color: 'var(--orange)' }} />
                  </div>
                  <div>
                    <div className="text-[9px] font-bold tracking-[2px] mb-1" style={{ color: 'var(--text3)' }}>{info.label}</div>
                    <div className="font-grotesk font-bold text-sm" style={{ color: 'var(--text)' }}>{info.val}</div>
                  </div>
                </div>
              );
            })}

            {/* Always ready */}
            <div className="mt-5 p-5 rounded-2xl" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
              <h4 className="font-grotesk font-bold text-sm mb-2" style={{ color: 'var(--text)' }}>Always Ready to Help</h4>
              <p className="text-xs mb-4" style={{ color: 'var(--text3)' }}>Wherever you are — citywide service and delivery.</p>
              <div className="flex flex-col gap-3">
                {[
                  { icon: Clock,  text: 'Sunday to Saturday: 24/7 Services' },
                  { icon: Wrench, text: 'On-site troubleshooting available' },
                  { icon: Truck,  text: 'Doorstep product delivery' },
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <div key={item.text} className="flex items-center gap-3 text-xs" style={{ color: 'var(--text2)' }}>
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: 'var(--orange3)' }}>
                        <Icon className="w-2.5 h-2.5" style={{ color: 'var(--orange)' }} />
                      </div>
                      {item.text}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Form ── */}
          <div className="p-8 rounded-2xl reveal-r" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
            <h3 className="font-grotesk font-bold text-lg mb-1" style={{ color: 'var(--text)' }}>Send a Message</h3>
            <p className="text-xs mb-6" style={{ color: 'var(--text3)' }}>We respond within a few hours.</p>

            <form onSubmit={handle} className="space-y-4">

              {/* Name, Email, Phone */}
              {[
                { label: 'YOUR NAME',    type: 'text',  ph: 'John Doe',        key: 'name' },
                { label: 'EMAIL',        type: 'email', ph: 'john@example.com', key: 'email' },
                { label: 'PHONE NUMBER', type: 'tel',   ph: '+91 XXXXX XXXXX',  key: 'phone' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-[9px] font-bold tracking-[2px] mb-1.5" style={{ color: 'var(--orange)' }}>
                    {f.label}
                  </label>
                  <input
                    type={f.type} required placeholder={f.ph}
                    value={(form as any)[f.key]}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    className={ic} style={is} onFocus={iF} onBlur={iB}
                  />
                </div>
              ))}

              {/* ── Multi-select services ── */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[9px] font-bold tracking-[2px]" style={{ color: 'var(--orange)' }}>
                    SERVICES INTERESTED IN
                  </label>
                  {form.services.length > 0 && (
                    <span
                      className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: 'var(--orange3)', color: 'var(--orange)' }}
                    >
                      {form.services.length} selected
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {SERVICES.map(svc => {
                    const selected = form.services.includes(svc.label);
                    return (
                      <button
                        key={svc.label}
                        type="button"
                        onClick={() => toggleService(svc.label)}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all duration-200"
                        style={{
                          background:   selected ? 'var(--orange3)'    : 'var(--bg2)',
                          border:       `1.5px solid ${selected ? 'var(--orange)' : 'var(--border)'}`,
                          color:        selected ? 'var(--orange)'     : 'var(--text2)',
                          transform:    selected ? 'scale(1.02)'       : 'scale(1)',
                          boxShadow:    selected ? '0 2px 12px rgba(249,115,22,0.15)' : 'none',
                        }}
                      >
                        {/* check box */}
                        <div
                          className="w-4 h-4 rounded-md flex items-center justify-center flex-shrink-0 transition-all duration-200"
                          style={{
                            background: selected ? 'var(--orange)' : 'transparent',
                            border:     `1.5px solid ${selected ? 'var(--orange)' : 'var(--border)'}`,
                          }}
                        >
                          {selected && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                        </div>
                        <span className="text-[11px] font-medium leading-tight">{svc.emoji} {svc.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* selected pills preview */}
                {form.services.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {form.services.map(s => (
                      <span
                        key={s}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-all hover:opacity-70"
                        style={{ background: 'var(--orange)', color: '#fff' }}
                        onClick={() => toggleService(s)}
                        title="Click to remove"
                      >
                        {s} ×
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Project details */}
              <div>
                <label className="block text-[9px] font-bold tracking-[2px] mb-1.5" style={{ color: 'var(--orange)' }}>
                  PROJECT DETAILS
                </label>
                <textarea
                  required rows={4} placeholder="Tell us about your project..."
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  className={`${ic} resize-none`} style={is} onFocus={iF} onBlur={iB}
                />
              </div>

              {/* Error */}
              {error && (
                <div
                  className="text-xs font-medium px-4 py-3 rounded-xl"
                  style={{ background: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3' }}
                >
                  ⚠ {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || sent}
                className="w-full py-3.5 rounded-xl text-white text-sm font-bold tracking-wide flex items-center justify-center gap-2 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-80 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                style={{
                  background:  sent
                    ? 'linear-gradient(135deg,#22c55e,#16a34a)'
                    : 'linear-gradient(135deg,var(--orange),var(--orange2))',
                  boxShadow: '0 6px 20px rgba(249,115,22,0.25)',
                }}
              >
                {sent ? (
                  <>✓ MESSAGE SENT!</>
                ) : loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    SENDING...
                  </>
                ) : (
                  <><span>SEND MESSAGE</span><Send className="w-4 h-4" /></>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}