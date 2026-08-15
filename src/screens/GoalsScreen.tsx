import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useFinance } from '../context/FinanceContext';
import { theme } from '../constants/theme';
import { formatCurrency } from '../utils/currency';

export default function GoalsScreen() {
    const navigation = useNavigation<any>();
    const { goals, settings, deleteGoal, updateGoal } = useFinance();
    const [progressModalVisible, setProgressModalVisible] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState<typeof goals[0] | null>(null);
    const [progressAmount, setProgressAmount] = useState('');
    const route = useRoute<any>();

    const handleEdit = (item: typeof goals[0]) => {
        navigation.navigate('AddGoal', { goalId: item.id });
    };

    const getDaysRemaining = (targetDate?: string) => {
        if (!targetDate) return null;
        const target = new Date(targetDate);
        const now = new Date();
        const diff = target.getTime() - now.getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return days;
    };

    const openProgressModal = (goal: typeof goals[0]) => {
        setSelectedGoal(goal);
        setProgressAmount('');
        setProgressModalVisible(true);
    };

    const handleAddProgress = async () => {
        if (!selectedGoal) return;
        if (!progressAmount || isNaN(Number(progressAmount)) || Number(progressAmount) <= 0) {
            Alert.alert('Invalid Amount', 'Please enter a valid amount greater than zero.');
            return;
        }

        const newAmount = selectedGoal.currentAmount + Number(progressAmount);
        if (newAmount > selectedGoal.targetAmount) {
            Alert.alert('Error', 'Amount exceeds target goal.');
            return;
        }

        try {
            await updateGoal({
                ...selectedGoal,
                currentAmount: newAmount,
            });
            setProgressModalVisible(false);
            setProgressAmount('');
            setSelectedGoal(null);
        } catch (error) {
            Alert.alert('Error', 'Failed to update progress.');
        }
    };

    const renderItem = ({ item }: { item: typeof goals[0] }) => {
        const progress = Math.min((item.currentAmount / item.targetAmount) * 100, 100);
        const daysRemaining = getDaysRemaining(item.targetDate);
        const isCompleted = item.currentAmount >= item.targetAmount;
        const isOverdue = daysRemaining !== null && daysRemaining < 0 && !isCompleted;

        return (
            <View style={styles.goalCard}>
                <View style={styles.goalHeader}>
                    <View style={styles.goalTitleRow}>
                        <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
                            <Ionicons name={item.icon as any || 'flag'} size={24} color={theme.colors.primary} />
                        </View>
                        <Text style={styles.goalName}>{item.name}</Text>
                    </View>
                    <View style={styles.goalActions}>
                        <TouchableOpacity onPress={() => handleEdit(item)}>
                            <Text style={styles.editText}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            Alert.alert('Delete Goal', 'Are you sure?', [
                                { text: 'Cancel', style: 'cancel' },
                                { text: 'Delete', onPress: () => deleteGoal(item.id), style: 'destructive' }
                            ]);
                        }}>
                            <Ionicons name="trash-outline" size={20} color={theme.colors.expense} />
                        </TouchableOpacity>
                    </View>
                </View>

                {item.description && (
                    <Text style={styles.goalDescription}>{item.description}</Text>
                )}

                <View style={styles.amountsRow}>
                    <View>
                        <Text style={styles.targetLabel}>Target</Text>
                        <Text style={styles.targetAmount}>{formatCurrency(item.targetAmount, settings.currencySymbol)}</Text>
                    </View>
                    <View style={styles.savedContainer}>
                        <Text style={styles.savedLabel}>Saved</Text>
                        <Text style={[styles.savedAmount, isCompleted && styles.completedText]}>
                            {formatCurrency(item.currentAmount, settings.currencySymbol)}
                        </Text>
                    </View>
                </View>

                <View style={styles.barBg}>
                    <View style={[
                        styles.barFill,
                        {
                            width: `${progress}%`,
                            backgroundColor: isCompleted ? theme.colors.income : theme.colors.primary
                        }
                    ]} />
                </View>

                <View style={styles.progressRow}>
                    <Text style={styles.progressText}>{Math.round(progress)}%</Text>
                    {isCompleted && (
                        <View style={styles.completedBadge}>
                            <Ionicons name="checkmark-circle" size={16} color={theme.colors.income} />
                            <Text style={styles.completedBadgeText}>Completed</Text>
                        </View>
                    )}
                    {!isCompleted && daysRemaining !== null && (
                        <Text style={[styles.daysText, isOverdue && styles.overdueText]}>
                            {isOverdue ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days left`}
                        </Text>
                    )}
                </View>

                {!isCompleted && (
                    <TouchableOpacity
                        style={styles.addProgressBtn}
                        onPress={() => openProgressModal(item)}
                    >
                        <Ionicons name="add" size={20} color={theme.colors.white} />
                        <Text style={styles.addProgressText}>Add Progress</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Goals</Text>
                <TouchableOpacity onPress={() => navigation.navigate('AddGoal')}>
                    <Text style={styles.addBtnText}>+ Add Goal</Text>
                </TouchableOpacity>
            </View>

            {goals.length === 0 ? (
                <View style={styles.emptyState}>
                    <View style={styles.emptyIconContainer}>
                        <Ionicons name="flag-outline" size={64} color={theme.colors.textSecondary} />
                    </View>
                    <Text style={styles.emptyStateText}>No goals yet</Text>
                    <Text style={styles.emptyStateSubtext}>Set a savings goal and track your progress</Text>
                    <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('AddGoal')}>
                        <Text style={styles.emptyBtnText}>+ Create Your First Goal</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={goals}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                />
            )}

            <Modal
                visible={progressModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setProgressModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Add Progress</Text>
                        {selectedGoal && (
                            <Text style={styles.modalSubtitle}>
                                {selectedGoal.name} — Target: {formatCurrency(selectedGoal.targetAmount, settings.currencySymbol)}
                            </Text>
                        )}
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Enter amount"
                            keyboardType="numeric"
                            value={progressAmount}
                            onChangeText={setProgressAmount}
                            autoFocus
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setProgressModalVisible(false)}>
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleAddProgress}>
                                <Text style={styles.modalConfirmText}>Add</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
    goalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.sm },
    goalTitleRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, flex: 1 },
    iconContainer: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    goalName: { fontSize: theme.typography.bodyLarge.fontSize, fontWeight: '600', color: theme.colors.text },
    goalDescription: { fontSize: theme.typography.bodySmall.fontSize, color: theme.colors.textSecondary, marginBottom: theme.spacing.md },
    amountsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.sm },
    targetLabel: { fontSize: theme.typography.caption.fontSize, color: theme.colors.textSecondary, marginBottom: 2 },
    targetAmount: { fontSize: theme.typography.bodySmall.fontSize, color: theme.colors.textSecondary, fontWeight: '500' },
    savedContainer: { alignItems: 'flex-end' },
    savedLabel: { fontSize: theme.typography.caption.fontSize, color: theme.colors.textSecondary, marginBottom: 2 },
    savedAmount: { fontSize: theme.typography.body.fontSize, fontWeight: '700', color: theme.colors.text },
    completedText: { color: theme.colors.income },
    barBg: { height: 10, backgroundColor: theme.colors.border, borderRadius: 5, marginBottom: theme.spacing.sm, overflow: 'hidden' },
    barFill: { height: 10, borderRadius: 5 },
    progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.sm },
    progressText: { fontSize: theme.typography.caption.fontSize, color: theme.colors.textSecondary, fontWeight: '600' },
    completedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    completedBadgeText: { fontSize: theme.typography.caption.fontSize, color: theme.colors.income, fontWeight: '600' },
    daysText: { fontSize: theme.typography.caption.fontSize, color: theme.colors.textSecondary },
    overdueText: { color: theme.colors.expense, fontWeight: '600' },
    addProgressBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: theme.spacing.xs, backgroundColor: theme.colors.primary, paddingVertical: theme.spacing.sm, borderRadius: theme.borderRadius.md, marginTop: theme.spacing.sm },
    addProgressText: { color: theme.colors.white, fontSize: theme.typography.bodySmall.fontSize, fontWeight: '600' },
    emptyState: { alignItems: 'center', padding: theme.spacing.xl, marginTop: theme.spacing.xl },
    emptyIconContainer: { width: 120, height: 120, borderRadius: 60, backgroundColor: theme.colors.border, justifyContent: 'center', alignItems: 'center', marginBottom: theme.spacing.lg },
    emptyStateText: { fontSize: theme.typography.h3.fontSize, fontWeight: '600', color: theme.colors.text, marginBottom: theme.spacing.xs },
    emptyStateSubtext: { fontSize: theme.typography.bodySmall.fontSize, color: theme.colors.textSecondary, textAlign: 'center', marginBottom: theme.spacing.lg },
    emptyBtn: { backgroundColor: theme.colors.primary, paddingVertical: theme.spacing.md, paddingHorizontal: theme.spacing.lg, borderRadius: theme.borderRadius.md },
    emptyBtnText: { color: theme.colors.white, fontSize: theme.typography.bodyLarge.fontSize, fontWeight: '600' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: theme.spacing.lg },
    modalContent: { backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.md, padding: theme.spacing.lg, width: '100%', maxWidth: 320, ...theme.shadows.medium },
    modalTitle: { fontSize: theme.typography.h3.fontSize, fontWeight: theme.typography.h3.fontWeight, color: theme.colors.text, marginBottom: theme.spacing.xs },
    modalSubtitle: { fontSize: theme.typography.bodySmall.fontSize, color: theme.colors.textSecondary, marginBottom: theme.spacing.md },
    modalInput: { backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, fontSize: theme.typography.body.fontSize, marginBottom: theme.spacing.md },
    modalButtons: { flexDirection: 'row', gap: theme.spacing.sm },
    modalCancelBtn: { flex: 1, paddingVertical: theme.spacing.sm, borderRadius: theme.borderRadius.md, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center' },
    modalCancelText: { color: theme.colors.text, fontWeight: '600' },
    modalConfirmBtn: { flex: 1, paddingVertical: theme.spacing.sm, borderRadius: theme.borderRadius.md, backgroundColor: theme.colors.primary, alignItems: 'center' },
    modalConfirmText: { color: theme.colors.white, fontWeight: '600' },
    goalActions: { flexDirection: 'row', gap: theme.spacing.md },
    editText: { color: theme.colors.primary, fontSize: theme.typography.bodySmall.fontSize, fontWeight: '600' },
});