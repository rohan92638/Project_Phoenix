import React, { createContext, useState, useEffect } from 'react';
import { getTransactions, createTransaction, deleteTransactionAPI, getFinanceSummary, getSpendingInsight } from '../services/api';

export const FinanceContext = createContext();

export const FinanceProvider = ({ children }) => {
    const [expenses, setExpenses] = useState([]);
    const [incomes, setIncomes] = useState([]);
    const [savingsEntries, setSavingsEntries] = useState([]);
    const [dashboardData, setDashboardData] = useState({ income: 0, expenses: 0, savings: 0, saving_ratio: 0 });
    const [insightMsg, setInsightMsg] = useState('');
    const [anomalyAlert, setAnomalyAlert] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchTransactions = async () => {
        try {
            const [data, summaryResult, insightResult] = await Promise.all([
                getTransactions(),
                getFinanceSummary(),
                getSpendingInsight()
            ]);
            
            const parseFloatAmt = (d) => ({ ...d, amount: parseFloat(d.amount), type: d.payment_method }); 
            
            setExpenses(data.filter(t => t.transaction_type === 'EXPENSE').map(parseFloatAmt));
            setIncomes(data.filter(t => t.transaction_type === 'INCOME').map(parseFloatAmt));
            setSavingsEntries(data.filter(t => t.transaction_type === 'SAVING').map(parseFloatAmt));
            
            setDashboardData(summaryResult);
            if (insightResult && insightResult.insight) {
                setInsightMsg(insightResult.insight);
            }
        } catch (error) {
            console.error("Failed to fetch finance records:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const refreshSummary = async () => {
        try {
            const summaryResult = await getFinanceSummary();
            setDashboardData(summaryResult);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    // Mutations
    const addExpense = async (entry) => {
        try {
            const payload = { ...entry, transaction_type: 'EXPENSE', payment_method: entry.type };
            delete payload.id; 
            delete payload.type; 
            const res = await createTransaction(payload);
            
            if (res.alert) {
                setAnomalyAlert(res.alert);
                setTimeout(() => setAnomalyAlert(null), 5000);
            }
            
            setExpenses([{ ...res, amount: parseFloat(res.amount), type: res.payment_method }, ...expenses]);
            await refreshSummary();
        } catch (error) { console.error("Expense post failed:", error); }
    };

    const addIncome = async (entry) => {
        try {
            const payload = { ...entry, transaction_type: 'INCOME' };
            delete payload.id;
            const res = await createTransaction(payload);
            setIncomes([{ ...res, amount: parseFloat(res.amount) }, ...incomes]);
            await refreshSummary();
        } catch (error) { console.error("Income post failed:", error); }
    };

    const addSavings = async (entry) => {
        try {
            const payload = { ...entry, transaction_type: 'SAVING' };
            delete payload.id;
            const res = await createTransaction(payload);
            setSavingsEntries([{ ...res, amount: parseFloat(res.amount) }, ...savingsEntries]);
            await refreshSummary();
        } catch (error) { console.error("Savings post failed:", error); }
    };

    const deleteExpense = async (id) => {
        try { 
            await deleteTransactionAPI(id); 
            setExpenses(expenses.filter(e => e.id !== id)); 
            await refreshSummary();
        } catch(e) { console.error(e) }
    };
    
    const deleteIncome = async (id) => {
        try { 
            await deleteTransactionAPI(id); 
            setIncomes(incomes.filter(e => e.id !== id)); 
            await refreshSummary();
        } catch(e) { console.error(e) }
    };
    
    const deleteSavings = async (id) => {
        try { 
            await deleteTransactionAPI(id); 
            setSavingsEntries(savingsEntries.filter(e => e.id !== id)); 
            await refreshSummary();
        } catch(e) { console.error(e) }
    };

    return (
        <FinanceContext.Provider
            value={{
                expenses, setExpenses, addExpense, deleteExpense,
                incomes, setIncomes, addIncome, deleteIncome,
                savingsEntries, setSavingsEntries, addSavings, deleteSavings,
                totalExpenses: dashboardData.expenses, 
                totalIncome: dashboardData.income, 
                savings: dashboardData.savings, 
                savingRatio: dashboardData.saving_ratio,
                insightMsg, anomalyAlert,
                isLoading
            }}
        >
            {children}
        </FinanceContext.Provider>
    );
};
