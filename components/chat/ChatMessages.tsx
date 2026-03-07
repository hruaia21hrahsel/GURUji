import { FlatList, View, Text } from "react-native";
import { useRef, useEffect } from "react";
import { ChatBubble } from "./ChatBubble";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatMessagesProps {
  messages: Message[];
}

export function ChatMessages({ messages }: ChatMessagesProps) {
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length, messages[messages.length - 1]?.content]);

  if (messages.length === 0) {
    return (
      <View className="flex-1 items-center justify-center px-8">
        <Text className="text-5xl mb-4">🎓</Text>
        <Text className="text-xl font-bold text-text-primary text-center mb-2">
          Namaste! I'm GURUji
        </Text>
        <Text className="text-text-secondary text-center leading-6">
          Ask me anything about your NCERT syllabus. I'll guide you through
          the answer step by step!
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      ref={flatListRef}
      data={messages}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ChatBubble role={item.role} content={item.content} />
      )}
      contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
      showsVerticalScrollIndicator={false}
    />
  );
}
