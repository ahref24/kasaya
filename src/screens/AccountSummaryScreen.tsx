import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useFinance } from '../context/FinanceContext';
import { theme } from '../constants/theme';
import { formatCurrency } from '../utils/currency';

export default function AccountSummaryScreen() {
    const navigation = useNavigation<any>();
    const { transactions, settings, categories } = useFinance();
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const monthlyTransactions = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });

    const totalIncome = monthlyTransactions
        .filter(t => t.type === 'income')
        .reduce((acc, t) => acc + t.amount, 0);

    const totalExpenses = monthlyTransactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => acc + t.amount, 0);

    const balance = totalIncome - totalExpenses;

    const categoryBreakdown = monthlyTransactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
            acc[t.categoryId] = (acc[t.categoryId] || 0) + t.amount;
            return acc;
        }, {} as Record<string, number>);

    const monthName = new Date(selectedYear, selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const goToPrevMonth = () => {
        if (selectedMonth === 0) {
            setSelectedMonth(11);
            setSelectedYear(selectedYear - 1);
        } else {
            setSelectedMonth(selectedMonth - 1);
        }
    };

    const goToNextMonth = () => {
        if (selectedMonth === 11) {
            setSelectedMonth(0);
            setSelectedYear(selectedYear + 1);
        } else {
            setSelectedMonth(selectedMonth + 1);
        }
    };

    const isCurrentMonth = selectedMonth === new Date().getMonth() && selectedYear === new Date().getFullYear();

    const handleCategoryPress = (categoryId: string) => {
        navigation.navigate('Transactions', {
            categoryId,
            month: selectedMonth,
            year: selectedYear,
        });
    };

    const renderCategoryItem = ({ item }: { item: { categoryId: string; amount: number } }) => {
        const cat = categories.find(c => c.id === item.categoryId);
        const percentage = totalExpenses > 0 ? (item.amount / totalExpenses) * 100 : 0;
        return (
            <TouchableOpacity style={styles.categoryItem} onPress={() => handleCategoryPress(item.categoryId)} activeOpacity={0.7}>
                <View style={styles.categoryLeft}>
                    <View style={[styles.catIconContainer, { backgroundColor: theme.colors.expense + '20' }]}>
                        <Ionicons name={cat?.icon as any || 'help-outline'} size={18} color={theme.colors.expense} />
                    </View>
                    <Text style={styles.categoryName}>{cat?.name || 'Unknown'}</Text>
                </View>
                <View style={styles.categoryRight}>
                    <Text style={styles.categoryAmount}>{formatCurrency(item.amount, settings.currencySymbol)}</Text>
                    <Text style={styles.categoryPercent}>{percentage.toFixed(1)}%</Text>
                    <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} />
                </View>
            </TouchableOpacity>
        );
    };

    const sortedCategoryBreakdown = Object.entries(categoryBreakdown)
        .map(([categoryId, amount]) => ({ categoryId, amount }))
        .sort((a, b) => b.amount - a.amount);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Account Summary</Text>
            </View>

            <View style={styles.monthSelector}>
                <TouchableOpacity onPress={goToPrevMonth} style={styles.monthBtn}>
                    <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={styles.monthText}>{monthName}</Text>
                <TouchableOpacity onPress={goToNextMonth} style={[styles.monthBtn, !isCurrentMonth && styles.monthBtnActive]} disabled={isCurrentMonth}>
                    <Ionicons name="chevron-forward" size={24} color={isCurrentMonth ? theme.colors.textSecondary : theme.colors.text} />
                </TouchableOpacity>
            </View>

            <View style={styles.summaryCards}>
                <View style={[styles.summaryCard, { backgroundColor: theme.colors.income + '15' }]}>
                    <View style={styles.summaryIcon}>
                        <Ionicons name="arrow-down" size={20} color={theme.colors.income} />
                    </View>
                    <Text style={styles.summaryLabel}>Income</Text>
                    <Text style={[styles.summaryAmount, { color: theme.colors.income }]}>
                        {formatCurrency(totalIncome, settings.currencySymbol)}
                    </Text>
                </View>

                <View style={[styles.summaryCard, { backgroundColor: theme.colors.expense + '15' }]}>
                    <View style={styles.summaryIcon}>
                        <Ionicons name="arrow-up" size={20} color={theme.colors.expense} />
                    </View>
                    <Text style={styles.summaryLabel}>Expenses</Text>
                    <Text style={[styles.summaryAmount, { color: theme.colors.expense }]}>
                        {formatCurrency(totalExpenses, settings.currencySymbol)}
                    </Text>
                </View>

                <View style={[styles.summaryCard, { backgroundColor: theme.colors.primary + '15' }]}>
                    <View style={styles.summaryIcon}>
                        <Ionicons name="wallet" size={20} color={theme.colors.primary} />
                    </View>
                    <Text style={styles.summaryLabel}>Balance</Text>
                    <Text style={[styles.summaryAmount, { color: balance >= 0 ? theme.colors.primary : theme.colors.expense }]}>
                        {formatCurrency(balance, settings.currencySymbol)}
                    </Text>
                </View>
            </View>

            <View style={styles.breakdownSection}>
                <Text style={styles.breakdownTitle}>Expense Breakdown</Text>
                {sortedCategoryBreakdown.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateText}>No expenses this month.</Text>
                    </View>
                ) : (
                    <FlatList
                        data={sortedCategoryBreakdown}
                        renderItem={renderCategoryItem}
                        keyExtractor={item => item.categoryId}
                        contentContainerStyle={styles.breakdownList}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        padding: theme.spacing.lg,
    },
    title: {
        fontSize: theme.typography.h1.fontSize,
        fontWeight: theme.typography.h1.fontWeight,
        color: theme.colors.text,
    },
    monthSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: theme.spacing.lg,
        marginBottom: theme.spacing.lg,
        gap: theme.spacing.lg,
    },
    monthBtn: {
        padding: theme.spacing.sm,
    },
    monthBtnActive: {
        opacity: 1,
    },
    monthText: {
        fontSize: theme.typography.h3.fontSize,
        fontWeight: theme.typography.h3.fontWeight,
        color: theme.colors.text,
        minWidth: 180,
        textAlign: 'center',
    },
    summaryCards: {
        flexDirection: 'row',
        paddingHorizontal: theme.spacing.lg,
        gap: theme.spacing.md,
        marginBottom: theme.spacing.xl,
    },
    summaryCard: {
        flex: 1,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
    },
    summaryIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.xs,
    },
    summaryLabel: {
        fontSize: theme.typography.caption.fontSize,
        color: theme.colors.textSecondary,
        fontWeight: '600',
        marginBottom: theme.spacing.xs,
    },
    summaryAmount: {
        fontSize: theme.typography.bodyLarge.fontSize,
        fontWeight: '700',
    },
    breakdownSection: {
        flex: 1,
        paddingHorizontal: theme.spacing.lg,
    },
    breakdownTitle: {
        fontSize: theme.typography.h3.fontSize,
        fontWeight: theme.typography.h3.fontWeight,
        color: theme.colors.text,
        marginBottom: theme.spacing.md,
    },
    breakdownList: {
        paddingBottom: 80,
    },
    categoryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: theme.colors.card,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        marginBottom: theme.spacing.sm,
        ...theme.shadows.small,
    },
    categoryLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
    },
    catIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoryName: {
        fontSize: theme.typography.body.fontSize,
        fontWeight: '600',
        color: theme.colors.text,
    },
    categoryRight: {
        alignItems: 'flex-end',
    },
    categoryAmount: {
        fontSize: theme.typography.body.fontSize,
        fontWeight: '700',
        color: theme.colors.text,
    },
    categoryPercent: {
        fontSize: theme.typography.caption.fontSize,
        color: theme.colors.textSecondary,
    },
    emptyState: {
        alignItems: 'center',
        padding: theme.spacing.xl,
    },
    emptyStateText: {
        fontSize: theme.typography.body.fontSize,
        color: theme.colors.textSecondary,
    }
});
