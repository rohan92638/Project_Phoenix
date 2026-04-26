import React, { useState, useContext, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FinanceContext } from '../context/FinanceContext';
import { predictTransactionCategory } from '../services/api';
import VoiceButton from '../components/voiceButton';
import SpendingPersona from '../components/spendingPersona';

const CATEGORY_COLORS = {
    // Expenses
    'Food & Dining': { bg: 'bg-primary/10', text: 'text-primary' },
    'Rent': { bg: 'bg-secondary/10', text: 'text-secondary-fixed' },
    'Entertainment': { bg: 'bg-tertiary/10', text: 'text-tertiary' },
    'Transportation': { bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
    'Shopping': { bg: 'bg-purple-500/10', text: 'text-purple-300' },
    'Utilities': { bg: 'bg-blue-500/10', text: 'text-blue-300' },

    // Income
    'Salary': { bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
    'Client': { bg: 'bg-blue-500/10', text: 'text-blue-400' },
    'Bonus': { bg: 'bg-tertiary/10', text: 'text-tertiary' },
    'Trading': { bg: 'bg-purple-500/10', text: 'text-purple-400' },

    'Other': { bg: 'bg-outline/20', text: 'text-on-surface-variant' },
};

const EXPENSE_CATEGORIES = ['Food & Dining', 'Rent', 'Entertainment', 'Transportation', 'Shopping', 'Utilities', 'Other'];
const INCOME_CATEGORIES = ['Salary', 'Client', 'Bonus', 'Trading', 'Other'];

const TYPE_ICON = { Card: 'credit_card', UPI: 'account_balance', Cash: 'payments' };

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Bar chart colors per category (up to 6 shown)
const CAT_COLORS = [
    'bg-primary', 'bg-secondary-container', 'bg-tertiary',
    'bg-emerald-500', 'bg-purple-500', 'bg-blue-400'
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};
const fmtAmt = (n) => `₹${Number(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
const fmtShort = (n) => n >= 1000 ? `₹${(n / 1000).toFixed(1)}k` : `₹${Math.round(n)}`;

// ─── Component ────────────────────────────────────────────────────────────────
const FinanceTracker = () => {
    const {
        expenses, addExpense, deleteExpense,
        incomes, addIncome, deleteIncome,
        savingsEntries, addSavings, deleteSavings,
        totalExpenses, totalIncome, savings, savingRatio,
        insightMsg, anomalyAlert, budgetAlert, mutationError
    } = useContext(FinanceContext);

    // ── Dynamic username from localStorage (set at login) ──
    const username = useMemo(() => {
        try {
            const u = JSON.parse(localStorage.getItem('user'));
            return u?.username || u?.first_name || u?.email?.split('@')[0] || 'User';
        } catch { return 'User'; }
    }, []);

    // ── Compute last-7-days spending bars from real expense data ──
    const weeklyBars = useMemo(() => {
        const today = new Date();
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(today);
            d.setDate(today.getDate() - (6 - i));
            const dateStr = d.toISOString().split('T')[0];
            const dayTotal = expenses
                .filter(e => e.date === dateStr)
                .reduce((sum, e) => sum + e.amount, 0);
            return { day: DAY_LABELS[d.getDay()], total: dayTotal, dateStr };
        });
    }, [expenses]);

    const weeklyMax = useMemo(() => Math.max(...weeklyBars.map(b => b.total), 1), [weeklyBars]);
    const weeklyAvg = useMemo(() => {
        const nonZero = weeklyBars.filter(b => b.total > 0);
        return nonZero.length ? nonZero.reduce((s, b) => s + b.total, 0) / nonZero.length : 0;
    }, [weeklyBars]);

    // ── Compute category breakdown from real expense data ──
    const categoryStats = useMemo(() => {
        const totals = {};
        expenses.forEach(e => {
            const cat = e.category || 'Other';
            totals[cat] = (totals[cat] || 0) + e.amount;
        });
        const grand = Object.values(totals).reduce((s, v) => s + v, 0) || 1;
        return Object.entries(totals)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([label, val]) => ({ label, pct: Math.round((val / grand) * 100) }));
    }, [expenses]);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [transactionMode, setTransactionMode] = useState('expense'); // 'expense' | 'income' | 'savings'
    const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
    const [activityFilter, setActivityFilter] = useState('All'); // 'All', 'Expense', 'Income', 'Saving'

    // form state
    const [formAmount, setFormAmount] = useState('');
    const [formCategory, setFormCategory] = useState('Food & Dining');
    const [formDesc, setFormDesc] = useState('');
    const [formType, setFormType] = useState('Card');
    const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
    const [isPredictingCategory, setIsPredictingCategory] = useState(false);

    useEffect(() => {
        if (!formDesc.trim() || formDesc.length < 3) return;

        const delayDebounceFn = setTimeout(async () => {
            setIsPredictingCategory(true);
            try {
                const res = await predictTransactionCategory(formDesc);
                if (res.predicted_category) {
                    const catLower = res.predicted_category.toLowerCase();
                    const isIncomeCat = INCOME_CATEGORIES.some(c => c.toLowerCase() === catLower);

                    if (isIncomeCat || catLower === 'income') {
                        setTransactionMode('income');
                        const validCategory = INCOME_CATEGORIES.find(c => c.toLowerCase() === catLower);
                        if (validCategory) setFormCategory(validCategory);
                    } else if (catLower === 'saving' || catLower === 'savings') {
                        setTransactionMode('savings');
                    } else {
                        setTransactionMode('expense');
                        const validCategory = EXPENSE_CATEGORIES.find(c => c.toLowerCase() === catLower);
                        if (validCategory) {
                            setFormCategory(validCategory);
                        }
                    }
                }
            } catch (err) {
                console.error("AI Prediction failed", err);
            } finally {
                setIsPredictingCategory(false);
            }
        }, 800);

        return () => clearTimeout(delayDebounceFn);
    }, [formDesc]);

    const handleAddTransaction = () => {
        if (!formAmount || !formDesc.trim()) return;
        const entry = {
            id: Date.now(),
            date: formDate,
            description: formDesc.trim(),
            amount: parseFloat(formAmount),
        };

        if (transactionMode === 'expense') {
            addExpense({ ...entry, category: formCategory, type: formType });
        } else if (transactionMode === 'income') {
            addIncome({ ...entry, category: formCategory });
        } else if (transactionMode === 'savings') {
            addSavings(entry);
        }

        setFormAmount(''); setFormDesc(''); setFormDate(new Date().toISOString().split('T')[0]);
        setIsAddMenuOpen(false);
    };

    const handleDelete = (id, txnType) => {
        if (txnType === 'Expense') deleteExpense(id);
        else if (txnType === 'Income') deleteIncome(id);
        else if (txnType === 'Saving') deleteSavings(id);
    };

    const handleVoiceData = (data) => {
        if (data.amount) setFormAmount(data.amount);
        if (data.description) setFormDesc(data.description);

        if (data.transaction_type) {
            setTransactionMode(data.transaction_type.toLowerCase());
        } else {
            setTransactionMode('expense');
        }

        if (data.category && CATEGORY_COLORS[data.category]) {
            setFormCategory(data.category);
        }
    };

    const catColor = (cat) => CATEGORY_COLORS[cat] ?? CATEGORY_COLORS['Other'];

    const allTransactions = [
        ...expenses.map(e => ({ ...e, txnType: 'Expense' })),
        ...incomes.map(i => ({ ...i, txnType: 'Income' })),
        ...savingsEntries.map(s => ({ ...s, txnType: 'Saving' }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    const displayedTransactions = activityFilter === 'All'
        ? allTransactions
        : allTransactions.filter(t => t.txnType === activityFilter);

    return (
        <div className="bg-[#0B0014] text-on-surface font-body min-h-screen overflow-x-hidden selection:bg-primary-container selection:text-white">

            {/* ANOMALY ALERT TOAST */}
            {anomalyAlert && (
                <div className="fixed top-24 right-8 z-[100] animate-bounce">
                    <div className="bg-error-container/90 backdrop-blur border border-error p-4 rounded-xl shadow-[0_0_20px_rgba(255,0,0,0.4)] flex items-center gap-3">
                        <span className="material-symbols-outlined text-error text-2xl">warning</span>
                        <div className="text-error font-bold text-sm">{anomalyAlert}</div>
                    </div>
                </div>
            )}

            {/* MUTATION ERROR TOAST */}
            {mutationError && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100]">
                    <div className="bg-[#2a0a0a]/95 backdrop-blur border border-error/50 px-5 py-3 rounded-xl shadow-[0_0_20px_rgba(255,50,50,0.3)] flex items-center gap-3">
                        <span className="material-symbols-outlined text-error text-lg">error</span>
                        <span className="text-error text-sm font-medium">{mutationError}</span>
                    </div>
                </div>
            )}


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
                            <span className="hidden sm:block font-medium text-on-surface text-sm">{username}</span>
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
                            <p className="text-[#f6d9fd] font-bold text-sm">{username}</p>
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
                    ].map(({ to, icon, label }) => (
                        <Link key={to} className="flex items-center gap-4 text-[#ffb59e]/50 py-3 px-6 hover:bg-[#412d49]/50 hover:text-[#ffb59e] transition-all duration-500 font-body text-sm font-medium" to={to}>
                            <span className="material-symbols-outlined">{icon}</span> {label}
                        </Link>
                    ))}

                    {/* Active: Finance Tracker */}
                    <Link className="flex items-center gap-4 text-[#fff9ef] bg-gradient-to-r from-[#ff571a]/20 to-transparent border-r-4 border-[#ff571a] py-3 px-6 transition-all duration-500 font-body text-sm font-medium" to="/finance-tracker">
                        <span className="material-symbols-outlined">payments</span> Finance Tracker
                    </Link>

                    {[
                        { icon: 'edit_note', label: 'Journal', to: '/journal' },
                        { icon: 'dangerous', label: 'Failure Tracker', to: '/failure-tracker' },
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
                        <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary-container/10 rounded-full blur-[120px] pointer-events-none" />
                        <h1 className="font-headline text-5xl md:text-6xl font-bold tracking-tighter text-[#fff9ef] mb-2 relative z-10">
                            Finance{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container drop-shadow-[0_0_15px_rgba(255,181,158,0.4)]">
                                Tracker
                            </span>
                        </h1>
                        <div className="h-0.5 bg-gradient-to-r from-[#ff571a] to-transparent w-48 mb-4" />
                        <p className="text-on-surface-variant text-lg font-light tracking-wide max-w-xl">
                            Manage your expenses, savings, and financial discipline through the lens of the celestial rebirth.
                        </p>
                    </section>

                    {/* ── INSIGHT CARDS ─────────────────────────────────────── */}
                    <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        {/* Green */}
                        <div className="glass-panel p-6 rounded-xl flex items-start gap-4 border-l-4 border-emerald-500 shadow-[0_20px_40px_rgba(255,77,0,0.08)] bg-[#36233e]/60 backdrop-blur-xl">
                            <div className="p-3 rounded-full bg-emerald-500/20 text-emerald-400 shrink-0">
                                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                            </div>
                            <div>
                                <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold">Insight</span>
                                <h4 className="text-emerald-400 font-bold mb-1 mt-1">Good Saving Discipline</h4>
                                <p className="text-on-surface-variant text-sm">Maintained 35% savings rate over the last 30 days. Level up imminent.</p>
                            </div>
                        </div>
                        {/* Budget Prediction ML (Dynamic) */}
                        <div className={`glass-panel p-6 rounded-xl flex items-start gap-4 border-l-4 shadow-[0_20px_40px_rgba(255,77,0,0.08)] bg-[#36233e]/60 backdrop-blur-xl ${budgetAlert?.includes('exceed') ? 'border-error' :
                            budgetAlert?.includes('within') ? 'border-emerald-500' : 'border-secondary-container'
                            }`}>
                            <div className={`p-3 rounded-full shrink-0 ${budgetAlert?.includes('exceed') ? 'bg-error/20 text-error' :
                                budgetAlert?.includes('within') ? 'bg-emerald-500/20 text-emerald-400' : 'bg-secondary-container/20 text-secondary-fixed'
                                }`}>
                                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                                    {budgetAlert?.includes('exceed') ? 'warning' : budgetAlert?.includes('within') ? 'check_circle' : 'hourglass_empty'}
                                </span>
                            </div>
                            <div>
                                <span className={`text-[10px] uppercase tracking-widest font-bold ${budgetAlert?.includes('exceed') ? 'text-error' :
                                    budgetAlert?.includes('within') ? 'text-emerald-400' : 'text-secondary-fixed'
                                    }`}>
                                    ML Budget Predictor
                                </span>
                                <h4 className={`font-bold mb-1 mt-1 ${budgetAlert?.includes('exceed') ? 'text-error' :
                                    budgetAlert?.includes('within') ? 'text-emerald-400' : 'text-secondary-fixed'
                                    }`}>
                                    {budgetAlert?.includes('exceed') ? 'Budget Alert' : budgetAlert?.includes('within') ? 'On Track' : 'Gathering Data'}
                                </h4>
                                <p className="text-on-surface-variant text-sm">
                                    {budgetAlert || 'Need more transaction data to predict budget.'}
                                </p>
                            </div>
                        </div>
                        {/* Dynamic Backend Insight */}
                        <div className={`glass-panel p-6 rounded-xl flex items-start gap-4 border-l-4 shadow-[0_20px_40px_rgba(255,77,0,0.08)] bg-[#36233e]/60 backdrop-blur-xl ${insightMsg?.toLowerCase().includes('increased') ? 'border-tertiary-container' :
                            insightMsg?.toLowerCase().includes('decreased') ? 'border-emerald-500' : 'border-[#f6d9fd]'
                            }`}>
                            <div className={`p-3 rounded-full shrink-0 ${insightMsg?.toLowerCase().includes('increased') ? 'bg-tertiary-container/20 text-tertiary' :
                                insightMsg?.toLowerCase().includes('decreased') ? 'bg-emerald-500/20 text-emerald-400' : 'bg-[#f6d9fd]/20 text-[#f6d9fd]'
                                }`}>
                                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                                    {insightMsg?.toLowerCase().includes('increased') ? 'trending_up' :
                                        insightMsg?.toLowerCase().includes('decreased') ? 'trending_down' : 'trending_flat'}
                                </span>
                            </div>
                            <div>
                                <span className={`text-[10px] uppercase tracking-widest font-bold ${insightMsg?.toLowerCase().includes('increased') ? 'text-tertiary' :
                                    insightMsg?.toLowerCase().includes('decreased') ? 'text-emerald-400' : 'text-[#f6d9fd]'
                                    }`}>
                                    {insightMsg?.toLowerCase().includes('increased') ? 'Caution' : 'Update'}
                                </span>
                                <h4 className={`font-bold mb-1 mt-1 ${insightMsg?.toLowerCase().includes('increased') ? 'text-tertiary' :
                                    insightMsg?.toLowerCase().includes('decreased') ? 'text-emerald-400' : 'text-[#f6d9fd]'
                                    }`}>
                                    {insightMsg?.toLowerCase().includes('increased') ? 'Spending Increased' :
                                        insightMsg?.toLowerCase().includes('decreased') ? 'Spending Decreased' : 'Spending Steady'}
                                </h4>
                                <p className="text-on-surface-variant text-sm">
                                    {insightMsg || "Loading insights..."}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* ── MONTHLY SUMMARY CARDS ─────────────────────────────── */}
                    <section className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        {/* Total Expenses */}
                        <Link to="/expenses-history" className="block glass-card p-6 rounded-3xl border border-outline-variant/10 bg-[#36233e]/60 backdrop-blur-xl shadow-[0_20px_40px_rgba(255,77,0,0.08)] hover:-translate-y-1 hover:shadow-2xl transition-all cursor-pointer">
                            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant/60 font-bold mb-3 flex items-center justify-between">Total Expenses <span className="material-symbols-outlined text-xs">open_in_new</span></p>
                            <div className="text-3xl font-headline font-black text-primary">{fmtAmt(totalExpenses)}</div>
                            <div className="mt-3 flex items-center gap-1 text-xs text-error font-medium">
                                <span className="material-symbols-outlined text-sm">south_east</span>
                                +4.2% from last month
                            </div>
                        </Link>
                        {/* Total Income */}
                        <Link to="/income-history" className="block glass-card p-6 rounded-3xl border border-outline-variant/10 bg-[#36233e]/60 backdrop-blur-xl shadow-[0_20px_40px_rgba(255,77,0,0.08)] hover:-translate-y-1 hover:shadow-2xl transition-all cursor-pointer">
                            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant/60 font-bold mb-3 flex items-center justify-between">Total Income <span className="material-symbols-outlined text-xs">open_in_new</span></p>
                            <div className="text-3xl font-headline font-black text-secondary-fixed">{fmtAmt(totalIncome)}</div>
                            <div className="mt-3 flex items-center gap-1 text-xs text-emerald-400 font-medium">
                                <span className="material-symbols-outlined text-sm">north_east</span>
                                +2.0% from last month
                            </div>
                        </Link>
                        {/* Savings */}
                        <Link to="/savings-history" className="block glass-card p-6 rounded-3xl border border-outline-variant/10 bg-[#36233e]/60 backdrop-blur-xl shadow-[0_20px_40px_rgba(255,77,0,0.08)] hover:-translate-y-1 hover:shadow-2xl transition-all cursor-pointer">
                            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant/60 font-bold mb-3 flex items-center justify-between">Savings <span className="material-symbols-outlined text-xs">open_in_new</span></p>
                            <div className="text-3xl font-headline font-black text-[#f6d9fd]">{fmtAmt(savings)}</div>
                            <div className="mt-3 flex items-center gap-1 text-xs text-primary font-medium">
                                <span className="material-symbols-outlined text-sm">auto_awesome</span>
                                {savingRatio}% Saving Ratio
                            </div>
                        </Link>
                        {/* Goal Progress */}
                        <div className="glass-card p-6 rounded-3xl border border-outline-variant/10 bg-[#36233e]/60 backdrop-blur-xl shadow-[0_20px_40px_rgba(255,77,0,0.08)] flex flex-col items-center justify-center gap-2">
                            <div className="relative w-20 h-20 flex items-center justify-center">
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                                    <circle cx="40" cy="40" r="32" fill="none" stroke="currentColor" strokeWidth="6" className="text-surface-container-highest" />
                                    <circle cx="40" cy="40" r="32" fill="none" stroke="url(#goalGrad)" strokeWidth="6"
                                        strokeDasharray="201" strokeDashoffset="30" strokeLinecap="round" />
                                    <defs>
                                        <linearGradient id="goalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#ffb59e" />
                                            <stop offset="100%" stopColor="#ff571a" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <span className="absolute text-lg font-black font-headline text-primary">85%</span>
                            </div>
                            <p className="text-[10px] uppercase tracking-widest text-primary font-bold">Goal Progress</p>
                        </div>
                    </section>

                    {/* ── MAIN GRID ─────────────────────────────────────────── */}
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">

                        {/* ── LEFT COLUMN (8/12) ──────────────────────────── */}
                        <div className="xl:col-span-8 space-y-8">

                            {/* TRANSACTION FORM */}
                            <div className="glass-card p-6 md:p-8 rounded-3xl border border-outline-variant/10 bg-[#36233e]/60 backdrop-blur-xl shadow-[0_20px_40px_rgba(255,77,0,0.08)]">
                                <div className="flex items-center justify-between mb-6 relative">
                                    <h3 className="font-headline text-xl font-bold text-[#fff9ef] flex items-center gap-3">
                                        <span className={`material-symbols-outlined ${transactionMode === 'expense' ? 'text-primary' : transactionMode === 'income' ? 'text-emerald-400' : 'text-[#f6d9fd]'}`}>
                                            {transactionMode === 'expense' ? 'add_circle' : transactionMode === 'income' ? 'account_balance_wallet' : 'savings'}
                                        </span>
                                        {transactionMode === 'expense' ? 'Quick Transaction' : transactionMode === 'income' ? 'Add Income' : 'Add Savings'}
                                    </h3>
                                    <div className="relative flex items-center gap-3">
                                        <VoiceButton onVoiceProcessed={handleVoiceData} />
                                        <button
                                            onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
                                            className="w-10 h-10 rounded-full bg-surface-container-highest/50 hover:bg-surface-container-highest text-on-surface flex items-center justify-center transition-colors"
                                        >
                                            <span className="material-symbols-outlined">add</span>
                                        </button>

                                        {isAddMenuOpen && (
                                            <div className="absolute right-0 top-12 w-48 bg-[#1d0c26] border border-outline-variant/20 rounded-xl shadow-xl overflow-hidden z-20">
                                                <button
                                                    onClick={() => { setTransactionMode('expense'); setIsAddMenuOpen(false); }}
                                                    className={`w-full text-left px-4 py-3 text-sm font-medium hover:bg-surface-container transition-colors ${transactionMode === 'expense' ? 'text-primary' : 'text-on-surface-variant'}`}
                                                >
                                                    <span className="material-symbols-outlined text-sm align-middle mr-2">receipt_long</span>
                                                    Add Expense
                                                </button>
                                                <button
                                                    onClick={() => { setTransactionMode('income'); setFormCategory('Salary'); setIsAddMenuOpen(false); }}
                                                    className={`w-full text-left px-4 py-3 text-sm font-medium hover:bg-surface-container transition-colors border-t border-outline-variant/10 ${transactionMode === 'income' ? 'text-emerald-400' : 'text-on-surface-variant'}`}
                                                >
                                                    <span className="material-symbols-outlined text-sm align-middle mr-2">account_balance_wallet</span>
                                                    Add Income
                                                </button>
                                                <button
                                                    onClick={() => { setTransactionMode('savings'); setIsAddMenuOpen(false); }}
                                                    className={`w-full text-left px-4 py-3 text-sm font-medium hover:bg-surface-container transition-colors border-t border-outline-variant/10 ${transactionMode === 'savings' ? 'text-[#f6d9fd]' : 'text-on-surface-variant'}`}
                                                >
                                                    <span className="material-symbols-outlined text-sm align-middle mr-2">savings</span>
                                                    Add Savings
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    {/* Amount */}
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-widest text-on-surface-variant font-bold">Amount (₹)</label>
                                        <input
                                            type="number" min="0" placeholder="0.00"
                                            value={formAmount}
                                            onChange={e => setFormAmount(e.target.value)}
                                            className="w-full bg-[#180720]/80 border border-outline-variant/20 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-on-surface p-4 transition-all outline-none"
                                        />
                                    </div>
                                    {/* Category (Expense/Income) or Description (Savings) */}
                                    {transactionMode === 'expense' || transactionMode === 'income' ? (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs uppercase tracking-widest text-on-surface-variant font-bold">Category</label>
                                                {isPredictingCategory && <span className={`material-symbols-outlined text-[10px] animate-pulse ${transactionMode === 'income' ? 'text-emerald-400' : 'text-primary'}`}>auto_awesome</span>}
                                            </div>
                                            <select
                                                value={formCategory} onChange={e => setFormCategory(e.target.value)}
                                                className="w-full bg-[#180720]/80 border border-outline-variant/20 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-on-surface p-4 appearance-none cursor-pointer"
                                            >
                                                {(transactionMode === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES)
                                                    .filter(c => c !== 'Other').map(c => (
                                                        <option key={c}>{c}</option>
                                                    ))}
                                            </select>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs uppercase tracking-widest text-on-surface-variant font-bold">Description</label>
                                                {isPredictingCategory && <span className="material-symbols-outlined text-[#f6d9fd] text-[10px] animate-pulse">auto_awesome</span>}
                                            </div>
                                            <input
                                                type="text" placeholder={`Savings description...`}
                                                value={formDesc} onChange={e => setFormDesc(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && handleAddTransaction()}
                                                className="w-full bg-[#180720]/80 border border-outline-variant/20 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-on-surface p-4 transition-all outline-none"
                                            />
                                        </div>
                                    )}
                                    {/* Date */}
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-widest text-on-surface-variant font-bold">Date</label>
                                        <input
                                            type="date" value={formDate} onChange={e => setFormDate(e.target.value)}
                                            className="w-full bg-[#180720]/80 border border-outline-variant/20 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-on-surface p-4 transition-all outline-none"
                                        />
                                    </div>
                                    {/* Description (Expense/Income) */}
                                    {(transactionMode === 'expense' || transactionMode === 'income') && (
                                        <div className="space-y-2 md:col-span-2">
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs uppercase tracking-widest text-on-surface-variant font-bold">Description</label>
                                                {isPredictingCategory && <span className={`material-symbols-outlined text-[10px] animate-pulse ${transactionMode === 'income' ? 'text-emerald-400' : 'text-primary'}`}>auto_awesome</span>}
                                            </div>
                                            <input
                                                type="text" placeholder={`${transactionMode === 'expense' ? 'Expense' : 'Income'} name...`}
                                                value={formDesc} onChange={e => setFormDesc(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && handleAddTransaction()}
                                                className="w-full bg-[#180720]/80 border border-outline-variant/20 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-on-surface p-4 transition-all outline-none"
                                            />
                                        </div>
                                    )}
                                    {/* Payment Type */}
                                    {transactionMode === 'expense' && (
                                        <div className="space-y-2">
                                            <label className="text-xs uppercase tracking-widest text-on-surface-variant font-bold">Payment Type</label>
                                            <div className="flex gap-2">
                                                {['Card', 'UPI', 'Cash'].map(t => (
                                                    <button
                                                        key={t} type="button"
                                                        onClick={() => setFormType(t)}
                                                        className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all border ${formType === t ? 'bg-primary/20 border-primary text-primary' : 'border-outline-variant/20 text-on-surface-variant hover:border-primary/40'}`}
                                                    >{t}</button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {/* Submit */}
                                    <div className="md:col-span-3">
                                        <button
                                            type="button" onClick={handleAddTransaction}
                                            className={`w-full py-4 rounded-xl font-bold uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:scale-[1.01] active:scale-[0.98] transition-all ${transactionMode === 'expense' ? 'bg-gradient-to-r from-primary to-primary-container text-background shadow-[0_10px_30px_rgba(255,87,26,0.3)]' :
                                                transactionMode === 'income' ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-background shadow-[0_10px_30px_rgba(16,185,129,0.3)]' :
                                                    'bg-gradient-to-r from-[#f6d9fd] to-[#d3a8e9] text-[#1d0c26] shadow-[0_10px_30px_rgba(246,217,253,0.3)]'
                                                }`}
                                        >
                                            {transactionMode === 'expense' ? 'Add Expense' : transactionMode === 'income' ? 'Add Income' : 'Add Savings'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* RECENT ACTIVITY TABLE */}
                            <div className="glass-card rounded-3xl border border-outline-variant/10 bg-[#36233e]/60 backdrop-blur-xl shadow-2xl overflow-hidden">
                                <div className="p-6 bg-surface-container-high flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant/10">
                                    <h3 className="font-headline text-xl font-bold text-secondary flex items-center gap-3">
                                        <span className="material-symbols-outlined text-primary">receipt_long</span>
                                        Recent Activity
                                    </h3>
                                    <div className="flex items-center gap-4">
                                        <div className="flex bg-[#180720]/80 rounded-full border border-outline-variant/20 overflow-hidden">
                                            {['All', 'Expense', 'Income', 'Saving'].map(f => (
                                                <button
                                                    key={f}
                                                    onClick={() => setActivityFilter(f)}
                                                    className={`px-3 md:px-4 py-1.5 min-w-[60px] text-[10px] md:text-xs font-bold uppercase tracking-widest transition-colors ${activityFilter === f ? 'bg-primary text-background' : 'text-on-surface-variant hover:bg-surface-bright/20'}`}
                                                >
                                                    {f}
                                                </button>
                                            ))}
                                        </div>
                                        <Link to="/all-history" className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary hover:text-white transition-colors flex items-center gap-1">
                                            View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                        </Link>
                                    </div>
                                </div>

                                {/* Desktop table */}
                                <div className="hidden md:block overflow-x-auto no-scrollbar">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-surface-container text-on-surface-variant text-[11px] uppercase tracking-widest font-bold">
                                                <th className="px-6 py-4 min-w-[120px]">Date</th>
                                                <th className="px-6 py-4">Transaction</th>
                                                <th className="px-6 py-4 text-center">Category</th>
                                                <th className="px-6 py-4 text-right">Amount</th>
                                                <th className="px-6 py-4 text-center">Payment</th>
                                                <th className="px-6 py-4 text-right"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm">
                                            {displayedTransactions.length === 0 ? (
                                                <tr>
                                                    <td colSpan="6" className="px-6 py-8 text-center text-on-surface-variant italic">No recent transactions matching filter.</td>
                                                </tr>
                                            ) : (
                                                displayedTransactions.slice(0, 10).map(txn => {
                                                    const isHigh = txn.amount > 500;
                                                    const colorClass = txn.txnType === 'Expense' ? 'text-primary' : txn.txnType === 'Income' ? 'text-emerald-400' : 'text-[#f6d9fd]';
                                                    const bgClass = txn.txnType === 'Expense' ? 'bg-primary/10' : txn.txnType === 'Income' ? 'bg-emerald-500/10' : 'bg-[#f6d9fd]/10';
                                                    const icon = txn.txnType === 'Expense' ? 'south_east' : txn.txnType === 'Income' ? 'north_east' : 'savings';

                                                    return (
                                                        <tr key={`${txn.txnType}-${txn.id}`} className={`border-b border-outline-variant/5 hover:bg-surface-bright/50 transition-colors ${isHigh && txn.txnType === 'Expense' ? 'border-l-2 border-tertiary/40' : ''}`}>
                                                            <td className="px-6 py-5 text-on-surface-variant">{fmtDate(txn.date)}</td>
                                                            <td className="px-6 py-5">
                                                                <div className="flex items-center gap-3">
                                                                    <span className={`material-symbols-outlined text-[1rem] p-1.5 rounded-full ${colorClass} ${bgClass}`}>{icon}</span>
                                                                    <span className="font-semibold text-white">{txn.description}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-5 text-center">
                                                                {txn.txnType === 'Expense' ? (
                                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${catColor(txn.category).bg} ${catColor(txn.category).text}`}>
                                                                        {txn.category}
                                                                    </span>
                                                                ) : (
                                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-surface-container-highest/50 text-on-surface-variant/80`}>
                                                                        {txn.txnType}
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className={`px-6 py-5 text-right font-bold ${isHigh && txn.txnType === 'Expense' ? 'text-tertiary' : colorClass}`}>
                                                                {txn.txnType === 'Expense' ? '-' : '+'}{fmtAmt(txn.amount)}
                                                            </td>
                                                            <td className="px-6 py-5 text-center">
                                                                {txn.txnType === 'Expense' ? (
                                                                    <span className="flex items-center justify-center gap-1.5 text-on-surface-variant text-xs">
                                                                        <span className="material-symbols-outlined text-sm">{TYPE_ICON[txn.type] || 'payments'}</span>
                                                                        {txn.type}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-on-surface-variant/50 text-xs">-</span>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-5 text-right">
                                                                <button
                                                                    onClick={() => handleDelete(txn.id, txn.txnType)}
                                                                    className="material-symbols-outlined text-outline/30 hover:text-error transition-colors text-sm"
                                                                >delete</button>
                                                            </td>
                                                        </tr>
                                                    )
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile cards */}
                                <div className="md:hidden divide-y divide-outline-variant/10">
                                    {displayedTransactions.length === 0 ? (
                                        <div className="p-8 text-center text-on-surface-variant italic text-sm">No recent transactions matching filter.</div>
                                    ) : (
                                        displayedTransactions.slice(0, 10).map(txn => {
                                            const isHigh = txn.amount > 500;
                                            const colorClass = txn.txnType === 'Expense' ? 'text-primary' : txn.txnType === 'Income' ? 'text-emerald-400' : 'text-[#f6d9fd]';
                                            const bgClass = txn.txnType === 'Expense' ? 'bg-primary/10' : txn.txnType === 'Income' ? 'bg-emerald-500/10' : 'bg-[#f6d9fd]/10';

                                            return (
                                                <div key={`${txn.txnType}-${txn.id}`} className="p-5 flex items-center justify-between hover:bg-surface-bright/30 transition-colors">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            {txn.txnType === 'Expense' ? (
                                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${catColor(txn.category).bg} ${catColor(txn.category).text}`}>
                                                                    {txn.category}
                                                                </span>
                                                            ) : (
                                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${colorClass} ${bgClass}`}>
                                                                    {txn.txnType}
                                                                </span>
                                                            )}
                                                            <span className="text-[10px] text-on-surface-variant opacity-80">{fmtDate(txn.date)}</span>
                                                        </div>
                                                        <p className="text-sm font-bold text-white">{txn.description}</p>
                                                        {txn.txnType === 'Expense' && (
                                                            <span className="flex items-center gap-1 text-xs text-on-surface-variant/80">
                                                                <span className="material-symbols-outlined text-xs">{TYPE_ICON[txn.type] || 'payments'}</span>
                                                                {txn.type}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col items-end justify-between h-full space-y-3">
                                                        <span className={`font-black tracking-wider text-base font-headline ${isHigh && txn.txnType === 'Expense' ? 'text-tertiary' : colorClass}`}>
                                                            {txn.txnType === 'Expense' ? '-' : '+'}{fmtAmt(txn.amount)}
                                                        </span>
                                                        <button onClick={() => handleDelete(txn.id, txn.txnType)} className="material-symbols-outlined text-outline/30 hover:text-error transition-colors text-sm">delete</button>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    )}
                                </div>
                            </div>

                            {/* CELESTIAL ASSETS — full-width in left column */}
                            <div className="glass-card p-6 md:p-8 rounded-3xl border border-outline-variant/10 bg-[#36233e]/60 backdrop-blur-xl shadow-[0_20px_40px_rgba(255,77,0,0.08)] relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-secondary/5 blur-3xl rounded-full pointer-events-none" />
                                <div className="flex items-center justify-between mb-8">
                                    <h4 className="font-headline text-xl font-bold text-secondary">Celestial Assets</h4>
                                    <div className="bg-secondary/10 px-3 py-1 rounded-full flex items-center gap-1">
                                        <span className="material-symbols-outlined text-secondary text-xs">keyboard_double_arrow_up</span>
                                        <span className="text-[10px] text-secondary font-black">PREMIUM</span>
                                    </div>
                                </div>

                                {/* 3-column asset grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                                    {[
                                        { icon: 'show_chart', iconColor: 'text-secondary', bg: 'bg-secondary/10', label: 'Mutual Funds', sub: '3 Active Funds', val: '₹12,450', pct: '+12.4%', up: true },
                                        { icon: 'candlestick_chart', iconColor: 'text-primary', bg: 'bg-primary/10', label: 'Stock Equity', sub: '12 Companies', val: '₹8,120', pct: '-2.1%', up: false },
                                        { icon: 'currency_bitcoin', iconColor: 'text-on-surface', bg: 'bg-surface-container-highest', label: 'Trading', sub: 'Crypto / Forex', val: '₹4,500', pct: '+5.7%', up: true },
                                    ].map(({ icon, iconColor, bg, label, sub, val, pct, up }) => (
                                        <div key={label} className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container-low/60 border border-outline-variant/10 hover:bg-surface-container hover:border-primary/20 transition-all group">
                                            <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                                                <span className={`material-symbols-outlined ${iconColor}`}>{icon}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h5 className="text-sm font-bold text-on-surface">{label}</h5>
                                                <p className="text-[10px] text-on-surface-variant mb-2">{sub}</p>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-base font-black font-headline text-on-surface">{val}</span>
                                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${up ? 'text-emerald-400 bg-emerald-500/10' : 'text-error bg-error/10'}`}>{pct}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Total portfolio summary */}
                                <div className="pt-6 border-t border-outline-variant/10">
                                    <div className="flex items-end justify-between mb-4">
                                        <div>
                                            <p className="text-xs text-on-surface-variant uppercase tracking-widest font-bold mb-1">Total Portfolio</p>
                                            <div className="text-3xl font-headline font-black text-secondary">₹25,070.00</div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-on-surface-variant uppercase tracking-widest font-bold mb-1">Overall Return</p>
                                            <div className="text-xl font-headline font-black text-emerald-400">+8.4%</div>
                                        </div>
                                    </div>
                                    <div className="w-full h-3 bg-surface-container-highest rounded-full overflow-hidden flex gap-0.5">
                                        <div className="h-full bg-secondary-container rounded-l-full" style={{ width: '50%' }} />
                                        <div className="h-full bg-primary" style={{ width: '30%' }} />
                                        <div className="h-full bg-on-surface-variant rounded-r-full" style={{ width: '20%' }} />
                                    </div>
                                    <div className="flex justify-between mt-2 text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">
                                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-secondary-container inline-block" />Mutual 50%</span>
                                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary inline-block" />Stocks 30%</span>
                                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-on-surface-variant inline-block" />Crypto 20%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── RIGHT COLUMN (4/12) ─────────────────────────── */}
                        <div className="xl:col-span-4 space-y-8">

                            {/* ✅ ADD THIS LINE HERE */}
                            <SpendingPersona />

                            {/* SPENDING TREND CHART */}
                            <div className="glass-card p-6 md:p-8 rounded-3xl border border-outline-variant/10 bg-[#36233e]/60 backdrop-blur-xl shadow-[0_20px_40px_rgba(255,77,0,0.08)]">
                                <h4 className="font-headline text-lg font-bold text-secondary mb-6 flex items-center justify-between">
                                    Spending Trend
                                    <span className="material-symbols-outlined text-primary">bar_chart</span>
                                </h4>
                                <div className="h-40 flex items-end justify-between gap-2 mt-4 mb-2">
                                    {weeklyBars.map((bar, i) => {
                                        const heightPct = weeklyMax > 0 ? (bar.total / weeklyMax) * 100 : 4;
                                        const isToday = i === 6;
                                        return (
                                            <div key={bar.dateStr} className={`w-full rounded-t-sm relative group cursor-pointer transition-all ${isToday ? 'bg-primary shadow-[0_0_15px_rgba(255,181,158,0.4)]' : 'bg-primary-container/10 hover:bg-primary/50'}`} style={{ height: `${Math.max(heightPct, 4)}%` }}>
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-container-highest px-2 py-1 rounded text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                    {bar.total > 0 ? fmtShort(bar.total) : 'No spend'}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="flex justify-between border-t border-outline-variant/10 pt-3 text-[10px] uppercase font-bold text-on-surface-variant tracking-widest">
                                    {weeklyBars.map((b, i) => (
                                        <span key={b.dateStr} className={i === 6 ? 'text-primary border-b border-primary pb-1 -mb-1' : ''}>{b.day}</span>
                                    ))}
                                </div>
                                <div className="mt-6 bg-surface-container-low p-4 rounded-xl border border-white/5">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs text-on-surface-variant font-medium">7-Day Average</span>
                                        <span className="text-sm font-bold text-secondary">{fmtShort(weeklyAvg)}</span>
                                    </div>
                                    <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full transition-all duration-500" style={{ width: weeklyMax > 0 ? `${Math.min((weeklyAvg / weeklyMax) * 100, 100)}%` : '0%' }} />
                                    </div>
                                </div>
                            </div>

                            {/* CATEGORY BREAKDOWN */}
                            <div className="glass-card p-6 md:p-8 rounded-3xl border border-outline-variant/10 bg-[#36233e]/60 backdrop-blur-xl shadow-[0_20px_40px_rgba(255,77,0,0.08)]">
                                <h4 className="font-headline text-lg font-bold text-secondary mb-6 flex items-center justify-between">
                                    Category Spread
                                    <span className="material-symbols-outlined text-primary">donut_large</span>
                                </h4>
                                {/* Pseudo donut */}
                                <div className="relative flex items-center justify-center py-6">
                                    <div className="relative w-40 h-40 rounded-full border-[10px] border-surface-container-highest flex items-center justify-center shadow-inner">
                                        <div className="absolute inset-0 rounded-full border-[10px] border-t-primary border-r-secondary-container border-b-tertiary border-l-emerald-500 rotate-[30deg] shadow-[0_0_20px_rgba(255,87,26,0.3)] hover:scale-[1.02] transition-transform cursor-pointer" />
                                        <div className="text-center z-10">
                                            <span className="block text-2xl font-black font-headline text-[#fff9ef]">{expenses.length}</span>
                                            <span className="text-[9px] uppercase tracking-widest text-on-surface-variant font-bold">Entries</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-2 space-y-2 pt-4 border-t border-white/5">
                                    {categoryStats.length > 0 ? categoryStats.map(({ label, pct }, idx) => (
                                        <div key={label} className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-white/5 transition-colors">
                                            <span className="flex items-center gap-2.5 text-on-surface-variant font-medium">
                                                <span className={`w-2 h-2 rounded-full ${CAT_COLORS[idx % CAT_COLORS.length]}`} />
                                                {label}
                                            </span>
                                            <span className="text-on-surface font-bold">{pct}%</span>
                                        </div>
                                    )) : (
                                        <p className="text-center text-on-surface-variant/50 text-xs py-4">No expense data yet</p>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Decorative blobs */}
                <div className="fixed top-[20%] left-[-10%] w-[40%] h-[40%] bg-primary-container/5 rounded-full blur-[120px] pointer-events-none -z-10" />
                <div className="fixed bottom-[-10%] right-[-5%] w-[30%] h-[30%] bg-tertiary-container/5 rounded-full blur-[100px] pointer-events-none -z-10" />
            </main>

            {/* ── MOBILE FAB ──────────────────────────────────────────────────── */}
            <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="fixed bottom-8 right-8 md:hidden w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary-container text-background flex items-center justify-center shadow-[0_0_30px_rgba(255,87,26,0.4)] z-50 active:scale-95 transition-transform"
            >
                <span className="material-symbols-outlined">add</span>
            </button>

            {/* ── MOBILE BOTTOM NAV ───────────────────────────────────────────── */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#1d0c26]/90 backdrop-blur-xl border-t border-outline-variant/10 flex justify-around items-center px-4 z-[70]">
                <Link to="/dashboard" className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">dashboard</Link>
                <Link to="/daily-tracker" className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">event_repeat</Link>
                <Link to="/finance-tracker" className="material-symbols-outlined text-primary">payments</Link>
                <Link to="/study-tracker" className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">menu_book</Link>
                <Link to="#" className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">person</Link>
            </nav>
        </div>
    );
};

export default FinanceTracker;
