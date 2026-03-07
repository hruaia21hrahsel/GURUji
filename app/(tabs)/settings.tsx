import { View, Text, Pressable, ScrollView, Alert } from "react-native";
import { useAppStore } from "@/store/useAppStore";
import { useChatStore } from "@/store/useChatStore";
import { Ionicons } from "@expo/vector-icons";

function SettingRow({
  icon,
  label,
  value,
  onPress,
  danger,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-surface flex-row items-center px-4 py-4 border-b border-gray-100"
    >
      <Ionicons
        name={icon}
        size={22}
        color={danger ? "#EF4444" : "#6C47FF"}
      />
      <Text
        className={`flex-1 ml-3 text-base ${
          danger ? "text-red-500" : "text-text-primary"
        }`}
      >
        {label}
      </Text>
      {value && <Text className="text-text-secondary mr-2">{value}</Text>}
      {onPress && (
        <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
      )}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const userClass = useAppStore((s) => s.class);
  const board = useAppStore((s) => s.board);
  const language = useAppStore((s) => s.language);
  const resetOnboarding = useAppStore((s) => s.resetOnboarding);
  const clearAllSessions = useChatStore((s) => s.clearAllSessions);
  const sessionCount = useChatStore((s) => s.sessions.length);

  const handleClearHistory = () => {
    Alert.alert(
      "Clear Chat History",
      "This will delete all your chat sessions. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: clearAllSessions,
        },
      ]
    );
  };

  const handleResetOnboarding = () => {
    Alert.alert(
      "Reset Profile",
      "This will reset your class, board, and language settings.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: resetOnboarding,
        },
      ]
    );
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="pt-16 pb-8">
        <Text className="text-3xl font-bold text-text-primary px-6 mb-6">
          Settings
        </Text>

        {/* Profile Section */}
        <Text className="text-sm font-semibold text-text-secondary px-6 mb-2 uppercase tracking-wider">
          Profile
        </Text>
        <View className="mb-6">
          <SettingRow icon="school" label="Class" value={`Class ${userClass}`} />
          <SettingRow icon="book" label="Board" value={board || ""} />
          <SettingRow icon="language" label="Language" value={language || ""} />
          <SettingRow
            icon="refresh"
            label="Change Profile"
            onPress={handleResetOnboarding}
          />
        </View>

        {/* Data Section */}
        <Text className="text-sm font-semibold text-text-secondary px-6 mb-2 uppercase tracking-wider">
          Data
        </Text>
        <View className="mb-6">
          <SettingRow
            icon="chatbubbles"
            label="Chat Sessions"
            value={`${sessionCount}`}
          />
          <SettingRow
            icon="trash"
            label="Clear Chat History"
            onPress={handleClearHistory}
            danger
          />
        </View>

        {/* About Section */}
        <Text className="text-sm font-semibold text-text-secondary px-6 mb-2 uppercase tracking-wider">
          About
        </Text>
        <View className="mb-6">
          <SettingRow icon="information-circle" label="Version" value="1.0.0" />
          <SettingRow
            icon="heart"
            label="Made with love for Indian students"
          />
        </View>
      </View>
    </ScrollView>
  );
}
