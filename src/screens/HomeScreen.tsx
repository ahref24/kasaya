import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/currency';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
    const { settings, totalIncome, totalExpenses, availableBalance, transactions, categories, budgets } = useFinance();
    const [showBalance, setShowBalance] = useState(true);
    const navigation = useNavigation<any>();

    const recentTransactions = transactions
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

    const totalSavings = transactions.reduce((acc, t) => {
        // If you had a mechanism to track savings deposits vs just income - expenses
        return acc;
    }, 0);

    // For budget display
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    // Filter for current month transactions
    const currentMonthExpenses = transactions
        .filter(t => t.type === 'expense')
        .filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        })
        .reduce((acc, t) => acc + t.amount, 0);

    const totalBudget = budgets.reduce((acc, b) => acc + b.amount, 0);
    const budgetProgress = totalBudget > 0 ? Math.min(currentMonthExpenses / totalBudget, 1) : 0;
    const budgetPercentage = totalBudget > 0 ? Math.round((currentMonthExpenses / totalBudget) * 100) : 0;

    const getCategoryIcon = (categoryId: string) => {
        const cat = categories.find(c => c.id === categoryId);
        return cat ? cat.icon : 'list';
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Good morning 👋</Text>
                        <Text style={styles.name}>{settings.name || 'User'}</Text>
                    </View>
                    <TouchableOpacity style={styles.profileBtn}>
                        <Ionicons name="person-circle" size={40} color={theme.colors.primary} />
                    </TouchableOpacity>
                </View>

                {/* Balance Card */}
                <View style={styles.balanceCard}>
                    <View style={styles.balanceHeader}>
                        <Text style={styles.balanceLabel}>Available Balance</Text>
                        <TouchableOpacity onPress={() => setShowBalance(!showBalance)}>
                            <Ionicons name={showBalance ? 'eye' : 'eye-off'} size={20} color={theme.colors.white} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.balanceAmount}>
                        {showBalance ? formatCurrency(availableBalance, settings.currencySymbol) : '••••••'}
                    </Text>
                </View>

                {/* Summary Cards */}
                <View style={styles.summaryContainer}>
                    <View style={[styles.summaryCard, { backgroundColor: '#e6f4ea' }]}>
                        <Text style={styles.summaryLabel}>Income</Text>
                        <Text style={[styles.summaryValue, { color: theme.colors.income }]}>
                            {formatCurrency(totalIncome, settings.currencySymbol)}
                        </Text>
                    </View>
                    <View style={[styles.summaryCard, { backgroundColor: '#fce8e8' }]}>
                        <Text style={styles.summaryLabel}>Expenses</Text>
                        <Text style={[styles.summaryValue, { color: theme.colors.expense }]}>
                            {formatCurrency(totalExpenses, settings.currencySymbol)}
                        </Text>
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionsContainer}>
                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => navigation.navigate('AddTransaction', { type: 'expense' })}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: '#fce8e8' }]}>
                            <Ionicons name="arrow-down" size={24} color={theme.colors.expense} />
                        </View>
                        <Text style={styles.actionText}>Expense</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => navigation.navigate('AddTransaction', { type: 'income' })}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: '#e6f4ea' }]}>
                            <Ionicons name="arrow-up" size={24} color={theme.colors.income} />
                        </View>
                        <Text style={styles.actionText}>Income</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Budget')}>
                        <View style={[styles.actionIcon, { backgroundColor: '#e0e7ff' }]}>
                            <Ionicons name="pie-chart" size={24} color="#4f46e5" />
                        </View>
                        <Text style={styles.actionText}>Budget</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Goals')}>
                        <View style={[styles.actionIcon, { backgroundColor: '#fef3c7' }]}>
                            <Ionicons name="flag" size={24} color="#d97706" />
                        </View>
                        <Text style={styles.actionText}>Goal</Text>
                    </TouchableOpacity>
                </View>

                {/* Budget Summary */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Monthly Budget</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('AddBudget')}>
                            <Text style={styles.seeAll}>+ Add Budget</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate('Budget')} activeOpacity={0.4}>
                        <View style={styles.budgetCard}>
                            <View style={styles.budgetRow}>
                                <Text style={styles.budgetSpent}>
                                    {formatCurrency(currentMonthExpenses, settings.currencySymbol)} spent
                                </Text>
                                <Text style={styles.budgetTotal}>
                                    of {formatCurrency(totalBudget, settings.currencySymbol)}
                                </Text>
                            </View>
                            <View style={styles.progressBarBg}>
                                <View
                                    style={[
                                        styles.progressBarFill,
                                        { width: `${budgetPercentage > 100 ? 100 : budgetPercentage}%` },
                                        budgetPercentage > 90 ? { backgroundColor: theme.colors.expense } : {}
                                    ]}
                                />
                            </View>
                            <Text style={styles.budgetPercent}>{budgetPercentage}% used</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Recent Transactions */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Transactions</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
                            <Text style={styles.seeAll}>See All</Text>
                        </TouchableOpacity>
                    </View>

                    {recentTransactions.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateText}>No transactions yet.</Text>
                            <Text style={styles.emptyStateSubtext}>Your financial journey starts here.</Text>
                        </View>
                    ) : (
                        recentTransactions.map(t => (
                            <View key={t.id} style={styles.transactionItem}>
                                <View style={styles.transactionLeft}>
                                    <View style={[styles.iconContainer, { backgroundColor: t.type === 'income' ? '#e6f4ea' : '#fce8e8' }]}>
                                        <Ionicons name={getCategoryIcon(t.categoryId) as any} size={20} color={t.type === 'income' ? theme.colors.income : theme.colors.expense} />
                                    </View>
                                    <View>
                                        <Text style={styles.transactionTitle}>{t.title}</Text>
                                        <Text style={styles.transactionDate}>
                                            {new Date(t.date).toLocaleDateString()}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={[styles.transactionAmount, { color: t.type === 'income' ? theme.colors.income : theme.colors.text }]}>
                                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, settings.currencySymbol)}
                                </Text>
                            </View>
                        ))
                    )}
                </View>

                <View style={{ height: 80 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing.lg,
    },
    greeting: {
        fontSize: theme.typography.body.fontSize,
        color: theme.colors.textSecondary,
    },
    name: {
        fontSize: theme.typography.h2.fontSize,
        fontWeight: theme.typography.h2.fontWeight,
        color: theme.colors.text,
    },
    profileBtn: {
        padding: theme.spacing.xs,
    },
    balanceCard: {
        marginHorizontal: theme.spacing.lg,
        backgroundColor: theme.colors.primary,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        ...theme.shadows.medium,
    },
    balanceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.sm,
    },
    balanceLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: theme.typography.body.fontSize,
    },
    balanceAmount: {
        color: theme.colors.white,
        fontSize: 36,
        fontWeight: '700',
    },
    summaryContainer: {
        flexDirection: 'row',
        paddingHorizontal: theme.spacing.lg,
        marginTop: theme.spacing.md,
        gap: theme.spacing.md,
    },
    summaryCard: {
        flex: 1,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
    },
    summaryLabel: {
        fontSize: theme.typography.caption.fontSize,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.xs,
    },
    summaryValue: {
        fontSize: theme.typography.h3.fontSize,
        fontWeight: theme.typography.h3.fontWeight,
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.lg,
        marginTop: theme.spacing.lg,
    },
    actionBtn: {
        alignItems: 'center',
    },
    actionIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.xs,
    },
    actionText: {
        fontSize: theme.typography.caption.fontSize,
        color: theme.colors.text,
        fontWeight: '500',
    },
    section: {
        paddingHorizontal: theme.spacing.lg,
        marginTop: theme.spacing.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    sectionTitle: {
        fontSize: theme.typography.h3.fontSize,
        fontWeight: theme.typography.h3.fontWeight,
        color: theme.colors.text,
        marginBottom: theme.spacing.md,
    },
    seeAll: {
        color: theme.colors.primary,
        fontWeight: '600',
    },
    budgetCard: {
        backgroundColor: theme.colors.card,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        ...theme.shadows.small,
    },
    budgetRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: theme.spacing.sm,
    },
    budgetSpent: {
        fontSize: theme.typography.bodyLarge.fontSize,
        fontWeight: '600',
        color: theme.colors.text,
    },
    budgetTotal: {
        fontSize: theme.typography.bodySmall.fontSize,
        color: theme.colors.textSecondary,
    },
    progressBarBg: {
        height: 8,
        backgroundColor: theme.colors.border,
        borderRadius: 4,
        marginBottom: theme.spacing.xs,
    },
    progressBarFill: {
        height: 8,
        backgroundColor: theme.colors.primary,
        borderRadius: 4,
    },
    budgetPercent: {
        fontSize: theme.typography.caption.fontSize,
        color: theme.colors.textSecondary,
        textAlign: 'right',
    },
    transactionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: theme.colors.card,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        marginBottom: theme.spacing.sm,
        ...theme.shadows.small,
    },
    transactionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.md,
    },
    transactionTitle: {
        fontSize: theme.typography.bodyLarge.fontSize,
        fontWeight: '600',
        color: theme.colors.text,
    },
    transactionDate: {
        fontSize: theme.typography.caption.fontSize,
        color: theme.colors.textSecondary,
    },
    transactionAmount: {
        fontSize: theme.typography.bodyLarge.fontSize,
        fontWeight: '700',
    },
    emptyState: {
        alignItems: 'center',
        padding: theme.spacing.xl,
        backgroundColor: theme.colors.card,
        borderRadius: theme.borderRadius.md,
    },
    emptyStateText: {
        fontSize: theme.typography.bodyLarge.fontSize,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    emptyStateSubtext: {
        fontSize: theme.typography.bodySmall.fontSize,
        color: theme.colors.textSecondary,
    }
});
