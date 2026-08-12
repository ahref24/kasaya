import { Category } from '../models';

export const DEFAULT_EXPENSE_CATEGORIES: Category[] = [
    { id: 'exp_food', name: 'Food', type: 'expense', icon: 'fast-food' },
    { id: 'exp_transport', name: 'Transportation', type: 'expense', icon: 'car' },
    { id: 'exp_bills', name: 'Bills', type: 'expense', icon: 'document-text' },
    { id: 'exp_shopping', name: 'Shopping', type: 'expense', icon: 'cart' },
    { id: 'exp_ent', name: 'Entertainment', type: 'expense', icon: 'game-controller' },
    { id: 'exp_health', name: 'Health', type: 'expense', icon: 'medkit' },
    { id: 'exp_edu', name: 'Education', type: 'expense', icon: 'school' },
    { id: 'exp_family', name: 'Family', type: 'expense', icon: 'people' },
    { id: 'exp_travel', name: 'Travel', type: 'expense', icon: 'airplane' },
    { id: 'exp_personal', name: 'Personal', type: 'expense', icon: 'person' },
    { id: 'exp_subs', name: 'Subscriptions', type: 'expense', icon: 'calendar' },
    { id: 'exp_other', name: 'Other', type: 'expense', icon: 'ellipsis-horizontal' },
];

export const DEFAULT_INCOME_CATEGORIES: Category[] = [
    { id: 'inc_salary', name: 'Salary', type: 'income', icon: 'cash' },
    { id: 'inc_freelance', name: 'Freelance', type: 'income', icon: 'laptop' },
    { id: 'inc_business', name: 'Business', type: 'income', icon: 'briefcase' },
    { id: 'inc_bonus', name: 'Bonus', type: 'income', icon: 'gift' },
    { id: 'inc_gift', name: 'Gift', type: 'income', icon: 'heart' },
    { id: 'inc_invest', name: 'Investment', type: 'income', icon: 'trending-up' },
    { id: 'inc_other', name: 'Other', type: 'income', icon: 'ellipsis-horizontal' },
];

export const ALL_DEFAULT_CATEGORIES = [...DEFAULT_EXPENSE_CATEGORIES, ...DEFAULT_INCOME_CATEGORIES];
