import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFinance } from '../context/FinanceContext';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
    const { settings, clearAllData } = useFinance();

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
                    <Text style={styles.sectionTitle}>Preferences</Text>
                    <View style={styles.card}>
                        <View style={styles.row}>
                            <Text style={styles.rowLabel}>Currency</Text>
                            <Text style={styles.rowValue}>{settings.currency} ({settings.currencySymbol})</Text>
                        </View>
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
    actionText: { fontSize: theme.typography.body.fontSize, marginLeft: theme.spacing.sm }
});
