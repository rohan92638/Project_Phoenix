import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// ─── Seed Data ────────────────────────────────────────────────────────────────
const today = new Date();

const fmtDateTime = (iso, time) => {
    const d = new Date(iso + 'T00:00:00');
    const diff = Math.round((today - d) / (1000 * 60 * 60 * 24));
    const prefix = diff === 0 ? 'Today' : diff === 1 ? 'Yesterday' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${prefix}, ${time}`;
};

const makeIso = (daysAgo) => {
    const d = new Date(today);
    d.setDate(today.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
};

const SEED_FAILURES = [
    {
        id: 1,
        description: 'Overslept (10h)',
        datetime: fmtDateTime(makeIso(0), '09:30 AM'),
        severity: 'Critical',
        icon: 'bedtime',
        iconBg: 'bg-red-500/10',
        iconColor: 'text-red-400',
        aiMessage: "You slept more than required. A healthy cycle is **7–8 hours**. Excess sleep can often lead to lethargy and skipped morning routines. Try setting a consistent wake-up trigger — like a morning sun lamp or an alarm placed across the room.",
        aiTip: "Set your alarm across the room. When your body is forced to get up to turn it off, the battle is half won.",
    },
    {
        id: 2,
        description: 'Skipped Workout',
        datetime: fmtDateTime(makeIso(1), '06:00 PM'),
        severity: 'Moderate',
        icon: 'fitness_center',
        iconBg: 'bg-yellow-500/10',
        iconColor: 'text-yellow-400',
        aiMessage: "Missing a workout breaks your compound habit loop. Even a **10-minute walk** preserves the chain. The goal isn't the workout — it's not breaking the streak.",
        aiTip: "Attach your workout to an existing habit (after coffee, for example). 'Habit stacking' reduces activation energy by 60%.",
    },
    {
        id: 3,
        description: 'Binge Eating',
        datetime: fmtDateTime(makeIso(2), '11:15 PM'),
        severity: 'Minor',
        icon: 'fastfood',
        iconBg: 'bg-purple-500/10',
        iconColor: 'text-purple-400',
        aiMessage: "Late-night binge eating is often triggered by **stress or boredom**, not real hunger. Identify the trigger and swap the behavior — try a herbal tea or a 5-minute breathing exercise.",
        aiTip: "Research shows a 10-minute delay before eating reduces binge episodes by 40%. Practice the pause.",
    },
];

const SEED_HISTORY = [
    { id: 101, date: makeIso(1), label: 'Missed Meditation', reason: null },
    { id: 102, date: makeIso(2), label: 'Late night snack', reason: 'Stress from deadline' },
    { id: 103, date: makeIso(3), label: 'Social Media (4h)', reason: 'Lack of phone lock' },
    { id: 104, date: makeIso(4), label: 'Skipped journaling', reason: 'Felt too tired' },
    { id: 105, date: makeIso(5), label: 'Broke diet rules', reason: null },
    { id: 106, date: makeIso(6), label: 'Slept at 2 AM', reason: 'Doomscrolling' },
    { id: 107, date: makeIso(7), label: 'Missed cold shower', reason: null },
];

const INSIGHTS = [
    {
        type: 'Improvement',
        icon: 'trending_up',
        color: 'text-green-400',
        bg: 'bg-green-400/10',
        border: 'border-green-500/20',
        hoverBg: 'group-hover:bg-green-500/5',
        barColor: 'bg-green-400',
        barWidth: 'w-3/4',
        pct: '75%',
        message: 'Sleep cycle stabilizing',
    },
    {
        type: 'Warning',
        icon: 'warning',
        color: 'text-yellow-400',
        bg: 'bg-yellow-400/10',
        border: 'border-yellow-500/20',
        hoverBg: 'group-hover:bg-yellow-500/5',
        barColor: 'bg-yellow-400',
        barWidth: 'w-1/2',
        pct: '50%',
        message: 'Diet discipline slipping',
    },
    {
        type: 'Critical',
        icon: 'error',
        color: 'text-red-400',
        bg: 'bg-red-400/10',
        border: 'border-red-500/20',
        hoverBg: 'group-hover:bg-red-500/5',
        barColor: 'bg-red-400',
        barWidth: 'w-1/5',
        pct: '20%',
        message: '3 consecutive study skips',
    },
];

const SEVERITY_STYLES = {
    Critical: { badge: 'bg-red-500/20 text-red-400', label: 'Critical' },
    Moderate: { badge: 'bg-yellow-500/20 text-yellow-400', label: 'Moderate' },
    Minor: { badge: 'bg-purple-500/20 text-purple-400', label: 'Minor' },
};

const AI_RESPONSES = [
    "Analyzing your pattern... Consistency failures at this frequency signal a systemic gap in your environment design, not willpower.",
    "Your discipline score dropped 12 points this week. The root cause appears to be poor sleep hygiene cascading into other areas.",
    "Every failure is data. Your pattern shows peak failure risk between 9 PM and 1 AM. Guard that window.",
];

const historyFmtDate = (iso) => {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).toUpperCase();
};

// ─── Component ────────────────────────────────────────────────────────────────
const FailureTracker = () => {
        const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [failures, setFailures] = useState(SEED_FAILURES);
    const [history, setHistory] = useState(SEED_HISTORY);

    // Add entry form
    const [formText, setFormText] = useState('');
    const [formSeverity, setFormSeverity] = useState('Moderate');

    // AI modal
    const [aiModal, setAiModal] = useState(null); // { entry } | null
    const [aiTyping, setAiTyping] = useState(false);
    const [aiShown, setAiShown] = useState(false);

    // History reason modal
    const [reasonModal, setReasonModal] = useState(null); // { item } | null
    const [reasonText, setReasonText] = useState('');

    // Regenerate AI
    const [aiResponseIdx, setAiResponseIdx] = useState(0);
    const [aiSideText, setAiSideText] = useState(null);

    const openAiModal = (entry) => {
        setAiModal(entry);
        setAiTyping(true);
        setAiShown(false);
        setTimeout(() => { setAiTyping(false); setAiShown(true); }, 1200);
    };

    const handleAddFailure = () => {
        if (!formText.trim()) return;
        const icons = { Critical: { icon: 'dangerous', bg: 'bg-red-500/10', color: 'text-red-400' }, Moderate: { icon: 'warning', bg: 'bg-yellow-500/10', color: 'text-yellow-400' }, Minor: { icon: 'info', bg: 'bg-purple-500/10', color: 'text-purple-400' } };
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const entry = {
            id: Date.now(),
            description: formText.trim(),
            datetime: `Today, ${timeStr}`,
            severity: formSeverity,
            icon: icons[formSeverity].icon,
            iconBg: icons[formSeverity].bg,
            iconColor: icons[formSeverity].color,
            aiMessage: "Pattern analysis in progress. Each logged failure improves the system's accuracy. Consistent logging is itself an act of discipline.",
            aiTip: "The fact that you logged this means you're aware. Awareness is the first step. Now design your environment to prevent recurrence.",
        };
        setFailures([entry, ...failures]);
        setFormText('');
    };

    const handleDelete = (id) => setFailures(failures.filter(f => f.id !== id));

    const handleSaveReason = () => {
        if (!reasonText.trim()) return;
        setHistory(history.map(h => h.id === reasonModal.id ? { ...h, reason: reasonText.trim() } : h));
        setReasonModal(null);
        setReasonText('');
    };

    const handleRegenerate = () => {
        setAiTyping(true);
        setAiShown(false);
        setAiResponseIdx(i => (i + 1) % AI_RESPONSES.length);
        setTimeout(() => { setAiTyping(false); setAiShown(true); }, 900);
    };

    return (
        <div className="bg-[#0B0014] text-on-surface font-body min-h-screen overflow-x-hidden selection:bg-primary-container selection:text-white">

            {/* ── TOP NAV ─────────────────────────────────────────────────────── */}
            <header className="fixed top-0 w-full z-50 bg-[#1d0c26]/60 backdrop-blur-xl flex justify-between items-center px-4 md:px-8 h-20 shadow-[0_4px_20px_rgba(255,77,0,0.1)]">
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
                        <span className="material-symbols-outlined text-primary-container text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
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
                    ].map(({ to, icon, label }) => (
                        <Link key={to} className="flex items-center gap-4 text-[#ffb59e]/50 py-3 px-6 hover:bg-[#412d49]/50 hover:text-[#ffb59e] transition-all duration-500 font-body text-sm font-medium" to={to}>
                            <span className="material-symbols-outlined">{icon}</span> {label}
                        </Link>
                    ))}

                    {/* Active: Failure Tracker */}
                    <Link className="flex items-center gap-4 text-[#fff9ef] bg-gradient-to-r from-[#ff571a]/20 to-transparent border-r-4 border-[#ff571a] py-3 px-6 transition-all duration-500 font-body text-sm font-medium" to="/failure-tracker">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dangerous</span> Failure Tracker
                    </Link>

                    {[
                        { icon: 'gavel', label: 'Rules & Discipline', to: '/rules-discipline' },
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
                    <section className="mb-12 relative">
                        <div className="absolute -top-20 -left-20 w-64 h-64 bg-red-500/5 rounded-full blur-[120px] pointer-events-none" />
                        <h1 className="font-headline text-5xl md:text-6xl font-bold tracking-tighter mb-3 relative z-10">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container">
                                Failure
                            </span>{' '}
                            <span className="text-[#fff9ef]">Tracker</span>
                        </h1>
                        <div className="h-0.5 bg-gradient-to-r from-[#ff571a] to-transparent w-48 mb-4" />
                        <p className="text-on-surface-variant text-lg font-light tracking-wide max-w-xl">
                            Understand your mistakes, learn from them, and{' '}
                            <span className="text-primary italic">improve daily.</span>
                        </p>
                    </section>

                    {/* ── INSIGHT CARDS ─────────────────────────────────────── */}
                    <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        {INSIGHTS.map((ins) => (
                            <div key={ins.type} className={`glass-card p-6 rounded-3xl border ${ins.border} bg-[#36233e]/60 backdrop-blur-xl relative overflow-hidden group shadow-[0_20px_40px_rgba(0,0,0,0.2)]`}>
                                <div className={`absolute inset-0 ${ins.hoverBg} opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`} />
                                <div className="flex items-start justify-between mb-4">
                                    <span className={`material-symbols-outlined ${ins.color} ${ins.bg} p-2 rounded-xl`}>{ins.icon}</span>
                                    <span className={`text-[10px] font-bold ${ins.color} uppercase tracking-widest`}>{ins.type}</span>
                                </div>
                                <p className="text-base font-semibold text-on-surface leading-tight mb-4">{ins.message}</p>
                                <div className="flex items-center gap-2">
                                    <div className={`h-1.5 flex-1 bg-surface-container-highest rounded-full overflow-hidden`}>
                                        <div className={`h-full ${ins.barColor} ${ins.barWidth} rounded-full transition-all`} />
                                    </div>
                                    <span className={`text-xs font-bold ${ins.color}`}>{ins.pct}</span>
                                </div>
                            </div>
                        ))}
                    </section>

                    {/* ── MAIN GRID ─────────────────────────────────────────── */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                        {/* ── LEFT COLUMN (8/12) ──────────────────────────────── */}
                        <div className="lg:col-span-8 space-y-8">

                            {/* LOG A SETBACK */}
                            <div className="glass-card p-6 md:p-8 rounded-3xl border border-outline-variant/10 bg-[#36233e]/60 backdrop-blur-xl shadow-[0_20px_40px_rgba(255,77,0,0.08)]">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="material-symbols-outlined text-primary-container">add_circle</span>
                                    <h3 className="font-headline text-xl font-bold text-[#fff9ef] tracking-tight">Log a Setback</h3>
                                </div>
                                <div className="flex flex-col md:flex-row gap-4">
                                    <input
                                        type="text"
                                        placeholder="What went wrong today?"
                                        value={formText}
                                        onChange={e => setFormText(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleAddFailure()}
                                        className="flex-1 bg-[#180720]/80 border border-outline-variant/20 rounded-xl px-6 py-4 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                    />
                                    {/* Severity toggle */}
                                    <div className="flex gap-2">
                                        {['Minor', 'Moderate', 'Critical'].map(s => (
                                            <button
                                                key={s}
                                                onClick={() => setFormSeverity(s)}
                                                className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all ${formSeverity === s
                                                    ? s === 'Critical' ? 'bg-red-500/20 border-red-400 text-red-400'
                                                        : s === 'Moderate' ? 'bg-yellow-500/20 border-yellow-400 text-yellow-400'
                                                            : 'bg-purple-500/20 border-purple-400 text-purple-400'
                                                    : 'border-outline-variant/20 text-on-surface-variant hover:border-primary/40'
                                                    }`}
                                            >{s}</button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={handleAddFailure}
                                        className="px-8 py-4 rounded-xl bg-gradient-to-r from-primary-container to-primary text-[#3a0b00] font-bold tracking-tight shadow-[0_10px_25px_rgba(255,87,26,0.3)] hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
                                    >
                                        Add Failure
                                    </button>
                                </div>
                            </div>

                            {/* RECENT FAILURES */}
                            <section>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-headline text-2xl font-bold text-[#fff9ef]">Recent Failures</h3>
                                    <button className="text-primary text-sm font-medium hover:underline underline-offset-4">View All</button>
                                </div>

                                {failures.length === 0 ? (
                                    <div className="glass-card rounded-3xl p-12 text-center border border-outline-variant/10 bg-[#36233e]/60 backdrop-blur-xl">
                                        <span className="material-symbols-outlined text-6xl text-on-surface-variant/20 block mb-4">check_circle</span>
                                        <p className="text-on-surface-variant font-medium">No failures logged. Keep the discipline going!</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {failures.map(f => {
                                            const sty = SEVERITY_STYLES[f.severity] || SEVERITY_STYLES.Minor;
                                            return (
                                                <div
                                                    key={f.id}
                                                    className="glass-card p-5 md:p-6 rounded-3xl border border-white/5 bg-[#36233e]/60 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-5 hover:border-primary-container/30 transition-all group shadow-[0_10px_30px_rgba(0,0,0,0.2)]"
                                                >
                                                    <div className="flex items-center gap-5">
                                                        <div className={`w-14 h-14 ${f.iconBg} rounded-2xl flex items-center justify-center ${f.iconColor} group-hover:scale-110 transition-transform shrink-0`}>
                                                            <span className="material-symbols-outlined text-3xl">{f.icon}</span>
                                                        </div>
                                                        <div>
                                                            <h4 className="text-lg font-bold text-white mb-1">{f.description}</h4>
                                                            <div className="flex items-center gap-3 text-sm text-on-surface-variant/50 flex-wrap">
                                                                <span>{f.datetime}</span>
                                                                <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest ${sty.badge}`}>
                                                                    {sty.label}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 self-start md:self-center shrink-0">
                                                        <button
                                                            onClick={() => openAiModal(f)}
                                                            className="px-5 py-2 rounded-full border border-primary-container/40 text-primary text-sm font-bold hover:bg-primary-container hover:text-[#3a0b00] transition-all"
                                                        >
                                                            Reason
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(f.id)}
                                                            className="w-9 h-9 rounded-full flex items-center justify-center bg-white/5 hover:bg-error/20 transition-colors"
                                                        >
                                                            <span className="material-symbols-outlined text-on-surface-variant/40 hover:text-error transition-colors text-sm">delete</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </section>

                            {/* THIS WEEK STATS */}
                            <div className="glass-card p-6 rounded-3xl border border-outline-variant/10 bg-[#36233e]/60 backdrop-blur-xl">
                                <h4 className="font-headline text-base font-bold text-[#fff9ef] mb-5 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-sm">query_stats</span>
                                    This Week
                                </h4>
                                <div className="grid grid-cols-4 gap-4">
                                    {[
                                        { label: 'Total', val: failures.length, color: 'text-primary' },
                                        { label: 'Critical', val: failures.filter(f => f.severity === 'Critical').length, color: 'text-red-400' },
                                        { label: 'Moderate', val: failures.filter(f => f.severity === 'Moderate').length, color: 'text-yellow-400' },
                                        { label: 'Minor', val: failures.filter(f => f.severity === 'Minor').length, color: 'text-purple-400' },
                                    ].map(({ label, val, color }) => (
                                        <div key={label} className="text-center p-3 bg-surface-container-highest/30 rounded-2xl">
                                            <div className={`text-2xl font-headline font-black ${color}`}>{val}</div>
                                            <div className="text-[10px] uppercase tracking-widest text-on-surface-variant/60 font-bold mt-1">{label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* ── RIGHT COLUMN (4/12) ─────────────────────────────── */}
                        <div className="lg:col-span-4 space-y-8">

                            {/* PHOENIX INSIGHT (AI Side Panel) */}
                            <div className="glass-card rounded-3xl border border-primary-container/20 overflow-hidden shadow-2xl bg-[#36233e]/60 backdrop-blur-xl">
                                <div className="bg-gradient-to-r from-primary-container/20 to-transparent p-6 border-b border-white/5">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                                        <h3 className="font-headline text-lg font-bold text-[#fff9ef] tracking-tight">Phoenix Insight</h3>
                                    </div>
                                </div>
                                <div className="p-6 space-y-5">
                                    {/* AI message bubble */}
                                    <div className="bg-surface-container-highest/40 p-5 rounded-2xl rounded-tl-none border-l-2 border-primary-container">
                                        <p className="text-sm leading-relaxed text-on-surface">
                                            {AI_RESPONSES[aiResponseIdx].split('**').map((part, i) =>
                                                i % 2 === 1
                                                    ? <span key={i} className="text-primary font-bold">{part}</span>
                                                    : part
                                            )}
                                        </p>
                                    </div>
                                    {/* Tip */}
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-sm text-[#3a0b00]" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
                                        </div>
                                        <p className="text-sm italic text-on-surface-variant">
                                            Every failure logged is a data point. The system learns from your patterns to help you build better habits.
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleRegenerate}
                                        className="w-full py-3 rounded-xl bg-surface-container-highest text-primary font-bold text-xs uppercase tracking-widest hover:bg-primary-container hover:text-[#3a0b00] transition-all"
                                    >
                                        Regenerate Analysis
                                    </button>
                                </div>
                            </div>

                            {/* LAST 7 DAYS TIMELINE */}
                            <section>
                                <h3 className="font-headline text-xl font-bold text-[#fff9ef] tracking-tight mb-6">Last 7 Days</h3>
                                <div className="relative pl-8 space-y-7 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-primary-container/60 before:to-transparent">
                                    {history.slice(0, 7).map((item, idx) => (
                                        <div key={item.id} className="relative group">
                                            <div className={`absolute -left-[27px] top-1.5 w-[14px] h-[14px] rounded-full border-4 border-[#0B0014] transition-all ${idx === 0 ? 'bg-primary-container ring-4 ring-primary-container/20' : 'bg-primary-container/30'}`} />
                                            <div>
                                                <span className="text-[10px] text-on-surface-variant/40 font-bold uppercase tracking-wider">{historyFmtDate(item.date)}</span>
                                                <h4 className={`text-sm font-semibold mt-0.5 ${item.reason ? 'text-white/70' : 'text-white'}`}>{item.label}</h4>
                                                {item.reason ? (
                                                    <p className="text-xs text-on-surface-variant/40 italic mt-0.5">Reason: {item.reason}</p>
                                                ) : (
                                                    <button
                                                        onClick={() => { setReasonModal(item); setReasonText(''); }}
                                                        className="text-xs text-primary mt-1 hover:text-primary-container transition-colors font-medium"
                                                    >
                                                        + Add Reason
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>


                        </div>
                    </div>
                </div>

                {/* Decorative blobs */}
                <div className="fixed bottom-10 right-10 w-96 h-96 bg-primary-container/5 rounded-full blur-[120px] pointer-events-none -z-10" />
                <div className="fixed top-[20%] left-[-10%] w-[40%] h-[40%] bg-red-500/3 rounded-full blur-[150px] pointer-events-none -z-10" />
            </main>

            {/* ── MOBILE BOTTOM NAV ───────────────────────────────────────────── */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#1d0c26]/90 backdrop-blur-xl border-t border-outline-variant/10 flex justify-around items-center px-4 z-[70]">
                <Link to="/dashboard" className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">dashboard</Link>
                <Link to="/daily-tracker" className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">calendar_today</Link>
                <Link to="/failure-tracker" className="material-symbols-outlined text-primary-container">dangerous</Link>
                <Link to="/study-tracker" className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">menu_book</Link>
                <Link to="/finance-tracker" className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">payments</Link>
            </nav>

            {/* ── AI REASON MODAL ──────────────────────────────────────────────── */}
            {aiModal && (
                <div
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center px-4"
                    onClick={(e) => { if (e.target === e.currentTarget) setAiModal(null); }}
                >
                    <div className="w-full max-w-lg bg-[#1d0c26] border border-primary-container/20 rounded-3xl overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.7)]">
                        {/* Modal header */}
                        <div className="bg-gradient-to-r from-primary-container/20 to-transparent px-8 pt-7 pb-5 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary-container/20 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                                </div>
                                <div>
                                    <h3 className="font-headline font-bold text-[#fff9ef]">Phoenix Insight</h3>
                                    <p className="text-[10px] text-on-surface-variant/60 uppercase tracking-widest">AI Discipline Coach</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setAiModal(null)}
                                className="w-9 h-9 rounded-full flex items-center justify-center bg-surface-container-highest hover:bg-error/20 transition-colors"
                            >
                                <span className="material-symbols-outlined text-on-surface-variant text-sm">close</span>
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            {/* User query bubble */}
                            <div className="flex justify-end">
                                <div className="max-w-[80%] bg-primary-container/20 border border-primary-container/20 rounded-2xl rounded-br-none px-5 py-4">
                                    <p className="text-sm text-on-surface font-medium">
                                        Why did I fail at: <span className="text-primary font-bold">"{aiModal.description}"</span>?
                                    </p>
                                </div>
                            </div>

                            {/* AI response bubble */}
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary-container/30 border border-primary-container/40 flex items-center justify-center shrink-0 mt-1">
                                    <span className="material-symbols-outlined text-primary-container text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                                </div>
                                <div className="flex-1 bg-surface-container-highest/50 rounded-2xl rounded-tl-none border-l-2 border-primary-container px-5 py-4">
                                    {aiTyping ? (
                                        <div className="flex gap-1.5 py-1">
                                            <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    ) : aiShown ? (
                                        <p className="text-sm leading-relaxed text-on-surface">
                                            {aiModal.aiMessage.split('**').map((part, i) =>
                                                i % 2 === 1
                                                    ? <span key={i} className="text-primary font-bold">{part}</span>
                                                    : part
                                            )}
                                        </p>
                                    ) : null}
                                </div>
                            </div>

                            {/* Tip bubble */}
                            {aiShown && (
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-[#3a0b00] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
                                    </div>
                                    <div className="flex-1 bg-surface-container-low/60 rounded-2xl rounded-tl-none px-5 py-4">
                                        <p className="text-sm italic text-on-surface-variant">{aiModal.aiTip}</p>
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setAiModal(null)}
                                    className="flex-1 py-3 rounded-xl bg-surface-container-highest text-on-surface-variant font-bold text-sm uppercase tracking-widest hover:bg-surface-bright transition-all"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => { openAiModal(aiModal); }}
                                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary-container to-primary text-[#3a0b00] font-bold text-sm uppercase tracking-widest hover:scale-[1.01] transition-all"
                                >
                                    Regenerate
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── ADD REASON MODAL ─────────────────────────────────────────────── */}
            {reasonModal && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center px-4"
                    onClick={(e) => { if (e.target === e.currentTarget) setReasonModal(null); }}
                >
                    <div className="w-full max-w-md bg-[#1d0c26] border border-outline-variant/20 rounded-3xl overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.6)]">
                        <div className="px-8 pt-7 pb-5 border-b border-white/5 flex items-center justify-between">
                            <div>
                                <h3 className="font-headline font-bold text-[#fff9ef]">Add Reason</h3>
                                <p className="text-xs text-on-surface-variant/60 mt-1">"{reasonModal.label}"</p>
                            </div>
                            <button onClick={() => setReasonModal(null)} className="w-9 h-9 rounded-full flex items-center justify-center bg-surface-container-highest hover:bg-error/20 transition-colors">
                                <span className="material-symbols-outlined text-on-surface-variant text-sm">close</span>
                            </button>
                        </div>
                        <div className="p-8 space-y-4">
                            <textarea
                                rows={3}
                                value={reasonText}
                                onChange={e => setReasonText(e.target.value)}
                                placeholder="What caused this failure?"
                                className="w-full bg-[#180720]/80 border border-outline-variant/20 rounded-xl px-5 py-4 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none"
                            />
                            <button
                                onClick={handleSaveReason}
                                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-container to-primary text-[#3a0b00] font-bold uppercase tracking-widest hover:scale-[1.01] transition-all"
                            >
                                Save Reason
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FailureTracker;
