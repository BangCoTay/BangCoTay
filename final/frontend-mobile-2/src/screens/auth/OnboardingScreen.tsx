import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { useAppStore } from '../../store/appStore';

export const OnboardingScreen = ({ navigation }: any) => {
  const [step, setStep] = useState(1);
  const { setHasOnboarded } = useAppStore();

  const nextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      setHasOnboarded(true);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {step === 1 && "Welcome to Better Self"}
        {step === 2 && "Track Your Habits"}
        {step === 3 && "Meet Your AI Coach"}
      </Text>
      
      <Text style={styles.subtitle}>
        {step === 1 && "The journey of a thousand miles begins with a single step."}
        {step === 2 && "Stay consistent, hit your goals, and see your streak grow."}
        {step === 3 && "Get personalized advice and motivation every day."}
      </Text>

      <View style={styles.dots}>
        {[1, 2, 3].map((s) => (
          <View key={s} style={[styles.dot, step === s && styles.activeDot]} />
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={nextStep}>
        <Text style={styles.buttonText}>{step === 3 ? "Get Started" : "Next"}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    padding: 32,
  },
  title: {
    fontFamily: 'Caveat_700Bold',
    fontSize: 48,
    color: '#18181B',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontFamily: 'Quicksand_500Medium',
    fontSize: 18,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 28,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginVertical: 48,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  activeDot: {
    backgroundColor: '#2563EB',
    width: 24,
  },
  button: {
    backgroundColor: '#2563EB',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontFamily: 'Quicksand_600SemiBold',
    fontSize: 18,
  }
});
