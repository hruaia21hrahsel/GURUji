import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useAppStore } from "@/store/useAppStore";
import { BOARDS } from "@/lib/constants";
import type { Board } from "@/lib/types";

export default function SelectBoard() {
  const router = useRouter();
  const selectedBoard = useAppStore((s) => s.board);
  const setBoard = useAppStore((s) => s.setBoard);

  const handleSelect = (b: Board) => {
    setBoard(b);
    router.push("/onboarding/language");
  };

  return (
    <View className="flex-1 bg-background px-6 pt-16">
      <Text className="text-3xl font-bold text-text-primary mb-2">
        Your Board
      </Text>
      <Text className="text-lg text-text-secondary mb-8">
        Select your education board
      </Text>

      <View className="gap-4">
        {BOARDS.map((b) => (
          <Pressable
            key={b.value}
            onPress={() => handleSelect(b.value)}
            className={`p-6 rounded-2xl ${
              selectedBoard === b.value ? "bg-primary" : "bg-surface"
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
                selectedBoard === b.value ? "text-white" : "text-text-primary"
              }`}
            >
              {b.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
