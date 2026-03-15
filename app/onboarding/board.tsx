import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';
import { BOARD_OPTIONS } from '@/lib/constants';
import type { Board } from '@/lib/types';

export default function SelectBoard() {
  const router = useRouter();
  const setBoard = useAppStore((s) => s.setBoard);

  const handleSelect = (value: Board) => {
    setBoard(value);
    router.push('/onboarding/language');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 pt-12">
        <Text className="text-3xl font-bold text-gray-900 mb-2">
          Your Board
        </Text>
        <Text className="text-lg text-gray-500 mb-8">
          Which board do you follow?
        </Text>

        <View className="gap-4">
          {BOARD_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              onPress={() => handleSelect(option.value)}
              className="rounded-2xl px-6 py-5 border-2 active:opacity-80"
              style={{ borderColor: '#6C47FF', backgroundColor: '#F5F3FF' }}
            >
              <Text className="text-xl font-semibold" style={{ color: '#6C47FF' }}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}
