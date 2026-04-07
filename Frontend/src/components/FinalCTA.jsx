import React from 'react';
import { Link } from 'react-router-dom';

const FinalCTA = () => {
  return (
    <section className="py-40 relative">
      <div className="absolute inset-0 bg-[#8B0000]/20 mix-blend-multiply"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0014] via-transparent to-[#0B0014]"></div>
      <div className="container mx-auto px-8 relative z-10 text-center">
        <h2 className="font-headline text-6xl md:text-8xl font-black mb-8 text-on-surface leading-none phoenix-glow">
          Enter the Phoenix System
        </h2>
        <p className="text-2xl text-secondary font-light mb-12 max-w-2xl mx-auto italic">
          Stop restarting. Start rising.
        </p>
        <div className="flex flex-col md:flex-row justify-center items-center gap-6">
          <Link to="/login" className="gold-gradient text-on-secondary-container px-12 py-6 rounded-full font-black text-xl uppercase tracking-[0.2em] shadow-[0_0_50px_rgba(255,219,60,0.4)] hover:scale-110 active:scale-95 transition-all inline-block text-center flex items-center justify-center">
            Login
          </Link>
          <Link to="/signup" className="px-12 py-6 rounded-full font-black text-xl uppercase tracking-[0.2em] border-2 border-primary-container text-primary-container backdrop-blur-xl hover:bg-primary-container hover:text-on-primary transition-all inline-block text-center flex items-center justify-center">
            Sign Up
          </Link>
        </div>
      </div>
      {/* Background Flare */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-64 bg-primary-container opacity-20 blur-[120px] rounded-full"></div>
    </section>
  );
};

export default FinalCTA;
