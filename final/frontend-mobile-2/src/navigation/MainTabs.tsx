import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { AICoachScreen } from "../screens/tabs/AICoachScreen";
import { PlanScreen } from "../screens/tabs/PlanScreen";
import { QuotesScreen } from "../screens/tabs/QuotesScreen";
import { AnalyticsScreen } from "../screens/tabs/AnalyticsScreen";
import { ProfileScreen } from "../screens/tabs/ProfileScreen";
import {
  MessageSquare,
  Calendar,
  Quote,
  BarChart,
  User,
} from "lucide-react-native";

const Tab = createBottomTabNavigator();

export const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let IconComponent;

          if (route.name === "AICoach") IconComponent = MessageSquare;
          else if (route.name === "Plan") IconComponent = Calendar;
          else if (route.name === "Quotes") IconComponent = Quote;
          else if (route.name === "Analytics") IconComponent = BarChart;
          else if (route.name === "Profile") IconComponent = User;

          return IconComponent ? (
            <IconComponent color={color} size={size} />
          ) : null;
        },
        tabBarActiveTintColor: "#3b82f6",
        tabBarInactiveTintColor: "#9ca3af",
        headerShown: false,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: "#f3f4f6",
          backgroundColor: "#ffffff",
          paddingBottom: 5,
        },
      })}
    >
      <Tab.Screen
        name="AICoach"
        component={AICoachScreen}
        options={{ title: "AI Coach" }}
      />
      <Tab.Screen
        name="Plan"
        component={PlanScreen}
        options={{ title: "Plan" }}
      />
      <Tab.Screen
        name="Quotes"
        component={QuotesScreen}
        options={{ title: "Quotes" }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{ title: "Analytics" }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "Profile" }}
      />
    </Tab.Navigator>
  );
};
