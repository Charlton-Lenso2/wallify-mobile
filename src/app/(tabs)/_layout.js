import { Tabs } from "expo-router";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { View, StyleSheet } from "react-native";
import { useTheme } from "../../context/ThemeContext";

export default function TabsLayout() {
  const { colors, activeScheme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.subtext,
        tabBarStyle: {
          position: "absolute",
          left: 16,
          right: 16,
          bottom: 24,
          height: 64,
          borderRadius: 24,
          borderTopWidth: 0,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          elevation: 0,
          overflow: "hidden",
          backgroundColor: "transparent",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: activeScheme === "dark" ? 0 : 0.08,
          shadowRadius: 12,
        },
        tabBarBackground: () => (
          <View style={StyleSheet.absoluteFill}>
            <BlurView
              intensity={80}
              tint={activeScheme === "dark" ? "dark" : "light"}
              blurMethod="dimezisBlurView"
              style={StyleSheet.absoluteFill}
            />
            <View
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: colors.card,
                  opacity: activeScheme === "dark" ? 0.3 : 0.55,
                },
              ]}
            />
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
