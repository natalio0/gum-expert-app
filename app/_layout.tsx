import { AuthProvider } from "@/context/AuthContext";
import { ClerkProvider } from "@clerk/clerk-expo";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey="pk_test_dHJ1c3R5LWxvYnN0ZXItNTMuY2xlcmsuYWNjb3VudHMuZGV2JA">
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
        </Stack>
      </AuthProvider>
    </ClerkProvider>
  );
}
