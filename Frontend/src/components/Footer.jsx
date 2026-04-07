import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-[#0B0014] w-full py-12 border-t border-[#ff571a]/10">
      <div className="flex flex-col md:flex-row justify-between items-center px-12 w-full gap-6 max-w-screen-2xl mx-auto">
        <div className="font-['Space_Grotesk'] font-bold text-[#ffb59e] text-xl">
          Project Phoenix
        </div>
        <div className="flex gap-8 text-[#f6d9fd]/40 font-['Inter'] text-xs uppercase tracking-widest">
          <a className="hover:text-[#ffb59e] transition-colors opacity-80 hover:opacity-100" href="#">Terms of Ascent</a>
          <a className="hover:text-[#ffb59e] transition-colors opacity-80 hover:opacity-100" href="#">Privacy Protocol</a>
          <a className="hover:text-[#ffb59e] transition-colors opacity-80 hover:opacity-100" href="#">System Support</a>
        </div>
        <div className="text-[#f6d9fd]/40 font-['Inter'] text-xs uppercase tracking-widest">
          © 2024 Project Phoenix. The Celestial Rebirth.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
