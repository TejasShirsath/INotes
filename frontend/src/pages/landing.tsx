
import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Testimonials from '../components/Testimonials';
import CTA from '../components/CTA';
import Footer from '../components/Footer';

interface LandingProps {
  onLoginClick: () => void;
}

const Landing: React.FC<LandingProps> = ({ onLoginClick }) => {
  return (
    <div className="min-h-screen">
      <Header onLoginClick={onLoginClick} />
      <Hero onLoginClick={onLoginClick} />
      <Features onLoginClick={onLoginClick} />
      <Testimonials />
      <CTA onLoginClick={onLoginClick} />
      <Footer />
    </div>
  );
};

export default Landing;
