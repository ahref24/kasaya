import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction, Budget, Goal, Category, Settings } from '../models';
import { ALL_DEFAULT_CATEGORIES } from '../constants/categories';

const KEYS = {
    TRANSACTIONS: '@kasaya_transactions',
    BUDGETS: '@kasaya_budgets',
    GOALS: '@kasaya_goals',
    CATEGORIES: '@kasaya_categories',
    SETTINGS: '@kasaya_settings',
};

const DEFAULT_SETTINGS: Settings = {
    currency: 'PHP',
    currencySymbol: '₱',
    theme: 'system',
    isFirstRun: true,
};

export const Storage = {
    async getTransactions(): Promise<Transaction[]> {
        const data = await AsyncStorage.getItem(KEYS.TRANSACTIONS);
        return data ? JSON.parse(data) : [];
    },
    async saveTransactions(transactions: Transaction[]): Promise<void> {
        await AsyncStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
    },

    async getBudgets(): Promise<Budget[]> {
        const data = await AsyncStorage.getItem(KEYS.BUDGETS);
        return data ? JSON.parse(data) : [];
    },
    async saveBudgets(budgets: Budget[]): Promise<void> {
        await AsyncStorage.setItem(KEYS.BUDGETS, JSON.stringify(budgets));
    },

    async getGoals(): Promise<Goal[]> {
        const data = await AsyncStorage.getItem(KEYS.GOALS);
        return data ? JSON.parse(data) : [];
    },
    async saveGoals(goals: Goal[]): Promise<void> {
        await AsyncStorage.setItem(KEYS.GOALS, JSON.stringify(goals));
    },

    async getCategories(): Promise<Category[]> {
        const data = await AsyncStorage.getItem(KEYS.CATEGORIES);
        return data ? JSON.parse(data) : ALL_DEFAULT_CATEGORIES;
    },
    async saveCategories(categories: Category[]): Promise<void> {
        await AsyncStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories));
    },

    async getSettings(): Promise<Settings> {
        const data = await AsyncStorage.getItem(KEYS.SETTINGS);
        return data ? JSON.parse(data) : DEFAULT_SETTINGS;
    },
    async saveSettings(settings: Settings): Promise<void> {
        await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    },

    async clearAll(): Promise<void> {
        await AsyncStorage.multiRemove(Object.values(KEYS));
    },
};
