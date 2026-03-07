import { View, KeyboardAvoidingView, Platform } from "react-native";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { fetch as expoFetch } from "expo/fetch";
import { ChatMessages } from "@/components/chat/ChatMessages";
import { ChatInput } from "@/components/chat/ChatInput";
import { useAppStore } from "@/store/useAppStore";
import { useMemo } from "react";

export default function ChatScreen() {
  const userClass = useAppStore((s) => s.class);
  const board = useAppStore((s) => s.board);
  const language = useAppStore((s) => s.language);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { userProfile: { class: userClass, board, language } },
        fetch: expoFetch as unknown as typeof globalThis.fetch,
      }),
    [userClass, board, language]
  );

  const { messages, sendMessage, status } = useChat({ transport });

  const isLoading = status === "submitted" || status === "streaming";

  // Extract text content from UIMessage parts
  const chatMessages = messages.map((msg) => ({
    id: msg.id,
    role: msg.role as "user" | "assistant",
    content:
      msg.parts
        ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
        .map((p) => p.text)
        .join("") || "",
  }));

  const handleSend = (text: string) => {
    sendMessage({ text });
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View className="flex-1 pt-12">
        <ChatMessages messages={chatMessages} />
        <ChatInput onSend={handleSend} disabled={isLoading} />
      </View>
    </KeyboardAvoidingView>
  );
}
