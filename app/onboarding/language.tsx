import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useAppStore } from "@/store/useAppStore";
import { LANGUAGES } from "@/lib/constants";
import type { Language } from "@/lib/types";

export default function SelectLanguage() {
  const router = useRouter();
  const selectedLanguage = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);

  const handleSelect = (l: Language) => {
    setLanguage(l); // This also sets onboardingComplete = true
    router.replace("/(tabs)");
  };

  return (
    <View className="flex-1 bg-background px-6 pt-16">
      <Text className="text-3xl font-bold text-text-primary mb-2">
        Language
      </Text>
      <Text className="text-lg text-text-secondary mb-8">
        How should GURUji talk to you?
      </Text>

      <View className="gap-4">
        {LANGUAGES.map((l) => (
          <Pressable
            key={l.value}
            onPress={() => handleSelect(l.value)}
            className={`p-6 rounded-2xl ${
              selectedLanguage === l.value ? "bg-primary" : "bg-surface"
            }`}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Text
              className={`text-xl font-semibold ${
                selectedLanguage === l.value ? "text-white" : "text-text-primary"
              }`}
            >
              {l.label}
            </Text>
            <Text
              className={`text-sm mt-1 ${
                selectedLanguage === l.value
                  ? "text-white/70"
                  : "text-text-secondary"
              }`}
            >
              {l.native}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
