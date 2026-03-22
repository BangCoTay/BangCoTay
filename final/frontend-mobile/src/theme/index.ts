import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export const colors = {
  primary: "#0D9488",
  primaryLight: "#14B8A6",
  primaryDark: "#0F766E",
  accent: "#E8613A",
  accentLight: "#F97316",

  background: "#FFFFFF",
  backgroundSecondary: "#F8FAFC",
  surface: "#FFFFFF",
  surfaceSecondary: "#F1F5F9",

  text: "#0F172A",
  textSecondary: "#64748B",
  textTertiary: "#94A3B8",

  border: "#E2E8F0",
  borderLight: "#F1F5F9",

  success: "#22C55E",
  error: "#EF4444",
  warning: "#F59E0B",

  // Dark mode
  dark: {
    background: "#0F172A",
    backgroundSecondary: "#1E293B",
    surface: "#1E293B",
    surfaceSecondary: "#334155",
    text: "#F8FAFC",
    textSecondary: "#94A3B8",
    textTertiary: "#64748B",
    border: "#334155",
    borderLight: "#1E293B",
  },

  // Persona colors
  friend: "#3B82F6",
  family: "#22C55E",
  girlfriend: "#EC4899",
  coach: "#0D9488",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  hero: 40,
};

export const fontWeight = {
  normal: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
  extrabold: "800" as const,
};

export const screen = { width, height };
