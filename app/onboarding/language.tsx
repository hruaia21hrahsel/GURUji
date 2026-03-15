import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useAppStore } from '@/store/useAppStore';
import { LANGUAGE_OPTIONS } from '@/lib/constants';
import type { Language } from '@/lib/types';

export default function SelectLanguage() {
  const setLanguage = useAppStore((s) => s.setLanguage);
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);

  const handleSelect = (value: Language) => {
    setLanguage(value);
    completeOnboarding();
    // Navigation is handled by the root layout guard — auth wall comes after onboarding
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 pt-12">
        <Text className="text-3xl font-bold text-gray-900 mb-2">
          Language
        </Text>
        <Text className="text-lg text-gray-500 mb-8">
          Which language do you prefer?
        </Text>

        <View className="gap-4">
          {LANGUAGE_OPTIONS.map((option) => (
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
