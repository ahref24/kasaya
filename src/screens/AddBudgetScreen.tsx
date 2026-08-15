import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFinance } from '../context/FinanceContext';
import { theme } from '../constants/theme';

export default function AddBudgetScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const { categories, addBudget, updateBudget, budgets, addCategory } = useFinance();

    const [amount, setAmount] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [customName, setCustomName] = useState('');
    const [showCustomInput, setShowCustomInput] = useState(false);
    const route = useRoute<any>();

    const relevantCategories = categories.filter(c => c.type === 'expense');

    useEffect(() => {
        const budgetId = route.params?.budgetId;
        if (budgetId) {
            const existing = budgets.find(b => b.id === budgetId);
            if (existing) {
                setAmount(existing.amount.toString());
                setCategoryId(existing.categoryId || '');
                setIsEditing(true);
            }
        }
    }, [route.params?.budgetId, budgets]);

    const handleSave = async () => {
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            Alert.alert('Invalid Amount', 'Please enter a valid amount greater than zero.');
            return;
        }
        if (!categoryId) {
            Alert.alert('Missing Category', 'Please select a category.');
            return;
        }

        const selectedCategory = categories.find(c => c.id === categoryId);
        if (!selectedCategory) {
            Alert.alert('Error', 'Selected category not found.');
            return;
        }

        const existingBudget = isEditing ? budgets.find(b => b.id === route.params.budgetId) : null;

        const budgetData = {
            id: isEditing ? route.params.budgetId : Date.now().toString(),
            name: selectedCategory.name,
            amount: Number(amount),
            categoryId: selectedCategory.id,
            period: existingBudget?.period || 'monthly' as const,
            startDate: existingBudget?.startDate || new Date().toISOString(),
            endDate: existingBudget?.endDate,
        };

        try {
            if (isEditing) {
                await updateBudget(budgetData);
            } else {
                await addBudget(budgetData);
            }
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', isEditing ? 'Failed to update budget.' : 'Failed to save budget.');
        }
    };

    const handleCreateCustomCategory = async () => {
        if (!customName.trim()) {
            Alert.alert('Missing Name', 'Please enter a category name.');
            return;
        }

        const newCategory = {
            id: `exp_custom_${Date.now()}`,
            name: customName.trim(),
            type: 'expense' as const,
            icon: 'ellipsis-horizontal',
        };

        try {
            await addCategory(newCategory);
            setCategoryId(newCategory.id);
            setCustomName('');
            setShowCustomInput(false);
        } catch (error) {
            Alert.alert('Error', 'Failed to create custom category.');
        }
    };

    const formatAmountInput = (value: string): string => {
        if (!value) return '';

        const cleaned = value.replace(/[^0-9.]/g, '');
        const parts = cleaned.split('.');
        const integerPart = parts[0];
        const decimalPart = parts.slice(1).join('');
        const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
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
                <Text style={styles.headerTitle}>{isEditing ? 'Edit Budget' : 'New Budget'}</Text>
                <View style={{ width: 28 }} />
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView style={styles.form}>
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
                        <Text style={styles.label}>Category</Text>
                        <View style={styles.categoriesContainer}>
                            {relevantCategories.map(cat => (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={[styles.categoryItem, categoryId === cat.id && styles.categoryItemActive]}
                                    onPress={() => {
                                        setCategoryId(cat.id);
                                        setShowCustomInput(false);
                                    }}
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
                            
                            <TouchableOpacity
                                style={[styles.categoryItem, showCustomInput && styles.categoryItemActive]}
                                onPress={() => setShowCustomInput(!showCustomInput)}
                            >
                                <View style={[styles.catIconContainer, showCustomInput && { backgroundColor: theme.colors.white }]}>
                                    <Ionicons
                                        name="add"
                                        size={20}
                                        color={showCustomInput ? theme.colors.primary : theme.colors.textSecondary}
                                    />
                                </View>
                                <Text style={[styles.categoryText, showCustomInput && styles.categoryTextActive]}>
                                    Custom
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {showCustomInput && (
                            <View style={styles.customCategoryInput}>
                                <TextInput
                                    style={styles.customInput}
                                    placeholder="Enter category name"
                                    value={customName}
                                    onChangeText={setCustomName}
                                    autoFocus
                                />
                                <TouchableOpacity style={styles.customAddBtn} onPress={handleCreateCustomCategory}>
                                    <Ionicons name="checkmark" size={20} color={theme.colors.white} />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <View style={styles.footer}>
                <View style={{ paddingBottom: Math.max(insets.bottom, theme.spacing.md) }}>
                    <TouchableOpacity 
                        style={[styles.saveBtn, !categoryId && styles.saveBtnDisabled]} 
                        onPress={handleSave}
                        disabled={!categoryId}
                    >
                        <Text style={styles.saveBtnText}>{isEditing ? 'Update Budget' : 'Save Budget'}</Text>
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
    customCategoryInput: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: theme.spacing.md,
        gap: theme.spacing.sm,
    },
    customInput: {
        flex: 1,
        backgroundColor: theme.colors.card,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        fontSize: theme.typography.body.fontSize,
    },
    customAddBtn: {
        backgroundColor: theme.colors.primary,
        width: 48,
        height: 48,
        borderRadius: theme.borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
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
    saveBtnDisabled: {
        backgroundColor: theme.colors.border,
    },
    saveBtnText: {
        color: theme.colors.white,
        fontSize: theme.typography.bodyLarge.fontSize,
        fontWeight: '700',
    }
});