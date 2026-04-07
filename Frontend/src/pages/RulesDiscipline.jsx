import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// ─── Seed Data ────────────────────────────────────────────────────────────────
const AI_SUGGESTIONS = {
    diet: "To maintain this rule during social events, preview restaurant menus in advance and identify \"safe options\" to reduce decision fatigue when willpower is lowest.",
    study: "Break the 4-hour block into two 2-hour deep work sprints separated by a 20-minute walk. Use a physical timer — not a phone — to avoid distraction loops.",
    sleep: "Set a phone curfew alarm 30 minutes before your digital fast begins. Place your device in another room to remove the temptation entirely.",
    default: "Start with small daily actions and track consistency. A habit logged is a habit reinforced. Use the streak system — never break the chain.",
};

const getAiSuggestion = (text) => {
    const t = text.toLowerCase();
    if (t.includes('diet') || t.includes('vegetarian') || t.includes('food') || t.includes('sugar')) return AI_SUGGESTIONS.diet;
    if (t.includes('study') || t.includes('work') || t.includes('deep') || t.includes('learn')) return AI_SUGGESTIONS.study;
    if (t.includes('sleep') || t.includes('digital') || t.includes('phone') || t.includes('screen')) return AI_SUGGESTIONS.sleep;
    return AI_SUGGESTIONS.default;
};

