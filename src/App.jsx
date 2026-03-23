import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from "react";

import './App.module.css';

// Layout Components
import Navbar from './components/layout/Navbar.jsx';
import BBar from './components/layout/BottomBar.jsx';
import DonateButton from './components/Donate.jsx';

// Pages
import Homepg from './components/pages/HomePage.jsx';
import AboutUs from './components/pages/AboutPage.jsx';
import CU from './components/pages/ContactPage.jsx';
import Prpo from './components/PrivacyPolicy.jsx';
import Home2 from './components/pages/home2.jsx'
// language
import HomeDE from './components/pages/de-home.jsx';


// Extras
import GCintro from './components/games/ghost-code/GhostCodeIntro.jsx';
import Caa from './components/pages/credits.jsx';
import Test from './components/games/test/test.jsx';

// Games
import Game2048 from './components/games/game-2048/Game2048.jsx';
import SnakeGame from './components/games/snake/SnakeGame.jsx';
import Hangman from './components/games/hangman/Hangman.jsx';
import GCplay from './components/games/ghost-code/GhostCode.jsx';
import MemoryPuzzle from './components/games/MemoryPuzzle/Memory.jsx';
import BounceGame from './components/games/bounce/bounce.jsx';
import NeonDodge3D from './components/games/neondodge/neondodge.jsx';

// Optional: 404 Page (to catch unmatched routes)
const NotFound = () => (
  <div className="text-center text-white py-20 text-2xl">
    404 - Page Not Found
  </div>
);

// function Sayori2() {
//   window.location.replace("https://gsatvik.in/shadowveil-studioz/sayori");
//   return null;
// }
// due to alas i added it like this [it's alas... laziness]
function Sayori() {
  useEffect(() => {
    const t = setTimeout(() => {
      window.location.replace("https://gsatvik.in/shadowveil-studioz/sayori");
      // }, []);
    }, 900);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
        background:
          "radial-gradient(circle at top, #160012, #000000 70%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "#e5e5e5",
        fontFamily: "serif",
        textAlign: "center",
      }}
    >
      {/* Sigil */}
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          border: "2px solid rgba(255,0,80,0.6)",
          boxShadow:
            "0 0 18px rgba(255,0,80,0.5), inset 0 0 18px rgba(255,0,80,0.3)",
          animation: "pulse 1.8s ease-in-out infinite",
        }}
      />

      <h1
        style={{
          marginTop: 24,
          fontSize: "2.2rem",
          letterSpacing: "0.12em",
          textShadow: "0 0 12px rgba(255,0,80,0.35)",
        }}
      >
        Summoning Sayori
      </h1>

      <p style={{ marginTop: 10, opacity: 0.75 }}>
        Crossing the veil<span className="dots">...</span>
      </p>

      {/* Inline keyframes */}
      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.9); opacity: 0.5; }
          50% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(0.9); opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="app-wrapper">
        <Navbar />

        <div className="main-content">
          <Routes>
            {/* Homepage */}
            <Route path="/" element={<Homepg />} />
            <Route path="/home" element={<Home2 />} />
            <Route path="/home2" element={<HomeDE />} />

            {/* Game intros */}
            <Route path="/ghost-code" element={<GCintro />} />

            {/* Games */}
            <Route path="/tzfe" element={<Game2048 />} />
            <Route path="/Snake" element={<SnakeGame />} />
            <Route path="/HangMan" element={<Hangman />} />
            <Route path="/ghost-code/play" element={<GCplay />} />
            <Route path="/memory" element={<MemoryPuzzle />} />
            <Route path="/bounce" element={<BounceGame />} />
            <Route path="/NeonDodge3D" element={<NeonDodge3D />} />
            <Route path="/test" element={<Test />} />

            {/* Other pages */}
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/reach-us" element={<CU />} />
            <Route path="/privacy-policy" element={<Prpo />} />
            <Route path="/acknowledgement" element={<Caa />} />

            {/* redirect */}
            <Route path="/sayori" element={<Sayori />} />
            {/* <Route path="/sayori2" element={ <Sayori2/> } /> */}
            {/* Final Destination */}
            <Route path="*" element={<NotFound />} />
          </Routes>

          <DonateButton />
        </div>

        <BBar />
      </div>
    </Router>
  );
}

export default App;