import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFinance } from '../context/FinanceContext';
import { theme } from '../constants/theme';

export default function AddBudgetScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const { categories, addBudget } = useFinance();

    const [amount, setAmount] = useState('');
    const [name, setName] = useState('');
    const [categoryId, setCategoryId] = useState('');

    // Budgets are typically for expenses
    const relevantCategories = categories.filter(c => c.type === 'expense');

    const handleSave = async () => {
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            Alert.alert('Invalid Amount', 'Please enter a valid amount greater than zero.');
            return;
        }
        if (!name.trim()) {
            Alert.alert('Missing Name', 'Please enter a name for this budget.');
            return;
        }

        try {
            await addBudget({
                id: Date.now().toString(),
                name,
                amount: Number(amount),
                categoryId: categoryId || undefined,
                period: 'monthly',
                startDate: new Date().toISOString(),
            });
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', 'Failed to save budget.');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="close" size={28} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>New Budget</Text>
                <View style={{ width: 28 }} />
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView style={styles.form}>
                    <View style={styles.amountContainer}>
                        <Text style={styles.currencySymbol}>₱</Text>
                        <TextInput
                            style={styles.amountInput}
                            placeholder="0.00"
                            keyboardType="numeric"
                            value={amount}
                            onChangeText={setAmount}
                            autoFocus
                        />
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Monthly Groceries"
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Category (Optional)</Text>
                        <View style={styles.categoriesContainer}>
                            {relevantCategories.map(cat => (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={[styles.categoryItem, categoryId === cat.id && styles.categoryItemActive]}
                                    onPress={() => setCategoryId(cat.id === categoryId ? '' : cat.id)}
                                >
                                    <View style={[styles.catIconContainer, categoryId === cat.id && { backgroundColor: theme.colors.white }]}>
                                        <Ionicons
                                            name={cat.icon as any}
                                            size={20}
                                            color={categoryId === cat.id ? theme.colors.primary : theme.colors.textSecondary}
                                        />
                                    </View>
                                    <Text style={[styles.categoryText, categoryId === cat.id && styles.categoryTextActive]}>
                                        {cat.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <View style={styles.footer}>
                <View style={{ paddingBottom: Math.max(insets.bottom, theme.spacing.md) }}>
                    <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                        <Text style={styles.saveBtnText}>Save Budget</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
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
    headerTitle: {
        fontSize: theme.typography.h3.fontSize,
        fontWeight: theme.typography.h3.fontWeight,
        color: theme.colors.text,
    },
    form: {
        flex: 1,
        paddingHorizontal: theme.spacing.lg,
    },
    amountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.xl,
        marginTop: theme.spacing.lg,
    },
    currencySymbol: {
        fontSize: 48,
        fontWeight: '700',
        color: theme.colors.textSecondary,
        marginRight: theme.spacing.xs,
    },
    amountInput: {
        fontSize: 56,
        fontWeight: '700',
        color: theme.colors.text,
        minWidth: 100,
    },
    field: {
        marginBottom: theme.spacing.xl,
    },
    label: {
        fontSize: theme.typography.bodyLarge.fontSize,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: theme.spacing.sm,
    },
    input: {
        backgroundColor: theme.colors.card,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        fontSize: theme.typography.body.fontSize,
    },
    categoriesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.sm,
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.card,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.round,
        paddingVertical: theme.spacing.xs,
        paddingHorizontal: theme.spacing.sm,
    },
    categoryItemActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    catIconContainer: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.xs,
    },
    categoryText: {
        fontSize: theme.typography.bodySmall.fontSize,
        color: theme.colors.text,
    },
    categoryTextActive: {
        color: theme.colors.white,
        fontWeight: '600',
    },
    footer: {
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.lg,
        borderTopWidth: 1,
        borderColor: theme.colors.border,
    },
    saveBtn: {
        backgroundColor: theme.colors.primary,
        paddingVertical: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
    },
    saveBtnText: {
        color: theme.colors.white,
        fontSize: theme.typography.bodyLarge.fontSize,
        fontWeight: '700',
    }
});
