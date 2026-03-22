import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { MessageCircle, CalendarDays, Heart, BarChart2, User } from 'lucide-react-native';
import { AICoachScreen } from '@/screens/tabs/AICoachScreen';
import { PlanScreen } from '@/screens/tabs/PlanScreen';
import { QuotesScreen } from '@/screens/tabs/QuotesScreen';
import { AnalyticsScreen } from '@/screens/tabs/AnalyticsScreen';
import { ProfileScreen } from '@/screens/tabs/ProfileScreen';
import { colors, typography } from '@/theme';

export type MainTabParamList = {
  AICoach: undefined;
  Plan: undefined;
  Quotes: undefined;
  Analytics: undefined;
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
        tabBarBackground: () => (
          <BlurView tint="light" intensity={80} style={StyleSheet.absoluteFill} />
        ),
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: 0,
          elevation: 0,
          backgroundColor: 'transparent',
          height: 60,
          paddingBottom: 6,
          paddingTop: 6,
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
          } else if (route.name === 'Analytics') {
            return <BarChart2 size={size} color={color} strokeWidth={focused ? 2.5 : 2} />;
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
      <Tab.Screen name="Analytics" component={AnalyticsScreen} options={{ tabBarLabel: 'Analytics' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}
