import { useEffect } from "react";
import {
  Stack,
  useRouter,
  useSegments,
  useRootNavigationState,
} from "expo-router";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { ActivityIndicator, View } from "react-native";

function RootStack() {
  const { colors } = useTheme();
  const { user, initializing } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (initializing || !navigationState?.key) return;
    const inAuthGroup = segments[0] === "(auth)";

    if (!user && !inAuthGroup) {
      router.replace("/login");
    } else if (user && inAuthGroup) {
      router.replace("/");
    }
  }, [user, initializing, navigationState?.key, segments, router]);

  if (initializing || !navigationState?.key) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="wallpaper/[id]" options={{ headerShown: false }} />
      <Stack.Screen
        name="privacy-policy"
        options={{ title: "Privacy Policy" }}
      />
      <Stack.Screen name="terms" options={{ title: "Terms of Use" }} />
      <Stack.Screen name="saved" options={{ title: "Saved" }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RootStack />
      </AuthProvider>
    </ThemeProvider>
  );
}
