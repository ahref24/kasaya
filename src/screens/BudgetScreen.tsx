import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useFinance } from '../context/FinanceContext';
import { theme } from '../constants/theme';
import { formatCurrency } from '../utils/currency';

export default function BudgetScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { budgets, transactions, settings, categories, deleteBudget } = useFinance();

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const getBudgetExpenses = (categoryId?: string) => {
        return transactions
            .filter(t => t.type === 'expense')
            .filter(t => {
                const d = new Date(t.date);
                return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            })
            .filter(t => !categoryId || t.categoryId === categoryId)
            .reduce((acc, t) => acc + t.amount, 0);
    };

    const handleEdit = (item: typeof budgets[0]) => {
        navigation.navigate('AddBudget', { budgetId: item.id });
    };

    const renderItem = ({ item }: { item: typeof budgets[0] }) => {
        const spent = getBudgetExpenses(item.categoryId);
        const progress = Math.min((spent / item.amount) * 100, 100);
        const isExceeded = spent > item.amount;

        return (
            <View style={styles.budgetCard}>
                <View style={styles.budgetHeader}>
                    <Text style={styles.budgetName}>{item.name}</Text>
                    <View style={styles.budgetActions}>
                        <TouchableOpacity onPress={() => handleEdit(item)}>
                            <Text style={styles.editText}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            Alert.alert('Delete Budget', 'Are you sure?', [
                                { text: 'Cancel', style: 'cancel' },
                                { text: 'Delete', onPress: () => deleteBudget(item.id), style: 'destructive' }
                            ]);
                        }}>
                            <Text style={styles.deleteText}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.budgetAmounts}>
                    <Text style={styles.limitText}>{formatCurrency(item.amount, settings.currencySymbol)}</Text>
                    <Text style={[styles.spentText, isExceeded && styles.spentTextExceeded]}>
                        {formatCurrency(spent, settings.currencySymbol)} spent
                    </Text>
                </View>
                <View style={styles.barBg}>
                    <View style={[styles.barFill, { width: `${progress}%`, backgroundColor: isExceeded ? theme.colors.expense : theme.colors.primary }]} />
                </View>
                <Text style={styles.progressText}>{progress.toFixed(1)}%</Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Budget</Text>
                <TouchableOpacity onPress={() => navigation.navigate('AddBudget')}>
                    <Text style={styles.addBtnText}>+ Add Budget</Text>
                </TouchableOpacity>
            </View>
            {budgets.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>No budgets yet.</Text>
                    <Text style={styles.emptyStateSubtext}>Create a budget and take control of your spending.</Text>
                </View>
            ) : (
                <FlatList
                    data={budgets}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { padding: theme.spacing.lg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: theme.typography.h1.fontSize, fontWeight: theme.typography.h1.fontWeight, color: theme.colors.text },
    addBtnText: { color: theme.colors.primary, fontWeight: '600', fontSize: theme.typography.bodyLarge.fontSize },
    list: { padding: theme.spacing.lg, gap: theme.spacing.md },
    budgetCard: { backgroundColor: theme.colors.card, padding: theme.spacing.md, borderRadius: theme.borderRadius.md, ...theme.shadows.small },
    budgetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.sm },
    budgetName: { fontSize: theme.typography.bodyLarge.fontSize, fontWeight: '600', flex: 1 },
    deleteText: { color: theme.colors.expense, fontSize: theme.typography.bodySmall.fontSize },
    budgetAmounts: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.xs },
    limitText: { color: theme.colors.textSecondary, fontSize: theme.typography.bodySmall.fontSize },
    spentText: { fontWeight: '600', fontSize: theme.typography.body.fontSize, color: theme.colors.text },
    spentTextExceeded: { color: theme.colors.expense },
    barBg: { height: 8, backgroundColor: theme.colors.border, borderRadius: 4, marginBottom: theme.spacing.xs, overflow: 'hidden' },
    barFill: { height: 8, borderRadius: 4 },
    progressText: { textAlign: 'right', fontSize: theme.typography.caption.fontSize, color: theme.colors.textSecondary },
    emptyState: { alignItems: 'center', padding: theme.spacing.xl, marginTop: theme.spacing.xl },
    emptyStateText: { fontSize: theme.typography.bodyLarge.fontSize, fontWeight: '600', marginBottom: theme.spacing.xs },
    emptyStateSubtext: { fontSize: theme.typography.bodySmall.fontSize, color: theme.colors.textSecondary },
    budgetActions: { flexDirection: 'row', gap: theme.spacing.md },
    editText: { color: theme.colors.primary, fontSize: theme.typography.bodySmall.fontSize, fontWeight: '600' },
});
