import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MessageCircle, CalendarDays, Heart, User } from 'lucide-react-native';
import { AICoachScreen } from '@/screens/tabs/AICoachScreen';
import { PlanScreen } from '@/screens/tabs/PlanScreen';
import { QuotesScreen } from '@/screens/tabs/QuotesScreen';
import { ProfileScreen } from '@/screens/tabs/ProfileScreen';
import { colors, typography } from '@/theme';

export type MainTabParamList = {
  AICoach: undefined;
  Plan: undefined;
  Quotes: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: colors.borderLight,
          backgroundColor: colors.backgroundSecondary,
          height: Platform.OS === 'ios' ? 88 : 66,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          paddingTop: 12,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: typography.fontFamily.semibold,
        },
        tabBarIcon: ({ focused, color, size }) => {
          size = 22; // Slightly smaller size for Lucide icons looks better

          if (route.name === 'AICoach') {
            return <MessageCircle size={size} color={color} strokeWidth={focused ? 2.5 : 2} />;
          } else if (route.name === 'Plan') {
            return <CalendarDays size={size} color={color} strokeWidth={focused ? 2.5 : 2} />;
          } else if (route.name === 'Quotes') {
            return <Heart size={size} color={color} strokeWidth={focused ? 2.5 : 2} />;
          } else if (route.name === 'Profile') {
            return <User size={size} color={color} strokeWidth={focused ? 2.5 : 2} />;
          }

          return null;
        },
      })}
    >
      <Tab.Screen name="AICoach" component={AICoachScreen} options={{ tabBarLabel: 'Coach' }} />
      <Tab.Screen name="Plan" component={PlanScreen} options={{ tabBarLabel: 'Plan' }} />
      <Tab.Screen name="Quotes" component={QuotesScreen} options={{ tabBarLabel: 'Quotes' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}
