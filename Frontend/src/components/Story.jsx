import React from 'react';

const Story = () => {
  const steps = [
    { icon: 'egg', title: 'Baby Phoenix Rising', subtitle: 'Initial Spark' },
    { icon: 'heart_broken', title: 'Gets Hurt', subtitle: 'The Encounter' },
    { icon: 'arrow_downward', title: 'Falls', subtitle: 'The Bottom' },
    { icon: 'verified', title: 'Chooses Discipline', subtitle: 'The Pivot' }
  ];

  return (
    <section id="story" className="py-32 bg-surface-container-low relative">
      <div className="container mx-auto px-8">
        <div className="flex flex-col items-center mb-20 text-center">
          <h2 className="font-headline text-5xl font-bold text-on-surface mb-6">The Rise of the Phoenix</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-primary-container to-transparent"></div>
        </div>
        <div className="relative max-w-5xl mx-auto">
          {/* Path Connector */}
          <div className="absolute top-1/2 left-0 w-full h-[2px] bg-[#ff571a]/20 hidden lg:block -translate-y-1/2">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary animate-pulse"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative flex flex-col items-center group">
                <div className="w-20 h-20 rounded-full bg-surface-container-highest border-2 border-primary/20 flex items-center justify-center mb-6 group-hover:border-primary transition-colors z-10">
                  <span className="material-symbols-outlined text-primary text-3xl">{step.icon}</span>
                </div>
                <h3 className="font-headline font-bold text-primary mb-2">{step.title}</h3>
                <p className="text-xs text-center text-on-surface/60 uppercase tracking-tighter">{step.subtitle}</p>
              </div>
            ))}
            
            {/* Final Step */}
            <div className="relative flex flex-col items-center group">
              <div className="w-20 h-20 rounded-full flame-gradient flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(255,77,0,0.5)] z-10">
                <span className="material-symbols-outlined text-on-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  local_fire_department
                </span>
              </div>
              <h3 className="font-headline font-bold text-secondary mb-2">Rises Stronger</h3>
              <p className="text-xs text-center text-on-surface/60 uppercase tracking-tighter">Ascension</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Story;
