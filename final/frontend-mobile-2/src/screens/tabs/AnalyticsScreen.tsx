import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useProgress } from '../../hooks/useProgress';
import { useCurrentPlan } from '../../hooks/usePlans';
import { Flame, Target, Trophy, TrendingUp } from 'lucide-react-native';

export const AnalyticsScreen = () => {
  const { data: progress } = useProgress();
  const { data: planData } = useCurrentPlan();

  const streak = progress?.streak || 0;
  const completionRate = progress?.completionRate || 0;
  const currentDay = progress?.currentDay || 1;

  // Mock data for weekly chart
  const weeklyData = [
    { day: 'M', value: 80 },
    { day: 'T', value: 100 },
    { day: 'W', value: 60 },
    { day: 'T', value: 90 },
    { day: 'F', value: 100 },
    { day: 'S', value: 40 },
    { day: 'S', value: Math.round(completionRate) },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics</Text>
        <Text style={styles.headerSubtitle}>Track your progress</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={[styles.statIconBg, { backgroundColor: '#FEF3C7' }]}>
            <Flame color="#D97706" size={24} />
          </View>
          <Text style={styles.statValue}>{streak} Days</Text>
          <Text style={styles.statLabel}>Current Streak</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIconBg, { backgroundColor: '#DBEAFE' }]}>
            <Target color="#2563EB" size={24} />
          </View>
          <Text style={styles.statValue}>{currentDay}/30</Text>
          <Text style={styles.statLabel}>Plan Progress</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIconBg, { backgroundColor: '#ECFDF5' }]}>
            <TrendingUp color="#059669" size={24} />
          </View>
          <Text style={styles.statValue}>{Math.round(completionRate)}%</Text>
          <Text style={styles.statLabel}>Completion Rate</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIconBg, { backgroundColor: '#FCE7F3' }]}>
            <Trophy color="#DB2777" size={24} />
          </View>
          <Text style={styles.statValue}>12</Text>
          <Text style={styles.statLabel}>Total Badges</Text>
        </View>
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Weekly Activity</Text>
        <View style={styles.chart}>
          {weeklyData.map((item, index) => (
            <View key={index} style={styles.barContainer}>
              <View style={[styles.bar, { height: `${item.value}%` }, item.value === 100 && styles.barPerfect]} />
              <Text style={styles.barLabel}>{item.day}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  content: { padding: 24, paddingTop: 60, paddingBottom: 40 },
  header: { marginBottom: 32 },
  headerTitle: { fontFamily: 'Caveat_700Bold', fontSize: 36, color: '#18181B' },
  headerSubtitle: { fontFamily: 'Quicksand_500Medium', fontSize: 16, color: '#475569' },
  
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 32 },
  statCard: {
    width: '47%',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  statIconBg: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statValue: { fontFamily: 'Quicksand_700Bold', fontSize: 20, color: '#18181B', marginBottom: 4 },
  statLabel: { fontFamily: 'Quicksand_500Medium', fontSize: 12, color: '#64748B' },
  
  chartCard: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chartTitle: { fontFamily: 'Quicksand_600SemiBold', fontSize: 18, color: '#18181B', marginBottom: 24 },
  chart: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 160, paddingBottom: 24 },
  barContainer: { alignItems: 'center', width: 24 },
  bar: { width: '100%', backgroundColor: '#BFDBFE', borderRadius: 6 },
  barPerfect: { backgroundColor: '#2563EB' },
  barLabel: { fontFamily: 'Quicksand_500Medium', fontSize: 13, color: '#64748B', position: 'absolute', bottom: -24 }
});
