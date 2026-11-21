
import './App.css';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

import Topography from './components/Topography';
import About from './pages/About';
import Contact from './pages/Contact';

function Home() {
  return (
    <div
      style={{
        height: '600px',
        width: '100%',
        position: 'relative'
      }}
    >
      <Topography
        color="#4f7cff"
        lineCount={22}
        speed={0.25}
      />

      <h1
        style={{
          position: 'absolute',
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'transparent',
          WebkitTextStroke: '1.5px white',
          fontSize: '68px',
          fontFamily: 'OXYGENE1.TTF',
          textAlign: 'center',
          zIndex: 2
        }}
      >
       EINEFICHTE
      </h1>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <main>
        <nav
          style={{
            position: 'absolute',
            top: '25px',
            right: '40px',
            display: 'flex',
            gap: '35px',
            zIndex: 10,
            fontFamily: 'Oxygene1',
            fontSize: '18px'
          }}
        >
          <Link to="/">HOME</Link>
          <Link to="/about">ABOUT</Link>
          <Link to="/contact">CONTACT</Link>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;

