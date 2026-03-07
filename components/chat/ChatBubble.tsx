import { View, Text } from "react-native";
import Markdown from "react-native-markdown-display";

interface ChatBubbleProps {
  role: "user" | "assistant";
  content: string;
}

const assistantMarkdownStyles = {
  body: { color: "#1A1A2E", fontSize: 15, lineHeight: 22 },
  strong: { fontWeight: "700" as const },
  em: { fontStyle: "italic" as const },
  paragraph: { marginTop: 0, marginBottom: 8 },
  list_item: { marginBottom: 4 },
  code_inline: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 13,
    fontFamily: "monospace",
  },
  fence: {
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 8,
    fontSize: 13,
    fontFamily: "monospace",
  },
  blockquote: {
    borderLeftWidth: 3,
    borderLeftColor: "#6C47FF",
    paddingLeft: 12,
    marginLeft: 0,
    opacity: 0.9,
  },
};

export function ChatBubble({ role, content }: ChatBubbleProps) {
  const isUser = role === "user";

  return (
    <View
      className={`max-w-[85%] mb-3 ${isUser ? "self-end" : "self-start"}`}
    >
      {!isUser && (
        <Text className="text-xs text-primary font-semibold mb-1 ml-1">
          GURUji
        </Text>
      )}
      <View
        className={`px-4 py-3 rounded-2xl ${
          isUser
            ? "bg-primary rounded-br-sm"
            : "bg-surface rounded-bl-sm"
        }`}
        style={
          !isUser
            ? {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }
            : undefined
        }
      >
        {isUser ? (
          <Text className="text-white text-[15px] leading-[22px]">
            {content}
          </Text>
        ) : (
          <Markdown style={assistantMarkdownStyles}>{content}</Markdown>
        )}
      </View>
    </View>
  );
}