const getDisciplineLabel = (rating) => {
    if (rating <= 3) return { label: 'Low Discipline', color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/30' };
    if (rating <= 6) return { label: 'Moderate Discipline', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30' };
    if (rating <= 8) return { label: 'High Discipline', color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30' };
    return { label: 'Elite Discipline', color: 'text-secondary-container', bg: 'bg-secondary-container/10', border: 'border-secondary-container/30' };
};

const SEED_RULES = [
    {
        id: 1,
        text: 'Vegetarian Diet Rule',
        rating: 8,
        status: 'Active',
        streak: 14,
        broken: 0,
        showAi: true,
        aiSuggestion: AI_SUGGESTIONS.diet,
    },
    {
        id: 2,
        text: 'Deep Work: 4 Hours Daily',
        rating: 5,
        status: 'Active',
        streak: 7,
        broken: 1,
        showAi: false,
        aiSuggestion: AI_SUGGESTIONS.study,
    },
];

const SEED_HISTORY = [
    { id: 101, text: 'Digital Fast: 8PM to 8AM', rating: 4, status: 'Broken', broken: 2, streak: 0 },
    { id: 102, text: 'No Processed Sugar', rating: 5, status: 'Active', broken: 0, streak: 12 },
    { id: 103, text: 'Morning Cold Plunge', rating: 2, status: 'Active', broken: 0, streak: 1 },
];

// ─── Star Rating Sub-component ─────────────────────────────────────────────────
const StarRating = ({ rating, onChange, size = 'text-3xl', count = 10 }) => {
    const [hovered, setHovered] = useState(null);
    const display = hovered ?? rating;

    return (
        <div className="flex gap-1.5">
            {Array.from({ length: count }, (_, i) => {
                const filled = i < display;
                return (
                    <span
                        key={i}
                        onClick={() => onChange && onChange(i + 1)}
                        onMouseEnter={() => onChange && setHovered(i + 1)}
                        onMouseLeave={() => onChange && setHovered(null)}
                        className={`material-symbols-outlined ${size} transition-all duration-150 ${onChange ? 'cursor-pointer hover:scale-125' : 'cursor-default'} ${filled
                            ? 'text-secondary-container drop-shadow-[0_0_6px_rgba(255,219,60,0.6)]'
                            : 'text-on-surface/20'
                            }`}
                        style={filled ? { fontVariationSettings: "'FILL' 1" } : {}}
                    >
                        star
                    </span>
                );
            })}
        </div>
    );
};

// ─── Mini Star (for history list) ─────────────────────────────────────────────
const MiniStars = ({ rating, count = 5 }) => (
    <div className="flex gap-0.5">
        {Array.from({ length: count }, (_, i) => (
            <span
                key={i}
                className={`material-symbols-outlined text-xs transition-all ${i < rating ? 'text-secondary-container' : 'text-on-surface/20'}`}
                style={i < rating ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
                star
            </span>
        ))}
    </div>
);

// ─── Component ────────────────────────────────────────────────────────────────
const RulesDiscipline = () => {
        const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [rules, setRules] = useState(SEED_RULES);
    const [history, setHistory] = useState(SEED_HISTORY);

    // Add rule form
    const [formText, setFormText] = useState('');

    // AI suggestion visibility per card
    const toggleAi = (id) => {
        setRules(rules.map(r => r.id === id ? { ...r, showAi: !r.showAi } : r));
    };

    // Star rating update
    const updateRating = (id, rating) => {
        setRules(rules.map(r => r.id === id ? { ...r, rating } : r));
    };

    // Toggle status
    const toggleStatus = (id) => {
        setRules(rules.map(r => r.id === id
            ? { ...r, status: r.status === 'Active' ? 'Broken' : 'Active', broken: r.status === 'Active' ? r.broken + 1 : r.broken }
            : r
        ));
    };

    // Delete rule
    const deleteRule = (id) => setRules(rules.filter(r => r.id !== id));

    // Add rule
    const handleAddRule = () => {
        if (!formText.trim()) return;
        const newRule = {
            id: Date.now(),
            text: formText.trim(),
            rating: 5,
            status: 'Active',
            streak: 0,
            broken: 0,
            showAi: false,
            aiSuggestion: getAiSuggestion(formText),
        };
        setRules([newRule, ...rules]);
        setFormText('');
    };

    // Discipline Index calc
    const totalRating = rules.reduce((acc, r) => acc + r.rating, 0);
    const maxRating = rules.length * 10;
    const disciplineIndex = rules.length ? Math.round((totalRating / maxRating) * 100) : 0;

    return (
        <div className="bg-[#0B0014] text-on-surface font-body min-h-screen overflow-x-hidden selection:bg-primary-container selection:text-white">

            {/* ── TOP NAV ─────────────────────────────────────────────────────── */}
            <header className="fixed top-0 w-full z-50 bg-[#1d0c26]/60 backdrop-blur-xl flex justify-between items-center px-4 md:px-8 h-20 shadow-[0_20px_40px_rgba(255,77,0,0.08)]">
                <div className="flex items-center gap-4 md:gap-6">
                    <span
                        className="material-symbols-outlined text-[#ffb59e]/70 hover:text-[#fff9ef] transition-colors cursor-pointer"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >menu</span>
                    <Link to="/" className="text-lg md:text-xl font-bold uppercase tracking-widest text-[#ffb59e] font-headline">
                        PROJECT PHOENIX
                    </Link>
                    <div className="hidden md:flex h-6 w-px bg-outline-variant/30" />
                    <span className="hidden md:block text-[#fff9ef] font-headline text-sm tracking-widest opacity-80">Phoenix v1.0</span>
                </div>
                <div className="flex items-center gap-4 md:gap-8">
                    <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container-highest/40 border border-primary-container/20">
                        <span className="material-symbols-outlined text-secondary-container text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                        <span className="text-[#fff9ef] font-headline font-bold text-sm tracking-tighter">Discipline Score: 850</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="material-symbols-outlined text-[#ffb59e]/70 hover:text-[#fff9ef] transition-colors cursor-pointer">notifications</span>
                        <div className="flex items-center gap-3">
                            <span className="hidden sm:block font-medium text-on-surface text-sm">Alex Mercer</span>
                            <img
                                alt="User avatar"
                                className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-primary/20 object-cover"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJX57hND0c23Vl9y9cQ-b8y7jvLmQ3EuvRdMxc0MlHAROaZlmIQKhsKb6qA0PkXrL7hzV4B7B-qbMSFe7fvO7Zbtw-ZbFzfqpvYHrp_qVB1et2M9otwJ_b1teBRyQnc76VmkPo061BEXfioiJkV9mFOPsPI5WZ14PFGgxB3NiAE0tq3CrjCBPTBvn8FSfJPC10cyOj1H92-_nCk-EhmB4xI1F65neVrMNF-VaF1OZuZyEAgepJdftLUAeZ4TtS4mjBOGNCrC1r"
                            />
                        </div>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#ffb59e]/20 to-transparent" />
            </header>

            {/* ── MOBILE OVERLAY ──────────────────────────────────────────────── */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* ── SIDEBAR ─────────────────────────────────────────────────────── */}
            <aside className={`fixed left-0 h-full w-72 z-40 bg-[#0B0014]/95 backdrop-blur-2xl border-r border-[#ffb59e]/10 shadow-[10px_0_30px_rgba(0,0,0,0.5)] flex flex-col pt-24 pb-8 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="px-6 mb-8 flex justify-between items-center">
                    <div className="flex items-center gap-3 p-4 bg-surface-container-low rounded-xl border border-outline-variant/10">
                        <div className="w-2 h-10 bg-primary rounded-full" />
                        <div>
                            <p className="text-[#f6d9fd] font-bold text-sm">Alex Mercer</p>
                            <p className="text-primary-container text-[10px] font-bold uppercase tracking-wider">Level 12 Initiated</p>
                        </div>
                    </div>
                    <span
                        className="material-symbols-outlined text-slate-400 cursor-pointer md:hidden ml-4"
                        onClick={() => setIsSidebarOpen(false)}
                    >close</span>
                </div>

                <nav className="flex flex-col flex-1 overflow-y-auto w-full no-scrollbar">
                    <div className="mb-4 px-6 text-[10px] uppercase tracking-widest text-on-surface-variant/50 font-bold">Main Console</div>

                    {[
                        { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
                        { to: '/daily-tracker', icon: 'calendar_today', label: 'Daily Tracker' },
                        { to: '/study-tracker', icon: 'menu_book', label: 'Study Tracker' },
                        { to: '/finance-tracker', icon: 'payments', label: 'Finance Tracker' },
                        { to: '/journal', icon: 'edit_note', label: 'Journal' },
                        { to: '/failure-tracker', icon: 'dangerous', label: 'Failure Tracker' },
                    ].map(({ to, icon, label }) => (
                        <Link key={to} className="flex items-center gap-4 text-[#ffb59e]/50 py-3 px-6 hover:bg-[#412d49]/50 hover:text-[#ffb59e] transition-all duration-500 font-body text-sm font-medium" to={to}>
                            <span className="material-symbols-outlined">{icon}</span> {label}
                        </Link>
                    ))}

                    {/* Active: Rules & Discipline */}
                    <Link className="flex items-center gap-4 text-[#fff9ef] bg-gradient-to-r from-[#ff571a]/20 to-transparent border-r-4 border-[#ff571a] py-3 px-6 transition-all duration-500 font-body text-sm font-medium" to="/rules-discipline">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>gavel</span> Rules & Discipline
                    </Link>

                    {[
                        { icon: 'analytics', label: 'Analysis', to: '/analysis' },
                    ].map(({ icon, label, to }) => (
                        <Link key={label} className="flex items-center gap-4 text-[#ffb59e]/50 py-3 px-6 hover:bg-[#412d49]/50 hover:text-[#ffb59e] transition-all duration-500 font-body text-sm font-medium" to={to}>
                            <span className="material-symbols-outlined">{icon}</span> {label}
                        </Link>
                    ))}

                    <div className="mt-auto pt-8">
                        <div className="flex flex-col w-full">
                        <button 
                            className="flex items-center justify-between w-full text-[#ffb59e]/50 py-3 px-6 hover:bg-[#412d49]/50 hover:text-[#ffb59e] transition-all duration-500 font-body text-sm font-medium" 
                            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                        >
                            <div className="flex items-center gap-4">
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
                        <Link className="flex items-center gap-4 text-error/70 py-3 px-6 hover:bg-error/10 hover:text-error transition-all duration-500 font-body text-sm font-medium mt-2" to="/login">
                            <span className="material-symbols-outlined">logout</span> System Logout
                        </Link>
                    </div>
                </nav>
            </aside>

            {/* ── MAIN CONTENT ────────────────────────────────────────────────── */}
            <main className={`pt-28 pb-20 md:pb-12 px-4 md:px-8 lg:px-12 min-h-screen relative z-10 transition-all duration-300 ${isSidebarOpen ? 'md:ml-72' : 'ml-0'}`}>
                <div className="w-full max-w-[1600px] mx-auto">

                    {/* ── TITLE ─────────────────────────────────────────────── */}
                    <section className="mb-14 relative">
                        <div className="absolute -top-20 -left-20 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
                        <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tighter mb-4 relative z-10">
                            <span className="text-[#fff9ef]">Rules &amp; </span>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary-container">
                                Discipline
                            </span>
                        </h1>
                        <div className="h-0.5 bg-gradient-to-r from-[#ff571a] to-transparent w-56 mb-4" />
                        <p className="text-on-surface-variant text-lg md:text-xl max-w-2xl font-light">
                            Define your rules and measure your discipline level. Forge your character through consistent adherence to your personal code.
                        </p>
                    </section>

                    {/* ── MAIN GRID ─────────────────────────────────────────── */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                        {/* ── LEFT COLUMN (7/12) ──────────────────────────────── */}
                        <div className="lg:col-span-7 space-y-8">

                            {/* ADD RULE */}
                            <div className="glass-card p-8 rounded-3xl border-t border-primary/20 bg-[#36233e]/60 backdrop-blur-xl shadow-[0_20px_40px_rgba(255,77,0,0.08)]">
                                <h3 className="font-headline text-xl font-bold mb-6 flex items-center gap-2 text-[#fff9ef]">
                                    <span className="material-symbols-outlined text-primary-container">add_circle</span>
                                    Establish New Protocol
                                </h3>
                                <div className="flex flex-col gap-4">
                                    <input
                                        type="text"
                                        placeholder="Write your rule here..."
                                        value={formText}
                                        onChange={e => setFormText(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleAddRule()}
                                        className="w-full bg-[#180720]/80 border-0 border-b-2 border-outline-variant/40 focus:border-primary text-on-surface py-4 px-4 outline-none transition-all duration-300 rounded-t-xl bg-surface-container-lowest placeholder:text-on-surface-variant/40"
                                    />
                                    <div className="flex justify-end">
                                        <button
                                            onClick={handleAddRule}
                                            className="flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-primary to-primary-container text-[#3a0b00] font-bold shadow-[0_10px_25px_rgba(255,87,26,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all"
                                        >
                                            Submit Rule <span className="material-symbols-outlined">bolt</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* CURRENT FOCUS PROTOCOLS */}
                            <div className="space-y-6">
                                <h3 className="font-headline text-xl font-bold flex items-center gap-2 text-[#fff9ef]">
                                    <span className="material-symbols-outlined text-secondary-container">monitoring</span>
                                    Current Focus Protocols
                                </h3>

                                {rules.length === 0 ? (
                                    <div className="glass-card rounded-3xl p-12 text-center border border-outline-variant/10 bg-[#36233e]/60 backdrop-blur-xl">
                                        <span className="material-symbols-outlined text-6xl text-on-surface-variant/20 block mb-4">gavel</span>
                                        <p className="text-on-surface-variant font-medium">No protocols yet. Add your first rule above.</p>
                                    </div>
                                ) : (
                                    rules.map(rule => {
                                        const disc = getDisciplineLabel(rule.rating);
                                        const accentColor = rule.rating >= 7 ? 'border-primary' : rule.rating >= 4 ? 'border-secondary-container/60' : 'border-red-500/60';
                                        const titleColor = rule.rating >= 7 ? 'text-primary' : rule.rating >= 4 ? 'text-secondary-container' : 'text-red-400';
                                        return (
                                            <div
                                                key={rule.id}
                                                className={`glass-card rounded-3xl overflow-hidden border-l-4 ${accentColor} bg-[#36233e]/60 backdrop-blur-xl shadow-2xl hover:-translate-y-1 transition-all duration-300`}
                                            >
                                                <div className="p-8">
                                                    {/* Header */}
                                                    <div className="flex justify-between items-start mb-6">
                                                        <h4 className={`font-headline text-2xl font-bold ${titleColor}`}>{rule.text}</h4>
                                                        <div className="flex items-center gap-2 shrink-0 ml-4">
                                                            <span className={`px-3 py-1 ${disc.bg} ${disc.color} text-xs font-bold rounded-full uppercase tracking-tight border ${disc.border}`}>
                                                                {disc.label}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Star rating */}
                                                    <div className="mb-7">
                                                        <p className="text-xs text-on-surface-variant mb-3 uppercase tracking-widest font-medium">Discipline Intensity</p>
                                                        <StarRating
                                                            rating={rule.rating}
                                                            onChange={(r) => updateRating(rule.id, r)}
                                                            size="text-3xl"
                                                            count={10}
                                                        />
                                                    </div>

                                                    {/* Footer */}
                                                    <div className="flex items-center justify-between flex-wrap gap-3">
                                                        <div className="flex items-center gap-3">
                                                            <button
                                                                onClick={() => toggleAi(rule.id)}
                                                                className="text-primary hover:text-secondary-container font-semibold text-sm flex items-center gap-1.5 transition-colors"
                                                            >
                                                                <span className="material-symbols-outlined text-sm">auto_awesome</span>
                                                                {rule.showAi ? 'Hide Strategy' : 'Improve Strategy'}
                                                            </button>
                                                            <button
                                                                onClick={() => toggleStatus(rule.id)}
                                                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${rule.status === 'Active'
                                                                    ? 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-error/10 hover:border-error/30 hover:text-error'
                                                                    : 'bg-error/10 border-error/30 text-error hover:bg-green-500/10 hover:border-green-500/30 hover:text-green-400'
                                                                    }`}
                                                            >
                                                                {rule.status}
                                                            </button>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-on-surface/40 text-xs italic">{rule.rating}/10 Rating</span>
                                                            <button
                                                                onClick={() => deleteRule(rule.id)}
                                                                className="w-7 h-7 rounded-full flex items-center justify-center bg-white/5 hover:bg-error/20 transition-colors"
                                                            >
                                                                <span className="material-symbols-outlined text-on-surface-variant/40 hover:text-error transition-colors text-sm">delete</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* AI Suggestion Panel */}
                                                {rule.showAi && (
                                                    <div className="bg-surface-container-highest/40 p-6 border-t border-outline-variant/10 animate-fadeIn">
                                                        <div className="flex gap-4">
                                                            <span className="material-symbols-outlined text-primary shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                                                            <div>
                                                                <p className="text-sm font-bold text-primary mb-1.5">AI Protocol Optimization</p>
                                                                <p className="text-xs text-on-surface-variant leading-relaxed">{rule.aiSuggestion}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* ── RIGHT COLUMN (5/12) ─────────────────────────────── */}
                        <div className="lg:col-span-5 space-y-8">

                            {/* PROTOCOL REGISTRY */}
                            <div className="glass-card rounded-3xl p-8 border-t border-tertiary/20 bg-[#36233e]/60 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.2)]">
                                <h3 className="font-headline text-xl font-bold mb-7 flex items-center gap-2 text-[#fff9ef]">
                                    <span className="material-symbols-outlined text-tertiary">history</span>
                                    Protocol Registry
                                </h3>

                                <div className="space-y-3">
                                    {[...history, ...rules.filter(r => !history.find(h => h.id === r.id))].slice(0, 6).map((item) => (
                                        <div
                                            key={item.id}
                                            className="bg-surface-container-lowest/60 rounded-2xl p-4 flex items-center justify-between border border-outline-variant/10 hover:border-primary/20 transition-all group"
                                        >
                                            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                                                <p className="font-bold text-on-surface text-sm truncate">{item.text}</p>
                                                <div className="flex items-center gap-2">
                                                    <MiniStars rating={Math.min(item.rating, 5)} count={5} />
                                                    <span className="text-[10px] text-on-surface-variant/50 uppercase tracking-wider font-medium">
                                                        {item.status === 'Broken' ? `Broken ×${item.broken}` : item.streak > 0 ? `Streak: ${item.streak}d` : 'New Protocol'}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className={`ml-3 shrink-0 font-black text-[10px] uppercase tracking-tight px-2.5 py-1.5 rounded-lg ${item.status === 'Broken'
                                                ? 'text-error bg-error/10'
                                                : 'text-secondary-container bg-secondary-container/10'
                                                }`}>
                                                {item.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <button className="w-full mt-6 py-3 text-on-surface-variant border border-outline-variant/30 rounded-xl text-sm hover:bg-surface-container-highest/20 hover:text-primary transition-all">
                                    View Complete Archives
                                </button>
                            </div>

                            {/* DISCIPLINE INDEX */}
                            <div className="glass-card rounded-3xl p-8 overflow-hidden relative border-t border-primary/20 bg-[#36233e]/60 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.2)]">
                                {/* Background glow */}
                                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary-container/5 rounded-full blur-[60px] pointer-events-none" />

                                <div className="relative z-10">
                                    <h3 className="font-headline text-xl font-bold mb-6 text-[#fff9ef]">Discipline Index</h3>

                                    <div className="flex items-end gap-3 mb-3">
                                        <span className="text-6xl font-black text-primary tracking-tighter font-headline">
                                            {disciplineIndex}
                                        </span>
                                        <span className="text-on-surface/60 font-bold mb-2 uppercase text-xs tracking-widest">Global Rank</span>
                                    </div>

                                    <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
                                        {disciplineIndex >= 80
                                            ? 'You are performing in the top 2% of the Phoenix collective. Maintain protocol for 3 more days to reach "Zenith" status.'
                                            : disciplineIndex >= 50
                                                ? 'Solid discipline foundation. Push for consistency across all protocols to elevate your rank.'
                                                : 'Building momentum. Every rule you keep strengthens the system. Stay consistent.'}
                                    </p>

                                    <div className="w-full h-2.5 bg-surface-container-lowest rounded-full overflow-hidden mb-4">
                                        <div
                                            className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full transition-all duration-700"
                                            style={{ width: `${disciplineIndex}%` }}
                                        />
                                    </div>

                                    {/* Per-category breakdown */}
                                    <div className="space-y-3 mt-6">
                                        {[
                                            { label: 'Active Protocols', val: rules.filter(r => r.status === 'Active').length, color: 'text-green-400' },
                                            { label: 'Broken Protocols', val: rules.filter(r => r.status === 'Broken').length, color: 'text-error' },
                                            { label: 'Avg Rating', val: rules.length ? `${(rules.reduce((a, r) => a + r.rating, 0) / rules.length).toFixed(1)}/10` : '—', color: 'text-primary' },
                                        ].map(({ label, val, color }) => (
                                            <div key={label} className="flex items-center justify-between">
                                                <span className="text-xs text-on-surface-variant font-medium">{label}</span>
                                                <span className={`text-sm font-headline font-black ${color}`}>{val}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* QUICK RULE TEMPLATES */}
                            <div className="glass-card rounded-3xl p-6 border border-outline-variant/10 bg-[#36233e]/60 backdrop-blur-xl">
                                <h4 className="font-headline text-base font-bold text-[#fff9ef] mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-sm">tips_and_updates</span>
                                    Quick Templates
                                </h4>
                                <div className="space-y-2">
                                    {[
                                        'I will study 3 hours daily',
                                        'No phone after 10 PM',
                                        'Wake up at 5 AM every day',
                                        'I will follow a vegetarian diet',
                                        'Exercise for 45 minutes daily',
                                    ].map(template => (
                                        <button
                                            key={template}
                                            onClick={() => setFormText(template)}
                                            className="w-full text-left px-4 py-2.5 rounded-xl bg-surface-container-lowest/60 hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20 transition-all text-sm text-on-surface-variant group"
                                        >
                                            <span className="material-symbols-outlined text-sm text-on-surface-variant/30 group-hover:text-primary/40 transition-colors mr-2 align-middle">add</span>
                                            {template}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Decorative blobs */}
                <div className="fixed top-[20%] right-[5%] w-[35%] h-[35%] bg-primary/4 rounded-full blur-[150px] pointer-events-none -z-10" />
                <div className="fixed bottom-[10%] left-[0%] w-[30%] h-[30%] bg-secondary-container/3 rounded-full blur-[120px] pointer-events-none -z-10" />
            </main>

            {/* ── MOBILE BOTTOM NAV ───────────────────────────────────────────── */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#1d0c26]/90 backdrop-blur-xl border-t border-outline-variant/10 flex justify-around items-center px-4 z-[70]">
                <Link to="/dashboard" className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">dashboard</Link>
                <Link to="/daily-tracker" className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">calendar_today</Link>
                <Link to="/rules-discipline" className="material-symbols-outlined text-primary-container">gavel</Link>
                <Link to="/failure-tracker" className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">dangerous</Link>
                <Link to="/finance-tracker" className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">payments</Link>
            </nav>
        </div>
    );
};

export default RulesDiscipline;
