import { Stack } from "expo-router";

const SleepLayout = () => {
  return (
    <Stack screenOptions={{headerShown: false}}>
      <Stack.Screen
        name="index" 
      />
      <Stack.Screen
        name="sleep-mode" 
        options={{ title: "Sleep Mode" }} 
      />
    </Stack>
  );
};

export default SleepLayout;