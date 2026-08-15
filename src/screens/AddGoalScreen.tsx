import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFinance } from '../context/FinanceContext';
import { theme } from '../constants/theme';
import DateTimePicker from '@react-native-community/datetimepicker';

const ICONS = [
    'home', 'car', 'airplane', 'book', 'laptop', 'phone-portrait', 'gift', 'heart',
    'cash', 'business', 'school', 'medical', 'build', 'cart', 'musical-notes', 'game-controller'
];

export default function AddGoalScreen() {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const { addGoal } = useFinance();

    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [currentAmount, setCurrentAmount] = useState('');
    const [targetDate, setTargetDate] = useState<Date | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedIcon, setSelectedIcon] = useState('flag');

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Missing Name', 'Please enter a name for this goal.');
            return;
        }
        if (!targetAmount || isNaN(Number(targetAmount)) || Number(targetAmount) <= 0) {
            Alert.alert('Invalid Amount', 'Please enter a valid target amount greater than zero.');
            return;
        }

        try {
            await addGoal({
                id: Date.now().toString(),
                name,
                targetAmount: Number(targetAmount),
                currentAmount: currentAmount ? Number(currentAmount) : 0,
                targetDate: targetDate ? targetDate.toISOString() : undefined,
                icon: selectedIcon,
                createdAt: new Date().toISOString(),
            });
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', 'Failed to save goal.');
        }
    };

    const formatDate = (date: Date | null) => {
        if (!date) return 'Optional';
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
                <Text style={styles.headerTitle}>New Goal</Text>
                <View style={{ width: 28 }} />
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView style={styles.form}>
                    <View style={styles.field}>
                        <Text style={styles.label}>Goal Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. New Laptop, Vacation"
                            value={name}
                            onChangeText={setName}
                            autoFocus
                        />
                    </View>

                    <View style={styles.amountContainer}>
                        <Text style={styles.currencySymbol}>₱</Text>
                        <TextInput
                            style={styles.amountInput}
                            placeholder="0.00"
                            keyboardType="decimal-pad"
                            value={formatAmountInput(targetAmount)}
                            onChangeText={(text) => setTargetAmount(text.replace(/,/g, ''))}
                            autoFocus
                        />
                    </View>
                    <Text style={styles.amountLabel}>Target Amount</Text>

                    <View style={styles.amountContainer}>
                        <Text style={styles.currencySymbol}>₱</Text>
                        <TextInput
                            style={styles.amountInput}
                            placeholder="0.00"
                            keyboardType="decimal-pad"
                            value={formatAmountInput(currentAmount)}
                            onChangeText={(text) => setCurrentAmount(text.replace(/,/g, ''))}
                        />
                    </View>
                    <Text style={styles.amountLabel}>Initial Amount (Optional)</Text>

                    <View style={styles.field}>
                        <Text style={styles.label}>Target Date (Optional)</Text>
                        <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDatePicker(true)}>
                            <Ionicons name="calendar-outline" size={20} color={theme.colors.textSecondary} />
                            <Text style={styles.dateBtnText}>{formatDate(targetDate)}</Text>
                            <Ionicons name="chevron-down" size={20} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    {showDatePicker && (
                        <DateTimePicker
                            value={targetDate || new Date()}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={(event, selectedDate) => {
                                setShowDatePicker(Platform.OS === 'ios');
                                if (selectedDate) setTargetDate(selectedDate);
                            }}
                        />
                    )}

                    <View style={styles.field}>
                        <Text style={styles.label}>Icon</Text>
                        <View style={styles.iconGrid}>
                            {ICONS.map(icon => (
                                <TouchableOpacity
                                    key={icon}
                                    style={[styles.iconItem, selectedIcon === icon && styles.iconItemActive]}
                                    onPress={() => setSelectedIcon(icon)}
                                >
                                    <Ionicons
                                        name={icon as any}
                                        size={24}
                                        color={selectedIcon === icon ? theme.colors.white : theme.colors.textSecondary}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <View style={styles.footer}>
                <View style={{ paddingBottom: Math.max(insets.bottom, theme.spacing.md) }}>
                    <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                        <Text style={styles.saveBtnText}>Create Goal</Text>
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
    amountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.sm,
    },
    currencySymbol: {
        fontSize: 36,
        fontWeight: '700',
        color: theme.colors.textSecondary,
        marginRight: theme.spacing.xs,
    },
    amountInput: {
        fontSize: 40,
        fontWeight: '700',
        color: theme.colors.text,
        minWidth: 100,
    },
    amountLabel: {
        textAlign: 'center',
        fontSize: theme.typography.bodySmall.fontSize,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.xl,
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
    iconGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.sm,
    },
    iconItem: {
        width: 48,
        height: 48,
        borderRadius: theme.borderRadius.md,
        backgroundColor: theme.colors.card,
        borderWidth: 1,
        borderColor: theme.colors.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconItemActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
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