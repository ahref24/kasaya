import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { useFinance } from '../context/FinanceContext';

import HomeScreen from '../screens/HomeScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import AccountSummaryScreen from '../screens/AccountSummaryScreen';
import AddTransactionScreen from '../screens/AddTransactionScreen';
import AddBudgetScreen from '../screens/AddBudgetScreen';
import BudgetScreen from '../screens/BudgetScreen';
import GoalsScreen from '../screens/GoalsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import WelcomeScreen from '../screens/WelcomeScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const MainTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap = 'home';
                    if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
                    else if (route.name === 'Transactions') iconName = focused ? 'list' : 'list-outline';
                    else if (route.name === 'Budget') iconName = focused ? 'pie-chart' : 'pie-chart-outline';
                    else if (route.name === 'Account') iconName = focused ? 'receipt' : 'receipt-outline';
                    else if (route.name === 'Goals') iconName = focused ? 'flag' : 'flag-outline';
                    else if (route.name === 'More') iconName = focused ? 'menu' : 'menu-outline';

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.textSecondary,
                headerShown: false,
                tabBarStyle: {
                    borderTopWidth: 1,
                    borderTopColor: theme.colors.border,
                    backgroundColor: theme.colors.card,
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Transactions" component={TransactionsScreen} />
            <Tab.Screen name="Budget" component={BudgetScreen} />
            <Tab.Screen name="Account" component={AccountSummaryScreen} />
            <Tab.Screen name="Goals" component={GoalsScreen} />
            <Tab.Screen name="More" component={SettingsScreen} />
        </Tab.Navigator>
    );
};

export const AppNavigator = () => {
    const { settings, isLoading } = useFinance();

    if (isLoading) {
        return null; // Or a splash screen
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {settings.isFirstRun ? (
                    <Stack.Screen name="Welcome" component={WelcomeScreen} />
                ) : (
                    <>
                        <Stack.Screen name="Main" component={MainTabs} />
                        <Stack.Screen
                            name="AddTransaction"
                            component={AddTransactionScreen}
                            options={{ presentation: 'modal' }}
                        />
                        <Stack.Screen
                            name="AddBudget"
                            component={AddBudgetScreen}
                            options={{ presentation: 'modal' }}
                        />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};
