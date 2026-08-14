import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Transaction, Budget, Goal, Category, Settings } from '../models';
import { Storage } from '../storage/storage';

interface FinanceContextType {
    transactions: Transaction[];
    budgets: Budget[];
    goals: Goal[];
    categories: Category[];
    settings: Settings;
    isLoading: boolean;

    // Actions
    addTransaction: (t: Transaction) => Promise<void>;
    updateTransaction: (t: Transaction) => Promise<void>;
    deleteTransaction: (id: string) => Promise<void>;

    addBudget: (b: Budget) => Promise<void>;
    updateBudget: (b: Budget) => Promise<void>;
    deleteBudget: (id: string) => Promise<void>;

    addGoal: (g: Goal) => Promise<void>;
    updateGoal: (g: Goal) => Promise<void>;
    deleteGoal: (id: string) => Promise<void>;

    updateSettings: (s: Partial<Settings>) => Promise<void>;

    clearAllData: () => Promise<void>;

    importData: (data: { transactions: Transaction[]; budgets: Budget[]; goals: Goal[]; categories: Category[]; settings: Settings }) => Promise<void>;

    // Computed
    totalIncome: number;
    totalExpenses: number;
    availableBalance: number;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider = ({ children }: { children: ReactNode }) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [settings, setSettings] = useState<Settings>({
        currency: 'PHP',
        currencySymbol: '₱',
        theme: 'system',
        isFirstRun: true,
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [t, b, g, c, s] = await Promise.all([
                Storage.getTransactions(),
                Storage.getBudgets(),
                Storage.getGoals(),
                Storage.getCategories(),
                Storage.getSettings(),
            ]);
            setTransactions(t);
            setBudgets(b);
            setGoals(g);
            setCategories(c);
            setSettings(s);
        } catch (error) {
            console.error('Error loading data', error);
        } finally {
            setIsLoading(false);
        }
    };

    const addTransaction = async (t: Transaction) => {
        const newData = [t, ...transactions];
        setTransactions(newData);
        await Storage.saveTransactions(newData);
    };

    const updateTransaction = async (t: Transaction) => {
        const newData = transactions.map(x => x.id === t.id ? t : x);
        setTransactions(newData);
        await Storage.saveTransactions(newData);
    };

    const deleteTransaction = async (id: string) => {
        const newData = transactions.filter(x => x.id !== id);
        setTransactions(newData);
        await Storage.saveTransactions(newData);
    };

    const addBudget = async (b: Budget) => {
        const newData = [...budgets, b];
        setBudgets(newData);
        await Storage.saveBudgets(newData);
    };

    const updateBudget = async (b: Budget) => {
        const newData = budgets.map(x => x.id === b.id ? b : x);
        setBudgets(newData);
        await Storage.saveBudgets(newData);
    };

    const deleteBudget = async (id: string) => {
        const newData = budgets.filter(x => x.id !== id);
        setBudgets(newData);
        await Storage.saveBudgets(newData);
    };

    const addGoal = async (g: Goal) => {
        const newData = [...goals, g];
        setGoals(newData);
        await Storage.saveGoals(newData);
    };

    const updateGoal = async (g: Goal) => {
        const newData = goals.map(x => x.id === g.id ? g : x);
        setGoals(newData);
        await Storage.saveGoals(newData);
    };

    const deleteGoal = async (id: string) => {
        const newData = goals.filter(x => x.id !== id);
        setGoals(newData);
        await Storage.saveGoals(newData);
    };

    const updateSettings = async (s: Partial<Settings>) => {
        const newSettings = { ...settings, ...s };
        setSettings(newSettings);
        await Storage.saveSettings(newSettings);
    };

    const clearAllData = async () => {
        await Storage.clearAll();
        setTransactions([]);
        setBudgets([]);
        setGoals([]);
        const c = await Storage.getCategories();
        setCategories(c);
        setSettings({
            currency: 'PHP',
            currencySymbol: '₱',
            theme: 'system',
            isFirstRun: true,
        });
    };

    const importData = async (data: { transactions: Transaction[]; budgets: Budget[]; goals: Goal[]; categories: Category[]; settings: Settings }) => {
        setTransactions(data.transactions);
        setBudgets(data.budgets);
        setGoals(data.goals);
        setCategories(data.categories);
        setSettings(data.settings);

        await Promise.all([
            Storage.saveTransactions(data.transactions),
            Storage.saveBudgets(data.budgets),
            Storage.saveGoals(data.goals),
            Storage.saveCategories(data.categories),
            Storage.saveSettings(data.settings),
        ]);
    };

    const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const availableBalance = totalIncome - totalExpenses;

    return (
        <FinanceContext.Provider value={{
            transactions,
            budgets,
            goals,
            categories,
            settings,
            isLoading,
            addTransaction,
            updateTransaction,
            deleteTransaction,
            addBudget,
            updateBudget,
            deleteBudget,
            addGoal,
            updateGoal,
            deleteGoal,
            updateSettings,
            clearAllData,
            importData,
            totalIncome,
            totalExpenses,
            availableBalance
        }}>
            {children}
        </FinanceContext.Provider>
    );
};

export const useFinance = () => {
    const context = useContext(FinanceContext);
    if (context === undefined) {
        throw new Error('useFinance must be used within a FinanceProvider');
    }
    return context;
};
