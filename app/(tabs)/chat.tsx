import { View, Text, SafeAreaView } from 'react-native';

export default function ChatScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 pt-8">
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-900">Ask GURUji</Text>
          <Text className="text-base text-gray-500 mt-1">
            Your Socratic tutor is ready to guide you.
          </Text>
        </View>

        <View className="flex-1 items-center justify-center">
          <View
            className="w-20 h-20 rounded-full items-center justify-center mb-4"
            style={{ backgroundColor: '#F5F3FF' }}
          >
            <Text className="text-4xl">G</Text>
          </View>
          <Text className="text-lg font-semibold text-gray-700 text-center mb-2">
            Chat coming soon
          </Text>
          <Text className="text-sm text-gray-400 text-center">
            Full chat implementation will be available after authentication is set up.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
