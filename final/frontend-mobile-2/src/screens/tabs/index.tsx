import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const AICoachScreen = () => <View style={styles.container}><Text>AI Coach Tab</Text></View>;
export const PlanScreen = () => <View style={styles.container}><Text>Plan Tab</Text></View>;
export const QuotesScreen = () => <View style={styles.container}><Text>Quotes Tab</Text></View>;
export const AnalyticsScreen = () => <View style={styles.container}><Text>Analytics Tab</Text></View>;
export const ProfileScreen = () => <View style={styles.container}><Text>Profile Tab</Text></View>;

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' }
});
