export interface Transaction {
    id: string;
    type: 'income' | 'expense';
    amount: number;
    title: string;
    categoryId: string;
    notes?: string;
    date: string; // ISO format
    paymentMethod?: string;
    recurring?: boolean;
    createdAt: string;
}

export interface Budget {
    id: string;
    name: string;
    amount: number;
    categoryId?: string;
    period: 'weekly' | 'monthly';
    startDate: string;
    endDate?: string;
}

export interface Goal {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    targetDate?: string;
    icon?: string;
    description?: string;
    createdAt: string;
}

export interface Category {
    id: string;
    name: string;
    type: 'income' | 'expense';
    icon: string;
}

export interface Settings {
    currency: string;
    currencySymbol: string;
    theme: 'light' | 'dark' | 'system';
    name?: string;
    monthlyIncome?: number;
    isFirstRun: boolean;
}
