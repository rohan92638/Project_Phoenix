import React from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,77,0,0.1)_0%,_transparent_70%)]"></div>
        <img
          className="w-full h-full object-cover opacity-30 mix-blend-screen"
          alt="abstract artistic visualization of glowing fiery orange phoenix wings emerging from deep purple cosmic smoke and embers"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBBGIjis0JgXkU4I1goMsWPRUcC9dkI3YpxtVpzQ339LW1Lf977zcbHkGKca6du90vILUpkcBXaA_xNx6_6LaRDiyta3_OWgj7DsjHCTlrqDp-0jseqmya83IzAZd7c7tPAxwYdNGUN_nHbC7bzwWtlDnATKY-k-sp6j3YcKflUp2BVVHsDVAm3pai0agec4qDBEU31_7Gbf3fVp2eADDMkkowDDHoYIIHkImhl0rbdeZwoUhTVqkd1P9nqqsCw19RRWYXDvcGN"
        />
      </div>
      <div className="container mx-auto px-8 relative z-10 flex flex-col items-start">
        <span className="text-primary tracking-[0.3em] font-medium uppercase mb-4 block">Personal Growth Protocol</span>
        <h1 className="font-headline text-7xl md:text-9xl font-black mb-2 text-on-surface phoenix-glow leading-[0.9]">
          Project Phoenix
        </h1>
        <h2 className="font-headline text-3xl md:text-5xl font-light text-secondary mb-8 leading-tight">
          From Ashes to <span className="text-primary-container font-bold">Authority</span>
        </h2>
        <p className="max-w-xl text-on-surface-variant text-lg md:text-xl mb-12 font-light leading-relaxed">
          A self-discipline and personal growth system designed to transform your chaos into structure, and your failures into strength.
        </p>
        <div className="flex flex-wrap gap-6">
          <Link to="/login" className="gold-gradient text-on-secondary-container px-10 py-5 rounded-full font-black text-lg uppercase tracking-widest shadow-[0_0_30px_rgba(255,219,60,0.3)] hover:scale-105 active:scale-95 transition-all inline-block flex items-center justify-center">
            Login
          </Link>
          <Link to="/signup" className="px-10 py-5 rounded-full font-black text-lg uppercase tracking-widest border-2 border-primary-container text-primary-container hover:bg-primary-container/10 transition-all inline-block flex items-center justify-center">
            Sign Up
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
