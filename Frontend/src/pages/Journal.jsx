import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getJournalEntries, getJournalStats, getJournalFeatured, createJournalEntry, deleteJournalEntry } from '../services/api';

// ─── Seed Data ────────────────────────────────────────────────────────────────
const today = new Date();

const SEED_ENTRIES = [
    {
        id: 1,
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1).toISOString().split('T')[0],
        title: 'Growth & Resilience',
        type: 'Lesson',
        typeIcon: 'history_edu',
        typeColor: 'text-secondary',
        typeBg: 'bg-secondary/10',
        tags: ['#Mindset', '#Resilience', '#Discipline'],
        body: "Today was a challenge in staying composed. When the project deadline shifted, my initial reaction was frustration. However, I applied the 'Stoic Pause' and realized that I could leverage this extra time to refine the animation system. Growth isn't just about moving forward; it's about how you handle the pushback.",
        featured: true,
    },
    {
        id: 2,
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3).toISOString().split('T')[0],
        title: 'Lessons from Failure',
        type: 'Failure Analysis',
        typeIcon: 'dangerous',
        typeColor: 'text-tertiary',
        typeBg: 'bg-tertiary/10',
        tags: ['#Failure', '#Reflection'],
        body: 'Analyzing the breakdown in the study routine during the high-load week. Root cause found in sleep deprivation and poor task prioritization. Must protect the 10 PM cutoff.',
        featured: false,
    },
    {
        id: 3,
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 5).toISOString().split('T')[0],
        title: 'Financial Milestone',
        type: 'Finance Milestone',
        typeIcon: 'payments',
        typeColor: 'text-secondary-container',
        typeBg: 'bg-secondary-container/10',
        tags: ['#Finance', '#Discipline'],
        body: 'Reached the initial savings goal for the Q2 investment pool. Discipline in daily expenses is yielding compound interest in the portfolio. The celestial baseline holds.',
        featured: false,
    },
    {
        id: 4,
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7).toISOString().split('T')[0],
        title: 'Mood Check — Low Energy',
        type: 'Mood Log',
        typeIcon: 'mood',
        typeColor: 'text-primary',
        typeBg: 'bg-primary/10',
        tags: ['#Mood', '#Recovery'],
        body: 'Energy was low today. Identified it as cumulative fatigue from the past two weeks. Decided to convert the afternoon session into active rest. No guilt — strategic recovery.',
        featured: false,
    },
];

