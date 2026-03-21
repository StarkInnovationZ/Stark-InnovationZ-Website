import { Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="py-14 px-5 lg:px-10" style={{ background: 'var(--text)', color: 'rgba(245,243,240,0.85)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-sm text-white"
                style={{ background: 'linear-gradient(135deg,var(--orange),var(--orange2))' }}>
                S
              </div>
              <span className="font-grotesk font-bold text-sm" style={{ color: 'rgba(245,243,240,0.9)' }}>
                Stark InnovationZ
              </span>
            </div>
            <div className="text-[9px] tracking-[3px] mb-4 font-bold" style={{ color: 'var(--orange)' }}>
              INNOVATE · BUILD · DELIVER
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'rgba(245,243,240,0.4)', maxWidth: '220px' }}>
              Transforming ideas into reality through innovative project development.
            </p>
          </div>

          {/* Nav */}
          <div>
            <h4 className="text-[9px] tracking-[3px] font-bold mb-5" style={{ color: 'var(--orange)' }}>NAVIGATION</h4>
            <ul className="flex flex-col gap-3 list-none">
              {[{ path: '/', label: 'Home' }, { path: '/services', label: 'Services' }, { path: '/about', label: 'About' }, { path: '/team', label: 'Team' }, { path: '/contact', label: 'Contact' }].map(i => (
                <li key={i.path}>
                  <Link to={i.path} className="text-xs transition-colors duration-200"
                    style={{ color: 'rgba(245,243,240,0.45)' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'rgba(245,243,240,0.9)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(245,243,240,0.45)')}>
                    {i.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-[9px] tracking-[3px] font-bold mb-5" style={{ color: 'var(--orange)' }}>SERVICES</h4>
            <ul className="flex flex-col gap-3 list-none">
              {['Hardware', 'Web & App Dev', '3D Design & Print', 'Documentation', 'Training'].map(s => (
                <li key={s}>
                  <Link to="/services" className="text-xs transition-colors duration-200"
                    style={{ color: 'rgba(245,243,240,0.45)' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'rgba(245,243,240,0.9)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(245,243,240,0.45)')}>
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[9px] tracking-[3px] font-bold mb-5" style={{ color: 'var(--orange)' }}>CONTACT</h4>
            <ul className="flex flex-col gap-4 list-none">
              {[
                { Icon: Mail,   val: 'office.starkinnovationz@gmail.com', href: 'mailto:office.starkinnovationz@gmail.com' },
                { Icon: Phone,  val: '+91 94428 79062\n+91 94860 43621',  href: 'tel:+919442879062' },
                { Icon: MapPin, val: 'India',                              href: '#' },
              ].map(({ Icon, val, href }) => (
                <li key={val} className="flex items-start gap-2.5">
                  <Icon className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: 'var(--orange)' }} />
                  <a href={href} className="text-xs leading-relaxed transition-colors duration-200 break-all whitespace-pre-line"
                    style={{ color: 'rgba(245,243,240,0.45)' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'rgba(245,243,240,0.9)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(245,243,240,0.45)')}>
                    {val}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-8"
          style={{ borderTop: '1px solid rgba(245,243,240,0.08)' }}>
          <span className="text-[10px] tracking-wide" style={{ color: 'rgba(245,243,240,0.25)' }}>
            © {new Date().getFullYear()} STARK INNOVATIONZ. ALL RIGHTS RESERVED.
          </span>
          <div className="flex gap-5">
            {['Privacy Policy', 'Terms of Service'].map(t => (
              <button key={t} className="text-[10px] bg-transparent border-none cursor-pointer transition-colors duration-200"
                style={{ color: 'rgba(245,243,240,0.25)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'rgba(245,243,240,0.7)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(245,243,240,0.25)')}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}