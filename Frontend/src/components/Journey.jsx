import React from 'react';

const Journey = () => {
  return (
    <section id="journey" className="py-32 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_10%_90%,_rgba(139,0,0,0.15)_0%,_transparent_50%)]"></div>
      <div className="container mx-auto px-8 relative">
        <div className="mb-24">
          <h2 className="font-headline text-6xl font-black text-on-surface max-w-2xl leading-none">Your Transformation Journey</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Stage 1 */}
          <div className="glass-card p-8 min-h-[400px] flex flex-col justify-between group hover:bg-surface-container-highest transition-all duration-500">
            <div>
              <span className="text-4xl material-symbols-outlined text-on-surface/30 mb-8 block">cyclone</span>
              <h3 className="font-headline text-3xl font-bold text-primary mb-4">Chaos</h3>
              <p className="text-on-surface-variant font-light">The state of reactive living. No systems, no focus, just noise.</p>
            </div>
            <div className="text-on-surface/20 font-black text-6xl font-headline group-hover:text-primary-container/40 transition-colors">01</div>
          </div>
          {/* Stage 2 */}
          <div className="glass-card p-8 min-h-[400px] flex flex-col justify-between group translate-y-8 hover:bg-surface-container-highest transition-all duration-500">
            <div>
              <span className="text-4xl material-symbols-outlined text-on-surface/30 mb-8 block">architecture</span>
              <h3 className="font-headline text-3xl font-bold text-primary mb-4">Structure</h3>
              <p className="text-on-surface-variant font-light">Building the framework. Implementing protocols and foundational habits.</p>
            </div>
            <div className="text-on-surface/20 font-black text-6xl font-headline group-hover:text-primary-container/40 transition-colors">02</div>
          </div>
          {/* Stage 3 */}
          <div className="glass-card p-8 min-h-[400px] flex flex-col justify-between group hover:bg-surface-container-highest transition-all duration-500">
            <div>
              <span className="text-4xl material-symbols-outlined text-on-surface/30 mb-8 block">shield</span>
              <h3 className="font-headline text-3xl font-bold text-primary mb-4">Discipline</h3>
              <p className="text-on-surface-variant font-light">The forging process. Consistency becomes your primary weapon.</p>
            </div>
            <div className="text-on-surface/20 font-black text-6xl font-headline group-hover:text-primary-container/40 transition-colors">03</div>
          </div>
          {/* Stage 4 */}
          <div className="glass-card p-8 min-h-[400px] flex flex-col justify-between group translate-y-8 hover:bg-surface-container-highest transition-all duration-500 border-primary/40 shadow-[0_0_40px_rgba(255,77,0,0.1)]">
            <div>
              <span className="text-4xl material-symbols-outlined text-primary mb-8 block" style={{ fontVariationSettings: "'FILL' 1" }}>flare</span>
              <h3 className="font-headline text-3xl font-bold text-secondary mb-4">Phoenix</h3>
              <p className="text-on-surface-variant font-light">Self-Mastery. You no longer battle your impulses; you command them.</p>
            </div>
            <div className="text-primary-container font-black text-6xl font-headline opacity-40">04</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Journey;
