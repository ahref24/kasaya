import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFinance } from '../context/FinanceContext';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { exportBackup, importBackup } from '../utils/backup';
import { ALL_DEFAULT_CATEGORIES } from '../constants/categories';

export default function SettingsScreen() {
    const { settings, updateSettings, clearAllData, transactions, budgets, goals, categories, importData, deleteCategory } = useFinance();
    const [importing, setImporting] = useState(false);

    const handleExport = async () => {
        try {
            await exportBackup(transactions, budgets, goals, categories, settings);
        } catch (error: any) {
            Alert.alert('Export Failed', error?.message || 'Failed to export backup.');
        }
    };

    const handleImport = async () => {
        setImporting(true);
        try {
            const data = await importBackup();
            if (!data) {
                setImporting(false);
                return;
            }

            Alert.alert(
                'Import Backup',
                'This will overwrite all current data. Are you sure?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Import',
                        style: 'destructive',
                        onPress: async () => {
                            try {
                                await importData(data);
                                Alert.alert('Success', 'Backup imported successfully!');
                            } catch (error) {
                                Alert.alert('Error', 'Failed to import backup.');
                            } finally {
                                setImporting(false);
                            }
                        }
                    }
                ]
            );
        } catch (error) {
            Alert.alert('Error', 'Failed to import backup. Please check the file format.');
            setImporting(false);
        }
    };

    const handleClearData = () => {
        Alert.alert(
            'Delete all Kasaya data?',
            'This action cannot be undone. All your transactions, budgets, and goals will be permanently deleted.',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete All', style: 'destructive', onPress: clearAllData }
            ]
        );
    };

    const handleDeleteCategory = (id: string, name: string) => {
        Alert.alert('Delete Category', `Are you sure you want to delete "${name}"?`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', onPress: () => deleteCategory(id), style: 'destructive' }
        ]);
    };

    const CURRENCIES = [
        { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
        { code: 'USD', symbol: '$', name: 'US Dollar' },
        { code: 'EUR', symbol: '€', name: 'Euro' },
        { code: 'GBP', symbol: '£', name: 'British Pound' },
        { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
        { code: 'KRW', symbol: '₩', name: 'Korean Won' },
        { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
        { code: 'THB', symbol: '฿', name: 'Thai Baht' },
    ];

    const handleChangeCurrency = () => {
        Alert.alert(
            'Select Currency',
            `Current: ${settings.currency} (${settings.currencySymbol})`,
            [
                { text: 'Cancel', style: 'cancel' },
                ...CURRENCIES.map(c => ({
                    text: `${c.code} — ${c.symbol} (${c.name})`,
                    onPress: () => updateSettings({ currency: c.code, currencySymbol: c.symbol }),
                }))
            ]
        );
    };

    const customCategories = useMemo(() => {
        const defaultIds = new Set(ALL_DEFAULT_CATEGORIES.map(c => c.id));
        return categories.filter(c => !defaultIds.has(c.id));
    }, [categories]);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <View style={styles.header}>
                    <Text style={styles.title}>More</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Profile</Text>
                    <View style={styles.card}>
                        <View style={styles.row}>
                            <Text style={styles.rowLabel}>Name</Text>
                            <Text style={styles.rowValue}>{settings.name || 'Set Name'}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Categories</Text>
                    <View style={styles.card}>
                        {customCategories.length === 0 ? (
                            <View style={styles.row}>
                                <Text style={[styles.rowValue, { color: theme.colors.textSecondary }]}>
                                    No custom categories yet. Create one when adding a transaction or budget.
                                </Text>
                            </View>
                        ) : (
                            customCategories.map(cat => (
                                <View key={cat.id} style={[styles.row, { borderBottomWidth: 1, borderBottomColor: theme.colors.border }]}>
                                    <View style={styles.categoryRowContent}>
                                        <View style={[styles.catIconContainer, { backgroundColor: theme.colors.border }]}>
                                            <Ionicons name={cat.icon as any} size={18} color={theme.colors.textSecondary} />
                                        </View>
                                        <Text style={styles.rowLabel}>{cat.name}</Text>
                                    </View>
                                    <TouchableOpacity onPress={() => handleDeleteCategory(cat.id, cat.name)}>
                                        <Ionicons name="trash-outline" size={18} color={theme.colors.expense} />
                                    </TouchableOpacity>
                                </View>
                            ))
                        )}
                    </View>
                </View>

                <View style={styles.section}>
                    <TouchableOpacity style={styles.row} onPress={handleChangeCurrency}>
                        <Text style={styles.rowLabel}>Currency</Text>
                        <View style={styles.rowRight}>
                            <Text style={styles.rowValue}>{settings.currency} ({settings.currencySymbol})</Text>
                            <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} />
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Backup</Text>
                    <View style={styles.card}>
                        <TouchableOpacity style={styles.actionRow} onPress={handleExport}>
                            <Ionicons name="cloud-upload-outline" size={20} color={theme.colors.primary} />
                            <Text style={[styles.actionText, { color: theme.colors.primary }]}>Export Backup</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionRow} onPress={handleImport} disabled={importing}>
                            <Ionicons name="cloud-download-outline" size={20} color={theme.colors.primary} />
                            <Text style={[styles.actionText, { color: theme.colors.primary }]}>
                                {importing ? 'Importing...' : 'Import Backup'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Data</Text>
                    <View style={styles.card}>
                        <TouchableOpacity style={styles.actionRow} onPress={handleClearData}>
                            <Ionicons name="trash-outline" size={20} color={theme.colors.expense} />
                            <Text style={[styles.actionText, { color: theme.colors.expense }]}>Clear all data</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About</Text>
                    <View style={styles.card}>
                        <View style={styles.row}>
                            <Text style={styles.rowLabel}>App Version</Text>
                            <Text style={styles.rowValue}>1.0.0</Text>
                        </View>
                        <View style={[styles.row, { borderBottomWidth: 0 }]}>
                            <Text style={styles.rowLabel}>About Kasaya</Text>
                            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                        </View>
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { padding: theme.spacing.lg },
    title: { fontSize: theme.typography.h1.fontSize, fontWeight: theme.typography.h1.fontWeight, color: theme.colors.text },
    section: { marginBottom: theme.spacing.xl, paddingHorizontal: theme.spacing.lg },
    sectionTitle: { fontSize: theme.typography.bodyLarge.fontSize, fontWeight: '600', color: theme.colors.textSecondary, marginBottom: theme.spacing.sm, textTransform: 'uppercase' },
    card: { backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.md, ...theme.shadows.small },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: theme.spacing.md, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
    rowLabel: { fontSize: theme.typography.body.fontSize, color: theme.colors.text },
    rowValue: { fontSize: theme.typography.body.fontSize, color: theme.colors.textSecondary },
    actionRow: { flexDirection: 'row', alignItems: 'center', padding: theme.spacing.md },
    actionText: { fontSize: theme.typography.body.fontSize, marginLeft: theme.spacing.sm },
    categoryRowContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    catIconContainer: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: theme.spacing.sm },
    rowRight: { flexDirection: 'row', alignItems: 'center' },
});
