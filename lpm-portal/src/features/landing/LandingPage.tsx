import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProblemGrid from './components/ProblemGrid';
import SolutionBinder from './components/SolutionBinder';
import ValueProp from './components/ValueProp';
import Footer from './components/Footer';
import NoiseOverlay from './components/NoiseOverlay';

interface LandingPageProps {
  onLoginClick: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick }) => {
  const [isDark, setIsDark] = useState(false);

  // Initialize theme based on system preference
  useEffect(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }

    // Cleanup: Remove dark class when leaving this page (optional, depending on preference)
    return () => {
      document.documentElement.classList.remove('dark');
    };
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  };

  return (
    <div className="relative min-h-screen font-sans selection:bg-accent selection:text-white transition-colors duration-300">
      <NoiseOverlay />
      
      {/* Pass the login handler to the Navbar */}
      <Navbar 
        isDark={isDark} 
        toggleTheme={toggleTheme} 
        onLoginClick={onLoginClick} 
      />
      
      <main className="relative z-10 flex flex-col">
        <Hero />
        <ProblemGrid />
        <SolutionBinder />
        <ValueProp />
      </main>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
};

export default LandingPage;