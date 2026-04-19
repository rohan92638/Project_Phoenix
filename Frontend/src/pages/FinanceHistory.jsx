import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { FinanceContext } from '../context/FinanceContext';

const CATEGORY_COLORS = {
    'Food & Dining': { bg: 'bg-primary/10', text: 'text-primary' },
    'Rent': { bg: 'bg-secondary/10', text: 'text-secondary-fixed' },
    'Entertainment': { bg: 'bg-tertiary/10', text: 'text-tertiary' },
    'Transportation': { bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
    'Shopping': { bg: 'bg-purple-500/10', text: 'text-purple-300' },
    'Utilities': { bg: 'bg-blue-500/10', text: 'text-blue-300' },
    'Other': { bg: 'bg-outline/20', text: 'text-on-surface-variant' },
};

const TYPE_ICON = { Card: 'credit_card', UPI: 'account_balance', Cash: 'payments' };

const fmtDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};
const fmtAmt = (n) => `₹${Number(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;

const FinanceHistory = ({ type }) => {
    const { 
        expenses, deleteExpense, totalExpenses,
        incomes, deleteIncome, totalIncome,
        savingsEntries, deleteSavings, savings 
    } = useContext(FinanceContext);

    const [filterQuery, setFilterQuery] = useState('');

    let data = [];
    let deleteHandler = null;
    let title = '';
    let iconUrl = '';
    let themeColor = '';
    let totalValue = 0;

    if (type === 'expense') {
        data = expenses;
        deleteHandler = deleteExpense;
        title = 'Expense History';
        iconUrl = 'receipt_long';
        themeColor = 'text-primary';
        totalValue = totalExpenses;
    } else if (type === 'income') {
        data = incomes;
        deleteHandler = deleteIncome;
        title = 'Income History';
        iconUrl = 'account_balance_wallet';
        themeColor = 'text-secondary-fixed';
        totalValue = incomes.reduce((s, e) => s + e.amount, 0);
    } else {
        data = savingsEntries;
        deleteHandler = deleteSavings;
        title = 'Savings History';
        iconUrl = 'savings';
        themeColor = 'text-[#f6d9fd]';
        totalValue = data.reduce((s, e) => s + e.amount, 0); // Specifically manual savings added
    }

    const filteredData = data.filter(d => 
        d.description?.toLowerCase().includes(filterQuery.toLowerCase()) || 
        d.category?.toLowerCase().includes(filterQuery.toLowerCase())
    );

    const handleDel = (id) => {
        if(window.confirm('Delete this entry?')) {
            deleteHandler(id);
        }
    };

    const catColor = (cat) => CATEGORY_COLORS[cat] ?? CATEGORY_COLORS['Other'];

    return (
        <div className="bg-[#0B0014] text-on-surface font-body min-h-screen overflow-x-hidden selection:bg-primary-container selection:text-white">
            {/* Top Navigation */}
            <header className="fixed top-0 w-full z-50 bg-[#1d0c26]/60 backdrop-blur-xl flex justify-between items-center px-4 md:px-8 h-20 shadow-[0_20px_40px_rgba(255,77,0,0.08)]">
                <div className="flex items-center gap-4">
                    <Link to="/finance-tracker" className="text-secondary hover:text-white transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined">arrow_back</span>
                        Back to Dashboard
                    </Link>
                </div>
                <div className="flex items-center gap-4">
                    <Link to="/" className="text-lg md:text-xl font-bold uppercase tracking-widest text-[#ffb59e] font-headline">
                        PROJECT PHOENIX
                    </Link>
                </div>
            </header>

            <main className="pt-28 pb-20 px-4 md:px-8 lg:px-12 min-h-screen relative z-10 w-full max-w-[1200px] mx-auto">
                <section className="mb-12 relative flex flex-col md:flex-row justify-between items-end gap-6">
                    <div>
                        <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary-container/10 rounded-full blur-[120px] pointer-events-none" />
                        <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter text-[#fff9ef] mb-2 relative z-10 flex items-center gap-4">
                            <span className={`material-symbols-outlined text-4xl md:text-5xl ${themeColor}`}>{iconUrl}</span>
                            {title}
                        </h1>
                        <div className={`h-0.5 bg-gradient-to-r from-[var(--tw-gradient-from,${themeColor})] to-transparent w-48 mb-4`} />
                    </div>
                    
                    <div className="glass-card p-6 rounded-3xl border border-outline-variant/10 bg-[#36233e]/60 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.2)] md:min-w-[250px]">
                        <p className="text-[10px] uppercase tracking-widest text-on-surface-variant/60 font-bold mb-3">Total Accumulated</p>
                        <div className={`text-3xl font-headline font-black ${themeColor}`}>{fmtAmt(totalValue)}</div>
                    </div>
                </section>

                <div className="glass-card rounded-3xl border border-outline-variant/10 bg-[#36233e]/60 backdrop-blur-xl shadow-2xl overflow-hidden">
                    <div className="p-6 bg-surface-container-high flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant/10">
                        <h3 className={`font-headline text-xl font-bold ${themeColor} flex items-center gap-3`}>
                            <span className="material-symbols-outlined">list_alt</span>
                            All Transactions
                        </h3>
                        <div className="relative w-full md:w-auto">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
                            <input 
                                type="text"
                                placeholder="Search description or category..." 
                                value={filterQuery}
                                onChange={(e) => setFilterQuery(e.target.value)}
                                className="w-full md:w-64 bg-[#180720]/80 border border-outline-variant/20 rounded-full py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none transition-colors"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto no-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                            <thead>
                                <tr className="bg-surface-container text-on-surface-variant text-[11px] uppercase tracking-widest font-bold">
                                    <th className="px-6 py-4">Date</th>
                                    {type === 'expense' && <th className="px-6 py-4">Category</th>}
                                    <th className="px-6 py-4">Description</th>
                                    <th className="px-6 py-4 text-right">Amount</th>
                                    {type === 'expense' && <th className="px-6 py-4 text-center">Type</th>}
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {filteredData.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-10 text-on-surface-variant italic">No records found.</td>
                                    </tr>
                                ) : (
                                    filteredData.map(exp => (
                                        <tr key={exp.id} className="border-b border-outline-variant/5 hover:bg-surface-bright/50 transition-colors">
                                            <td className="px-6 py-5 text-on-surface-variant">{fmtDate(exp.date)}</td>
                                            {type === 'expense' && (
                                                <td className="px-6 py-5">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${catColor(exp.category).bg} ${catColor(exp.category).text}`}>
                                                        {exp.category}
                                                    </span>
                                                </td>
                                            )}
                                            <td className="px-6 py-5 font-semibold text-white">{exp.description}</td>
                                            <td className={`px-6 py-5 text-right font-bold ${themeColor}`}>
                                                {fmtAmt(exp.amount)}
                                            </td>
                                            {type === 'expense' && (
                                                <td className="px-6 py-5 text-center">
                                                    <span className="flex items-center justify-center gap-1.5 text-on-surface-variant text-xs">
                                                        <span className="material-symbols-outlined text-sm">{TYPE_ICON[exp.type] || 'payments'}</span>
                                                        {exp.type}
                                                    </span>
                                                </td>
                                            )}
                                            <td className="px-6 py-5 text-right">
                                                <button
                                                    onClick={() => handleDel(exp.id)}
                                                    className="material-symbols-outlined text-outline/30 hover:text-error transition-colors text-sm"
                                                >delete</button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default FinanceHistory;
