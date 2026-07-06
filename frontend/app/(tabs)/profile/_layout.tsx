import { Stack } from "expo-router";

const ProfileLayout = () => {
  return (
    <Stack screenOptions={{headerShown: false}}>
      <Stack.Screen
        name="index" 
      />
      <Stack.Screen
        name="consent-preferences" 
        options={{ title: "Consent Preferences" }} 
      />
    </Stack>
  );
};

export default ProfileLayout;