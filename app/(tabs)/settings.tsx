import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useAppStore } from '@/store/useAppStore';

export default function SettingsScreen() {
  const studentClass = useAppStore((s) => s.class);
  const board = useAppStore((s) => s.board);
  const language = useAppStore((s) => s.language);
  const authProvider = useAppStore((s) => s.authProvider);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 pt-8">
        <Text className="text-2xl font-bold text-gray-900 mb-6">Settings</Text>

        {/* Profile section */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Profile
          </Text>
          <View className="bg-gray-50 rounded-2xl overflow-hidden">
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
              <Text className="text-base text-gray-700">Class</Text>
              <Text className="text-base font-semibold text-gray-900">
                {studentClass ? `Class ${studentClass}` : '—'}
              </Text>
            </View>
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
              <Text className="text-base text-gray-700">Board</Text>
              <Text className="text-base font-semibold text-gray-900">
                {board || '—'}
              </Text>
            </View>
            <View className="flex-row items-center justify-between px-4 py-3">
              <Text className="text-base text-gray-700">Language</Text>
              <Text className="text-base font-semibold text-gray-900">
                {language || '—'}
              </Text>
            </View>
          </View>
        </View>

        {/* Account section */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Account
          </Text>
          <View className="bg-gray-50 rounded-2xl overflow-hidden">
            <View className="flex-row items-center justify-between px-4 py-3">
              <Text className="text-base text-gray-700">Signed in with</Text>
              <Text className="text-base font-semibold text-gray-900 capitalize">
                {authProvider || '—'}
              </Text>
            </View>
          </View>
        </View>

        {/* Sign out button stub */}
        <TouchableOpacity
          className="rounded-2xl py-4 items-center"
          style={{ backgroundColor: '#FEF2F2' }}
          onPress={() => {
            // Sign out implementation coming in Plan 02
          }}
        >
          <Text className="text-base font-semibold text-red-500">Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
