import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="fixed top-0 w-full z-50 bg-[#1d0c26]/60 backdrop-blur-md bg-gradient-to-b from-[#412d49]/20 to-transparent shadow-[0_20px_40px_rgba(255,77,0,0.08)]">
      <div className="flex justify-between items-center px-8 py-4 w-full max-w-screen-2xl mx-auto font-['Space_Grotesk'] tracking-tight">
        <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ffb59e] to-[#ff571a]">
          Project Phoenix
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a className="text-[#ffb59e] border-b-2 border-[#ff571a] pb-1 hover:bg-[#ff571a]/10 transition-all duration-300" href="#story">Story</a>
          <a className="text-[#f6d9fd]/70 hover:text-[#f6d9fd] hover:bg-[#ff571a]/10 transition-all duration-300" href="#journey">Journey</a>
          <a className="text-[#f6d9fd]/70 hover:text-[#f6d9fd] hover:bg-[#ff571a]/10 transition-all duration-300" href="#features">Features</a>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-[#f6d9fd]/70 hover:text-[#f6d9fd] px-4 py-2 text-sm uppercase tracking-widest scale-95 active:scale-90 transition-transform inline-block">Login</Link>
          <Link to="/signup" className="gold-gradient text-on-secondary-container px-6 py-2 rounded-full font-bold text-sm uppercase tracking-widest scale-95 active:scale-90 transition-transform inline-block">Sign Up</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
