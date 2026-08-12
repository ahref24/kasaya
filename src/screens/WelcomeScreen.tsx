import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFinance } from '../context/FinanceContext';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function WelcomeScreen() {
    const { updateSettings } = useFinance();
    const [name, setName] = useState('');

    const handleStart = async () => {
        await updateSettings({
            name: name || undefined,
            isFirstRun: false,
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.logo}>KASAYA</Text>
                    <Ionicons name="leaf" size={24} color={theme.colors.primary} />
                </View>

                <View style={styles.spacing} />

                <Text style={styles.label}>What should we call you? (Optional)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your name"
                    value={name}
                    onChangeText={setName}
                    placeholderTextColor={theme.colors.textSecondary}
                />

                <View style={styles.spacing} />

                <Text style={styles.title}>Welcome to Kasaya</Text>
                <Text style={styles.subtitle}>Your money. Your goals. Your peace of mind.</Text>
                <Text style={styles.description}>Managing money doesn't have to be stressful.</Text>

                <View style={styles.spacing} />

            </View>
            <View style={styles.footer}>
                <TouchableOpacity style={styles.button} onPress={handleStart}>
                    <Text style={styles.buttonText}>Let's Get Started</Text>
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
    content: {
        flex: 1,
        padding: theme.spacing.lg,
        justifyContent: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.xl * 2,
    },
    logo: {
        fontSize: theme.typography.h1.fontSize,
        fontWeight: '800',
        color: theme.colors.primaryDark,
        marginRight: theme.spacing.sm,
        letterSpacing: 2,
    },
    spacing: {
        height: theme.spacing.xl,
    },
    title: {
        fontSize: theme.typography.h1.fontSize,
        fontWeight: theme.typography.h1.fontWeight,
        color: theme.colors.text,
        marginBottom: theme.spacing.sm,
    },
    subtitle: {
        fontSize: theme.typography.h3.fontSize,
        fontWeight: theme.typography.h3.fontWeight,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.sm,
    },
    description: {
        fontSize: theme.typography.body.fontSize,
        color: theme.colors.textSecondary,
    },
    label: {
        fontSize: theme.typography.bodySmall.fontSize,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.xs,
        marginLeft: theme.spacing.xs,
    },
    input: {
        backgroundColor: theme.colors.card,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        fontSize: theme.typography.body.fontSize,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    footer: {
        padding: theme.spacing.lg,
    },
    button: {
        backgroundColor: theme.colors.primary,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
    },
    buttonText: {
        color: theme.colors.white,
        fontSize: theme.typography.bodyLarge.fontSize,
        fontWeight: theme.typography.bodyLarge.fontWeight,
    },
});
