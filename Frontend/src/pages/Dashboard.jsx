import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
        const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    return (
        <div className="bg-[#0B0014] text-on-surface font-body min-h-screen overflow-x-hidden selection:bg-primary-container selection:text-white relative">
            {/* TopNavBar Shell */}
            <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-slate-950/60 backdrop-blur-xl shadow-[0_4px_20px_rgba(255,77,0,0.05)] font-headline tracking-tight">
                <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-slate-400 hover:text-orange-300 transition-colors duration-300 cursor-pointer" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>menu</span>
                    <Link to="/" className="text-2xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-orange-300 to-orange-600">Project Phoenix</Link>
                </div>
                <div className="hidden md:flex items-center gap-8">
                    <span className="text-orange-500 font-bold">Discipline Score: 98</span>
                    <span className="text-slate-400">Phoenix v1.0</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-slate-400 hover:text-orange-300 transition-colors duration-300 cursor-pointer">account_circle</span>
                </div>
            </header>
            <div className="bg-gradient-to-r from-transparent via-orange-500/20 to-transparent h-[1px] fixed top-[72px] w-full z-50"></div>
            
            {/* SideNavBar Shell */}
            <aside className={`flex flex-col h-screen w-64 fixed left-0 top-0 bg-[#0B0014] shadow-[10px_0_30px_rgba(0,0,0,0.5)] z-40 pt-20 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="px-6 mb-8 mt-4 flex justify-between items-center">
                    <h2 className="font-headline font-black text-orange-500 uppercase tracking-widest text-xs">The Celestial Rebirth</h2>
                    <span className="material-symbols-outlined text-slate-500 cursor-pointer md:hidden" onClick={() => setIsSidebarOpen(false)}>close</span>
                </div>
                <nav className="flex-1 overflow-y-auto space-y-1">
                    <Link className="flex items-center gap-3 bg-gradient-to-r from-orange-600/20 to-transparent text-orange-400 border-l-4 border-orange-500 py-3 px-6 transition-all font-body text-sm uppercase tracking-widest" to="/dashboard">
                        <span className="material-symbols-outlined">dashboard</span> Dashboard
                    </Link>
                    <Link className="flex items-center gap-3 text-slate-500 hover:text-slate-300 py-3 px-6 transition-all hover:bg-white/5 font-body text-sm uppercase tracking-widest" to="/daily-tracker">
                        <span className="material-symbols-outlined">bolt</span> Daily Tracker
                    </Link>
                    <Link className="flex items-center gap-3 text-slate-500 hover:text-slate-300 py-3 px-6 transition-all hover:bg-white/5 font-body text-sm uppercase tracking-widest" to="/study-tracker">
                        <span className="material-symbols-outlined">school</span> Study Tracker
                    </Link>
                    <Link className="flex items-center gap-3 text-slate-500 hover:text-slate-300 py-3 px-6 transition-all hover:bg-white/5 font-body text-sm uppercase tracking-widest" to="/finance-tracker">
                        <span className="material-symbols-outlined">payments</span> Finance Tracker
                    </Link>
                    <Link className="flex items-center gap-3 text-slate-500 hover:text-slate-300 py-3 px-6 transition-all hover:bg-white/5 font-body text-sm uppercase tracking-widest" to="/journal">
                        <span className="material-symbols-outlined">edit_note</span> Journal
                    </Link>
                    <Link className="flex items-center gap-3 text-slate-500 hover:text-slate-300 py-3 px-6 transition-all hover:bg-white/5 font-body text-sm uppercase tracking-widest" to="/failure-tracker">
                        <span className="material-symbols-outlined">error</span> Failure Tracker
                    </Link>
                    <Link className="flex items-center gap-3 text-slate-500 hover:text-slate-300 py-3 px-6 transition-all hover:bg-white/5 font-body text-sm uppercase tracking-widest" to="/rules-discipline">
                        <span className="material-symbols-outlined">gavel</span> Rules & Discipline
                    </Link>
                    <Link className="flex items-center gap-3 text-slate-500 hover:text-slate-300 py-3 px-6 transition-all hover:bg-white/5 font-body text-sm uppercase tracking-widest" to="/analysis">
                        <span className="material-symbols-outlined">analytics</span> Analysis
                    </Link>
                    <div className="flex flex-col w-full">
                        <button 
                            className="flex items-center justify-between w-full text-slate-500 hover:text-slate-300 py-3 px-6 transition-all hover:bg-white/5 font-body text-sm uppercase tracking-widest" 
                            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                        >
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined">settings</span> Settings
                            </div>
                            <span className="material-symbols-outlined text-sm">{isSettingsOpen ? 'expand_less' : 'expand_more'}</span>
                        </button>
                        {isSettingsOpen && (
                            <div className="flex flex-col bg-[#1d0c26]/50 py-2 pl-14 pr-6 space-y-2 border-l-2 border-[#ffb59e]/20 ml-6 mb-2">
                                <Link to="#" className="text-xs text-on-surface-variant hover:text-primary transition-colors py-1">Update Profile</Link>
                                <Link to="#" className="text-xs text-on-surface-variant hover:text-primary transition-colors py-1">Change Version</Link>
                                <Link to="#" className="text-xs text-on-surface-variant hover:text-primary transition-colors py-1">Target</Link>
                            </div>
                        )}
                    </div>
                    <Link className="flex items-center gap-3 text-slate-500 hover:text-slate-300 py-3 px-6 transition-all hover:bg-white/5 font-body text-sm uppercase tracking-widest mt-10" to="/login">
                        <span className="material-symbols-outlined">logout</span> Logout
                    </Link>
                </nav>
                <div className="p-6">
                    <button className="w-full py-3 rounded-full flame-gradient text-on-primary-fixed font-bold flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(255,87,26,0.2)] hover:scale-[1.02] transition-transform">
                        <span className="material-symbols-outlined">add</span> New Entry
                    </button>
                </div>
            </aside>

            {/* Overlay for mobile sidebar */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Main Canvas */}
            <main className={`pt-24 pb-12 px-6 lg:px-12 min-h-screen relative overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
                {/* Background Flame Decoration */}
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-container/10 blur-[120px] rounded-full pointer-events-none"></div>
                <div className="absolute top-1/2 -left-24 w-64 h-64 bg-tertiary-container/5 blur-[100px] rounded-full pointer-events-none"></div>
                
                <div className="max-w-7xl mx-auto space-y-12 relative">
                    {/* Hero Status Panel */}
                    <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                        <div className="lg:col-span-8 glass-panel p-8 rounded-xl flex flex-col md:flex-row justify-between items-center gap-8">
                            <div className="space-y-4 text-center md:text-left">
                                <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tighter text-glow-orange" style={{ textShadow: '0 0 15px rgba(255, 87, 26, 0.5)' }}>Current Status: Focused</h1>
                                <p className="text-on-surface-variant font-body">Day 42 of your ascension. The flame burns steady.</p>
                                <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
                                    <div className="bg-surface-container-highest px-4 py-2 rounded-full flex items-center gap-2 border border-outline-variant/20">
                                        <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                                        <span className="text-xs font-bold uppercase tracking-widest">1 Day</span>
                                    </div>
                                    <div className="bg-surface-container-highest px-4 py-2 rounded-full flex items-center gap-2 border border-outline-variant/20">
                                        <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                                        <span className="text-xs font-bold uppercase tracking-widest">7 Days</span>
                                    </div>
                                    <div className="bg-gradient-to-r from-orange-500 to-orange-700 px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                                        <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                                        <span className="text-xs font-bold uppercase tracking-widest text-white">30 Days</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-center md:text-right space-y-1">
                                <div className="text-sm uppercase tracking-[0.2em] text-slate-500 font-semibold">Last Activity</div>
                                <div className="text-xl font-headline font-medium">2 hours ago</div>
                                <div className="pt-6">
                                    <div className="text-sm uppercase tracking-[0.2em] text-slate-500 font-semibold">Current Streak</div>
                                    <div className="text-5xl font-headline font-black text-orange-500">42</div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="lg:col-span-4 bg-surface-container-low rounded-xl p-8 flex flex-col justify-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <h3 className="text-xs uppercase tracking-[0.3em] text-orange-400 font-bold mb-6">Weekly Insight</h3>
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-primary text-xl">trending_up</span>
                                    </div>
                                    <p className="text-sm font-medium leading-relaxed">Consistency Improved. You've maintained peak focus for 6 consecutive days.</p>
                                </div>
                                <div className="flex gap-4 p-4 rounded-lg bg-error-container/20 border border-error/10">
                                    <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-error text-xl">warning</span>
                                    </div>
                                    <p className="text-sm font-medium text-error leading-relaxed">Finance Discipline Needs Attention. Spending exceeded target by 12%.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Progress Orb Section */}
                    <section className="py-12 flex flex-col items-center justify-center space-y-8">
                        <div className="relative w-80 h-80 flex items-center justify-center">
                            {/* Glow effect */}
                            <div className="absolute inset-0 bg-primary-container/20 rounded-full blur-[60px]"></div>
                            {/* Circular Progress */}
                            <svg className="w-full h-full transform -rotate-90">
                                <circle className="text-surface-container-highest" cx="160" cy="160" fill="transparent" r="140" stroke="currentColor" strokeWidth="8"></circle>
                                <circle cx="160" cy="160" fill="transparent" r="140" stroke="url(#flameGradient)" strokeDasharray="880" strokeDashoffset="413" strokeLinecap="round" strokeWidth="12"></circle>
                                <defs>
                                    <linearGradient id="flameGradient" x1="0%" x2="100%" y1="0%" y2="100%">
                                        <stop offset="0%" style={{ stopColor: '#ffb59e', stopOpacity: 1 }}></stop>
                                        <stop offset="100%" style={{ stopColor: '#ff571a', stopOpacity: 1 }}></stop>
                                    </linearGradient>
                                </defs>
                            </svg>
                            {/* Center Content */}
                            <div className="absolute flex flex-col items-center">
                                <span className="text-7xl font-headline font-black text-white tracking-tighter">53%</span>
                                <span className="text-xs uppercase tracking-[0.4em] text-orange-300 font-bold mt-2">Evolution</span>
                            </div>
                        </div>
                        <div className="w-full max-w-2xl space-y-4">
                            <div className="flex justify-between text-xs uppercase tracking-[0.3em] font-black">
                                <span className="text-slate-500">Ashes</span>
                                <span className="text-orange-500">Phoenix</span>
                            </div>
                            <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden relative">
                                <div className="absolute top-0 left-0 h-full w-[53%] flame-gradient shadow-[0_0_10px_rgba(255,87,26,0.5)]"></div>
                                {/* Marker */}
                                <div className="absolute top-0 left-[53%] w-1 h-full bg-white z-10 shadow-lg"></div>
                            </div>
                        </div>
                    </section>

                    {/* Grid Summary Cards */}
                    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        {/* Daily Discipline */}
                        <div className="bg-surface-container-low p-6 rounded-xl space-y-4 border-t border-white/5 hover:bg-surface-container transition-colors">
                            <div className="flex justify-between items-start">
                                <span className="material-symbols-outlined text-primary text-3xl">task_alt</span>
                                <div className="flex items-center text-xs font-bold text-green-400">
                                    <span className="material-symbols-outlined text-sm">trending_up</span>
                                </div>
                            </div>
                            <div>
                                <div className="text-3xl font-headline font-bold">92%</div>
                                <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-1">Daily Discipline</div>
                            </div>
                            <div className="text-xs font-semibold text-green-400 bg-green-400/10 px-2 py-1 rounded w-fit">Good</div>
                        </div>
                        
                        {/* Study Progress */}
                        <div className="bg-surface-container-low p-6 rounded-xl space-y-4 border-t border-white/5 hover:bg-surface-container transition-colors">
                            <div className="flex justify-between items-start">
                                <span className="material-symbols-outlined text-secondary text-3xl">auto_stories</span>
                                <div className="flex items-center text-xs font-bold text-yellow-400">
                                    <span className="material-symbols-outlined text-sm">trending_down</span>
                                </div>
                            </div>
                            <div>
                                <div className="text-3xl font-headline font-bold">68%</div>
                                <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-1">Study Progress</div>
                            </div>
                            <div className="text-xs font-semibold text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded w-fit">Warning</div>
                        </div>

                        {/* Financial Control */}
                        <div className="bg-surface-container-low p-6 rounded-xl space-y-4 border-t border-white/5 hover:bg-surface-container transition-colors">
                            <div className="flex justify-between items-start">
                                <span className="material-symbols-outlined text-primary text-3xl">account_balance_wallet</span>
                                <div className="flex items-center text-xs font-bold text-green-400">
                                    <span className="material-symbols-outlined text-sm">trending_up</span>
                                </div>
                            </div>
                            <div>
                                <div className="text-3xl font-headline font-bold">85%</div>
                                <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-1">Financial Control</div>
                            </div>
                            <div className="text-xs font-semibold text-green-400 bg-green-400/10 px-2 py-1 rounded w-fit">Good</div>
                        </div>

                        {/* Failure Control */}
                        <div className="bg-surface-container-low p-6 rounded-xl space-y-4 border-t border-white/5 hover:bg-surface-container transition-colors">
                            <div className="flex justify-between items-start">
                                <span className="material-symbols-outlined text-error text-3xl">dangerous</span>
                                <div className="flex items-center text-xs font-bold text-error">
                                    <span className="material-symbols-outlined text-sm">trending_down</span>
                                </div>
                            </div>
                            <div>
                                <div className="text-3xl font-headline font-bold">42%</div>
                                <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-1">Failure Control</div>
                            </div>
                            <div className="text-xs font-semibold text-error bg-error/10 px-2 py-1 rounded w-fit">Poor</div>
                        </div>

                        {/* Consistency */}
                        <div className="bg-surface-container-low p-6 rounded-xl space-y-4 border-t border-white/5 hover:bg-surface-container transition-colors">
                            <div className="flex justify-between items-start">
                                <span className="material-symbols-outlined text-primary text-3xl">query_stats</span>
                                <div className="flex items-center text-xs font-bold text-green-400">
                                    <span className="material-symbols-outlined text-sm">trending_up</span>
                                </div>
                            </div>
                            <div>
                                <div className="text-3xl font-headline font-bold">95%</div>
                                <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-1">Consistency</div>
                            </div>
                            <div className="text-xs font-semibold text-green-400 bg-green-400/10 px-2 py-1 rounded w-fit">Good</div>
                        </div>
                    </section>

                    {/* Quote Section */}
                    <section className="max-w-3xl mx-auto pt-12 pb-12">
                        <div className="glass-panel p-12 rounded-2xl text-center relative overflow-hidden group">
                            <span className="material-symbols-outlined text-6xl text-orange-500/10 absolute -top-2 -left-2 rotate-12">format_quote</span>
                            <blockquote className="relative z-10 space-y-6">
                                <p className="text-2xl md:text-3xl font-headline font-light italic leading-snug text-on-surface">
                                    "A man is made by his belief. As he believes, so he is."
                                </p>
                                <footer className="text-sm uppercase tracking-[0.4em] font-bold text-orange-400">— Bhagavad Gita</footer>
                            </blockquote>
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent"></div>
                        </div>
                    </section>
                </div>
            </main>

            {/* FAB for quick action (Only visible on mobile) */}
            <button className="fixed bottom-8 right-8 md:hidden w-16 h-16 rounded-full flame-gradient flex items-center justify-center text-white shadow-2xl z-50">
                <span className="material-symbols-outlined text-3xl">add</span>
            </button>
        </div>
    );
};

export default Dashboard;
