import { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const THEME_KEY = "@wallify_theme_preference";

const lightColors = {
  background: "#FFFFFF",
  card: "#F5F5F5",
  text: "#1A1A1A",
  subtext: "#666666",
  border: "#E0E0E0",
  accent: "#3478F6",
};

const darkColors = {
  background: "#121212",
  card: "#1E1E1E",
  text: "#F5F5F5",
  subtext: "#A0A0A0",
  border: "#2C2C2C",
  accent: "#5E9BFF",
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme(); // 'light' | 'dark'
  const [preference, setPreference] = useState("system"); // 'light' | 'dark' | 'system'
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((saved) => {
      if (saved) setPreference(saved);
      setLoaded(true);
    });
  }, []);

  const setThemePreference = async (value) => {
    setPreference(value);
    await AsyncStorage.setItem(THEME_KEY, value);
  };

  const activeScheme = preference === "system" ? systemScheme : preference;
  const colors = activeScheme === "dark" ? darkColors : lightColors;

  if (!loaded) return null; // or a splash/loading screen

  return (
    <ThemeContext.Provider
      value={{ colors, preference, setThemePreference, activeScheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
