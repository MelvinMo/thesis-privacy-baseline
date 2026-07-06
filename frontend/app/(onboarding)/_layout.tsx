import { Stack } from "expo-router";

export default function OnboardingLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" /> {/* This is the microphone consent screen*/}
            <Stack.Screen name="accelerometer-consent" />
            <Stack.Screen name="light-sensor-consent" />
            <Stack.Screen name="journal-data" />
            <Stack.Screen name="cloud-storage" />
            <Stack.Screen name="privacy-policy-agreement"/>
            <Stack.Screen name="transparency" />
            <Stack.Screen name="questions-explanation" />
            <Stack.Screen name="questions" />
        </Stack>
    );
}