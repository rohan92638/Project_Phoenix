import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStudyCategories, createStudyCategory, getAllStudyLogs, createStudyLog } from '../services/api';

const COLOR_THEMES = [
    { colorFrom: 'from-emerald-900/10', colorTo: 'to-[#1d0c26]/60', borderColor: 'border-emerald-500', iconColor: 'text-emerald-400', highlightColor: 'bg-emerald-400' },
    { colorFrom: 'from-amber-900/10', colorTo: 'to-[#1d0c26]/60', borderColor: 'border-amber-500', iconColor: 'text-amber-400', highlightColor: 'bg-amber-400' },
    { colorFrom: 'from-pink-900/10', colorTo: 'to-[#1d0c26]/60', borderColor: 'border-pink-500', iconColor: 'text-pink-400', highlightColor: 'bg-pink-400' },
    { colorFrom: 'from-rose-900/10', colorTo: 'to-[#1d0c26]/60', borderColor: 'border-rose-500', iconColor: 'text-rose-400', highlightColor: 'bg-rose-400' },
    { colorFrom: 'from-teal-900/10', colorTo: 'to-[#1d0c26]/60', borderColor: 'border-teal-500', iconColor: 'text-teal-400', highlightColor: 'bg-teal-400' },
];

const StudyTracker = () => {
    // 1. useState Setup
    const [categories, setCategories] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Form Navigation States
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Form Data States
    const [selectedCategory, setSelectedCategory] = useState('');
    const [newCategoryTitle, setNewCategoryTitle] = useState('');
    const [isEditingTitle, setIsEditingTitle] = useState(false);

    const [formSubject, setFormSubject] = useState("");
    const [formTopic, setFormTopic] = useState("");
    const [formStatus, setFormStatus] = useState("Not Started");
    const [formNum, setFormNum] = useState(0);
    const [formRev, setFormRev] = useState(0);
    const [formWeak, setFormWeak] = useState(false);

    // 2. useEffect (Initial Load)
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const fetchedCategories = await getStudyCategories();
            const fetchedLogs = await getAllStudyLogs();
            
            // Map frontend themes to the backend categories
            const themedCategories = fetchedCategories.map((cat, index) => {
                const theme = COLOR_THEMES[index % COLOR_THEMES.length];
                return { ...cat, icon: 'bookmark', ...theme };
            });

            setCategories(themedCategories);
            setLogs(fetchedLogs);
            
            if (themedCategories.length > 0 && !selectedCategory) {
                setSelectedCategory(themedCategories[0].id);
            }
        } catch (err) {
            setError(err.message || "Failed to load tracker logs.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Helper: Calculate progress percentage for a category based on 'Completed' status
    const getCategoryProgress = (categoryId) => {
        const catLogs = logs.filter(l => l.category && l.category.id === categoryId);
        if (catLogs.length === 0) return 0;
        
        const completed = catLogs.filter(l => l.status === 'Completed').length;
        return Math.round((completed / catLogs.length) * 100);
    };

    // 4. FORM SUBMISSION (CRITICAL)
    const handleAddEntry = async () => {
        if (!formTopic.trim()) {
            setError("Topic name is required.");
            return;
        }

        let targetCategoryId = selectedCategory;

        try {
            // STEP 1: Check if making new category
            if (targetCategoryId === 'ADD_NEW') {
                if (!newCategoryTitle.trim()) {
                    setError("Please provide a new title name.");
                    return;
                }
                const newCatResponse = await createStudyCategory({ title: newCategoryTitle.trim() });
                targetCategoryId = newCatResponse.id;
            }

            if (!targetCategoryId) {
                setError("Invalid category selection.");
                return;
            }

            // STEP 2: POST to create log
            const logData = {
                category: targetCategoryId,
                subject: formSubject.trim() || newCategoryTitle.trim() || "General",
                topic: formTopic.trim(), 
                status: formStatus,
                numericals: parseInt(formNum, 10) || 0,
                revision: parseInt(formRev, 10) || 0,
                weak: formWeak
            };

            await createStudyLog(logData);

            // 5. AFTER SUBMIT (Fetch Logs & Clear Form)
            await fetchData(); 
            
            setSelectedCategory(targetCategoryId);
            setNewCategoryTitle("");
            setIsEditingTitle(false);
            setFormSubject("");
            setFormTopic("");
            setFormStatus("Not Started");
            setFormNum(0);
            setFormRev(0);
            setFormWeak(false);
            setError(null);

        } catch (err) {
            setError(err.message || "Failed to add entry. Please verify API state.");
        }
    };

    return (
        <div className="bg-[#0B0014] text-on-surface font-body min-h-screen overflow-x-hidden selection:bg-primary-container selection:text-white">
            {/* Top Navigation */}
            <header className="fixed top-0 w-full z-50 bg-[#1d0c26]/60 backdrop-blur-xl flex justify-between items-center px-4 md:px-8 h-20 shadow-[0_20px_40px_rgba(255,77,0,0.08)]">
                <div className="flex items-center gap-4 md:gap-6">
                    <span
                        className="material-symbols-outlined text-[#ffb59e]/70 hover:text-[#fff9ef] transition-colors cursor-pointer"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                        menu
                    </span>
                    <Link to="/" className="text-lg md:text-xl font-bold uppercase tracking-widest text-[#ffb59e] font-headline">PROJECT PHOENIX</Link>
                    <div className="hidden md:flex h-6 w-px bg-outline-variant/30"></div>
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
                            <img alt="User avatar" className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-primary/20 object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJX57hND0c23Vl9y9cQ-b8y7jvLmQ3EuvRdMxc0MlHAROaZlmIQKhsKb6qA0PkXrL7hzV4B7B-qbMSFe7fvO7Zbtw-ZbFzfqpvYHrp_qVB1et2M9otwJ_b1teBRyQnc76VmkPo061BEXfioiJkV9mFOPsPI5WZ14PFGgxB3NiAE0tq3CrjCBPTBvn8FSfJPC10cyOj1H92-_nCk-EhmB4xI1F65neVrMNF-VaF1OZuZyEAgepJdftLUAeZ4TtS4mjBOGNCrC1r" />
                        </div>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#ffb59e]/20 to-transparent"></div>
            </header>

            {/* The mobile overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            <aside className={`fixed left-0 h-full w-72 z-40 bg-[#0B0014]/95 backdrop-blur-2xl border-r border-[#ffb59e]/10 shadow-[10px_0_30px_rgba(0,0,0,0.5)] flex flex-col pt-24 pb-8 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="px-6 mb-8 flex justify-between items-center">
                    <div className="flex items-center gap-3 p-4 bg-surface-container-low rounded-xl border border-outline-variant/10">
                        <div className="w-2 h-10 bg-primary rounded-full"></div>
                        <div>
                            <p className="text-[#f6d9fd] font-bold text-sm">Alex Mercer</p>
                            <p className="text-primary-container text-[10px] font-bold uppercase tracking-wider">Level 12 Initiated</p>
                        </div>
                    </div>
                    <span
                        className="material-symbols-outlined text-slate-400 cursor-pointer md:hidden ml-4"
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        close
                    </span>
                </div>
                <nav className="flex flex-col flex-1 overflow-y-auto w-full no-scrollbar">
                    <div className="mb-4 px-6 text-[10px] uppercase tracking-widest text-on-surface-variant/50 font-bold">Main Console</div>
                    <Link className="flex items-center gap-4 text-[#ffb59e]/50 py-3 px-6 hover:bg-[#412d49]/50 hover:text-[#ffb59e] transition-all duration-500 font-body text-sm font-medium" to="/dashboard">
                        <span className="material-symbols-outlined">dashboard</span> Dashboard
                    </Link>
                    <Link className="flex items-center gap-4 text-[#ffb59e]/50 py-3 px-6 hover:bg-[#412d49]/50 hover:text-[#ffb59e] transition-all duration-500 font-body text-sm font-medium" to="/daily-tracker">
                        <span className="material-symbols-outlined">calendar_today</span> Daily Tracker
                    </Link>
                    <Link className="flex items-center gap-4 text-[#fff9ef] bg-gradient-to-r from-[#ff571a]/20 to-transparent border-r-4 border-[#ff571a] py-3 px-6 transition-all duration-500 font-body text-sm font-medium" to="/study-tracker">
                        <span className="material-symbols-outlined">menu_book</span> Study Tracker
                    </Link>
                    <Link className="flex items-center gap-4 text-[#ffb59e]/50 py-3 px-6 hover:bg-[#412d49]/50 hover:text-[#ffb59e] transition-all duration-500 font-body text-sm font-medium" to="/finance-tracker">
                        <span className="material-symbols-outlined">payments</span> Finance Tracker
                    </Link>
                    <Link className="flex items-center gap-4 text-[#ffb59e]/50 py-3 px-6 hover:bg-[#412d49]/50 hover:text-[#ffb59e] transition-all duration-500 font-body text-sm font-medium" to="/journal">
                        <span className="material-symbols-outlined">edit_note</span> Journal
                    </Link>

                    <Link className="flex items-center gap-4 text-[#ffb59e]/50 py-3 px-6 hover:bg-[#412d49]/50 hover:text-[#ffb59e] transition-all duration-500 font-body text-sm font-medium" to="/failure-tracker">
                        <span className="material-symbols-outlined">dangerous</span> Failure Tracker
                    </Link>
                    <Link className="flex items-center gap-4 text-[#ffb59e]/50 py-3 px-6 hover:bg-[#412d49]/50 hover:text-[#ffb59e] transition-all duration-500 font-body text-sm font-medium" to="/rules-discipline">
                        <span className="material-symbols-outlined">gavel</span> Rules & Discipline
                    </Link>
                    <Link className="flex items-center gap-4 text-[#ffb59e]/50 py-3 px-6 hover:bg-[#412d49]/50 hover:text-[#ffb59e] transition-all duration-500 font-body text-sm font-medium" to="/analysis">
                        <span className="material-symbols-outlined">analytics</span> Analysis
                    </Link>

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

            {/* Main Content */}
            <main className={`pt-28 pb-20 md:pb-12 px-6 lg:px-12 min-h-screen relative z-10 transition-all duration-300 ${isSidebarOpen ? 'md:ml-72' : 'ml-0'}`}>
                <div className="w-full max-w-[1600px] mx-auto">
                    {/* Hero Title Section */}
                    <section className="mb-12 relative">
                        <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary-container/10 rounded-full blur-[120px]"></div>
                        <h1 className="font-headline text-5xl md:text-6xl font-bold tracking-tighter text-[#fff9ef] mb-2 relative z-10">
                            Study <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container drop-shadow-[0_0_15px_rgba(255,181,158,0.4)]">Tracker</span>
                        </h1>
                        <div className="h-0.5 bg-gradient-to-r from-[#ff571a] to-transparent w-48 mb-4"></div>
                        <p className="text-on-surface-variant text-lg font-light tracking-wide max-w-xl">
                            Track your subjects, topics, and learning progress with clinical precision.
                        </p>
                    </section>

                    {/* Insight Section (Smart Feedback Panel) */}
                    <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        {/* Green: Improved */}
                        <div className="glass-panel p-6 rounded-xl flex items-start gap-4 border-l-4 border-emerald-500 shadow-[0_20px_40px_rgba(255,77,0,0.08)] bg-[#36233e]/60 backdrop-blur-xl">
                            <div className="p-3 rounded-full bg-emerald-500/20 text-emerald-400">
                                <span className="material-symbols-outlined">trending_up</span>
                            </div>
                            <div>
                                <h4 className="text-emerald-400 font-bold mb-1">Study Consistency Improved</h4>
                                <p className="text-on-surface-variant text-sm">You've hit your 4-hour target for 5 consecutive days.</p>
                            </div>
                        </div>

                        {/* Yellow: Revision */}
                        <div className="glass-panel p-6 rounded-xl flex items-start gap-4 border-l-4 border-secondary-container shadow-[0_20px_40px_rgba(255,77,0,0.08)] bg-[#36233e]/60 backdrop-blur-xl">
                            <div className="p-3 rounded-full bg-secondary-container/20 text-secondary-fixed">
                                <span className="material-symbols-outlined">book</span>
                            </div>
                            <div>
                                <h4 className="text-secondary-fixed font-bold mb-1">Some Topics Need Revision</h4>
                                <p className="text-on-surface-variant text-sm">3 topics in Neural Networks haven't been touched in 7 days.</p>
                            </div>
                        </div>

                        {/* Red: Weak Areas */}
                        <div className="glass-panel p-6 rounded-xl flex items-start gap-4 border-l-4 border-tertiary-container shadow-[0_20px_40px_rgba(255,77,0,0.08)] bg-[#36233e]/60 backdrop-blur-xl">
                            <div className="p-3 rounded-full bg-tertiary-container/20 text-tertiary">
                                <span className="material-symbols-outlined">warning</span>
                            </div>
                            <div>
                                <h4 className="text-tertiary font-bold mb-1">Weak Areas Detected</h4>
                                <p className="text-on-surface-variant text-sm">Numerical performance in Quantum Mechanics is below 40%.</p>
                            </div>
                        </div>
                    </section>

                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                        {/* Main Content Area: Data Table */}
                        <div className="xl:col-span-8 space-y-8">
                            <div className="glass-card rounded-3xl border border-outline-variant/10 shadow-2xl bg-[#36233e]/60 backdrop-blur-xl overflow-hidden">
                                <div className="p-6 bg-surface-container-high flex justify-between items-center border-b border-outline-variant/10">
                                    <h3 className="font-headline text-xl font-bold text-secondary">Active Learning Log</h3>
                                    <div className="flex gap-2">
                                        <span className="px-3 py-1 rounded-full bg-primary-container/20 text-primary text-[10px] font-bold uppercase tracking-widest">Live View</span>
                                    </div>
                                </div>

                                {/* Loading & Empty States */}
                                {loading ? (
                                    <div className="p-8 text-center bg-[#180720]/40">
                                        <span className="material-symbols-outlined animate-spin text-primary text-3xl mb-2">sync</span>
                                        <p className="text-on-surface-variant font-bold">Synchronizing with Phoenix Network...</p>
                                    </div>
                                ) : categories.length === 0 ? (
                                    <div className="p-8 text-center bg-[#180720]/40">
                                        <span className="material-symbols-outlined text-outline text-4xl mb-3">inbox</span>
                                        <p className="text-on-surface-variant font-bold mb-1">No Active Subjects Found</p>
                                        <p className="text-sm text-outline">Ignite a new subject below to start tracking your progress.</p>
                                    </div>
                                ) : (
                                    <div className="p-6 grid gap-6 bg-[#180720]/40 border-b border-outline-variant/10" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                                        {categories.map(cat => (
                                            <Link
                                                key={cat.id}
                                                to={`/study-tracker/${cat.id}`}
                                                className={`block p-5 rounded-[20px] cursor-pointer transition-all duration-300 border backdrop-blur-xl bg-gradient-to-br ${cat.colorFrom} ${cat.colorTo} ${cat.borderColor} border-opacity-20 hover:border-opacity-50 hover:bg-[#1d0c26]/60 hover:scale-[1.01]`}
                                            >
                                                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                                    <span className={`material-symbols-outlined ${cat.iconColor} text-lg`}>{cat.icon}</span>
                                                    {cat.title}
                                                </h3>
                                                <div className="flex justify-between text-[10px] uppercase font-bold tracking-wider mb-2 w-full">
                                                    <span className="text-on-surface-variant">Progress</span>
                                                    <span className={`${cat.iconColor}`}>{getCategoryProgress(cat.id)}% Complete</span>
                                                </div>
                                                <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden border border-white/5 relative">
                                                    <div className={`${cat.highlightColor} h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,255,255,0.1)]`} style={{ width: `${getCategoryProgress(cat.id)}%` }}></div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>

                                {/* 
                                <div className="p-4 bg-surface-container-low text-on-surface-variant text-[10px] uppercase tracking-widest font-bold">
                                    Recent Activity
                                </div>

                                <div className="overflow-x-auto no-scrollbar">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-surface-container text-on-surface-variant text-[11px] uppercase tracking-widest font-bold">
                                                <th className="px-6 py-4">Subject</th>
                                                <th className="px-6 py-4">Topic</th>
                                                <th className="px-6 py-4">Status</th>
                                                <th className="px-6 py-4 text-center">Num.</th>
                                                <th className="px-6 py-4 text-center">Rev.</th>
                                                <th className="px-6 py-4 text-right">Weak</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm">
                                            {studyLogs.map(log => (
                                                <tr key={log.id} className="border-b border-outline-variant/5 hover:bg-surface-bright/50 transition-colors">
                                                    <td className="px-6 py-5 font-semibold text-white">{log.subject}</td>
                                                    <td className="px-6 py-5 text-on-surface-variant">{log.topic}</td>
                                                    <td className="px-6 py-5">
                                                        {log.status === 'In Progress' && (
                                                            <span className="flex items-center gap-2 text-primary font-medium">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                                                                In Progress
                                                            </span>
                                                        )}
                                                        {log.status === 'Not Started' && (
                                                            <span className="flex items-center gap-2 text-tertiary font-medium">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                                                                Not Started
                                                            </span>
                                                        )}
                                                        {log.status === 'Completed' && (
                                                            <span className="flex items-center gap-2 text-emerald-400 font-medium">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                                                Completed
                                                            </span>
                                                        )}
                                                        {log.status === 'Revision Required' && (
                                                            <span className="flex items-center gap-2 text-secondary-fixed font-medium">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed"></span>
                                                                Revision Required
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-5 text-center text-white">{log.num}</td>
                                                    <td className="px-6 py-5 text-center font-mono text-primary">{log.rev < 10 ? `0${log.rev}` : log.rev}</td>
                                                    <td className="px-6 py-5 text-right">
                                                        <button
                                                            className={`material-symbols-outlined ${log.weak ? 'text-tertiary' : 'text-outline/30'}`}
                                                            style={log.weak ? { fontVariationSettings: "'FILL' 1" } : {}}
                                                        >
                                                            flag
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                */}

                            {/* Add Study Entry Form */}
                            <div className="glass-card p-6 md:p-8 rounded-3xl border border-outline-variant/10 shadow-[0_20px_40px_rgba(255,77,0,0.08)] bg-[#36233e]/60 backdrop-blur-xl">
                                <h3 className="font-headline text-2xl font-bold text-[#fff9ef] mb-6">Ignite New Subject</h3>
                                {error && (
                                    <div className="mb-6 p-4 rounded-xl bg-tertiary-container/20 border border-tertiary/30 text-tertiary font-bold flex items-center gap-3">
                                        <span className="material-symbols-outlined">error</span>
                                        {error}
                                    </div>
                                )}

                                <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={(e) => e.preventDefault()}>
                                    <div className="md:col-span-2 p-5 rounded-2xl bg-[#0B0014]/60 border border-primary/20 mb-2 shadow-inner">
                                        <div className="flex justify-between items-center mb-4">
                                            <label className="text-xs uppercase tracking-widest text-primary font-bold">Target Dashboard Title</label>
                                            {selectedCategory === 'ADD_NEW' && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedCategory(categories.length > 0 ? categories[0].id : '');
                                                        setNewCategoryTitle("");
                                                        setIsEditingTitle(false);
                                                    }}
                                                    className="text-[10px] text-on-surface-variant hover:text-white uppercase tracking-widest font-bold transition-colors flex items-center gap-1 bg-white/5 py-1 px-3 rounded-full hover:bg-white/10"
                                                >
                                                    <span className="material-symbols-outlined text-[14px]">close</span>
                                                    Cancel
                                                </button>
                                            )}
                                        </div>

                                        {selectedCategory !== 'ADD_NEW' ? (
                                            <div className="flex flex-col md:flex-row gap-4 items-stretch">
                                                <div className="relative flex-1">
                                                    <select 
                                                        className="w-full bg-[#180720]/80 border border-outline-variant/20 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-on-surface p-4 appearance-none cursor-pointer font-bold shadow-sm"
                                                        value={selectedCategory} 
                                                        onChange={e => setSelectedCategory(e.target.value)}
                                                    >
                                                        {categories.map(cat => (
                                                            <option key={cat.id} value={cat.id}>{cat.title}</option>
                                                        ))}
                                                    </select>
                                                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-primary/70">
                                                        expand_more
                                                    </span>
                                                </div>
                                                <button 
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedCategory('ADD_NEW');
                                                        setIsEditingTitle(true);
                                                    }}
                                                    className="px-6 py-4 rounded-xl bg-primary-container/10 border border-primary/30 text-primary hover:bg-primary/20 font-bold whitespace-nowrap transition-all shadow-[0_0_15px_rgba(255,87,26,0.1)] hover:shadow-[0_0_20px_rgba(255,87,26,0.2)] flex items-center justify-center gap-2 group"
                                                >
                                                    <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform">add_circle</span>
                                                    Create New Title...
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="w-full animate-in fade-in zoom-in-95 duration-200">
                                                {isEditingTitle ? (
                                                    <div className="relative">
                                                        <input 
                                                            autoFocus
                                                            className="w-full bg-[#180720]/90 border-2 border-primary shadow-[0_0_15px_rgba(255,87,26,0.2)] rounded-xl focus:ring-4 focus:ring-primary/20 text-white p-4 pr-12 transition-all outline-none font-bold text-lg placeholder:text-white/20 placeholder:font-normal" 
                                                            placeholder="Enter dashboard title (e.g. Placement Prep)..." 
                                                            type="text" 
                                                            value={newCategoryTitle} 
                                                            onChange={e => setNewCategoryTitle(e.target.value)}
                                                            onBlur={() => {
                                                                if (newCategoryTitle.trim()) setIsEditingTitle(false);
                                                            }}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault();
                                                                    if (newCategoryTitle.trim()) setIsEditingTitle(false);
                                                                }
                                                            }}
                                                        />
                                                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-primary font-bold">
                                                            keyboard_return
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div 
                                                        className="w-full bg-gradient-to-r from-[#180720] to-[#26142e] border border-primary/40 rounded-xl p-5 flex justify-between items-center cursor-pointer hover:border-primary transition-all group shadow-[0_0_15px_rgba(255,87,26,0.15)] hover:shadow-[0_0_25px_rgba(255,87,26,0.3)]"
                                                        onClick={() => setIsEditingTitle(true)}
                                                    >
                                                        <span className="font-bold text-[#fff9ef] text-lg flex items-center gap-3">
                                                            <span className="w-2.5 h-2.5 rounded-full bg-primary block shadow-[0_0_10px_rgba(255,181,158,1)] animate-pulse"></span>
                                                            {newCategoryTitle || "Untitled Dashboard Title"}
                                                        </span>
                                                        <div className="flex items-center gap-3 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
                                                            <span className="text-[10px] uppercase tracking-widest text-primary/90 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Click to Edit</span>
                                                            <span className="material-symbols-outlined text-primary/70 group-hover:text-primary transition-colors text-sm">edit</span>
                                                        </div>
                                                    </div>
                                                )}
                                                <p className="text-xs text-on-surface-variant/70 mt-3 flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-[14px]">info</span>
                                                    Press Enter or click outside to save the new dashboard title.
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-widest text-on-surface-variant font-bold">Subject</label>
                                        <input className="w-full bg-[#180720]/80 border border-outline-variant/20 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-on-surface p-4 transition-all" placeholder="e.g. Astrophysics" type="text" value={formSubject} onChange={e => setFormSubject(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-widest text-on-surface-variant font-bold">Topic Name</label>
                                        <input className="w-full bg-[#180720]/80 border border-outline-variant/20 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-on-surface p-4 transition-all" placeholder="e.g. Event Horizons" type="text" value={formTopic} onChange={e => setFormTopic(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-widest text-on-surface-variant font-bold">Current Status</label>
                                        <select className="w-full bg-[#180720]/80 border border-outline-variant/20 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-on-surface p-4 appearance-none cursor-pointer" value={formStatus} onChange={e => setFormStatus(e.target.value)}>
                                            <option>Not Started</option>
                                            <option>In Progress</option>
                                            <option>Completed</option>
                                            <option>Revision Required</option>
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs uppercase tracking-widest text-on-surface-variant font-bold">Numericals</label>
                                            <input className="w-full bg-[#180720]/80 border border-outline-variant/20 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-on-surface p-4 transition-all" type="number" value={formNum} onChange={e => setFormNum(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs uppercase tracking-widest text-on-surface-variant font-bold">Revision</label>
                                            <input className="w-full bg-[#180720]/80 border border-outline-variant/20 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-on-surface p-4 transition-all" type="number" value={formRev} onChange={e => setFormRev(e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 flex items-center gap-4 py-2">
                                        <input className="w-5 h-5 rounded bg-surface-container-highest border-outline-variant/40 text-primary focus:ring-primary focus:ring-offset-surface-dim cursor-pointer" id="weak-flag" type="checkbox" checked={formWeak} onChange={e => setFormWeak(e.target.checked)} />
                                        <label className="text-sm font-medium text-on-surface cursor-pointer" htmlFor="weak-flag">Mark as "Weak Area" for priority tracking</label>
                                    </div>
                                    <div className="md:col-span-2 pt-2">
                                        <button
                                            type="button"
                                            onClick={handleAddEntry}
                                            className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-primary-container text-background font-bold uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(255,87,26,0.3)] hover:scale-[1.01] active:scale-[0.98] transition-all"
                                        >
                                            Add Entry to Phoenix
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Analytics Section */}
                        <div className="xl:col-span-4 space-y-8">
                            {/* Topics Completed vs Pending (Visual) */}
                            <div className="glass-card p-6 md:p-8 rounded-3xl border border-outline-variant/10 shadow-[0_20px_40px_rgba(255,77,0,0.08)] bg-[#36233e]/60 backdrop-blur-xl">
                                <h4 className="font-headline text-lg font-bold text-secondary mb-6 flex items-center justify-between">
                                    Learning Spread
                                    <span className="material-symbols-outlined text-primary">donut_large</span>
                                </h4>
                                <div className="relative flex items-center justify-center py-8">
                                    {/* Simulated Donut Chart using Tailwind rings */}
                                    <div className="relative w-48 h-48 rounded-full border-[12px] border-surface-container-highest flex items-center justify-center shadow-inner">
                                        <div className="absolute inset-0 rounded-full border-[12px] border-t-primary border-r-primary-container border-b-primary-container/40 border-l-transparent rotate-45 shadow-[0_0_20px_rgba(255,87,26,0.3)] hover:scale-[1.02] transition-transform cursor-pointer"></div>
                                        <div className="text-center z-10">
                                            <span className="block text-4xl font-black font-headline text-[#fff9ef]">68%</span>
                                            <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Complete</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 space-y-4 pt-4 border-t border-white/5">
                                    <div className="flex justify-between items-center text-sm p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                                        <span className="flex items-center gap-3 text-on-surface-variant font-medium"><span className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_10px_rgba(255,181,158,0.5)]"></span> Completed</span>
                                        <span className="text-on-surface font-bold text-base">14 Topics</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                                        <span className="flex items-center gap-3 text-on-surface-variant font-medium"><span className="w-2.5 h-2.5 rounded-full bg-primary-container/40"></span> Pending</span>
                                        <span className="text-on-surface font-bold text-base">6 Topics</span>
                                    </div>
                                </div>
                            </div>

                            {/* Study Progress Over Time (Visual) */}
                            <div className="glass-card p-6 md:p-8 rounded-3xl border border-outline-variant/10 shadow-[0_20px_40px_rgba(255,77,0,0.08)] bg-[#36233e]/60 backdrop-blur-xl">
                                <h4 className="font-headline text-lg font-bold text-secondary mb-6 flex items-center justify-between">
                                    Momentum
                                    <span className="material-symbols-outlined text-primary">show_chart</span>
                                </h4>
                                <div className="h-40 flex items-end justify-between gap-2 mt-8 mb-2">
                                    {/* Bar chart mockup */}
                                    <div className="w-full bg-primary-container/10 rounded-t-sm h-[40%] hover:bg-primary/50 transition-all cursor-pointer relative group">
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-container-highest px-2 py-1 rounded text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">3.2hr</div>
                                    </div>
                                    <div className="w-full bg-primary-container/10 rounded-t-sm h-[65%] hover:bg-primary/50 transition-all cursor-pointer relative group">
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-container-highest px-2 py-1 rounded text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">5.4hr</div>
                                    </div>
                                    <div className="w-full bg-primary-container/10 rounded-t-sm h-[55%] hover:bg-primary/50 transition-all cursor-pointer relative group">
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-container-highest px-2 py-1 rounded text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">4.4hr</div>
                                    </div>
                                    <div className="w-full bg-primary-container/10 rounded-t-sm h-[90%] hover:bg-primary/50 transition-all cursor-pointer relative group">
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-container-highest px-2 py-1 rounded text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">8.0hr</div>
                                    </div>
                                    <div className="w-full bg-primary-container/10 rounded-t-sm h-[75%] hover:bg-primary/50 transition-all cursor-pointer relative group">
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-container-highest px-2 py-1 rounded text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">6.2hr</div>
                                    </div>
                                    <div className="w-full bg-primary rounded-t-sm h-[85%] relative group shadow-[0_0_15px_rgba(255,181,158,0.5)] cursor-pointer">
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-primary text-background px-2 py-1 rounded text-[10px] font-bold opacity-100 transition-opacity whitespace-nowrap">7.5hr</div>
                                    </div>
                                    <div className="w-full bg-primary-container/10 rounded-t-sm h-[60%] hover:bg-primary/50 transition-all cursor-pointer relative group">
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-container-highest px-2 py-1 rounded text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">5.0hr</div>
                                    </div>
                                </div>
                                <div className="flex justify-between border-t border-outline-variant/10 pt-3 text-[10px] uppercase font-bold text-on-surface-variant tracking-widest">
                                    <span>Mon</span>
                                    <span>Tue</span>
                                    <span>Wed</span>
                                    <span>Thu</span>
                                    <span>Fri</span>
                                    <span className="text-primary border-b border-primary pb-1 -mb-1">Sat</span>
                                    <span>Sun</span>
                                </div>
                                <div className="mt-8 bg-surface-container-low p-4 rounded-xl border border-white/5">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs text-on-surface-variant font-medium">Daily Average</span>
                                        <span className="text-sm font-bold text-secondary">5.2 Hours</span>
                                    </div>
                                    <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-primary to-primary-container w-[75%] rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Decorative Background Elements */}
                <div className="fixed top-[20%] left-[-10%] w-[40%] h-[40%] bg-primary-container/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>
                <div className="fixed bottom-[-10%] right-[-5%] w-[30%] h-[30%] bg-tertiary-container/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>
            </main>
        </div>
    );
};

export default StudyTracker;
