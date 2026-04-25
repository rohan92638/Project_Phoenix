import React, { createContext, useState, useEffect } from 'react';
import { getTransactions, createTransaction, deleteTransactionAPI, getFinanceSummary, getSpendingInsight, getBudgetPrediction } from '../services/api';

export const FinanceContext = createContext();

export const FinanceProvider = ({ children }) => {
    const [expenses, setExpenses] = useState([]);
    const [incomes, setIncomes] = useState([]);
    const [savingsEntries, setSavingsEntries] = useState([]);
    const [dashboardData, setDashboardData] = useState({ income: 0, expenses: 0, savings: 0, saving_ratio: 0 });
    const [insightMsg, setInsightMsg] = useState(null);
    const [anomalyAlert, setAnomalyAlert] = useState(null);
    const [budgetAlert, setBudgetAlert] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [targetBudget, setTargetBudgetState] = useState(() => {
        return parseFloat(localStorage.getItem('targetBudget')) || 20000;
    });

    const setTargetBudget = (value) => {
        localStorage.setItem('targetBudget', value);
        setTargetBudgetState(value);
    };

    const fetchTransactions = async () => {
        try {
            // 1. Fetch Summary first
            const summaryResult = await getFinanceSummary();

            // 2. Fetch the rest using the user's target budget
            const [dataRes, insightResult, budgetResult] = await Promise.all([
                getTransactions(1, '', 100),
                getSpendingInsight(),
                getBudgetPrediction(targetBudget)
            ]);

            const data = dataRes.results || dataRes;
            const parseFloatAmt = (d) => ({ ...d, amount: parseFloat(d.amount), type: d.payment_method });

            setExpenses(data.filter(t => t.transaction_type === 'EXPENSE').map(parseFloatAmt));
            setIncomes(data.filter(t => t.transaction_type === 'INCOME').map(parseFloatAmt));
            setSavingsEntries(data.filter(t => t.transaction_type === 'SAVING').map(parseFloatAmt));

            setDashboardData(summaryResult);
            if (insightResult && insightResult.insight) {
                setInsightMsg(insightResult.insight);
            }
            if (budgetResult) {
                setBudgetAlert(budgetResult.alert || budgetResult.status || null);
            }
        } catch (error) {
            console.error("Failed to fetch finance records:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const refreshSummary = async () => {
        try {
            // Fetch summary first
            const summaryResult = await getFinanceSummary();

            const [insightResult, budgetResult] = await Promise.all([
                getSpendingInsight(),
                getBudgetPrediction(targetBudget)
            ]);

            setDashboardData(summaryResult);
            if (insightResult && insightResult.insight) {
                setInsightMsg(insightResult.insight);
            }
            if (budgetResult) {
                setBudgetAlert(budgetResult.alert || budgetResult.status || null);
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            fetchTransactions();
        } else {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!isLoading) {
            refreshSummary();
        }
    }, [targetBudget]);

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
        } catch (e) { console.error(e) }
    };

    const deleteIncome = async (id) => {
        try {
            await deleteTransactionAPI(id);
            setIncomes(incomes.filter(e => e.id !== id));
            await refreshSummary();
        } catch (e) { console.error(e) }
    };

    const deleteSavings = async (id) => {
        try {
            await deleteTransactionAPI(id);
            setSavingsEntries(savingsEntries.filter(e => e.id !== id));
            await refreshSummary();
        } catch (e) { console.error(e) }
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
                insightMsg, anomalyAlert, budgetAlert,
                isLoading, targetBudget, setTargetBudget
            }}
        >
            {children}
        </FinanceContext.Provider>
    );
};
