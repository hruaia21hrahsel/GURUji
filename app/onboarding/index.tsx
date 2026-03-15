import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';
import { CLASS_OPTIONS } from '@/lib/constants';
import type { StudentClass } from '@/lib/types';

export default function SelectClass() {
  const router = useRouter();
  const setClass = useAppStore((s) => s.setClass);

  const handleSelect = (value: StudentClass) => {
    setClass(value);
    router.push('/onboarding/board');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 pt-12">
        <Text className="text-3xl font-bold text-gray-900 mb-2">
          Welcome to GURUji
        </Text>
        <Text className="text-lg text-gray-500 mb-8">
          Which class are you in?
        </Text>

        <View className="flex-row flex-wrap gap-3">
          {CLASS_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              onPress={() => handleSelect(option.value)}
              className="w-[30%] aspect-square rounded-2xl bg-purple-50 items-center justify-center border-2 border-purple-100 active:bg-purple-100"
              style={{ borderColor: '#6C47FF' }}
            >
              <Text className="text-2xl font-bold" style={{ color: '#6C47FF' }}>
                {option.value}
              </Text>
              <Text className="text-xs text-gray-500 mt-1">Class</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}
