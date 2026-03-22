import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "@clerk/clerk-expo";
import { SignInScreen } from "../screens/auth/SignInScreen";
import { OnboardingScreen } from "../screens/auth/OnboardingScreen";
import { MainTabs } from "./MainTabs";
import { useAppStore } from "../store/appStore";

const Stack = createNativeStackNavigator();

export const RootNavigator = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const { hasOnboarded } = useAppStore();

  if (!isLoaded) {
    return null;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isSignedIn ? (
        <Stack.Screen name="SignIn" component={SignInScreen} />
      ) : !hasOnboarded ? (
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      ) : (
        <Stack.Screen name="MainTabs" component={MainTabs} />
      )}
    </Stack.Navigator>
  );
};
