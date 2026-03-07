import { View, Text, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useAppStore } from "@/store/useAppStore";
import { useChatStore } from "@/store/useChatStore";
import { Ionicons } from "@expo/vector-icons";

export default function HomeScreen() {
  const router = useRouter();
  const userClass = useAppStore((s) => s.class);
  const board = useAppStore((s) => s.board);
  const sessions = useChatStore((s) => s.sessions);
  const recentSessions = sessions.slice(0, 5);

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="px-6 pt-16 pb-8">
        {/* Header */}
        <Text className="text-text-secondary text-base">Namaste! 🙏</Text>
        <Text className="text-3xl font-bold text-text-primary mt-1">
          Class {userClass} — {board}
        </Text>

        {/* Ask GURUji CTA */}
        <Pressable
          onPress={() => router.push("/(tabs)/chat")}
          className="bg-primary rounded-2xl p-6 mt-8"
          style={{
            shadowColor: "#6C47FF",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          <View className="flex-row items-center gap-3">
            <Text className="text-4xl">🎓</Text>
            <View className="flex-1">
              <Text className="text-white text-xl font-bold">Ask GURUji</Text>
              <Text className="text-white/80 text-sm mt-1">
                Get help with any NCERT topic
              </Text>
            </View>
            <Ionicons name="arrow-forward-circle" size={32} color="white" />
          </View>
        </Pressable>

        {/* Quick Subjects */}
        <Text className="text-lg font-semibold text-text-primary mt-8 mb-4">
          Quick Start
        </Text>
        <View className="flex-row flex-wrap gap-3">
          {["Maths", "Science", "English", "Social Science"].map((subject) => (
            <Pressable
              key={subject}
              onPress={() => router.push("/(tabs)/chat")}
              className="bg-surface px-5 py-3 rounded-xl"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}
            >
              <Text className="text-text-primary font-medium">{subject}</Text>
            </Pressable>
          ))}
        </View>

        {/* Recent Chats */}
        {recentSessions.length > 0 && (
          <>
            <Text className="text-lg font-semibold text-text-primary mt-8 mb-4">
              Recent Chats
            </Text>
            <View className="gap-2">
              {recentSessions.map((session) => (
                <Pressable
                  key={session.id}
                  className="bg-surface p-4 rounded-xl flex-row items-center"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1,
                  }}
                >
                  <Ionicons
                    name="chatbubble-outline"
                    size={20}
                    color="#6B7280"
                  />
                  <Text
                    className="flex-1 ml-3 text-text-primary"
                    numberOfLines={1}
                  >
                    {session.title}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                </Pressable>
              ))}
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}
