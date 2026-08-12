import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFinance } from '../context/FinanceContext';
import { theme } from '../constants/theme';
import { formatCurrency } from '../utils/currency';

export default function GoalsScreen() {
    const { goals, settings, deleteGoal } = useFinance();

    const renderItem = ({ item }: { item: typeof goals[0] }) => {
        const progress = Math.min((item.currentAmount / item.targetAmount) * 100, 100);

        return (
            <View style={styles.goalCard}>
                <View style={styles.goalHeader}>
                    <Text style={styles.goalName}>{item.icon || '🎯'} {item.name}</Text>
                    <TouchableOpacity onPress={() => {
                        Alert.alert('Delete Goal', 'Are you sure?', [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Delete', onPress: () => deleteGoal(item.id), style: 'destructive' }
                        ]);
                    }}>
                        <Text style={styles.deleteText}>Delete</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.amounts}>
                    <Text style={styles.targetText}>{formatCurrency(item.targetAmount, settings.currencySymbol)} goal</Text>
                    <Text style={styles.savedText}>{formatCurrency(item.currentAmount, settings.currencySymbol)} saved</Text>
                </View>
                <View style={styles.barBg}>
                    <View style={[styles.barFill, { width: `${progress}%` }]} />
                </View>
                <Text style={styles.progressText}>{Math.round(progress)}%</Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Goals</Text>
                <TouchableOpacity>
                    <Text style={styles.addBtnText}>+ Add Goal</Text>
                </TouchableOpacity>
            </View>
            {goals.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>No goals yet.</Text>
                    <Text style={styles.emptyStateSubtext}>Give your money a purpose.</Text>
                </View>
            ) : (
                <FlatList
                    data={goals}
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
    goalCard: { backgroundColor: theme.colors.card, padding: theme.spacing.md, borderRadius: theme.borderRadius.md, ...theme.shadows.small },
    goalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.md },
    goalName: { fontSize: theme.typography.bodyLarge.fontSize, fontWeight: '600' },
    deleteText: { color: theme.colors.expense, fontSize: theme.typography.bodySmall.fontSize },
    amounts: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.xs },
    targetText: { color: theme.colors.textSecondary, fontSize: theme.typography.bodySmall.fontSize },
    savedText: { fontWeight: '600', fontSize: theme.typography.body.fontSize },
    barBg: { height: 12, backgroundColor: theme.colors.border, borderRadius: 6, marginBottom: theme.spacing.xs },
    barFill: { height: 12, backgroundColor: theme.colors.savings, borderRadius: 6 },
    progressText: { textAlign: 'right', fontSize: theme.typography.caption.fontSize, color: theme.colors.textSecondary },
    emptyState: { alignItems: 'center', padding: theme.spacing.xl, marginTop: theme.spacing.xl },
    emptyStateText: { fontSize: theme.typography.bodyLarge.fontSize, fontWeight: '600', marginBottom: theme.spacing.xs },
    emptyStateSubtext: { fontSize: theme.typography.bodySmall.fontSize, color: theme.colors.textSecondary }
});
