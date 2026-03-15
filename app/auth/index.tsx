import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { signInWithPhone, signInWithGoogle } from '@/lib/auth';

/**
 * Unified Auth Screen — three sign-in methods in priority order:
 *   1. Phone OTP (primary — most Indian students use phone)
 *   2. Google Sign-In (secondary)
 *   3. Email / Password (tertiary — link to email-form)
 */
export default function AuthScreen() {
  const router = useRouter();

  // Phone OTP state
  const [phone, setPhone] = useState('');
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // Google state
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  const anyLoading = phoneLoading || googleLoading;

  /** Handles phone OTP send */
  async function handleSendOtp() {
    setPhoneError(null);

    const fullNumber = phone.startsWith('+') ? phone : `+91${phone}`;

    setPhoneLoading(true);
    const { error } = await signInWithPhone(fullNumber);
    setPhoneLoading(false);

    if (error) {
      setPhoneError(error.message);
      return;
    }

    // Navigate to OTP verification with phone number as param
    router.push({ pathname: '/auth/otp-verify', params: { phone: fullNumber, type: 'sms' } });
  }

  /** Handles Google Sign-In */
  async function handleGoogleSignIn() {
    setGoogleError(null);
    setGoogleLoading(true);
    const { error } = await signInWithGoogle();
    setGoogleLoading(false);

    if (error) {
      setGoogleError(error.message);
    }
    // On success, onAuthStateChange in root layout handles redirect automatically
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pt-16 pb-10"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View className="items-center mb-10">
          <Text className="text-5xl font-bold text-[#6C47FF] tracking-tight">GURUji</Text>
          <Text className="text-base text-gray-500 mt-2">Your personal AI tutor</Text>
        </View>

        {/* ── Phone OTP (PRIMARY) ── */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-gray-700 mb-2">
            Continue with phone number
          </Text>

          <View className="flex-row items-center border border-gray-200 rounded-xl bg-gray-50 overflow-hidden">
            {/* Country code prefix */}
            <View className="px-4 py-3.5 border-r border-gray-200">
              <Text className="text-base font-medium text-gray-700">+91</Text>
            </View>

            <TextInput
              className="flex-1 px-4 py-3.5 text-base text-gray-900"
              placeholder="98765 43210"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={(text) => {
                // Strip any +91 prefix the user might type
                const cleaned = text.replace(/^\+91/, '').replace(/\D/g, '');
                setPhone(cleaned);
                setPhoneError(null);
              }}
              maxLength={10}
              editable={!anyLoading}
              returnKeyType="done"
              onSubmitEditing={handleSendOtp}
            />
          </View>

          {phoneError ? (
            <Text className="text-red-500 text-sm mt-1.5">{phoneError}</Text>
          ) : null}

          <TouchableOpacity
            className={`mt-3 py-3.5 rounded-xl items-center justify-center ${
              anyLoading ? 'bg-[#6C47FF]/60' : 'bg-[#6C47FF]'
            }`}
            onPress={handleSendOtp}
            disabled={anyLoading}
            activeOpacity={0.85}
          >
            {phoneLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-base">Send OTP</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Divider ── */}
        <View className="flex-row items-center mb-6">
          <View className="flex-1 h-px bg-gray-200" />
          <Text className="mx-3 text-sm text-gray-400">or</Text>
          <View className="flex-1 h-px bg-gray-200" />
        </View>

        {/* ── Google Sign-In (SECONDARY) ── */}
        <View className="mb-4">
          {googleError ? (
            <Text className="text-red-500 text-sm mb-2">{googleError}</Text>
          ) : null}

          <TouchableOpacity
            className={`flex-row items-center justify-center border rounded-xl py-3.5 gap-3 ${
              anyLoading ? 'border-gray-100 bg-gray-50' : 'border-gray-200 bg-white'
            }`}
            onPress={handleGoogleSignIn}
            disabled={anyLoading}
            activeOpacity={0.85}
          >
            {googleLoading ? (
              <ActivityIndicator color="#6C47FF" />
            ) : (
              <>
                {/* Google "G" icon — rendered as styled text since no asset available */}
                <View className="w-5 h-5 rounded-full bg-white border border-gray-200 items-center justify-center">
                  <Text className="text-xs font-bold text-[#4285F4]">G</Text>
                </View>
                <Text className="text-base font-medium text-gray-700">
                  Continue with Google
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Email (TERTIARY) ── */}
        <TouchableOpacity
          className="items-center py-3"
          onPress={() => router.push('/auth/email-form')}
          disabled={anyLoading}
          activeOpacity={0.7}
        >
          <Text className="text-sm text-[#6C47FF] font-medium underline">
            Use email and password instead
          </Text>
        </TouchableOpacity>

        {/* ── Footer ── */}
        <Text className="text-center text-xs text-gray-400 mt-8 leading-5">
          By continuing, you agree to our{'\n'}Terms of Service and Privacy Policy
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
