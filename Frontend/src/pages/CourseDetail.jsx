import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

const DUMMY_CATEGORIES = [
    { id: 'gate', title: 'Gate Exam Preparation', icon: 'school', colorFrom: 'from-purple-900/10', colorTo: 'to-[#1d0c26]/60', borderColor: 'border-purple-500', iconColor: 'text-[#ffb59e]', highlightColor: 'bg-[#a855f7]' },
    { id: 'college', title: 'College Course Completion', icon: 'account_balance', colorFrom: 'from-blue-900/10', colorTo: 'to-[#1d0c26]/60', borderColor: 'border-blue-500', iconColor: 'text-[#ffb59e]', highlightColor: 'bg-cyan-400' }
];

const CourseDetail = () => {
    const { courseId } = useParams(); 
    
    const [categories] = useState(() => {
        const saved = localStorage.getItem('phoenix_study_categories');
        return saved ? JSON.parse(saved) : DUMMY_CATEGORIES;
    });

    const [studyLogs, setStudyLogs] = useState(() => {
        const saved = localStorage.getItem('phoenix_study_logs');
        return saved ? JSON.parse(saved) : {};
    });

    useEffect(() => {
        localStorage.setItem('phoenix_study_logs', JSON.stringify(studyLogs));
    }, [studyLogs]);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const currentData = studyLogs[courseId] || [];
    const currentCategory = categories.find(c => c.id === courseId) || { title: 'Unknown Course' };

    const handleProgressChange = (id, newProgress) => {
        let val = newProgress === '' ? '' : parseInt(newProgress, 10);
        if (val !== '' && isNaN(val)) val = 0;
        if (val !== '') val = Math.max(0, Math.min(100, val));

        setStudyLogs(prev => {
            if (!prev[courseId]) return prev;
            return {
                ...prev,
                [courseId]: prev[courseId].map(item => 
                    item.id === id ? { ...item, progress: val } : item
                )
            };
        });
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'Completed': return "text-emerald-400";
            case 'In Progress': return "text-orange-400";
            case 'Not Started': return "text-red-500";
            default: return "text-gray-400";
        }
    };

    return (
        <div className="bg-[#0B0014] text-gray-200 font-body min-h-screen overflow-x-hidden selection:bg-purple-900 selection:text-white">
            {/* Top Navigation */}
            <header className="fixed top-0 w-full z-50 bg-[#1d0c26]/60 backdrop-blur-xl flex justify-between items-center px-4 md:px-8 h-20 shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
                <div className="flex items-center gap-4 md:gap-6">
                    <span
                        className="material-symbols-outlined text-purple-400 hover:text-white transition-colors cursor-pointer"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                        menu
                    </span>
                    <Link to="/" className="text-lg md:text-xl font-bold uppercase tracking-widest text-purple-300 font-headline">PROJECT PHOENIX</Link>
                    <div className="hidden md:flex h-6 w-px bg-white/10"></div>
                    <span className="hidden md:block text-gray-300 font-headline text-sm tracking-widest opacity-80">Phoenix v1.0</span>
                </div>
                <div className="flex items-center gap-4 md:gap-8">
                    <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
                        <span className="material-symbols-outlined text-gray-400 text-sm">workspace_premium</span>
                        <span className="text-gray-200 font-headline font-bold text-sm tracking-tighter">Discipline Score: 850</span>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent"></div>
            </header>

            {/* Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <aside className={`fixed left-0 h-full w-72 z-40 bg-[#0B0014]/95 backdrop-blur-2xl border-r border-white/5 flex flex-col pt-24 pb-8 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Simplified Sidebar for Detail View */}
                <div className="px-6 mb-8 flex justify-between items-center">
                    <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10 w-full">
                        <div className="w-2 h-10 bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
                        <div>
                            <p className="text-gray-200 font-bold text-sm">Alex Mercer</p>
                            <p className="text-purple-400 text-[10px] font-bold uppercase tracking-wider">Level 12 Initiated</p>
                        </div>
                    </div>
                    <span
                        className="material-symbols-outlined text-slate-400 cursor-pointer md:hidden mx-2"
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        close
                    </span>
                </div>
                <nav className="flex flex-col flex-1 overflow-y-auto w-full no-scrollbar">
                    <div className="mb-4 px-6 text-[10px] uppercase tracking-widest text-gray-500 font-bold">Main Console</div>
                    <Link className="flex items-center gap-4 text-gray-400 py-3 px-6 hover:bg-white/5 hover:text-white transition-all duration-300 font-body text-sm font-medium" to="/dashboard">
                        <span className="material-symbols-outlined">dashboard</span> Dashboard
                    </Link>
                    <Link className="flex items-center gap-4 text-white bg-gradient-to-r from-purple-600/20 to-transparent border-r-4 border-purple-500 py-3 px-6 font-body text-sm font-medium shadow-[0_0_15px_rgba(168,85,247,0.1)]" to="/study-tracker">
                        <span className="material-symbols-outlined text-purple-400">arrow_back</span> Back to Study Tracker
                    </Link>
                    <Link className="flex items-center gap-4 text-gray-400 py-3 px-6 hover:bg-white/5 hover:text-white transition-all duration-300 font-body text-sm font-medium" to="/daily-tracker">
                        <span className="material-symbols-outlined">calendar_today</span> Daily Tracker
                    </Link>
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className={`pt-28 pb-20 md:pb-12 px-6 lg:px-12 min-h-screen relative z-10 transition-all duration-300 ${isSidebarOpen ? 'md:ml-72' : 'ml-0'}`}>
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-1/2 h-[500px] bg-gradient-radial from-purple-900/20 via-[#0B0014] to-[#0B0014] blur-[100px] pointer-events-none -z-10"></div>
                
                <div className="w-full max-w-6xl mx-auto">
                    <div className="flex items-center gap-4 mb-8">
                        <Link to="/study-tracker" className="material-symbols-outlined text-gray-400 hover:text-white transition-colors bg-white/5 p-2 rounded-full border border-white/10 hover:bg-white/10">
                            arrow_back
                        </Link>
                        <div>
                            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-2">
                                {currentCategory.title}
                            </h1>
                            <p className="text-gray-400 text-sm md:text-base">Detailed topic-level overview for your module.</p>
                        </div>
                    </div>

                    {/* Dynamic Table View */}
                    <div className="glass-card rounded-[24px] border border-white/5 shadow-2xl bg-[#1d0c26]/40 backdrop-blur-3xl overflow-hidden transition-all duration-500">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
                            <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-3">
                                <><span className="w-1.5 h-6 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"></span> Detailed Learning Log</>
                            </h3>
                        </div>
                        <div className="overflow-x-auto no-scrollbar">
                            <table className="w-full text-left border-collapse min-w-[700px]">
                                <thead>
                                    <tr className="bg-black/30 text-gray-400 text-[11px] uppercase tracking-widest font-bold">
                                        <th className="px-8 py-5">Subject</th>
                                        <th className="px-6 py-5">Topic</th>
                                        <th className="px-6 py-5">Status</th>
                                        <th className="px-6 py-5 text-center">Num</th>
                                        <th className="px-6 py-5 text-center">Rev</th>
                                        <th className="px-6 py-5 text-center">Progress %</th>
                                        <th className="px-8 py-5 text-center text-red-300">Weak</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {currentData.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center text-gray-500 font-medium">
                                                No topics found for this course. Head back to the dashboard to ignite a new subject!
                                            </td>
                                        </tr>
                                    ) : currentData.map((row, idx) => (
                                        <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                            <td className="px-8 py-6 font-semibold text-gray-100 group-hover:text-white transition-colors">{row.subject}</td>
                                            <td className="px-6 py-6 text-gray-400 group-hover:text-gray-300 transition-colors">{row.topic}</td>
                                            <td className="px-6 py-6">
                                                <span className={`inline-flex items-center gap-2 font-bold text-xs uppercase tracking-wider px-3 py-1 rounded-full bg-black/40 border border-white/5 ${getStatusStyles(row.status)}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                                        row.status === 'Completed' ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' :
                                                        row.status === 'In Progress' ? 'bg-orange-400 animate-pulse shadow-[0_0_8px_#fb923c]' :
                                                        'bg-red-500 shadow-[0_0_8px_#ef4444]'
                                                    }`}></span>
                                                    {row.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-6 text-center text-gray-300 font-mono text-base">{row.num}</td>
                                            <td className="px-6 py-6 text-center text-gray-300 font-mono text-base">
                                                {row.rev < 10 ? `0${row.rev}` : row.rev}
                                            </td>
                                            <td className="px-6 py-6 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <input 
                                                        type="number" 
                                                        min="0" max="100" 
                                                        value={row.progress !== undefined ? row.progress : 0}
                                                        onChange={(e) => handleProgressChange(row.id, e.target.value)}
                                                        className="w-16 bg-black/40 border border-white/10 rounded-md py-1.5 px-1 text-center text-gray-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 font-mono text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all"
                                                        placeholder="0"
                                                    />
                                                    <span className="text-gray-500 text-xs font-bold">%</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <button className={`material-symbols-outlined text-xl transition-all ${row.weak ? 'text-red-400 drop-shadow-[0_0_6px_rgba(248,113,113,0.6)] hover:scale-110' : 'text-gray-600 hover:text-gray-400'}`} style={row.weak ? { fontVariationSettings: "'FILL' 1" } : {}}>
                                                    flag
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CourseDetail;
