import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export const colors = {
  primary: "#0891B2",
  primaryLight: "#22D3EE",
  primaryDark: "#0E7490",
  primaryDarkHex: "#0E7490",
  accent: "#22C55E",
  accentLight: "#4ADE80",

  background: "#ECFEFF",
  backgroundSecondary: "#FFFFFF",
  surface: "#FFFFFF",
  surfaceSecondary: "#F8FAFC",

  text: "#164E63",
  textSecondary: "#475569",
  textTertiary: "#94A3B8",

  border: "#CFFAFE",
  borderLight: "#E0F2FE",

  success: "#22C55E",
  error: "#EF4444",
  warning: "#F59E0B",

  // Dark mode
  dark: {
    background: "#083344", // Cyan-950 equivalent
    backgroundSecondary: "#164E63", // Cyan-900
    surface: "#164E63",
    surfaceSecondary: "#0E7490", // Cyan-800
    text: "#ECFEFF",
    textSecondary: "#A5F3FC",
    textTertiary: "#67E8F9",
    border: "#164E63",
    borderLight: "#083344",
  },

  // Persona colors
  friend: "#3B82F6",
  family: "#22C55E",
  girlfriend: "#EC4899",
  coach: "#0891B2",
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

export const typography = {
  fontFamily: {
    regular: "Inter_400Regular",
    medium: "Inter_500Medium",
    semibold: "Inter_600SemiBold",
    bold: "Inter_700Bold",
  },
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
