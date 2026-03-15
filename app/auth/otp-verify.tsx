import { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { verifyPhoneOtp, verifyEmailOtp, signInWithPhone, requestPasswordReset } from '@/lib/auth';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 30; // seconds

/**
 * OTP Verification Screen
 * Accepts `phone` + `type: 'sms'` params (phone OTP)
 * or `email` + `type: 'email'` params (email OTP / magic link).
 */
export default function OtpVerifyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    phone?: string;
    email?: string;
    type: 'sms' | 'email';
  }>();

  const { phone, email, type = 'sms' } = params;
  const isSms = type === 'sms';
  const recipient = isSms ? (phone ?? '') : (email ?? '');

  // 6 individual OTP digit slots
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const inputRefs = useRef<(TextInput | null)[]>(Array(OTP_LENGTH).fill(null));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Resend cooldown timer
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const [resendLoading, setResendLoading] = useState(false);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start cooldown timer on mount
  useEffect(() => {
    startCooldown();
    // Auto-focus first input
    setTimeout(() => inputRefs.current[0]?.focus(), 150);
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startCooldown() {
    setCooldown(RESEND_COOLDOWN);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  const handleVerify = useCallback(
    async (code: string) => {
      if (code.length < OTP_LENGTH) return;

      setError(null);
      setLoading(true);

      const { error: verifyError } = isSms
        ? await verifyPhoneOtp(recipient, code)
        : await verifyEmailOtp(recipient, code);

      setLoading(false);

      if (verifyError) {
        setError(verifyError.message);
        // Clear digits on failure so user can re-enter
        setDigits(Array(OTP_LENGTH).fill(''));
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
        return;
      }

      // Success — onAuthStateChange in root layout handles redirect
    },
    [isSms, recipient]
  );

  function handleDigitChange(index: number, value: string) {
    // Handle paste: if user pastes all 6 digits at once into any box
    if (value.length > 1) {
      const clean = value.replace(/\D/g, '').slice(0, OTP_LENGTH);
      const newDigits = [...Array(OTP_LENGTH).fill('')];
      clean.split('').forEach((ch, i) => {
        newDigits[i] = ch;
      });
      setDigits(newDigits);
      const focusIndex = Math.min(clean.length, OTP_LENGTH - 1);
      inputRefs.current[focusIndex]?.focus();
      if (clean.length === OTP_LENGTH) handleVerify(clean);
      return;
    }

    const digit = value.replace(/\D/g, '');
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    const code = newDigits.join('');
    if (code.length === OTP_LENGTH) {
      handleVerify(code);
    }
  }

  function handleKeyPress(index: number, key: string) {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      // Move focus to previous box on backspace when current is empty
      const newDigits = [...digits];
      newDigits[index - 1] = '';
      setDigits(newDigits);
      inputRefs.current[index - 1]?.focus();
    }
  }

  async function handleResend() {
    setResendLoading(true);
    const { error: resendError } = isSms
      ? await signInWithPhone(recipient)
      : await requestPasswordReset(recipient);
    setResendLoading(false);

    if (resendError) {
      setError(resendError.message);
    } else {
      setError(null);
      setDigits(Array(OTP_LENGTH).fill(''));
      startCooldown();
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }

  const maskedRecipient = isSms
    ? recipient.slice(0, -4).replace(/\d/g, '•') + recipient.slice(-4)
    : recipient;

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Back button */}
      <TouchableOpacity
        className="absolute top-14 left-6 z-10 p-2"
        onPress={() => router.back()}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text className="text-[#6C47FF] text-base font-medium">← Back</Text>
      </TouchableOpacity>

      <View className="flex-1 justify-center px-6">
        {/* Header */}
        <Text className="text-3xl font-bold text-gray-900 mb-2">Enter OTP</Text>
        <Text className="text-base text-gray-500 mb-8">
          We sent a {OTP_LENGTH}-digit code to{'\n'}
          <Text className="font-semibold text-gray-700">{maskedRecipient}</Text>
        </Text>

        {/* 6 OTP input boxes */}
        <View className="flex-row justify-between mb-6">
          {digits.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              className={`w-12 h-14 rounded-xl border-2 text-center text-xl font-bold ${
                digit
                  ? 'border-[#6C47FF] bg-[#6C47FF]/5 text-[#6C47FF]'
                  : 'border-gray-200 bg-gray-50 text-gray-900'
              }`}
              value={digit}
              onChangeText={(val) => handleDigitChange(index, val)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
              keyboardType="number-pad"
              maxLength={OTP_LENGTH} // allow paste
              selectTextOnFocus
              editable={!loading}
            />
          ))}
        </View>

        {/* Error */}
        {error ? (
          <Text className="text-red-500 text-sm text-center mb-4">{error}</Text>
        ) : null}

        {/* Verify button (auto-submits, but also manual for accessibility) */}
        <TouchableOpacity
          className={`py-3.5 rounded-xl items-center justify-center mb-6 ${
            loading || digits.join('').length < OTP_LENGTH
              ? 'bg-[#6C47FF]/50'
              : 'bg-[#6C47FF]'
          }`}
          onPress={() => handleVerify(digits.join(''))}
          disabled={loading || digits.join('').length < OTP_LENGTH}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-semibold text-base">Verify</Text>
          )}
        </TouchableOpacity>

        {/* Resend OTP */}
        <View className="items-center">
          {cooldown > 0 ? (
            <Text className="text-sm text-gray-400">
              Resend OTP in{' '}
              <Text className="font-semibold text-gray-600">{cooldown}s</Text>
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResend} disabled={resendLoading}>
              {resendLoading ? (
                <ActivityIndicator color="#6C47FF" size="small" />
              ) : (
                <Text className="text-sm font-semibold text-[#6C47FF]">Resend OTP</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
