import "../global.css";
import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAppStore } from "@/store/useAppStore";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const onboardingComplete = useAppStore((s) => s.onboardingComplete);

  useEffect(() => {
    const inOnboarding = segments[0] === "onboarding";

    if (!onboardingComplete && !inOnboarding) {
      router.replace("/onboarding");
    } else if (onboardingComplete && inOnboarding) {
      router.replace("/(tabs)");
    }
  }, [onboardingComplete, segments]);

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
