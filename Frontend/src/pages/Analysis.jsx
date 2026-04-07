import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Analysis = () => {
        const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    return (
        <div className="bg-[#0B0014] text-on-surface font-body min-h-screen overflow-x-hidden relative">
            {/* TopNavBar */}
            <header className="fixed top-0 w-full z-50 flex justify-between items-center px-4 md:px-6 h-16 bg-[#1d0c26]/60 backdrop-blur-xl border-b border-[#ff4d00]/15 shadow-[0_20px_40px_rgba(255,77,0,0.08)]">
                <div className="flex items-center gap-4">
                    <span 
                        className="material-symbols-outlined text-[#ffb59e] cursor-pointer lg:hidden"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                        menu
                    </span>
                    <Link to="/" className="text-xl md:text-2xl font-black italic text-transparent bg-clip-text bg-gradient-to-br from-[#ffb59e] to-[#ff571a] font-['Space_Grotesk'] tracking-tight">Project Phoenix</Link>
                    <nav className="hidden md:flex gap-6 ml-8">
                        <span className="text-[#ffb59e] font-bold border-b-2 border-[#ffb59e] transition-colors duration-300">v1.0</span>
                    </nav>
                </div>
                <div className="flex items-center gap-4 md:gap-6">
                    <div className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 bg-[#ff4d00]/10 rounded-full border border-[#ff4d00]/20">
                        <span className="material-symbols-outlined text-[#ffb59e] text-sm">bolt</span>
                        <span className="text-[#ffb59e] font-bold font-['Space_Grotesk'] text-[10px] md:text-sm uppercase tracking-wider">Score: 850</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-xs text-[#f6d9fd]/60 font-medium">Alex Mercer</p>
                        </div>
                        <img alt="Alex Mercer" className="w-8 h-8 rounded-full border border-[#ffb59e]/30" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDWrdXYPGFGVnBvumSf7xrg3V0CT-4vOAzPtlY_UPWFKRhIwO7HVjkxf-pIEh0hVpSccWAFnu-yGhhBaMSoHC1ujihMeHb2PjY_0n9mYkoRLtDPOdTKLml-BvWwWV9P6VRvT5Z0_ok5wXkLSOIRYG9_dWx5WMk6DnvjaurBqexIxzQo6Mqqg4jvraGJ_cH8cbEjEN7HX65X5suyxCNmB0tFdFuQtep5vuNQJyqd9oRKrS6ICBY1YqJZfMBJN7uCIikIgVAVVr6p"/>
                    </div>
                </div>
            </header>

            {/* SideNavBar Overlay for mobile */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* SideNavBar */}
            <aside className={`h-full w-64 fixed left-0 top-0 bg-gradient-to-b from-[#26142e] to-[#0B0014] pt-20 pb-6 flex flex-col z-40 transition-transform duration-300 border-r border-[#ff4d00]/5 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                <div className="px-6 mb-8 flex justify-between items-center lg:block">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-high/40 w-full">
                        <img alt="Alex Mercer" className="w-10 h-10 rounded-lg" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_qD1wMGN9h7XKLqdwRMjT7yvWqgT5eE_yJ2ZfSyRbCOKalmXI9glFvaXHXiI4NwXIDR9PnpiAPsyg9mu6XkRqnNms9LjnNRL1QxEZ6nGHW74E8T9aSrXMmTPCwZ2FRq762ZWCBPdMCGY0KwBBWziQnV-JeY0Ocmg1iz3_V5ReuJYQw6wcaRyC6kARDNRYKT7vmIaWmUMc3fKcKCUz3MnaR3qktS0r7EFDbfBpOHcsGaiMHOFdNN58QRmosvCNMnAMSRn3bj52"/>
                        <div>
                            <h4 className="font-headline font-bold text-sm text-[#ffb59e]">Alex Mercer</h4>
                            <p className="text-[10px] text-[#f6d9fd]/40 uppercase tracking-widest">Phoenix Initiate</p>
                        </div>
                    </div>
                    <span className="material-symbols-outlined text-slate-500 cursor-pointer lg:hidden ml-4" onClick={() => setIsSidebarOpen(false)}>close</span>
                </div>
                
                <nav className="flex-1 space-y-1 px-4 overflow-y-auto">
                    <Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#f6d9fd]/40 hover:bg-[#412d49]/30 hover:text-[#fff9ef] transition-all" to="/dashboard">
                        <span className="material-symbols-outlined">dashboard</span>
                        <span className="text-sm font-medium">Dashboard</span>
                    </Link>
                    <Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#f6d9fd]/40 hover:bg-[#412d49]/30 hover:text-[#fff9ef] transition-all" to="/daily-tracker">
                        <span className="material-symbols-outlined">event_available</span>
                        <span className="text-sm font-medium">Daily Tracker</span>
                    </Link>
                    <Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#f6d9fd]/40 hover:bg-[#412d49]/30 hover:text-[#fff9ef] transition-all" to="/study-tracker">
                        <span className="material-symbols-outlined">menu_book</span>
                        <span className="text-sm font-medium">Study Tracker</span>
                    </Link>
                    <Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#f6d9fd]/40 hover:bg-[#412d49]/30 hover:text-[#fff9ef] transition-all" to="/finance-tracker">
                        <span className="material-symbols-outlined">payments</span>
                        <span className="text-sm font-medium">Finance Tracker</span>
                    </Link>
                    <Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#f6d9fd]/40 hover:bg-[#412d49]/30 hover:text-[#fff9ef] transition-all" to="/journal">
                        <span className="material-symbols-outlined">history_edu</span>
                        <span className="text-sm font-medium">Journal</span>
                    </Link>
                    <Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#f6d9fd]/40 hover:bg-[#412d49]/30 hover:text-[#fff9ef] transition-all" to="/failure-tracker">
                        <span className="material-symbols-outlined">error_outline</span>
                        <span className="text-sm font-medium">Failure Tracker</span>
                    </Link>
                    <Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#f6d9fd]/40 hover:bg-[#412d49]/30 hover:text-[#fff9ef] transition-all" to="/rules-discipline">
                        <span className="material-symbols-outlined">gavel</span>
                        <span className="text-sm font-medium">Rules & Discipline</span>
                    </Link>
                    <Link className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-[#ff4d00]/20 to-transparent text-[#ffb59e] border-l-4 border-[#ffb59e] transition-all" to="/analysis">
                        <span className="material-symbols-outlined">analytics</span>
                        <span className="text-sm font-bold">Analysis</span>
                    </Link>
                    <div className="flex flex-col w-full">
                        <button 
                            className="flex items-center justify-between w-full px-4 py-3 rounded-lg text-[#f6d9fd]/40 hover:bg-[#412d49]/30 hover:text-[#fff9ef] transition-all" 
                            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                        >
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined">settings</span>
                                <span className="text-sm font-medium">Settings</span>
                            </div>
                            <span className="material-symbols-outlined text-sm">{isSettingsOpen ? 'expand_less' : 'expand_more'}</span>
                        </button>
                        {isSettingsOpen && (
                            <div className="flex flex-col bg-[#1d0c26]/50 py-2 pl-12 pr-4 space-y-2 border-l-2 border-[#ffb59e]/20 ml-4 mb-2 rounded-lg">
                                <Link to="#" className="text-xs text-on-surface-variant hover:text-primary transition-colors py-1">Update Profile</Link>
                                <Link to="#" className="text-xs text-on-surface-variant hover:text-primary transition-colors py-1">Change Version</Link>
                                <Link to="#" className="text-xs text-on-surface-variant hover:text-primary transition-colors py-1">Target</Link>
                            </div>
                        )}
                    </div>
                </nav>
                <div className="px-4 mt-auto">

                    <Link className="flex items-center gap-3 px-4 py-4 mt-4 text-[#f6d9fd]/40 hover:text-error transition-colors" to="/login">
                        <span className="material-symbols-outlined">logout</span>
                        <span className="text-sm">Logout</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="lg:ml-64 pt-24 px-4 md:px-6 pb-12 transition-all duration-300">
                <div className="max-w-7xl mx-auto space-y-12">
                    
                    {/* Title Section */}
                    <div className="relative">
                        <h1 className="font-headline text-5xl md:text-7xl font-black text-on-surface leading-tight tracking-tighter opacity-90">
                            Analysis<span className="text-[#ffb59e]">.</span>
                        </h1>
                        <p className="mt-4 text-on-surface-variant font-body text-lg max-w-2xl">
                            Track your progress and understand your discipline patterns. Your ascent is quantified through every decision you make.
                        </p>
                        {/* Decorative background flame element */}
                        <div className="absolute -top-20 -right-20 w-96 h-96 bg-[#ff571a]/5 blur-[120px] rounded-full -z-10"></div>
                    </div>

                    {/* Add Parameter Section */}
                    <div className="bg-[#412d49]/60 backdrop-blur-xl border-t border-[#ffb59e]/20 p-6 rounded-2xl mb-8 flex flex-col md:flex-row items-center gap-4 border border-[#ff4d00]/10 shadow-lg shadow-black/20">
                        <div className="flex-1 w-full">
                            <label className="block text-[10px] text-[#f6d9fd]/40 uppercase tracking-widest font-bold mb-2 ml-1">New Metric Tracking</label>
                            <div className="relative flex items-center">
                                <span className="material-symbols-outlined absolute left-4 text-[#ffb59e]/50 text-xl">add_circle</span>
                                <input className="w-full bg-[#1d0c26]/50 border border-[#ff4d00]/20 rounded-full py-3 pl-12 pr-6 text-sm text-[#f6d9fd] placeholder:text-[#f6d9fd]/20 focus:outline-none focus:border-[#ff4d00]/50 transition-all focus:ring-1 focus:ring-[#ff4d00]/30" placeholder="Enter parameter (e.g., Finance, Food, Sleep)" type="text"/>
                            </div>
                        </div>
                        <div className="w-full md:w-auto pt-6 md:pt-0 shrink-0">
                            <button className="w-full md:w-auto px-8 py-3 bg-gradient-to-br from-[#ffb59e] to-[#ff571a] text-[#521300] font-bold rounded-full shadow-[0_20px_40px_rgba(255,77,0,0.08)] text-xs uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-sm">add</span> Add Parameter
                            </button>
                        </div>
                    </div>

                    {/* Graph Section */}
                    <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Chart Bento Area */}
                        <div className="lg:col-span-2 bg-[#412d49]/60 backdrop-blur-xl border-t border-[#ffb59e]/20 p-8 rounded-2xl relative overflow-hidden h-[400px] shadow-lg shadow-black/20">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h3 className="font-headline text-2xl font-bold text-[#ffb59e]">Discipline Trajectory</h3>
                                    <p className="text-xs text-[#f6d9fd]/40 uppercase tracking-widest mt-1">Last 7 Days Data Stream</p>
                                </div>
                                <div className="flex flex-wrap gap-2 justify-end">
                                    <span className="px-3 py-1 bg-[#ffb59e]/10 text-[#ffb59e] text-[10px] rounded-full border border-[#ffb59e]/20 uppercase font-bold tracking-tighter">Discipline</span>
                                    <span className="px-3 py-1 bg-[#ffdb3c]/10 text-[#ffdb3c] text-[10px] rounded-full border border-[#ffdb3c]/20 uppercase font-bold tracking-tighter">Study</span>
                                </div>
                            </div>
                            
                            {/* Modern Bar Chart Mock */}
                            <div className="absolute bottom-0 left-0 w-full h-64 px-8 pb-8 flex items-end justify-between gap-2 sm:gap-6">
                                {/* Monday */}
                                <div className="flex-1 group relative flex flex-col items-center gap-1">
                                    <div className="w-full flex items-end justify-center gap-[2px] sm:gap-1 h-full">
                                        <div className="w-full bg-[#ffdb3c]/30 rounded-t-lg transition-all duration-500 group-hover:bg-[#ffdb3c]/50" style={{ height: '60%' }}></div>
                                        <div className="w-full bg-gradient-to-br from-[#ffb59e] to-[#ff571a] rounded-t-lg transition-all duration-500 group-hover:brightness-110 shadow-[0_0_15px_rgba(255,181,158,0.2)]" style={{ height: '80%' }}></div>
                                    </div>
                                    <span className="text-[10px] text-[#f6d9fd]/40 font-bold">MON</span>
                                </div>
                                {/* Tuesday */}
                                <div className="flex-1 group relative flex flex-col items-center gap-1">
                                    <div className="w-full flex items-end justify-center gap-[2px] sm:gap-1 h-full">
                                        <div className="w-full bg-[#ffdb3c]/30 rounded-t-lg" style={{ height: '75%' }}></div>
                                        <div className="w-full bg-gradient-to-br from-[#ffb59e] to-[#ff571a] rounded-t-lg" style={{ height: '85%' }}></div>
                                    </div>
                                    <span className="text-[10px] text-[#f6d9fd]/40 font-bold">TUE</span>
                                </div>
                                {/* Wednesday */}
                                <div className="flex-1 group relative flex flex-col items-center gap-1">
                                    <div className="w-full flex items-end justify-center gap-[2px] sm:gap-1 h-full">
                                        <div className="w-full bg-[#ffdb3c]/30 rounded-t-lg" style={{ height: '50%' }}></div>
                                        <div className="w-full bg-gradient-to-br from-[#ffb59e] to-[#ff571a] rounded-t-lg" style={{ height: '90%' }}></div>
                                    </div>
                                    <span className="text-[10px] text-[#f6d9fd]/40 font-bold">WED</span>
                                </div>
                                {/* Thursday */}
                                <div className="flex-1 group relative flex flex-col items-center gap-1">
                                    <div className="w-full flex items-end justify-center gap-[2px] sm:gap-1 h-full">
                                        <div className="w-full bg-[#ffdb3c]/30 rounded-t-lg" style={{ height: '80%' }}></div>
                                        <div className="w-full bg-gradient-to-br from-[#ffb59e] to-[#ff571a] rounded-t-lg" style={{ height: '98%' }}></div>
                                    </div>
                                    <span className="text-[10px] text-[#f6d9fd]/40 font-bold">THU</span>
                                </div>
                                {/* Friday */}
                                <div className="flex-1 group relative flex flex-col items-center gap-1">
                                    <div className="w-full flex items-end justify-center gap-[2px] sm:gap-1 h-full">
                                        <div className="w-full bg-[#ffdb3c]/30 rounded-t-lg" style={{ height: '65%' }}></div>
                                        <div className="w-full bg-gradient-to-br from-[#ffb59e] to-[#ff571a] rounded-t-lg" style={{ height: '88%' }}></div>
                                    </div>
                                    <span className="text-[10px] text-[#f6d9fd]/40 font-bold">FRI</span>
                                </div>
                                {/* Saturday */}
                                <div className="flex-1 group relative flex flex-col items-center gap-1">
                                    <div className="w-full flex items-end justify-center gap-[2px] sm:gap-1 h-full">
                                        <div className="w-full bg-[#ffdb3c]/30 rounded-t-lg" style={{ height: '40%' }}></div>
                                        <div className="w-full bg-gradient-to-br from-[#ffb59e] to-[#ff571a] rounded-t-lg" style={{ height: '82%' }}></div>
                                    </div>
                                    <span className="text-[10px] text-[#f6d9fd]/40 font-bold">SAT</span>
                                </div>
                                {/* Sunday */}
                                <div className="flex-1 group relative flex flex-col items-center gap-1">
                                    <div className="w-full flex items-end justify-center gap-[2px] sm:gap-1 h-full">
                                        <div className="w-full bg-[#ffdb3c]/30 rounded-t-lg" style={{ height: '35%' }}></div>
                                        <div className="w-full bg-gradient-to-br from-[#ffb59e] to-[#ff571a] rounded-t-lg" style={{ height: '78%' }}></div>
                                    </div>
                                    <span className="text-[10px] text-[#f6d9fd]/40 font-bold">SUN</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Radial Stats Card */}
                        <div className="bg-[#412d49]/60 backdrop-blur-xl border-t border-[#ffb59e]/20 p-8 rounded-2xl flex flex-col items-center justify-center text-center space-y-6 shadow-lg shadow-black/20">
                            <h3 className="font-headline text-lg font-bold text-[#f6d9fd]/80">Weekly Average</h3>
                            <div className="relative w-48 h-48">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="96" cy="96" fill="transparent" r="88" stroke="#412d49" strokeWidth="12"></circle>
                                    <circle cx="96" cy="96" fill="transparent" r="88" stroke="url(#flame-grad)" strokeDasharray="552.92" strokeDashoffset="44.23" strokeLinecap="round" strokeWidth="12"></circle>
                                    <defs>
                                        <linearGradient id="flame-grad" x1="0%" x2="100%" y1="0%" y2="100%">
                                            <stop offset="0%" style={{ stopColor: '#ffb59e' }}></stop>
                                            <stop offset="100%" style={{ stopColor: '#ff571a' }}></stop>
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
                                    <span className="text-4xl font-black font-headline text-[#ffb59e]">92%</span>
                                    <span className="text-[10px] text-[#f6d9fd]/40 uppercase tracking-[.25em]">Discipline</span>
                                </div>
                            </div>
                            <p className="text-xs text-[#f6d9fd]/60 leading-relaxed italic">
                                "Your consistency is the oxygen that feeds the phoenix. Keep rising."
                            </p>
                        </div>
                    </section>

                    {/* Progress Summary Cards */}
                    <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        <div className="bg-[#26142e] p-6 rounded-2xl border-l-4 border-[#ffb59e] shadow-lg">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] text-[#f6d9fd]/40 uppercase tracking-widest font-bold">Average Score</p>
                                    <h4 className="text-3xl font-headline font-black text-[#f6d9fd] mt-1">92%</h4>
                                </div>
                                <span className="material-symbols-outlined text-[#ffb59e] bg-[#ffb59e]/10 p-2 rounded-lg">analytics</span>
                            </div>
                            <div className="mt-4 flex items-center gap-2">
                                <span className="text-emerald-400 text-xs font-bold">+2.4%</span>
                                <span className="text-[10px] text-[#f6d9fd]/30 uppercase">Since last week</span>
                            </div>
                        </div>
                        
                        <div className="bg-[#26142e] p-6 rounded-2xl border-l-4 border-[#ffdb3c] shadow-lg">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] text-[#f6d9fd]/40 uppercase tracking-widest font-bold">Best Day</p>
                                    <h4 className="text-3xl font-headline font-black text-[#f6d9fd] mt-1">98%</h4>
                                </div>
                                <span className="material-symbols-outlined text-[#ffdb3c] bg-[#ffdb3c]/10 p-2 rounded-lg">military_tech</span>
                            </div>
                            <p className="mt-4 text-[10px] text-[#f6d9fd]/30 uppercase">Recorded: Thursday, Oct 12</p>
                        </div>
                        
                        <div className="bg-[#26142e] p-6 rounded-2xl border-l-4 border-[#ffb4ab] shadow-lg sm:col-span-2 md:col-span-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] text-[#f6d9fd]/40 uppercase tracking-widest font-bold">Lowest Day</p>
                                    <h4 className="text-3xl font-headline font-black text-[#f6d9fd] mt-1">78%</h4>
                                </div>
                                <span className="material-symbols-outlined text-[#ffb4ab] bg-[#ffb4ab]/10 p-2 rounded-lg">trending_down</span>
                            </div>
                            <p className="mt-4 text-[10px] text-[#f6d9fd]/30 uppercase">Recorded: Sunday, Oct 8</p>
                        </div>
                    </section>

                    {/* AI Insights Section */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-[#ffb59e]">psychology</span>
                            <h2 className="font-headline text-2xl font-bold">Phoenix AI Insights</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-[#412d49]/60 backdrop-blur-xl border-t border-[#ffb59e]/20 p-6 rounded-2xl group hover:bg-[#412d49] transition-all duration-300 shadow-lg shadow-black/20">
                                <div className="w-10 h-10 rounded-full bg-[#ffb59e]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-[#ffb59e] text-xl">auto_graph</span>
                                </div>
                                <h5 className="text-[#ffb59e] font-bold text-sm mb-2">Steady Ascension</h5>
                                <p className="text-sm text-[#f6d9fd]/70 leading-relaxed">Your discipline is improving steadily. The trajectory suggests you'll hit a new score baseline by next Tuesday.</p>
                            </div>
                            <div className="bg-[#412d49]/60 backdrop-blur-xl border-t border-[#ffb59e]/20 p-6 rounded-2xl group hover:bg-[#412d49] transition-all duration-300 shadow-lg shadow-black/20">
                                <div className="w-10 h-10 rounded-full bg-[#ffdb3c]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-[#ffdb3c] text-xl">nutrition</span>
                                </div>
                                <h5 className="text-[#ffdb3c] font-bold text-sm mb-2">Nutritional Gap</h5>
                                <p className="text-sm text-[#f6d9fd]/70 leading-relaxed">Diet consistency is low on weekends. Weekend score drops are directly correlated to late-night snacking patterns.</p>
                            </div>
                            <div className="bg-[#412d49]/60 backdrop-blur-xl border-t border-[#ffb59e]/20 p-6 rounded-2xl group hover:bg-[#412d49] transition-all duration-300 shadow-lg shadow-black/20">
                                <div className="w-10 h-10 rounded-full bg-[#ffb4a8]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-[#ffb4a8] text-xl">timer</span>
                                </div>
                                <h5 className="text-[#ffb4a8] font-bold text-sm mb-2">Study Optimization</h5>
                                <p className="text-sm text-[#f6d9fd]/70 leading-relaxed">Study hours dropped mid-week. Consider shifting your deep work sessions to early mornings to avoid peak burnout.</p>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            {/* Background Decoration Particles */}
            <div className="fixed top-1/4 left-1/4 w-1 h-1 bg-white/20 rounded-full blur-[2px] -z-10 pointer-events-none"></div>
            <div className="fixed top-1/2 right-1/3 w-1 h-1 bg-white/10 rounded-full blur-[2px] -z-10 pointer-events-none"></div>
            <div className="fixed bottom-1/4 left-1/2 w-1 h-1 bg-white/20 rounded-full blur-[2px] -z-10 pointer-events-none"></div>
            <div className="fixed bottom-10 right-10 w-64 h-64 bg-[#ffb59e]/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>
        </div>
    );
};

export default Analysis;
