import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useCurrentPlan } from '../../hooks/usePlans';
import { useCompleteTask, useUncompleteTask } from '../../hooks/useTasks';
import { useProgress } from '../../hooks/useProgress';
import { useOnboarding } from '../../hooks/useOnboarding';
import { useUserSubscription } from '../../hooks/useUsers';
import { ADDICTIONS } from '../../types';
import { Check, Lock, ChevronDown, ChevronUp, Sparkles } from 'lucide-react-native';

export const PlanScreen = ({ navigation }: any) => {
  const { data: planData, isLoading: planLoading } = useCurrentPlan();
  const { data: progress } = useProgress();
  const { data: onboardingData } = useOnboarding();
  const { data: subscription } = useUserSubscription();
  const completeTask = useCompleteTask();
  const uncompleteTask = useUncompleteTask();

  const [expandedDay, setExpandedDay] = useState<number>(1);

  const planDataNormalized = planData as any;
  const plan = planDataNormalized?.dayPlans || [];
  const subscriptionTier = subscription?.tier || "free";
  const totalProgress = progress?.completionRate || 0;
  const addiction = ADDICTIONS.find((a) => a.id === onboardingData?.addiction);

  const handleUpgrade = () => {
    navigation.navigate('Profile');
  };

  const handleToggleTask = async (taskId: string, currentCompleted: boolean) => {
    try {
      if (!currentCompleted) {
        await completeTask.mutateAsync(taskId);
      } else {
        await uncompleteTask.mutateAsync(taskId);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getDayProgress = (day: number) => {
    const dayPlan = plan.find((d: any) => d.dayNumber === day);
    if (!dayPlan || !dayPlan.tasks) return 0;
    const completed = dayPlan.tasks.filter((t: any) => t.completed).length;
    return (completed / dayPlan.tasks.length) * 100;
  };

  if (planLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Your 30-Day Plan</Text>
            <Text style={styles.headerSubtitle}>Quit {addiction?.label || "bad habits"}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.progressText}>{Math.round(totalProgress)}%</Text>
            <Text style={styles.progressLabel}>Complete</Text>
          </View>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${totalProgress}%` }]} />
        </View>
      </View>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {plan.map((dayPlan: any) => {
          const isPaidTier = subscriptionTier === "starter" || subscriptionTier === "premium";
          const isLocked = !dayPlan.unlocked && !isPaidTier;
          const isExpanded = expandedDay === dayPlan.dayNumber;
          const dayProgress = getDayProgress(dayPlan.dayNumber);
          const isComplete = dayProgress === 100;

          return (
            <View key={dayPlan.dayNumber} style={[styles.dayCard, isLocked && styles.dayCardLocked, isComplete && styles.dayCardSuccess]}>
              <TouchableOpacity 
                style={styles.dayHeader} 
                onPress={() => !isLocked && setExpandedDay(isExpanded ? 0 : dayPlan.dayNumber)}
                disabled={isLocked}
              >
                <View style={styles.dayHeaderLeft}>
                  <View style={[styles.dayIcon, isComplete ? styles.dayIconSuccess : isLocked ? styles.dayIconLocked : styles.dayIconDefault]}>
                    {isComplete ? <Check color="#fff" size={20} /> : isLocked ? <Lock color="#94a3b8" size={20} /> : <Text style={styles.dayNum}>{dayPlan.dayNumber}</Text>}
                  </View>
                  <View>
                    <Text style={styles.dayTitle}>Day {dayPlan.dayNumber}</Text>
                    <Text style={styles.dayTasksText}>
                      {isLocked ? "Upgrade to unlock" : `${dayPlan.tasks?.filter((t: any) => t.completed).length || 0}/${dayPlan.tasks?.length || 0} tasks`}
                    </Text>
                  </View>
                </View>

                {!isLocked && (
                  <View style={styles.dayHeaderRight}>
                    <View style={styles.miniProgBg}>
                      <View style={[styles.miniProgFill, { width: `${dayProgress}%` }]} />
                    </View>
                    {isExpanded ? <ChevronUp color="#94A3B8" size={20} /> : <ChevronDown color="#94A3B8" size={20} />}
                  </View>
                )}
              </TouchableOpacity>

              {isExpanded && !isLocked && (
                <View style={styles.tasksContainer}>
                  {dayPlan.tasks?.map((task: any) => (
                    <TouchableOpacity 
                      key={task.id} 
                      style={[styles.taskRow, task.completed && styles.taskRowCompleted]}
                      onPress={() => handleToggleTask(task.id, task.completed)}
                    >
                      <Text style={[styles.taskTitle, task.completed && styles.taskTitleCompleted]}>{task.title}</Text>
                      <View style={[styles.checkbox, task.completed && styles.checkboxCompleted]}>
                        {task.completed && <Check color="#fff" size={14} />}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          );
        })}

        {subscriptionTier === "free" && (
          <View style={styles.upgradeCard}>
            <View style={styles.upgradeIconBox}>
              <Sparkles color="#fff" size={20} />
            </View>
            <View style={styles.upgradeTexts}>
              <Text style={styles.upgradeTitle}>Unlock all 30 days</Text>
              <Text style={styles.upgradeSubtitle}>Get the full plan + unlimited AI coach</Text>
            </View>
            <TouchableOpacity style={styles.upgradeBtn} onPress={handleUpgrade}>
              <Text style={styles.upgradeBtnText}>Upgrade</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { padding: 24, paddingTop: 60, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerTitle: { fontFamily: 'Caveat_700Bold', fontSize: 32, color: '#18181B' },
  headerSubtitle: { fontFamily: 'Quicksand_500Medium', fontSize: 16, color: '#475569' },
  headerRight: { alignItems: 'flex-end' },
  progressText: { fontFamily: 'Quicksand_700Bold', fontSize: 24, color: '#2563EB' },
  progressLabel: { fontFamily: 'Quicksand_500Medium', fontSize: 12, color: '#94A3B8' },
  progressBarBg: { height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#2563EB', borderRadius: 4 },
  
  list: { flex: 1 },
  listContent: { padding: 16, paddingBottom: 40, gap: 12 },
  dayCard: { backgroundColor: '#ffffff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#FAFAFA', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  dayCardLocked: { opacity: 0.7 },
  dayCardSuccess: { borderColor: '#10B981' },
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dayHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  dayIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  dayIconDefault: { backgroundColor: '#EFF6FF' },
  dayIconSuccess: { backgroundColor: '#10B981' },
  dayIconLocked: { backgroundColor: '#F1F5F9' },
  dayNum: { fontFamily: 'Quicksand_700Bold', color: '#2563EB', fontSize: 18 },
  dayTitle: { fontFamily: 'Quicksand_600SemiBold', fontSize: 16, color: '#18181B' },
  dayTasksText: { fontFamily: 'Quicksand_500Medium', fontSize: 12, color: '#64748B', marginTop: 2 },
  dayHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  miniProgBg: { width: 60, height: 6, backgroundColor: '#E2E8F0', borderRadius: 3, overflow: 'hidden' },
  miniProgFill: { height: '100%', backgroundColor: '#10B981' },
  
  tasksContainer: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9', gap: 10 },
  taskRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, paddingHorizontal: 12, backgroundColor: '#FAFAFA', borderRadius: 8 },
  taskRowCompleted: { backgroundColor: '#ECFDF5' },
  taskTitle: { fontFamily: 'Quicksand_500Medium', fontSize: 14, color: '#334155', flex: 1, marginRight: 12 },
  taskTitleCompleted: { textDecorationLine: 'line-through', color: '#94A3B8' },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#CBD5E1', justifyContent: 'center', alignItems: 'center' },
  checkboxCompleted: { backgroundColor: '#10B981', borderColor: '#10B981' },
  
  upgradeCard: { marginTop: 16, flexDirection: 'row', backgroundColor: '#EFF6FF', padding: 16, borderRadius: 16, alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#BFDBFE' },
  upgradeIconBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#2563EB', justifyContent: 'center', alignItems: 'center' },
  upgradeTexts: { flex: 1 },
  upgradeTitle: { fontFamily: 'Quicksand_700Bold', fontSize: 14, color: '#1E3A8A' },
  upgradeSubtitle: { fontFamily: 'Quicksand_500Medium', fontSize: 12, color: '#3B82F6', marginTop: 2 },
  upgradeBtn: { backgroundColor: '#2563EB', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  upgradeBtnText: { color: '#ffffff', fontFamily: 'Quicksand_600SemiBold', fontSize: 13 }
});
