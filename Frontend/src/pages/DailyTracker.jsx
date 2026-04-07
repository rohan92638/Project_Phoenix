import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const DailyTracker = () => {
        const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [newTaskText, setNewTaskText] = useState('');
    const [tasks, setTasks] = useState([
        { id: 1, text: "Wake up 05:00 AM", status: "DONE" },
        { id: 2, text: "Cold Shower", status: "PARTIAL" },
        { id: 3, text: "2h Deep Work (Study)", status: "MISSED" }
    ]);
    const [activeMenuId, setActiveMenuId] = useState(null);

    const updateTaskStatus = (id, newStatus) => {
        setTasks(tasks.map(task => task.id === id ? { ...task, status: newStatus } : task));
    };

    const toggleTaskStatus = (id) => {
        setTasks(tasks.map(task => {
            if (task.id === id) {
                const nextStatus = task.status === 'PENDING' ? 'DONE' 
                                 : task.status === 'DONE' ? 'PARTIAL' 
                                 : task.status === 'PARTIAL' ? 'MISSED' 
                                 : 'PENDING';
                return { ...task, status: nextStatus };
            }
            return task;
        }));
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
                            <img alt="User avatar" className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-primary/20 object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJX57hND0c23Vl9y9cQ-b8y7jvLmQ3EuvRdMxc0MlHAROaZlmIQKhsKb6qA0PkXrL7hzV4B7B-qbMSFe7fvO7Zbtw-ZbFzfqpvYHrp_qVB1et2M9otwJ_b1teBRyQnc76VmkPo061BEXfioiJkV9mFOPsPI5WZ14PFGgxB3NiAE0tq3CrjCBPTBvn8FSfJPC10cyOj1H92-_nCk-EhmB4xI1F65neVrMNF-VaF1OZuZyEAgepJdftLUAeZ4TtS4mjBOGNCrC1r"/>
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-r from-[#ffb59e]/20 to-transparent h-[1px] w-full absolute bottom-0 left-0"></div>
            </header>

            {/* Side Navigation */}
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
                            <p className="text-[#ffb59e] font-black text-xs uppercase tracking-widest">Discipline Score</p>
                            <p className="text-secondary font-bold text-lg">850 <span className="text-[10px] font-normal opacity-50 ml-1">V2.0.4</span></p>
                        </div>
                    </div>
                    <span 
                        className="material-symbols-outlined text-slate-400 cursor-pointer md:hidden ml-4"
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        close
                    </span>
                </div>
                <nav className="flex-1 space-y-1 overflow-y-auto">
                    <Link className="flex items-center gap-4 text-[#ffb59e]/50 py-3 px-6 hover:bg-[#412d49]/50 hover:text-[#ffb59e] transition-all duration-500 font-body text-sm font-medium" to="/dashboard">
                        <span className="material-symbols-outlined">dashboard</span> Dashboard
                    </Link>
                    <Link className="flex items-center gap-4 text-[#fff9ef] bg-gradient-to-r from-[#ff571a]/20 to-transparent border-r-4 border-[#ff571a] py-3 px-6 transition-all duration-500 font-body text-sm font-medium" to="/daily-tracker">
                        <span className="material-symbols-outlined">event_repeat</span> Daily Tracker
                    </Link>
                    <Link className="flex items-center gap-4 text-[#ffb59e]/50 py-3 px-6 hover:bg-[#412d49]/50 hover:text-[#ffb59e] transition-all duration-500 font-body text-sm font-medium" to="/study-tracker">
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
                    <div className="pt-8">
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
                        <Link className="flex items-center gap-4 text-tertiary/60 py-3 px-6 hover:bg-[#412d49]/50 hover:text-tertiary transition-all duration-500 font-body text-sm font-medium" to="/login">
                            <span className="material-symbols-outlined">logout</span> Logout
                        </Link>
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <main className={`pt-28 pb-20 md:pb-12 px-6 lg:px-12 min-h-screen relative z-10 transition-all duration-300 ${isSidebarOpen ? 'md:ml-72' : 'ml-0'}`}>
                <div className="w-full max-w-[1600px] mx-auto">
                    {/* Header Section */}
                <section className="mb-12">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-headline font-bold text-on-surface tracking-tighter mb-2">Daily Tracker</h1>
                    <div className="h-0.5 bg-gradient-to-r from-[#ff571a] to-transparent w-48 mb-4"></div>
                    <p className="text-on-surface-variant font-body text-base md:text-lg opacity-80">Track your discipline and growth</p>
                </section>

                {/* Insight Panel */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="glass-card p-6 rounded-2xl border-t border-primary/20 flex flex-col sm:flex-row items-start gap-4 shadow-lg group hover:bg-surface-container-highest transition-colors duration-300">
                        <div className="p-3 bg-primary/10 rounded-xl text-primary shadow-[0_0_15px_rgba(255,181,158,0.2)] shrink-0">
                            <span className="material-symbols-outlined">trending_up</span>
                        </div>
                        <div>
                            <h3 className="text-primary font-bold text-xs sm:text-sm uppercase tracking-widest mb-1">Improvement Detected</h3>
                            <p className="text-on-surface text-sm leading-relaxed">Daily focus up by 15% this week. Keep ascending.</p>
                        </div>
                    </div>
                    <div className="glass-card p-6 rounded-2xl border-t border-secondary-container/20 flex flex-col sm:flex-row items-start gap-4 shadow-lg group hover:bg-surface-container-highest transition-colors duration-300">
                        <div className="p-3 bg-secondary-container/10 rounded-xl text-secondary-container shadow-[0_0_15px_rgba(255,219,60,0.1)] shrink-0">
                            <span className="material-symbols-outlined">warning</span>
                        </div>
                        <div>
                            <h3 className="text-secondary-container font-bold text-xs sm:text-sm uppercase tracking-widest mb-1">Needs Attention</h3>
                            <p className="text-on-surface text-sm leading-relaxed">Study session was interrupted twice. Optimize environment.</p>
                        </div>
                    </div>
                    <div className="glass-card p-6 rounded-2xl border-t border-tertiary/20 flex flex-col sm:flex-row items-start gap-4 shadow-lg group hover:bg-surface-container-highest transition-colors duration-300">
                        <div className="p-3 bg-tertiary/10 rounded-xl text-tertiary shadow-[0_0_15px_rgba(255,180,168,0.1)] shrink-0">
                            <span className="material-symbols-outlined">priority_high</span>
                        </div>
                        <div>
                            <h3 className="text-tertiary font-bold text-xs sm:text-sm uppercase tracking-widest mb-1">Critical Alert</h3>
                            <p className="text-on-surface text-sm leading-relaxed">Finance discipline threshold breached. Review expenses.</p>
                        </div>
                    </div>
                </section>

                {/* Content Layout: Single Column */}
                <div className="space-y-8 w-full">
                    {/* Daily Discipline Rituals */}
                    <div className="glass-card rounded-3xl border border-outline-variant/10 shadow-2xl">
                        <div className="bg-surface-container-high px-4 md:px-8 py-6 flex justify-between items-center border-b border-outline-variant/10 rounded-t-3xl">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary">fact_check</span>
                                <h2 className="font-headline font-bold text-lg md:text-xl">Daily Discipline Rituals</h2>
                            </div>
                            <button 
                                className="bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap"
                                onClick={() => setIsAddingTask(true)}
                            >
                                Add Task
                            </button>
                        </div>
                        <div className="p-2 md:p-4">
                            {/* Interactive Input Layer */}
                            {isAddingTask && (
                                <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-surface-container-low rounded-2xl mb-4 border border-primary/30 shadow-[0_0_20px_rgba(255,77,0,0.1)] gap-4 animate-in slide-in-from-top-2">
                                    <div className="flex items-center gap-4 w-full">
                                        <div className="w-6 h-6 shrink-0 border-2 border-outline-variant rounded flex items-center justify-center bg-transparent"></div>
                                        <input 
                                            type="text" 
                                            value={newTaskText}
                                            onChange={(e) => setNewTaskText(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && newTaskText.trim() !== '') {
                                                    setTasks([{ id: Date.now(), text: newTaskText, status: "PENDING" }, ...tasks]);
                                                    setNewTaskText('');
                                                    setIsAddingTask(false);
                                                } else if (e.key === 'Escape') {
                                                    setIsAddingTask(false);
                                                    setNewTaskText('');
                                                }
                                            }}
                                            placeholder="What is your next discipline?" 
                                            className="bg-transparent border-none outline-none text-on-surface font-medium text-sm md:text-base w-full placeholder:text-on-surface-variant/50 focus:ring-0 p-0"
                                            autoFocus
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
                                        <button 
                                            className="text-xs font-bold text-primary px-4 py-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors tracking-widest"
                                            onClick={() => {
                                                if (newTaskText.trim() !== '') {
                                                    setTasks([{ id: Date.now(), text: newTaskText, status: "PENDING" }, ...tasks]);
                                                }
                                                setNewTaskText('');
                                                setIsAddingTask(false);
                                            }}
                                        >
                                            SAVE
                                        </button>
                                        <button 
                                            className="material-symbols-outlined text-on-surface-variant hover:text-error transition-colors p-1"
                                            onClick={() => {
                                                setIsAddingTask(false);
                                                setNewTaskText('');
                                            }}
                                        >
                                            close
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Task Items Map */}
                            {tasks.map(task => (
                                <div key={task.id} className="flex items-center justify-between p-4 hover:bg-surface-container-low rounded-2xl transition-colors group">
                                    <div className="flex items-center gap-4">
                                        {task.status === "DONE" && (
                                            <div 
                                                className="w-6 h-6 shrink-0 border-2 border-primary rounded flex items-center justify-center text-primary bg-primary/5 cursor-pointer hover:bg-primary/20 transition-colors"
                                                onClick={() => toggleTaskStatus(task.id)}
                                            >
                                                <span className="material-symbols-outlined text-sm font-bold">check</span>
                                            </div>
                                        )}
                                        {(task.status === "PARTIAL" || task.status === "PENDING") && (
                                            <div 
                                                className={`w-6 h-6 shrink-0 border-2 ${task.status === 'PARTIAL' ? 'border-outline text-outline bg-surface-container-highest hover:bg-outline/20' : 'border-outline-variant text-transparent bg-transparent hover:bg-surface-container-high'} rounded flex items-center justify-center cursor-pointer transition-colors`}
                                                onClick={() => toggleTaskStatus(task.id)}
                                            >
                                                {task.status === 'PARTIAL' ? <span className="material-symbols-outlined text-sm font-bold">remove</span> : null}
                                            </div>
                                        )}
                                        {task.status === "MISSED" && (
                                            <div 
                                                className="w-6 h-6 shrink-0 border-2 border-tertiary rounded flex items-center justify-center text-tertiary bg-tertiary/5 cursor-pointer hover:bg-tertiary/20 transition-colors"
                                                onClick={() => toggleTaskStatus(task.id)}
                                            >
                                                <span className="material-symbols-outlined text-sm font-bold">close</span>
                                            </div>
                                        )}
                                        <span className={`${task.status === 'MISSED' ? 'text-tertiary/70 line-through' : task.status === 'PARTIAL' ? 'text-on-surface/60' : 'text-on-surface'} font-medium text-sm md:text-base`}>
                                            {task.text}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {task.status === "DONE" && <span className="text-[10px] font-bold text-primary px-2 py-0.5 rounded bg-primary/10 hidden sm:block">DONE</span>}
                                        {task.status === "PARTIAL" && <span className="text-[10px] font-bold text-outline px-2 py-0.5 rounded bg-surface-container-highest hidden sm:block">PARTIAL</span>}
                                        {task.status === "MISSED" && <span className="text-[10px] font-bold text-tertiary px-2 py-0.5 rounded bg-tertiary/10 hidden sm:block">MISSED</span>}
                                        {task.status === "PENDING" && <span className="text-[10px] font-bold text-secondary px-2 py-0.5 rounded bg-secondary/10 hidden sm:block">PENDING</span>}
                                        
                                        <div className="relative">
                                            <span 
                                                className="material-symbols-outlined text-on-surface/20 hover:text-on-surface/80 group-hover:text-on-surface/60 cursor-pointer p-1"
                                                onClick={() => setActiveMenuId(activeMenuId === task.id ? null : task.id)}
                                            >
                                                more_vert
                                            </span>
                                            {activeMenuId === task.id && (
                                                <div className="absolute right-0 top-full mt-2 w-48 bg-surface-container-highest rounded-xl border border-white/5 shadow-2xl overflow-hidden z-20">
                                                    <div className="flex flex-col py-1">
                                                        <button 
                                                            className="px-4 py-3 text-sm text-center md:text-left hover:bg-white/5 text-primary flex items-center justify-center md:justify-start gap-3 transition-colors w-full"
                                                            onClick={() => { updateTaskStatus(task.id, 'DONE'); setActiveMenuId(null); }}
                                                        >
                                                            <span className="material-symbols-outlined text-[18px]">check</span> Mark Done
                                                        </button>
                                                        <button 
                                                            className="px-4 py-3 text-sm text-center md:text-left hover:bg-white/5 text-outline flex items-center justify-center md:justify-start gap-3 transition-colors w-full"
                                                            onClick={() => { updateTaskStatus(task.id, 'PARTIAL'); setActiveMenuId(null); }}
                                                        >
                                                            <span className="material-symbols-outlined text-[18px]">remove</span> Mark Partial
                                                        </button>
                                                        <button 
                                                            className="px-4 py-3 text-sm text-center md:text-left hover:bg-white/5 text-tertiary flex items-center justify-center md:justify-start gap-3 transition-colors w-full"
                                                            onClick={() => { updateTaskStatus(task.id, 'MISSED'); setActiveMenuId(null); }}
                                                        >
                                                            <span className="material-symbols-outlined text-[18px]">close</span> Mark Missed
                                                        </button>
                                                        <div className="h-px w-full bg-white/5 my-1"></div>
                                                        <button 
                                                            className="px-4 py-3 text-sm text-center md:text-left hover:bg-error/10 text-error flex items-center justify-center md:justify-start gap-3 transition-colors w-full"
                                                            onClick={() => { setTasks(tasks.filter(t => t.id !== task.id)); setActiveMenuId(null); }}
                                                        >
                                                            <span className="material-symbols-outlined text-[18px]">delete</span> Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* AI Summary Section */}
                    <div className="relative overflow-hidden group rounded-3xl">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary-container/10 to-tertiary/20 animate-pulse opacity-30 blur-2xl"></div>
                        <div className="relative glass-card p-6 md:p-8 rounded-3xl border border-primary/30 shadow-[0_20px_40px_rgba(255,77,0,0.08)]">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="material-symbols-outlined text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                                <h2 className="font-headline font-bold text-lg md:text-xl tracking-tight bg-gradient-to-r from-[#ffb59e] to-[#ff571a] bg-clip-text text-transparent">Phoenix Intelligence Insight</h2>
                            </div>
                            <p className="text-on-surface text-base md:text-lg leading-relaxed font-light italic">
                                "Analysis: You showed <span className="text-primary font-medium">exceptional focus</span> in your morning block, but consistency in the evening journal remains a growth area. Your discipline curve suggests peak performance between 06:00 and 09:00."
                            </p>
                        </div>
                    </div>

                    {/* Focused Time & Distraction Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="glass-card p-6 rounded-3xl border border-outline-variant/10 text-center">
                            <p className="text-on-surface-variant text-xs font-bold uppercase tracking-widest mb-2">Focused Time</p>
                            <p className="text-3xl lg:text-4xl font-headline font-bold text-primary tracking-tighter">4h 12m</p>
                            <div className="w-full h-1.5 bg-surface-container-high rounded-full mt-4 overflow-hidden">
                                <div className="w-[85%] h-full bg-primary"></div>
                            </div>
                        </div>
                        <div className="glass-card p-6 rounded-3xl border border-outline-variant/10 text-center">
                            <p className="text-on-surface-variant text-xs font-bold uppercase tracking-widest mb-2">Distraction</p>
                            <p className="text-3xl lg:text-4xl font-headline font-bold text-secondary tracking-tighter">32m</p>
                            <div className="w-full h-1.5 bg-surface-container-high rounded-full mt-4 overflow-hidden">
                                <div className="w-[15%] h-full bg-secondary"></div>
                            </div>
                        </div>
                    </div>

                    {/* Weekly Growth Analytics */}
                    <div className="glass-card p-6 md:p-8 rounded-3xl border border-outline-variant/10 shadow-2xl">
                        <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center mb-8 gap-2">
                            <h2 className="font-headline font-bold text-lg">Weekly Growth</h2>
                            <span className="text-xs text-primary font-bold">+12.4% vs Last Week</span>
                        </div>
                        <div className="flex items-end justify-between h-40 gap-1 sm:gap-3">
                            <div className="w-full bg-surface-container-highest rounded-t-lg relative group h-[40%]">
                                <div className="absolute bottom-0 w-full bg-gradient-to-t from-primary-container to-primary rounded-t-lg h-full opacity-60 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                            <div className="w-full bg-surface-container-highest rounded-t-lg relative group h-[65%]">
                                <div className="absolute bottom-0 w-full bg-gradient-to-t from-primary-container to-primary rounded-t-lg h-full opacity-60 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                            <div className="w-full bg-surface-container-highest rounded-t-lg relative group h-[55%]">
                                <div className="absolute bottom-0 w-full bg-gradient-to-t from-primary-container to-primary rounded-t-lg h-full opacity-60 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                            <div className="w-full bg-surface-container-highest rounded-t-lg relative group h-[85%]">
                                <div className="absolute bottom-0 w-full bg-gradient-to-t from-primary-container to-primary rounded-t-lg h-full opacity-60 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                            <div className="w-full bg-surface-container-highest rounded-t-lg relative group h-[70%]">
                                <div className="absolute bottom-0 w-full bg-gradient-to-t from-primary-container to-primary rounded-t-lg h-full opacity-60 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                            <div className="w-full bg-surface-container-highest rounded-t-lg relative group h-[95%]">
                                <div className="absolute bottom-0 w-full bg-gradient-to-t from-primary-container to-primary rounded-t-lg h-full opacity-80 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                            <div className="w-full bg-surface-container-highest rounded-t-lg relative group h-[20%]">
                                <div className="absolute bottom-0 w-full bg-tertiary rounded-t-lg h-full opacity-60 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                        </div>
                        <div className="flex justify-between mt-4 text-[9px] sm:text-[10px] font-bold text-on-surface-variant tracking-widest px-1">
                            <span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span>
                        </div>
                    </div>

                    {/* Notes Section */}
                    <div className="glass-card p-6 md:p-8 rounded-3xl border border-outline-variant/10 shadow-2xl flex flex-col min-h-[320px]">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="material-symbols-outlined text-secondary">notes</span>
                            <h2 className="font-headline font-bold text-lg md:text-xl">Daily Reflection</h2>
                        </div>
                        <textarea 
                            className="flex-1 bg-surface-container-low border-none rounded-2xl p-4 md:p-6 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-1 focus:ring-primary/40 resize-none font-body leading-relaxed text-sm mb-6 outline-none" 
                            placeholder="What lessons did today bring? Any deviations from the path?"
                        ></textarea>
                        <button className="w-full bg-gradient-to-r from-primary to-primary-container text-on-primary-container font-headline font-bold py-4 rounded-full shadow-lg hover:shadow-[0_0_20px_rgba(255,87,26,0.2)] transition-all active:scale-95 uppercase tracking-widest text-sm">
                            Save Note
                        </button>
                    </div>
                </div>

                </div>

                {/* Decorative Background Elements */}
                <div className="fixed top-[20%] left-[-10%] w-[40%] h-[40%] bg-primary-container/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>
                <div className="fixed bottom-[-10%] right-[-5%] w-[30%] h-[30%] bg-tertiary-container/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>
            </main>

            {/* Bottom Navigation for Mobile */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#1d0c26]/90 backdrop-blur-xl border-t border-outline-variant/10 flex justify-around items-center px-4 z-[70]">
                <Link to="/dashboard" className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">dashboard</Link>
                <Link to="/daily-tracker" className="material-symbols-outlined text-primary">event_repeat</Link>
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center -mt-8 shadow-lg shadow-primary/20 border-4 border-[#0B0014] cursor-pointer active:scale-95 transition-transform">
                    <span className="material-symbols-outlined text-on-primary">add</span>
                </div>
                <Link to="/analysis" className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">analytics</Link>
                <Link to="#" className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">person</Link>
            </nav>
        </div>
    );
};

export default DailyTracker;
