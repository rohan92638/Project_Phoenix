import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FinanceContext } from '../context/FinanceContext';
import { getTransactions } from '../services/api';

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
        totalExpenses, totalIncome, savings,
        deleteExpense, deleteIncome, deleteSavings
    } = useContext(FinanceContext);

    const [transactions, setTransactions] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [filterQuery, setFilterQuery] = useState('');

    const typeFilter = type === 'all' ? '' : type;

    const fetchHistory = async (page) => {
        setIsLoading(true);
        try {
            const res = await getTransactions(page, typeFilter);
            if (res.results) {
                setTransactions(res.results);
                setTotalPages(Math.ceil(res.count / 10));
            } else {
                setTransactions(res);
                setTotalPages(1);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory(currentPage);
        // eslint-disable-next-line
    }, [currentPage, typeFilter]);

    const handleDel = async (id, txnType) => {
        if(window.confirm('Delete this entry?')) {
            try {
                if (txnType === 'EXPENSE') await deleteExpense(id);
                else if (txnType === 'INCOME') await deleteIncome(id);
                else if (txnType === 'SAVING') await deleteSavings(id);
                fetchHistory(currentPage);
            } catch (e) {
                console.error(e);
            }
        }
    };

    let title = '';
    let iconUrl = '';
    let themeColor = '';
    let totalValue = 0;

    if (type === 'expense') {
        title = 'Expense History';
        iconUrl = 'receipt_long';
        themeColor = 'text-primary';
        totalValue = totalExpenses;
    } else if (type === 'income') {
        title = 'Income History';
        iconUrl = 'account_balance_wallet';
        themeColor = 'text-secondary-fixed';
        totalValue = totalIncome;
    } else if (type === 'savings') {
        title = 'Savings History';
        iconUrl = 'savings';
        themeColor = 'text-[#f6d9fd]';
        totalValue = savings;
    } else {
        title = 'All Transactions';
        iconUrl = 'list_alt';
        themeColor = 'text-primary';
        totalValue = totalIncome - totalExpenses + savings;
    }

    const filteredData = transactions.filter(d => 
        d.description?.toLowerCase().includes(filterQuery.toLowerCase()) || 
        d.category?.toLowerCase().includes(filterQuery.toLowerCase())
    );

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
                        <p className="text-[10px] uppercase tracking-widest text-on-surface-variant/60 font-bold mb-3">{type === 'all' ? 'Total Balance' : 'Total Accumulated'}</p>
                        <div className={`text-3xl font-headline font-black ${themeColor}`}>{fmtAmt(totalValue)}</div>
                    </div>
                </section>

                <div className="glass-card rounded-3xl border border-outline-variant/10 bg-[#36233e]/60 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col">
                    <div className="p-6 bg-surface-container-high flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant/10">
                        <h3 className={`font-headline text-xl font-bold ${themeColor} flex items-center gap-3`}>
                            <span className="material-symbols-outlined">list_alt</span>
                            Records
                        </h3>
                        <div className="relative w-full md:w-auto">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
                            <input 
                                type="text"
                                placeholder="Search this page..." 
                                value={filterQuery}
                                onChange={(e) => setFilterQuery(e.target.value)}
                                className="w-full md:w-64 bg-[#180720]/80 border border-outline-variant/20 rounded-full py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none transition-colors"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto no-scrollbar flex-1 min-h-[300px]">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                            <thead>
                                <tr className="bg-surface-container text-on-surface-variant text-[11px] uppercase tracking-widest font-bold">
                                    <th className="px-6 py-4">Date</th>
                                    {(type === 'expense' || type === 'all') && <th className="px-6 py-4">Category</th>}
                                    <th className="px-6 py-4">Description</th>
                                    <th className="px-6 py-4 text-right">Amount</th>
                                    {(type === 'expense' || type === 'all') && <th className="px-6 py-4 text-center">Type</th>}
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm relative">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-10 text-primary animate-pulse">Loading...</td>
                                    </tr>
                                ) : filteredData.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-10 text-on-surface-variant italic">No records found.</td>
                                    </tr>
                                ) : (
                                    filteredData.map(exp => {
                                        const isExp = exp.transaction_type === 'EXPENSE';
                                        const colorCls = isExp ? 'text-primary' : (exp.transaction_type === 'INCOME' ? 'text-emerald-400' : 'text-[#f6d9fd]');
                                        return (
                                        <tr key={exp.id} className="border-b border-outline-variant/5 hover:bg-surface-bright/50 transition-colors">
                                            <td className="px-6 py-5 text-on-surface-variant">{fmtDate(exp.date)}</td>
                                            {(type === 'expense' || type === 'all') && (
                                                <td className="px-6 py-5">
                                                    {isExp ? (
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${catColor(exp.category).bg} ${catColor(exp.category).text}`}>
                                                            {exp.category || 'Other'}
                                                        </span>
                                                    ) : (
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-surface-container-highest/50 text-on-surface-variant/80`}>
                                                            {exp.transaction_type}
                                                        </span>
                                                    )}
                                                </td>
                                            )}
                                            <td className="px-6 py-5 font-semibold text-white">{exp.description}</td>
                                            <td className={`px-6 py-5 text-right font-bold ${colorCls}`}>
                                                {isExp ? '-' : '+'}{fmtAmt(exp.amount)}
                                            </td>
                                            {(type === 'expense' || type === 'all') && (
                                                <td className="px-6 py-5 text-center">
                                                    {isExp && exp.payment_method ? (
                                                        <span className="flex items-center justify-center gap-1.5 text-on-surface-variant text-xs">
                                                            <span className="material-symbols-outlined text-sm">{TYPE_ICON[exp.payment_method] || 'payments'}</span>
                                                            {exp.payment_method}
                                                        </span>
                                                    ) : (
                                                        <span className="text-on-surface-variant/50 text-xs">-</span>
                                                    )}
                                                </td>
                                            )}
                                            <td className="px-6 py-5 text-right">
                                                <button
                                                    onClick={() => handleDel(exp.id, exp.transaction_type)}
                                                    className="material-symbols-outlined text-outline/30 hover:text-error transition-colors text-sm"
                                                >delete</button>
                                            </td>
                                        </tr>
                                    )})
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* PAGINATION CONTROLS */}
                    <div className="flex items-center justify-between px-6 py-4 border-t border-outline-variant/10 bg-surface-container-low/50">
                        <button 
                            disabled={currentPage === 1 || isLoading}
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-bright text-on-surface-variant disabled:opacity-50 transition-colors text-sm font-bold tracking-wider"
                        >
                            PREVIOUS
                        </button>
                        <div className="flex gap-2 text-sm overflow-x-auto no-scrollbar px-2">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`min-w-[32px] h-8 px-2 rounded-full flex items-center justify-center transition-colors ${currentPage === page ? 'bg-primary text-background font-bold' : 'text-on-surface-variant hover:bg-surface-bright'}`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                        <button 
                            disabled={currentPage === totalPages || totalPages === 0 || isLoading}
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-bright text-on-surface-variant disabled:opacity-50 transition-colors text-sm font-bold tracking-wider"
                        >
                            NEXT
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default FinanceHistory;
