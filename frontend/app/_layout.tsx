import { useAuthStore } from "@/store/authStore";
import { Stack, useRouter, useSegments, SplashScreen } from "expo-router";
import { useEffect, useState } from "react";
import { useFonts } from "expo-font";
import { useProfileStore } from "@/store/userProfileStore";
import { sensorBackgroundTaskManager } from "@/services";
import { useTransparencyStore } from "@/store/transparencyStore";
import { ActivityIndicator, View } from "react-native";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [isInitializing, setIsInitializing] = useState(true);

  const { checkAuth, user, token } = useAuthStore();
  const { loadProfileStatus, hasCompletedAppOnboarding, hasCompletedPrivacyOnboarding } = useProfileStore();
  const { loadTransparencyStatus } = useTransparencyStore();

  const [fontsLoaded] = useFonts({
    "SpaceMono-Regular": require("@/assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    const initialize = async () => {
      try {
        checkAuth();
        await loadProfileStatus();
        await loadTransparencyStatus();
        const userConsentPreferences = useProfileStore.getState().userConsentPreferences;
        sensorBackgroundTaskManager.updateConfig({
          accelerometerEnabled: userConsentPreferences?.accelerometerEnabled ?? false,
        });
        // Register only the accelerometer as it is on at all times, but light and audio are only on during sleep mode
        sensorBackgroundTaskManager.registerAccelerometer();
      } catch (error) {
        console.error("Initialization failed:", error);
      } finally {
        setIsInitializing(false);
      }
    };
    initialize();
  }, []);

  useEffect(() => {
    if (!fontsLoaded || isInitializing) {
      return;
    }

    const inAuthStack = segments[0] === "(auth)";
    const isAuthenticated = user && token;

    if (!isAuthenticated && !inAuthStack) {
      router.replace("/(auth)");
    } else if (isAuthenticated && inAuthStack && !hasCompletedPrivacyOnboarding) {
      router.replace("/(onboarding)");
    } else if (isAuthenticated && inAuthStack && hasCompletedPrivacyOnboarding && !hasCompletedAppOnboarding) {
      router.replace("/(onboarding)/questions");
    } else if (isAuthenticated && inAuthStack && hasCompletedPrivacyOnboarding && hasCompletedAppOnboarding) {
      router.replace("/(tabs)/sleep/");
    }
  }, [user, token, segments, isInitializing, fontsLoaded]);

  if (isInitializing || !fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="privacy-policy" />
    </Stack>
  );
}