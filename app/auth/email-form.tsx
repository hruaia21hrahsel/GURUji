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
import { signUpWithEmail, signInWithEmail, requestPasswordReset } from '@/lib/auth';

type Mode = 'signup' | 'login';

/**
 * Email / Password Form
 * Two-mode form: Sign Up (default) and Log In.
 * Toggles between modes via tab-style header.
 */
export default function EmailFormScreen() {
  const router = useRouter();

  const [mode, setMode] = useState<Mode>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function clearForm() {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError(null);
    setSuccessMessage(null);
  }

  function switchMode(newMode: Mode) {
    clearForm();
    setMode(newMode);
  }

  async function handleSubmit() {
    setError(null);
    setSuccessMessage(null);

    if (mode === 'signup') {
      // Validate confirm password
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }

      setLoading(true);
      const { data, error: signUpError } = await signUpWithEmail(email, password);
      setLoading(false);

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      // If Supabase returns data without a session, email confirmation is required
      const hasSession = (data as any)?.session != null;
      if (!hasSession) {
        setSuccessMessage('Check your email to confirm your account.');
      }
      // If session exists, onAuthStateChange fires and root layout redirects
    } else {
      // Login mode
      setLoading(true);
      const { error: signInError } = await signInWithEmail(email, password);
      setLoading(false);

      if (signInError) {
        setError(signInError.message);
        return;
      }
      // Success — onAuthStateChange handles redirect
    }
  }

  async function handleForgotPassword() {
    if (!email) {
      setError('Enter your email address above, then tap Forgot Password.');
      return;
    }
    setLoading(true);
    const { error: resetError } = await requestPasswordReset(email);
    setLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    // Navigate to OTP verify with email params
    router.push({
      pathname: '/auth/otp-verify',
      params: { email, type: 'email' },
    });
  }

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

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pt-28 pb-10"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text className="text-3xl font-bold text-gray-900 mb-6">
          {mode === 'signup' ? 'Create account' : 'Welcome back'}
        </Text>

        {/* Mode toggle tabs */}
        <View className="flex-row bg-gray-100 rounded-xl p-1 mb-6">
          <TouchableOpacity
            className={`flex-1 py-2.5 rounded-lg items-center ${
              mode === 'signup' ? 'bg-white shadow-sm' : ''
            }`}
            onPress={() => switchMode('signup')}
            disabled={loading}
          >
            <Text
              className={`text-sm font-semibold ${
                mode === 'signup' ? 'text-[#6C47FF]' : 'text-gray-500'
              }`}
            >
              Sign Up
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-1 py-2.5 rounded-lg items-center ${
              mode === 'login' ? 'bg-white shadow-sm' : ''
            }`}
            onPress={() => switchMode('login')}
            disabled={loading}
          >
            <Text
              className={`text-sm font-semibold ${
                mode === 'login' ? 'text-[#6C47FF]' : 'text-gray-500'
              }`}
            >
              Log In
            </Text>
          </TouchableOpacity>
        </View>

        {/* Email input */}
        <View className="mb-4">
          <Text className="text-sm font-semibold text-gray-700 mb-1.5">Email</Text>
          <TextInput
            className="border border-gray-200 rounded-xl bg-gray-50 px-4 py-3.5 text-base text-gray-900"
            placeholder="you@example.com"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={(val) => {
              setEmail(val);
              setError(null);
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            editable={!loading}
            returnKeyType="next"
          />
        </View>

        {/* Password input */}
        <View className="mb-4">
          <Text className="text-sm font-semibold text-gray-700 mb-1.5">Password</Text>
          <TextInput
            className="border border-gray-200 rounded-xl bg-gray-50 px-4 py-3.5 text-base text-gray-900"
            placeholder="Minimum 6 characters"
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={(val) => {
              setPassword(val);
              setError(null);
            }}
            secureTextEntry
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            editable={!loading}
            returnKeyType={mode === 'signup' ? 'next' : 'done'}
            onSubmitEditing={mode === 'login' ? handleSubmit : undefined}
          />
        </View>

        {/* Confirm password (sign-up only) */}
        {mode === 'signup' && (
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-1.5">
              Confirm Password
            </Text>
            <TextInput
              className="border border-gray-200 rounded-xl bg-gray-50 px-4 py-3.5 text-base text-gray-900"
              placeholder="Re-enter your password"
              placeholderTextColor="#9CA3AF"
              value={confirmPassword}
              onChangeText={(val) => {
                setConfirmPassword(val);
                setError(null);
              }}
              secureTextEntry
              autoComplete="new-password"
              editable={!loading}
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />
          </View>
        )}

        {/* Forgot password link (login mode only) */}
        {mode === 'login' && (
          <TouchableOpacity
            className="self-end mb-4"
            onPress={handleForgotPassword}
            disabled={loading}
          >
            <Text className="text-sm text-[#6C47FF] font-medium">Forgot password?</Text>
          </TouchableOpacity>
        )}

        {/* Error message */}
        {error ? (
          <Text className="text-red-500 text-sm mb-4">{error}</Text>
        ) : null}

        {/* Success message */}
        {successMessage ? (
          <View className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
            <Text className="text-green-700 text-sm font-medium">{successMessage}</Text>
          </View>
        ) : null}

        {/* Submit button */}
        <TouchableOpacity
          className={`py-3.5 rounded-xl items-center justify-center ${
            loading ? 'bg-[#6C47FF]/60' : 'bg-[#6C47FF]'
          }`}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-semibold text-base">
              {mode === 'signup' ? 'Create Account' : 'Log In'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
