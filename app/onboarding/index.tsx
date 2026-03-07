import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useAppStore } from "@/store/useAppStore";
import { CLASS_LEVELS } from "@/lib/constants";
import type { ClassLevel } from "@/lib/types";

export default function SelectClass() {
  const router = useRouter();
  const selectedClass = useAppStore((s) => s.class);
  const setClass = useAppStore((s) => s.setClass);

  const handleSelect = (c: ClassLevel) => {
    setClass(c);
    router.push("/onboarding/board");
  };

  return (
    <View className="flex-1 bg-background px-6 pt-16">
      <Text className="text-3xl font-bold text-text-primary mb-2">
        Welcome to GURUji
      </Text>
      <Text className="text-lg text-text-secondary mb-8">
        Which class are you in?
      </Text>

      <View className="flex-row flex-wrap gap-4">
        {CLASS_LEVELS.map((c) => (
          <Pressable
            key={c}
            onPress={() => handleSelect(c)}
            className={`w-[28%] aspect-square rounded-2xl items-center justify-center ${
              selectedClass === c ? "bg-primary" : "bg-surface"
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
              className={`text-2xl font-bold ${
                selectedClass === c ? "text-white" : "text-text-primary"
              }`}
            >
              {c}
            </Text>
            <Text
              className={`text-xs mt-1 ${
                selectedClass === c ? "text-white/80" : "text-text-secondary"
              }`}
            >
              Class
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
