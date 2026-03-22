import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage.tsx';
import Header   from './components/Header';
import Hero     from './components/Hero';
import Services from './components/Services';
import Reviews  from './components/Reviews';
import About    from './components/About';
import Team     from './components/Team';
import Contact  from './components/Contact';
import Footer   from './components/Footer';

function App() {
  // If already visited this session → skip landing immediately
  const alreadySeen = sessionStorage.getItem('stark_entered') === '1';
  const [showLanding, setShowLanding] = useState(!alreadySeen);
  const [siteVisible, setSiteVisible] = useState(alreadySeen);

  const handleEnter = () => {
    sessionStorage.setItem('stark_entered', '1');
    setShowLanding(false);
    setTimeout(() => setSiteVisible(true), 50);
  };

  return (
    <>
      {/* Landing page — only on first visit per session */}
      {showLanding && <LandingPage onEnter={handleEnter} />}

      {/* Main site — fades in after landing (or instantly if revisit) */}
      <div
        style={{
          opacity:    siteVisible ? 1 : 0,
          transform:  siteVisible ? 'translateY(0)' : 'translateY(12px)',
          transition: siteVisible && !alreadySeen ? 'opacity 0.7s ease, transform 0.7s ease' : 'none',
        }}
      >
        <Router>
          <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
            <Header />
            <Routes>
              <Route path="/" element={<><Hero /><Reviews /></>} />
              <Route path="/services" element={<Services />} />
              <Route path="/about"    element={<About />} />
              <Route path="/team"     element={<Team />} />
              <Route path="/contact"  element={<Contact />} />
            </Routes>
            <Footer />
          </div>
        </Router>
      </div>
    </>
  );
}

export default App;