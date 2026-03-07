import { View, TextInput, Pressable } from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [text, setText] = useState("");

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
  };

  return (
    <View className="flex-row items-end px-4 py-3 bg-surface border-t border-gray-200 gap-2">
      <TextInput
        className="flex-1 bg-background rounded-2xl px-4 py-3 text-[15px] text-text-primary max-h-[120px]"
        placeholder="Ask GURUji anything..."
        placeholderTextColor="#9CA3AF"
        value={text}
        onChangeText={setText}
        multiline
        editable={!disabled}
        onSubmitEditing={handleSend}
        blurOnSubmit={false}
      />
      <Pressable
        onPress={handleSend}
        disabled={!text.trim() || disabled}
        className={`w-11 h-11 rounded-full items-center justify-center ${
          text.trim() && !disabled ? "bg-primary" : "bg-gray-300"
        }`}
      >
        <Ionicons
          name={disabled ? "hourglass" : "send"}
          size={20}
          color="white"
        />
      </Pressable>
    </View>
  );
}
