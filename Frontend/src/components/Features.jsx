import React from 'react';

const Features = () => {
  return (
    <section id="features" className="py-32 bg-[#0B0014]">
      <div className="container mx-auto px-8">
        <div className="flex items-end justify-between mb-20 gap-8 flex-wrap">
          <h2 className="font-headline text-5xl font-bold max-w-xl">Powerful Tracking System for Absolute Clarity</h2>
          <p className="text-on-surface-variant max-w-sm mb-2">Metrics drive growth. If you don't measure it, you cannot conquer it.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-6 md:grid-rows-2 gap-4 h-full">
          {/* Daily Tracker */}
          <div className="md:col-span-3 bg-surface-container p-10 rounded-2xl border border-white/5 flex flex-col justify-between group hover:border-primary/30 transition-all">
            <div>
              <span className="material-symbols-outlined text-4xl text-primary mb-6">event_repeat</span>
              <h3 className="text-2xl font-headline font-bold mb-4">Daily Tracker</h3>
              <p className="text-on-surface-variant">The core of your routine. Log habits, rituals, and non-negotiables with high-fidelity precision.</p>
            </div>
            <img
              className="w-full h-32 object-cover rounded-xl mt-8 opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-80 transition-all"
              alt="minimalist close-up of a digital habit tracking interface with glowing orange progress bars on a dark background"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCqAiNNavaBCZqcrvMouqah8zveMMVlAzy_xuqoS8C68o-mnxfhp_g8YkiZdXh20eyQZfcnvxKKQl7jIU6DXgM1NaMCmcOiq0szCQDiJJCptyorXlThC8Re7lNvO6kWheu3HPEp3rqwL-r_gctOlQBz6PPA5GEmzjY8QxNeVg0RdChdj8y6r0BFUzoUj0waNSdfxorwfNpMCLe4hlrUrPdD6yYG9zvqA6LTScGg1GioKlbs24GLY_BS9UpIDIcGlcXG55mEyPvU"
            />
          </div>
          {/* Study Tracker */}
          <div className="md:col-span-3 bg-surface-container-low p-10 rounded-2xl border border-white/5 flex flex-col justify-between group hover:border-primary/30 transition-all">
            <div>
              <span className="material-symbols-outlined text-4xl text-primary mb-6">menu_book</span>
              <h3 className="text-2xl font-headline font-bold mb-4">Study Tracker</h3>
              <p className="text-on-surface-variant">Continuous learning protocols. Track deep work sessions, skill acquisition, and reading milestones.</p>
            </div>
            <div className="flex gap-2 mt-8">
              <div className="h-1 flex-1 bg-primary/20 rounded-full overflow-hidden">
                <div className="h-full w-3/4 flame-gradient"></div>
              </div>
              <div className="h-1 flex-1 bg-primary/20 rounded-full overflow-hidden">
                <div className="h-full w-1/2 flame-gradient"></div>
              </div>
            </div>
          </div>
          {/* Finance Tracker */}
          <div className="md:col-span-2 bg-surface-container-highest p-10 rounded-2xl border border-white/5 flex flex-col items-center text-center group hover:scale-[1.02] transition-all">
            <span className="material-symbols-outlined text-5xl text-secondary mb-6">monetization_on</span>
            <h3 className="text-xl font-headline font-bold mb-4">Finance Tracker</h3>
            <p className="text-sm text-on-surface-variant">Resource management. Track your ascent to financial sovereignty.</p>
          </div>
          {/* Failure Tracker */}
          <div className="md:col-span-2 bg-surface p-10 rounded-2xl border border-tertiary-container/30 flex flex-col items-center text-center group hover:bg-tertiary-container/5 transition-all">
            <span className="material-symbols-outlined text-5xl text-tertiary-container mb-6">rebase_edit</span>
            <h3 className="text-xl font-headline font-bold mb-4">Failure Tracker</h3>
            <p className="text-sm text-on-surface-variant">Analyze the ash. Log setbacks, identify patterns, and plan the re-rise.</p>
          </div>
          {/* Analytics */}
          <div className="md:col-span-2 bg-[#1d0c26] p-10 rounded-2xl border border-primary-container/20 flex flex-col items-center text-center group overflow-hidden relative">
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <span className="material-symbols-outlined text-[120px]" style={{ fontVariationSettings: "'FILL' 1" }}>insights</span>
            </div>
            <span className="material-symbols-outlined text-5xl text-primary mb-6">query_stats</span>
            <h3 className="text-xl font-headline font-bold mb-4">Analytics</h3>
            <p className="text-sm text-on-surface-variant">Visual intelligence. See the growth of your phoenix through data visualizations.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
