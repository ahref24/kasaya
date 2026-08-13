import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useFinance } from '../context/FinanceContext';
import { theme } from '../constants/theme';
import { formatCurrency } from '../utils/currency';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function TransactionsScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { transactions, categories, settings } = useFinance();
    const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
    const [search, setSearch] = useState('');
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    const routeCategoryId = route.params?.categoryId as string | undefined;
    const routeMonth = route.params?.month as number | undefined;
    const routeYear = route.params?.year as number | undefined;

    const filteredTransactions = transactions
        .filter(t => {
            if (routeCategoryId && t.categoryId !== routeCategoryId) return false;
            return filter === 'all' || t.type === filter;
        })
        .filter(t => {
            if (routeMonth !== undefined && routeYear !== undefined) {
                const d = new Date(t.date);
                if (d.getMonth() !== routeMonth || d.getFullYear() !== routeYear) return false;
            }
            const transactionDate = new Date(t.date);
            if (startDate && transactionDate < new Date(startDate.toDateString())) return false;
            if (endDate && transactionDate > new Date(endDate.toDateString() + ' 23:59:59')) return false;
            return true;
        })
        .filter(t => t.title.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const activeCategoryName = routeCategoryId ? categories.find(c => c.id === routeCategoryId)?.name : null;

    // Group by date
    const grouped = filteredTransactions.reduce((acc, t) => {
        const d = new Date(t.date).toLocaleDateString();
        if (!acc[d]) acc[d] = [];
        acc[d].push(t);
        return acc;
    }, {} as Record<string, typeof transactions>);

    const getCategoryIcon = (categoryId: string) => {
        const cat = categories.find(c => c.id === categoryId);
        return cat ? cat.icon : 'list';
    };

    const renderItem = ({ item }: { item: typeof transactions[0] }) => (
        <View style={styles.transactionItem}>
            <View style={styles.transactionLeft}>
                <View style={[styles.iconContainer, { backgroundColor: item.type === 'income' ? '#e6f4ea' : '#fce8e8' }]}>
                    <Ionicons name={getCategoryIcon(item.categoryId) as any} size={20} color={item.type === 'income' ? theme.colors.income : theme.colors.expense} />
                </View>
                <View>
                    <Text style={styles.transactionTitle}>{item.title}</Text>
                    <Text style={styles.transactionCat}>
                        {categories.find(c => c.id === item.categoryId)?.name || 'Other'}
                    </Text>
                </View>
            </View>
            <Text style={[styles.transactionAmount, { color: item.type === 'income' ? theme.colors.income : theme.colors.text }]}>
                {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount, settings.currencySymbol)}
            </Text>
        </View>
    );

    const formatDate = (date: Date | null) => {
        if (!date) return 'Select date';
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const clearDateFilter = () => {
        setStartDate(null);
        setEndDate(null);
    };

    const clearCategoryFilter = () => {
        navigation.setParams({ categoryId: undefined, month: undefined, year: undefined });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>
                    {activeCategoryName ? activeCategoryName : 'Transactions'}
                </Text>
                {activeCategoryName && (
                    <TouchableOpacity onPress={clearCategoryFilter}>
                        <Text style={styles.clearFilterText}>Clear</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search transactions..."
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            <View style={styles.filters}>
                {(['all', 'income', 'expense'] as const).map(f => (
                    <TouchableOpacity
                        key={f}
                        style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
                        onPress={() => setFilter(f)}
                    >
                        <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.dateFilterContainer}>
                <TouchableOpacity style={styles.dateBtn} onPress={() => setShowStartPicker(true)}>
                    <Ionicons name="calendar-outline" size={18} color={theme.colors.textSecondary} />
                    <Text style={styles.dateBtnText}>{formatDate(startDate)}</Text>
                </TouchableOpacity>
                <Text style={styles.dateSeparator}>to</Text>
                <TouchableOpacity style={styles.dateBtn} onPress={() => setShowEndPicker(true)}>
                    <Ionicons name="calendar-outline" size={18} color={theme.colors.textSecondary} />
                    <Text style={styles.dateBtnText}>{formatDate(endDate)}</Text>
                </TouchableOpacity>
                {(startDate || endDate) && (
                    <TouchableOpacity onPress={clearDateFilter} style={styles.clearDateBtn}>
                        <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                )}
            </View>

            {showStartPicker && (
                <DateTimePicker
                    value={startDate || new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, selectedDate) => {
                        setShowStartPicker(Platform.OS === 'ios');
                        if (selectedDate) setStartDate(selectedDate);
                    }}
                />
            )}

            {showEndPicker && (
                <DateTimePicker
                    value={endDate || new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, selectedDate) => {
                        setShowEndPicker(Platform.OS === 'ios');
                        if (selectedDate) setEndDate(selectedDate);
                    }}
                />
            )}

            {filteredTransactions.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>No transactions found.</Text>
                </View>
            ) : (
                <FlatList
                    data={Object.keys(grouped).map(k => ({ title: k, data: grouped[k] }))}
                    keyExtractor={item => item.title}
                    renderItem={({ item }) => (
                        <View style={styles.group}>
                            <Text style={styles.groupTitle}>{item.title === new Date().toLocaleDateString() ? 'TODAY' : item.title}</Text>
                            {item.data.map(t => <React.Fragment key={t.id}>{renderItem({ item: t })}</React.Fragment>)}
                        </View>
                    )}
                    contentContainerStyle={styles.listContainer}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        padding: theme.spacing.lg,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: theme.typography.h1.fontSize,
        fontWeight: theme.typography.h1.fontWeight,
        color: theme.colors.text,
    },
    clearFilterText: {
        color: theme.colors.primary,
        fontWeight: '600',
        fontSize: theme.typography.body.fontSize,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.card,
        marginHorizontal: theme.spacing.lg,
        borderRadius: theme.borderRadius.md,
        paddingHorizontal: theme.spacing.md,
        marginBottom: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    searchIcon: {
        marginRight: theme.spacing.sm,
    },
    searchInput: {
        flex: 1,
        paddingVertical: theme.spacing.sm,
        fontSize: theme.typography.body.fontSize,
    },
    filters: {
        flexDirection: 'row',
        paddingHorizontal: theme.spacing.lg,
        marginBottom: theme.spacing.md,
        gap: theme.spacing.sm,
    },
    filterBtn: {
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        borderRadius: theme.borderRadius.round,
        backgroundColor: theme.colors.card,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    filterBtnActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    filterText: {
        color: theme.colors.text,
        fontSize: theme.typography.bodySmall.fontSize,
    },
    filterTextActive: {
        color: theme.colors.white,
        fontWeight: '600',
    },
    dateFilterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.lg,
        marginBottom: theme.spacing.md,
        gap: theme.spacing.sm,
    },
    dateBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.card,
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        gap: theme.spacing.xs,
        flex: 1,
    },
    dateBtnText: {
        color: theme.colors.text,
        fontSize: theme.typography.bodySmall.fontSize,
    },
    dateSeparator: {
        color: theme.colors.textSecondary,
        fontSize: theme.typography.bodySmall.fontSize,
    },
    clearDateBtn: {
        padding: theme.spacing.xs,
    },
    listContainer: {
        paddingHorizontal: theme.spacing.lg,
        paddingBottom: 80,
    },
    group: {
        marginBottom: theme.spacing.lg,
    },
    groupTitle: {
        fontSize: theme.typography.caption.fontSize,
        color: theme.colors.textSecondary,
        fontWeight: '700',
        marginBottom: theme.spacing.sm,
        letterSpacing: 1,
    },
    transactionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: theme.colors.card,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        marginBottom: theme.spacing.sm,
        ...theme.shadows.small,
    },
    transactionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.md,
    },
    transactionTitle: {
        fontSize: theme.typography.bodyLarge.fontSize,
        fontWeight: '600',
        color: theme.colors.text,
    },
    transactionCat: {
        fontSize: theme.typography.caption.fontSize,
        color: theme.colors.textSecondary,
    },
    transactionAmount: {
        fontSize: theme.typography.bodyLarge.fontSize,
        fontWeight: '700',
    },
    emptyState: {
        alignItems: 'center',
        padding: theme.spacing.xl,
        marginTop: theme.spacing.xl,
    },
    emptyStateText: {
        fontSize: theme.typography.bodyLarge.fontSize,
        color: theme.colors.textSecondary,
    }
});