const MOOD_OPTIONS = [
    { label: 'Mood Check', desc: 'Log your emotional state and triggers.', icon: 'mood', color: 'text-primary', border: 'border-primary', type: 'Mood Log' },
    { label: 'Lesson Learned', desc: 'Document daily wisdom and growth.', icon: 'history_edu', color: 'text-secondary', border: 'border-secondary', type: 'Lesson' },
    { label: 'Free Reflection', desc: 'Capture any other thought or insight.', icon: 'edit_note', color: 'text-tertiary', border: 'border-tertiary', type: 'Reflection' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (iso) => {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
};

const isYesterday = (iso) => {
    const d = new Date(iso + 'T00:00:00');
    const y = new Date(today);
    y.setDate(today.getDate() - 1);
    return d.toDateString() === y.toDateString();
};

const getDaysBetween = (iso) => {
    const d = new Date(iso + 'T00:00:00');
    const diff = Math.round((today - d) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    return `${diff} days ago`;
};

// ─── Calendar Helper ──────────────────────────────────────────────────────────
const buildCalendar = (year, month) => {
    const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
    // Shift so Mon=0
    const startOffset = (firstDay + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevDays = new Date(year, month, 0).getDate();

    const cells = [];
    for (let i = startOffset - 1; i >= 0; i--) cells.push({ day: prevDays - i, current: false });
    for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, current: true });
    while (cells.length % 7 !== 0) cells.push({ day: cells.length - daysInMonth - startOffset + 1, current: false });
    return cells;
};

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

// ─── Component ────────────────────────────────────────────────────────────────
const Journal = () => {
        const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    
    // API State
    const [entries, setEntries] = useState([]);
    const [stats, setStats] = useState({ total_entries: 0, day_streak: 0, all_time_best: 0 });
    const [featuredEntry, setFeaturedEntry] = useState(null);
    
    const [selectedDate, setSelectedDate] = useState(null);

    // Calendar state
    const [calYear, setCalYear] = useState(today.getFullYear());
    const [calMonth, setCalMonth] = useState(today.getMonth());

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [modalStep, setModalStep] = useState('pick'); // 'pick' | 'write'
    const [modalType, setModalType] = useState(null);
    const [formTitle, setFormTitle] = useState('');
    const [formBody, setFormBody] = useState('');
    const [formTags, setFormTags] = useState('');

    // Expand state for featured entry
    const [expanded, setExpanded] = useState(false);

    const calCells = buildCalendar(calYear, calMonth);

    const entriesOnDate = (day) => {
        const iso = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return entries.some(e => e.date === iso);
    };

    const handlePickType = (opt) => {
        setModalType(opt);
        setFormTitle(opt.label);
        setModalStep('write');
    };

    const fetchJournalData = async () => {
        try {
            const [entriesRes, statsRes, featuredRes] = await Promise.all([
                getJournalEntries(),
                getJournalStats(),
                getJournalFeatured()
            ]);
            setEntries(entriesRes);
            setStats(statsRes);
            setFeaturedEntry(featuredRes && !featuredRes.error ? featuredRes : null);
        } catch (error) {
            console.error('Failed to fetch journal data:', error);
        }
    };

    useEffect(() => {
        fetchJournalData();
    }, []);

    const handleAddEntry = async () => {
        if (!formTitle.trim() || !formBody.trim()) return;
        
        let tags = [];
        if (formTags.trim()) {
            tags = formTags.split(',').map(t => t.trim()).filter(Boolean).map(t => t.startsWith('#') ? t : `#${t}`);
        } else {
            tags = ['#Reflection'];
        }

        const data = {
            title: formTitle.trim(),
            type: modalType.type,
            tags: tags,
            body: formBody.trim()
        };

        try {
            await createJournalEntry(data);
            await fetchJournalData(); 
            
            setShowModal(false);
            setModalStep('pick');
            setFormTitle('');
            setFormBody('');
            setFormTags('');
            setModalType(null);
        } catch (error) {
            console.error('Error creating entry:', error);
            alert('Failed to create entry. Please try again.');
        }
    };

    const handleDelete = async (id) => {
        if(!window.confirm('Are you sure you want to delete this entry?')) return;
        try {
            await deleteJournalEntry(id);
            await fetchJournalData();
        } catch (error) {
            console.error('Failed to delete entry', error);
        }
    };

    // Show selected date if any, otherwise all barring featured
    const otherEntries = entries.filter(e => {
        if (featuredEntry && e.id === featuredEntry.id) return false;
        if (selectedDate) return e.date === selectedDate;
        return true;
    });

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
                    <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container-highest/40">
                        <span className="material-symbols-outlined text-secondary text-sm">workspace_premium</span>
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
                    ].map(({ to, icon, label }) => (
                        <Link key={to} className="flex items-center gap-4 text-[#ffb59e]/50 py-3 px-6 hover:bg-[#412d49]/50 hover:text-[#ffb59e] transition-all duration-500 font-body text-sm font-medium" to={to}>
                            <span className="material-symbols-outlined">{icon}</span> {label}
                        </Link>
                    ))}

                    {/* Active: Journal */}
                    <Link className="flex items-center gap-4 text-[#fff9ef] bg-gradient-to-r from-[#ff571a]/20 to-transparent border-r-4 border-[#ff571a] py-3 px-6 transition-all duration-500 font-body text-sm font-medium" to="/journal">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>edit_note</span> Journal
                    </Link>

                    {[
                        { icon: 'dangerous', label: 'Failure Tracker', to: '/failure-tracker' },
                        { icon: 'gavel', label: 'Rules & Discipline', to: '/rules-discipline' },
                        { icon: 'analytics', label: 'Analysis', to: '/analysis' },
                    ].map(({ icon, label, to }) => (
                        <Link key={label} className="flex items-center gap-4 text-[#ffb59e]/50 py-3 px-6 hover:bg-[#412d49]/50 hover:text-[#ffb59e] transition-all duration-500 font-body text-sm font-medium" to={to}>
                            <span className="material-symbols-outlined">{icon}</span> {label}
                        </Link>
                    ))}

                    <div className="mt-auto pt-8">
                        {/* New Entry Button inside sidebar */}
                        <div className="px-6 mb-4">
                            <button
                                onClick={() => { setShowModal(true); setIsSidebarOpen(false); }}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-gradient-to-r from-primary to-primary-container text-[#3a0b00] font-bold shadow-[0_10px_20px_rgba(255,87,26,0.2)] hover:scale-[1.02] active:scale-95 transition-all duration-300"
                            >
                                <span className="material-symbols-outlined">add_circle</span>
                                New Entry
                            </button>
                        </div>
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
                    <section className="mb-12 relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
                        <div>
                            <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary-container/10 rounded-full blur-[120px] pointer-events-none" />
                            <h1 className="font-headline text-5xl md:text-6xl font-bold tracking-tighter text-[#fff9ef] mb-2 relative z-10">
                                Journal{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container drop-shadow-[0_0_15px_rgba(255,181,158,0.4)]">
                                    &
                                </span>{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-container to-primary">
                                    Reflection
                                </span>
                            </h1>
                            <div className="h-0.5 bg-gradient-to-r from-[#ff571a] to-transparent w-48 mb-4" />
                            <p className="text-on-surface-variant text-lg font-light tracking-wide max-w-xl italic">
                                Reflect on your day, track your thoughts, and grow with awareness.
                            </p>
                        </div>
                        {/* + New Entry FAB (desktop) */}
                        <button
                            onClick={() => setShowModal(true)}
                            className="hidden sm:flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-primary to-primary-container text-[#3a0b00] font-bold shadow-[0_10px_30px_rgba(255,87,26,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0"
                        >
                            <span className="material-symbols-outlined">add_circle</span>
                            New Entry
                        </button>
                    </section>

                    {/* ── MAIN GRID ─────────────────────────────────────────── */}
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">

                        {/* ── LEFT COLUMN (4/12): Calendar + Quick Add ─────── */}
                        <div className="xl:col-span-4 space-y-6">

                            {/* CALENDAR */}
                            <div className="glass-card p-6 rounded-3xl border border-outline-variant/10 bg-[#36233e]/60 backdrop-blur-xl shadow-[0_20px_40px_rgba(255,77,0,0.08)]">
                                {/* Month Nav */}
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-headline text-xl font-bold text-secondary">
                                        {MONTH_NAMES[calMonth]} {calYear}
                                    </h3>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => {
                                                if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
                                                else setCalMonth(m => m - 1);
                                            }}
                                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-primary/10 text-on-surface-variant hover:text-primary transition-all"
                                        >
                                            <span className="material-symbols-outlined text-lg leading-none">chevron_left</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
                                                else setCalMonth(m => m + 1);
                                            }}
                                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-primary/10 text-on-surface-variant hover:text-primary transition-all"
                                        >
                                            <span className="material-symbols-outlined text-lg leading-none">chevron_right</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Day Labels */}
                                <div className="grid grid-cols-7 gap-y-3 text-center mb-2">
                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                                        <span key={d} className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-tighter">{d}</span>
                                    ))}
                                </div>

                                {/* Date Cells */}
                                <div className="grid grid-cols-7 gap-y-1 text-center">
                                    {calCells.map((cell, i) => {
                                        const isToday = cell.current &&
                                            cell.day === today.getDate() &&
                                            calMonth === today.getMonth() &&
                                            calYear === today.getFullYear();
                                        const hasEntry = cell.current && entriesOnDate(cell.day);
                                        const isoStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}`;
                                        const isSelected = selectedDate === isoStr && cell.current;

                                        return (
                                            <div
                                                key={i}
                                                onClick={() => cell.current && setSelectedDate(isSelected ? null : isoStr)}
                                                className={`relative flex flex-col items-center justify-center py-1.5 cursor-pointer group`}
                                            >
                                                <span className={`
                                                    w-8 h-8 flex items-center justify-center text-sm font-medium rounded-full transition-all
                                                    ${!cell.current ? 'text-on-surface-variant/20 cursor-default' : 'hover:bg-primary/10'}
                                                    ${isToday ? 'bg-primary/20 border border-primary/40 text-primary font-bold' : ''}
                                                    ${isSelected && !isToday ? 'bg-primary/30 text-primary' : ''}
                                                    ${cell.current && !isToday && !isSelected ? 'text-on-surface/80' : ''}
                                                `}>
                                                    {cell.day}
                                                </span>
                                                {hasEntry && (
                                                    <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-primary-container" />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Today label */}
                                <div className="mt-4 pt-4 border-t border-outline-variant/10 flex items-center justify-between">
                                    <span className="text-xs text-on-surface-variant font-medium">
                                        {today.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
                                    </span>
                                    <span className="text-xs text-primary font-bold">{entries.length} Entries</span>
                                </div>
                            </div>

                            {/* QUICK ADD CARDS */}
                            <div className="space-y-3">
                                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant/50 font-bold px-1">Quick Add</p>
                                {MOOD_OPTIONS.map(opt => (
                                    <button
                                        key={opt.type}
                                        onClick={() => { setModalType(opt); setFormTitle(opt.label); setModalStep('write'); setShowModal(true); }}
                                        className={`w-full glass-panel p-4 rounded-2xl border-l-4 ${opt.border} bg-[#36233e]/60 backdrop-blur-xl flex items-center gap-4 hover:translate-x-1 transition-all duration-300 cursor-pointer group text-left`}
                                    >
                                        <div className="w-11 h-11 rounded-xl bg-surface-container-highest flex items-center justify-center shrink-0">
                                            <span className={`material-symbols-outlined ${opt.color} group-hover:scale-110 transition-transform`}>{opt.icon}</span>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-on-surface text-sm">{opt.label}</h4>
                                            <p className="text-[11px] text-on-surface-variant/60">{opt.desc}</p>
                                        </div>
                                        <span className="material-symbols-outlined text-on-surface-variant/30 group-hover:text-primary ml-auto transition-colors">arrow_forward_ios</span>
                                    </button>
                                ))}
                            </div>

                            {/* STATS CARD */}
                            <div className="glass-card p-6 rounded-3xl border border-outline-variant/10 bg-[#36233e]/60 backdrop-blur-xl">
                                <h4 className="font-headline text-base font-bold text-secondary mb-5">Writing Streak</h4>
                                <div className="flex items-center justify-around">
                                    {[
                                        { val: stats.total_entries, label: 'Total Entries', color: 'text-primary' },
                                        { val: stats.day_streak, label: 'Day Streak', color: 'text-secondary' },
                                        { val: stats.all_time_best, label: 'All-Time Best', color: 'text-tertiary' },
                                    ].map(({ val, label, color }) => (
                                        <div key={label} className="text-center">
                                            <div className={`text-3xl font-headline font-black ${color}`}>{val}</div>
                                            <div className="text-[10px] uppercase tracking-widest text-on-surface-variant/60 font-bold mt-1">{label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* ── RIGHT COLUMN (8/12): Featured + Previous ─────── */}
                        <div className="xl:col-span-8 space-y-8">

                            {/* FEATURED / YESTERDAY ENTRY */}
                            {featuredEntry && (
                                <article className="relative glass-card rounded-3xl overflow-hidden border border-outline-variant/10 bg-[#36233e]/60 backdrop-blur-xl shadow-[0_20px_40px_rgba(255,77,0,0.08)] group">
                                    {/* Glow backdrop */}
                                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 blur-[100px] pointer-events-none" />

                                    <div className="p-8 md:p-10 relative z-10">
                                        {/* Header */}
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <div className="flex items-center gap-3 mb-3 flex-wrap">
                                                    <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest rounded-full border border-primary/20">
                                                        {isYesterday(featuredEntry.date) ? 'Yesterday' : getDaysBetween(featuredEntry.date)}
                                                    </span>
                                                    <span className="text-on-surface-variant text-sm font-medium">{fmtDate(featuredEntry.date)}</span>
                                                    <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${featuredEntry.typeBg} ${featuredEntry.typeColor}`}>
                                                        <span className="material-symbols-outlined text-xs">{featuredEntry.typeIcon}</span>
                                                        {featuredEntry.type}
                                                    </span>
                                                </div>
                                                <h2 className="font-headline text-3xl md:text-4xl font-black text-on-surface">{featuredEntry.title}</h2>
                                            </div>
                                            <div className="flex gap-2 shrink-0">
                                                <button className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors">
                                                    <span className="material-symbols-outlined text-on-surface-variant text-lg">edit</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(featuredEntry.id)}
                                                    className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 hover:bg-error/20 transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-on-surface-variant hover:text-error text-lg transition-colors">delete</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Body */}
                                        <div className="mb-8">
                                            <p className={`text-on-surface-variant leading-relaxed text-lg italic border-l-2 border-primary/30 pl-6 py-2 ${!expanded && 'line-clamp-4'}`}>
                                                "{featuredEntry.body}"
                                            </p>
                                        </div>

                                        {/* Footer */}
                                        <div className="flex items-center justify-between flex-wrap gap-4">
                                            <div className="flex gap-2 flex-wrap">
                                                {featuredEntry.tags.map(tag => (
                                                    <span key={tag} className="bg-surface-container-highest px-3 py-1.5 rounded-full text-xs font-medium text-on-surface-variant">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                            <button
                                                onClick={() => setExpanded(!expanded)}
                                                className="flex items-center gap-2 text-primary font-bold text-sm hover:gap-3 transition-all group/btn"
                                            >
                                                <span>{expanded ? 'Show Less' : 'Read Full Entry'}</span>
                                                <span className="material-symbols-outlined">{expanded ? 'keyboard_arrow_up' : 'arrow_right_alt'}</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Bottom accent line */}
                                    <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                                </article>
                            )}

                            {/* PREVIOUS ENTRIES */}
                            <section>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-headline text-2xl font-bold text-[#fff9ef]">Previous Entries</h3>
                                    <button className="text-on-surface-variant text-sm hover:text-primary transition-colors flex items-center gap-2">
                                        View Archive
                                        <span className="material-symbols-outlined text-sm">open_in_new</span>
                                    </button>
                                </div>

                                {otherEntries.length === 0 ? (
                                    <div className="glass-card rounded-3xl p-12 text-center border border-outline-variant/10 bg-[#36233e]/60 backdrop-blur-xl">
                                        <span className="material-symbols-outlined text-6xl text-on-surface-variant/20 mb-4 block">auto_stories</span>
                                        <p className="text-on-surface-variant font-medium">No previous entries yet. Start journaling!</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        {otherEntries.map(entry => (
                                            <div
                                                key={entry.id}
                                                className="glass-panel p-6 rounded-2xl border border-outline-variant/10 bg-[#36233e]/60 backdrop-blur-xl hover:bg-surface-container-high transition-colors group cursor-pointer relative overflow-hidden"
                                            >
                                                {/* Subtle glow on hover */}
                                                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/3 transition-colors pointer-events-none" />

                                                <div className="flex justify-between items-start mb-4">
                                                    <span className={`text-xs font-bold ${entry.typeColor} uppercase tracking-tight`}>
                                                        {fmtDate(entry.date).split(' ').slice(0, 2).join(' ')}
                                                    </span>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDelete(entry.id); }}
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <span className="material-symbols-outlined text-on-surface-variant/40 hover:text-error transition-colors text-sm">delete</span>
                                                    </button>
                                                </div>

                                                <h4 className="text-lg font-bold mb-2 text-on-surface group-hover:text-primary transition-colors">{entry.title}</h4>
                                                <p className="text-on-surface-variant/70 text-sm line-clamp-2 mb-5">
                                                    {entry.body}
                                                </p>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`w-2 h-2 rounded-full ${entry.typeColor.replace('text-', 'bg-')}`} />
                                                        <span className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-widest">{entry.type}</span>
                                                    </div>
                                                    <span className="text-[10px] text-on-surface-variant/40 font-medium">{getDaysBetween(entry.date)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        </div>
                    </div>
                </div>

                {/* Decorative blobs */}
                <div className="fixed top-[20%] right-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[150px] pointer-events-none -z-10" />
                <div className="fixed bottom-[-10%] left-[5%] w-[30%] h-[30%] bg-secondary/5 rounded-full blur-[100px] pointer-events-none -z-10" />
            </main>

            {/* ── MOBILE FAB ──────────────────────────────────────────────────── */}
            <button
                onClick={() => setShowModal(true)}
                className="fixed bottom-24 right-6 md:hidden w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary-container text-[#3a0b00] flex items-center justify-center shadow-[0_0_30px_rgba(255,87,26,0.4)] z-50 active:scale-95 transition-transform"
            >
                <span className="material-symbols-outlined">edit_note</span>
            </button>

            {/* ── MOBILE BOTTOM NAV ───────────────────────────────────────────── */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#1d0c26]/90 backdrop-blur-xl border-t border-outline-variant/10 flex justify-around items-center px-4 z-[70]">
                <Link to="/dashboard" className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">dashboard</Link>
                <Link to="/daily-tracker" className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">calendar_today</Link>
                <Link to="/journal" className="material-symbols-outlined text-primary">edit_note</Link>
                <Link to="/study-tracker" className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">menu_book</Link>
                <Link to="/finance-tracker" className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">payments</Link>
            </nav>

            {/* ── NEW ENTRY MODAL ──────────────────────────────────────────────── */}
            {showModal && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center px-4"
                    onClick={(e) => { if (e.target === e.currentTarget) { setShowModal(false); setModalStep('pick'); setModalType(null); } }}
                >
                    <div className="w-full max-w-lg glass-card rounded-3xl border border-outline-variant/10 bg-[#26142e]/95 backdrop-blur-2xl shadow-[0_40px_80px_rgba(0,0,0,0.6)] overflow-hidden">

                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-outline-variant/10">
                            <div>
                                <h3 className="font-headline text-2xl font-bold text-[#fff9ef]">
                                    {modalStep === 'pick' ? 'New Journal Entry' : modalType?.label}
                                </h3>
                                <p className="text-on-surface-variant text-sm mt-1">
                                    {modalStep === 'pick' ? 'What would you like to reflect on?' : 'Write your reflection below.'}
                                </p>
                            </div>
                            <button
                                onClick={() => { setShowModal(false); setModalStep('pick'); setModalType(null); }}
                                className="w-9 h-9 rounded-full flex items-center justify-center bg-surface-container-highest hover:bg-error/20 transition-colors"
                            >
                                <span className="material-symbols-outlined text-on-surface-variant hover:text-error transition-colors">close</span>
                            </button>
                        </div>

                        {/* Step 1: Pick type */}
                        {modalStep === 'pick' && (
                            <div className="p-8 space-y-3">
                                {MOOD_OPTIONS.map(opt => (
                                    <button
                                        key={opt.type}
                                        onClick={() => handlePickType(opt)}
                                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border ${opt.border}/20 bg-surface-container-low/60 hover:bg-surface-container hover:${opt.border}/40 transition-all group text-left`}
                                    >
                                        <div className={`w-12 h-12 rounded-xl ${opt.color.replace('text-', 'bg-')}/10 flex items-center justify-center shrink-0`}>
                                            <span className={`material-symbols-outlined ${opt.color} group-hover:scale-110 transition-transform`}>{opt.icon}</span>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-on-surface">{opt.label}</h4>
                                            <p className="text-xs text-on-surface-variant/60">{opt.desc}</p>
                                        </div>
                                        <span className={`material-symbols-outlined ${opt.color} opacity-0 group-hover:opacity-100 transition-opacity`}>arrow_forward</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Step 2: Write entry */}
                        {modalStep === 'write' && (
                            <div className="p-8 space-y-5">
                                {/* Back button */}
                                <button
                                    onClick={() => { setModalStep('pick'); setFormTitle(''); setFormBody(''); setFormTags(''); }}
                                    className="flex items-center gap-1 text-on-surface-variant hover:text-primary transition-colors text-sm font-medium"
                                >
                                    <span className="material-symbols-outlined text-base">arrow_back</span>
                                    Back
                                </button>

                                {/* Title */}
                                <div className="space-y-2">
                                    <label className="text-xs uppercase tracking-widest text-on-surface-variant font-bold">Entry Title</label>
                                    <input
                                        type="text"
                                        value={formTitle}
                                        onChange={e => setFormTitle(e.target.value)}
                                        placeholder="Give your entry a title..."
                                        className="w-full bg-[#180720]/80 border border-outline-variant/20 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-on-surface p-4 transition-all outline-none placeholder:text-on-surface-variant/40"
                                    />
                                </div>

                                {/* Body */}
                                <div className="space-y-2">
                                    <label className="text-xs uppercase tracking-widest text-on-surface-variant font-bold">Reflection</label>
                                    <textarea
                                        rows={5}
                                        value={formBody}
                                        onChange={e => setFormBody(e.target.value)}
                                        placeholder="Write your thoughts freely..."
                                        className="w-full bg-[#180720]/80 border border-outline-variant/20 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-on-surface p-4 transition-all outline-none placeholder:text-on-surface-variant/40 resize-none leading-relaxed"
                                    />
                                </div>

                                {/* Tags */}
                                <div className="space-y-2">
                                    <label className="text-xs uppercase tracking-widest text-on-surface-variant font-bold">Tags <span className="normal-case font-normal opacity-60">(comma separated)</span></label>
                                    <input
                                        type="text"
                                        value={formTags}
                                        onChange={e => setFormTags(e.target.value)}
                                        placeholder="Mindset, Resilience, Finance..."
                                        className="w-full bg-[#180720]/80 border border-outline-variant/20 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-on-surface p-4 transition-all outline-none placeholder:text-on-surface-variant/40"
                                    />
                                </div>

                                {/* Submit */}
                                <button
                                    onClick={handleAddEntry}
                                    disabled={!formTitle.trim() || !formBody.trim()}
                                    className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-primary-container text-[#3a0b00] font-bold uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(255,87,26,0.3)] hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
                                >
                                    Save Entry
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Journal;
