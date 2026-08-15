import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFinance } from '../context/FinanceContext';
import { theme } from '../constants/theme';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function AddTransactionScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { type: initialType } = route.params || { type: 'expense' };

    const { categories, addTransaction, updateTransaction, transactions } = useFinance();

    const [type, setType] = useState<'income' | 'expense'>(initialType);
    const [isEditing, setIsEditing] = useState(false);
    const [amount, setAmount] = useState('');
    const [title, setTitle] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    useEffect(() => {
        const transactionId = route.params?.transactionId;
        if (transactionId) {
            const existing = transactions.find(t => t.id === transactionId);
            if (existing) {
                setType(existing.type);
                setAmount(existing.amount.toString());
                setTitle(existing.title);
                setCategoryId(existing.categoryId);
                setDate(new Date(existing.date));
                setIsEditing(true);
            }
        }
    }, [route.params?.transactionId, transactions]);

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

        const existingTx = isEditing ? transactions.find(t => t.id === route.params.transactionId) : null;

        const transactionData = {
            id: isEditing ? route.params.transactionId : Date.now().toString(),
            type,
            amount: Number(amount),
            title,
            categoryId,
            date: date.toISOString(),
            createdAt: existingTx?.createdAt || new Date().toISOString(),
            notes: existingTx?.notes,
            paymentMethod: existingTx?.paymentMethod,
            recurring: existingTx?.recurring,
        };

        try {
            if (isEditing) {
                await updateTransaction(transactionData);
            } else {
                await addTransaction(transactionData);
            }
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', isEditing ? 'Failed to update transaction.' : 'Failed to save transaction.');
        }
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatAmountInput = (value: string): string => {
        if (!value) return '';
        
        // Keep only digits and decimal point
        const cleaned = value.replace(/[^0-9.]/g, '');
        const parts = cleaned.split('.');
        
        // Handle multiple decimal points (keep only the first)
        const integerPart = parts[0];
        const decimalPart = parts.slice(1).join('');
        
        // Format integer part with commas
        const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        
        // Limit to 2 decimal places
        const truncatedDecimal = decimalPart.slice(0, 2);
        
        if (decimalPart) {
            return `${formattedInteger}.${truncatedDecimal}`;
        }
        return formattedInteger;
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="close" size={28} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{isEditing ? 'Edit Transaction' : 'New Transaction'}</Text>
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
                            keyboardType="decimal-pad"
                            value={formatAmountInput(amount)}
                            onChangeText={(text) => setAmount(text.replace(/,/g, ''))}
                            autoFocus
                        />
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Date</Text>
                        <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDatePicker(true)}>
                            <Ionicons name="calendar-outline" size={20} color={theme.colors.textSecondary} />
                            <Text style={styles.dateBtnText}>{formatDate(date)}</Text>
                            <Ionicons name="chevron-down" size={20} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    {showDatePicker && (
                        <DateTimePicker
                            value={date}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={(event, selectedDate) => {
                                setShowDatePicker(Platform.OS === 'ios');
                                if (selectedDate) setDate(selectedDate);
                            }}
                        />
                    )}

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
                <View style={{ paddingBottom: Math.max(insets.bottom, theme.spacing.md) }}>
                    <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                        <Text style={styles.saveBtnText}>Save Transaction</Text>
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
    dateBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.card,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        gap: theme.spacing.sm,
    },
    dateBtnText: {
        flex: 1,
        fontSize: theme.typography.body.fontSize,
        color: theme.colors.text,
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