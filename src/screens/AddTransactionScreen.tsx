import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFinance } from '../context/FinanceContext';
import { theme } from '../constants/theme';

export default function AddTransactionScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { type: initialType } = route.params || { type: 'expense' };

    const { categories, addTransaction } = useFinance();

    const [type, setType] = useState<'income' | 'expense'>(initialType);
    const [amount, setAmount] = useState('');
    const [title, setTitle] = useState('');
    const [categoryId, setCategoryId] = useState('');

    const relevantCategories = categories.filter(c => c.type === type);

    const handleSave = async () => {
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            Alert.alert('Invalid Amount', 'Please enter a valid amount greater than zero.');
            return;
        }
        if (!title.trim()) {
            Alert.alert('Missing Title', 'Please enter a title for this transaction.');
            return;
        }
        if (!categoryId) {
            Alert.alert('Missing Category', 'Please select a category.');
            return;
        }

        try {
            await addTransaction({
                id: Date.now().toString(),
                type,
                amount: Number(amount),
                title,
                categoryId,
                date: new Date().toISOString(),
                createdAt: new Date().toISOString(),
            });
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', 'Failed to save transaction.');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="close" size={28} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>New Transaction</Text>
                <View style={{ width: 28 }} />
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView style={styles.form}>
                    <View style={styles.typeSelector}>
                        <TouchableOpacity
                            style={[styles.typeBtn, type === 'expense' && styles.typeBtnExpense]}
                            onPress={() => setType('expense')}
                        >
                            <Text style={[styles.typeText, type === 'expense' && styles.typeTextActive]}>Expense</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.typeBtn, type === 'income' && styles.typeBtnIncome]}
                            onPress={() => setType('income')}
                        >
                            <Text style={[styles.typeText, type === 'income' && styles.typeTextActive]}>Income</Text>
                        </TouchableOpacity>
                    </View>

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
                        <Text style={styles.label}>Title</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Grocery shopping"
                            value={title}
                            onChangeText={setTitle}
                        />
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Category</Text>
                        <View style={styles.categoriesContainer}>
                            {relevantCategories.map(cat => (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={[styles.categoryItem, categoryId === cat.id && styles.categoryItemActive]}
                                    onPress={() => setCategoryId(cat.id)}
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
                <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                    <Text style={styles.saveBtnText}>Save Transaction</Text>
                </TouchableOpacity>
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
    typeSelector: {
        flexDirection: 'row',
        backgroundColor: theme.colors.border,
        padding: 4,
        borderRadius: theme.borderRadius.md,
        marginBottom: theme.spacing.xl,
    },
    typeBtn: {
        flex: 1,
        paddingVertical: theme.spacing.sm,
        alignItems: 'center',
        borderRadius: theme.borderRadius.sm,
    },
    typeBtnExpense: {
        backgroundColor: theme.colors.expense,
    },
    typeBtnIncome: {
        backgroundColor: theme.colors.income,
    },
    typeText: {
        fontSize: theme.typography.bodyLarge.fontSize,
        fontWeight: '600',
        color: theme.colors.textSecondary,
    },
    typeTextActive: {
        color: theme.colors.white,
    },
    amountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.xl,
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
        padding: theme.spacing.lg,
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
