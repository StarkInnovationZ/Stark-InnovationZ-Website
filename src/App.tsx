import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header   from './components/Header';
import Hero     from './components/Hero';
import Services from './components/Services';
import Reviews  from './components/Reviews';
import About    from './components/About';
import Team     from './components/Team';
import Contact  from './components/Contact';
import Footer   from './components/Footer';

function App() {
  return (
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
  );
}

export default App;