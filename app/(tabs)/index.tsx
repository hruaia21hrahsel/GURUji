import { View, Text, SafeAreaView } from 'react-native';
import { useAppStore } from '@/store/useAppStore';

export default function HomeScreen() {
  const studentClass = useAppStore((s) => s.class);
  const board = useAppStore((s) => s.board);
  const language = useAppStore((s) => s.language);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 pt-8">
        <View className="mb-8">
          <Text className="text-2xl font-bold text-gray-900">
            Welcome back!
          </Text>
          <Text className="text-base text-gray-500 mt-1">
            Ready to learn something new today?
          </Text>
        </View>

        <View
          className="rounded-2xl p-5 mb-4"
          style={{ backgroundColor: '#F5F3FF' }}
        >
          <Text className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Your Profile
          </Text>
          <View className="flex-row gap-3">
            <View className="flex-1 bg-white rounded-xl p-3 items-center">
              <Text className="text-2xl font-bold" style={{ color: '#6C47FF' }}>
                {studentClass || '—'}
              </Text>
              <Text className="text-xs text-gray-500 mt-1">Class</Text>
            </View>
            <View className="flex-1 bg-white rounded-xl p-3 items-center">
              <Text className="text-lg font-bold" style={{ color: '#6C47FF' }}>
                {board || '—'}
              </Text>
              <Text className="text-xs text-gray-500 mt-1">Board</Text>
            </View>
            <View className="flex-1 bg-white rounded-xl p-3 items-center">
              <Text className="text-sm font-bold" style={{ color: '#6C47FF' }}>
                {language || '—'}
              </Text>
              <Text className="text-xs text-gray-500 mt-1">Language</Text>
            </View>
          </View>
        </View>

        <View
          className="rounded-2xl p-5"
          style={{ backgroundColor: '#6C47FF' }}
        >
          <Text className="text-lg font-bold text-white mb-1">
            Ask GURUji anything
          </Text>
          <Text className="text-sm text-purple-200">
            Get guided help with any subject — no shortcuts, just understanding.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
