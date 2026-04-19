import React, { createContext, useState, useEffect } from 'react';
import { getTransactions, createTransaction, deleteTransactionAPI } from '../services/api';

export const FinanceContext = createContext();

export const FinanceProvider = ({ children }) => {
    const [expenses, setExpenses] = useState([]);
    const [incomes, setIncomes] = useState([]);
    const [savingsEntries, setSavingsEntries] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchTransactions = async () => {
        try {
            const data = await getTransactions();
            const parseFloatAmt = (d) => ({ ...d, amount: parseFloat(d.amount), type: d.payment_method }); 
            
            setExpenses(data.filter(t => t.transaction_type === 'EXPENSE').map(parseFloatAmt));
            setIncomes(data.filter(t => t.transaction_type === 'INCOME').map(parseFloatAmt));
            setSavingsEntries(data.filter(t => t.transaction_type === 'SAVING').map(parseFloatAmt));
        } catch (error) {
            console.error("Failed to fetch finance records:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    // Derived State
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    const totalIncome = incomes.reduce((s, e) => s + e.amount, 0);
    const savings = totalIncome - totalExpenses + savingsEntries.reduce((s, e) => s + e.amount, 0);

    // Mutations
    const addExpense = async (entry) => {
        try {
            const payload = { ...entry, transaction_type: 'EXPENSE', payment_method: entry.type };
            delete payload.id; 
            delete payload.type; 
            const res = await createTransaction(payload);
            setExpenses([{ ...res, amount: parseFloat(res.amount), type: res.payment_method }, ...expenses]);
        } catch (error) { console.error("Expense post failed:", error); }
    };

    const addIncome = async (entry) => {
        try {
            const payload = { ...entry, transaction_type: 'INCOME' };
            delete payload.id;
            const res = await createTransaction(payload);
            setIncomes([{ ...res, amount: parseFloat(res.amount) }, ...incomes]);
        } catch (error) { console.error("Income post failed:", error); }
    };

    const addSavings = async (entry) => {
        try {
            const payload = { ...entry, transaction_type: 'SAVING' };
            delete payload.id;
            const res = await createTransaction(payload);
            setSavingsEntries([{ ...res, amount: parseFloat(res.amount) }, ...savingsEntries]);
        } catch (error) { console.error("Savings post failed:", error); }
    };

    const deleteExpense = async (id) => {
        try { 
            await deleteTransactionAPI(id); 
            setExpenses(expenses.filter(e => e.id !== id)); 
        } catch(e) { console.error(e) }
    };
    
    const deleteIncome = async (id) => {
        try { 
            await deleteTransactionAPI(id); 
            setIncomes(incomes.filter(e => e.id !== id)); 
        } catch(e) { console.error(e) }
    };
    
    const deleteSavings = async (id) => {
        try { 
            await deleteTransactionAPI(id); 
            setSavingsEntries(savingsEntries.filter(e => e.id !== id)); 
        } catch(e) { console.error(e) }
    };

    return (
        <FinanceContext.Provider
            value={{
                expenses, setExpenses, addExpense, deleteExpense,
                incomes, setIncomes, addIncome, deleteIncome,
                savingsEntries, setSavingsEntries, addSavings, deleteSavings,
                totalExpenses, totalIncome, savings, isLoading
            }}
        >
            {children}
        </FinanceContext.Provider>
    );
};
