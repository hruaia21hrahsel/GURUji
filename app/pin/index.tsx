import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Animated,
} from 'react-native';
import { usePinStore } from '@/store/usePinStore';
import { verifyPin, authenticateWithBiometric } from '@/lib/pin';
import { signOut } from '@/lib/auth';

const PIN_LENGTH = 4;
const MAX_ATTEMPTS = 3;

function PinDots({ pin, length = PIN_LENGTH }: { pin: string; length?: number }) {
  return (
    <View className="flex-row justify-center gap-4 my-8">
      {Array.from({ length }).map((_, i) => (
        <View
          key={i}
          className={`w-5 h-5 rounded-full border-2 ${
            i < pin.length
              ? 'bg-indigo-600 border-indigo-600'
              : 'bg-transparent border-gray-300'
          }`}
        />
      ))}
    </View>
  );
}

function NumericKeypad({
  onPress,
  onBackspace,
  disabled = false,
}: {
  onPress: (digit: string) => void;
  onBackspace: () => void;
  disabled?: boolean;
}) {
  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['', '0', 'del'],
  ];

  return (
    <View className="gap-3 px-8">
      {keys.map((row, rowIdx) => (
        <View key={rowIdx} className="flex-row justify-between gap-3">
          {row.map((key, colIdx) => {
            if (key === '') {
              return <View key={colIdx} className="flex-1" />;
            }

            const isDel = key === 'del';

            return (
              <TouchableOpacity
                key={colIdx}
                disabled={disabled}
                onPress={() => (isDel ? onBackspace() : onPress(key))}
                activeOpacity={0.7}
                className={`flex-1 h-16 rounded-2xl items-center justify-center ${
                  isDel ? 'bg-gray-100' : 'bg-gray-50'
                } ${disabled ? 'opacity-40' : ''}`}
              >
                <Text
                  className={`text-2xl font-semibold ${
                    isDel ? 'text-gray-500' : 'text-gray-900'
                  }`}
                >
                  {isDel ? '⌫' : key}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

export default function PinEntryScreen() {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const failedAttempts = usePinStore((s) => s.failedAttempts);
  const biometricEnabled = usePinStore((s) => s.biometricEnabled);
  const isLockedOut = failedAttempts >= MAX_ATTEMPTS;

  function shake() {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }

  // Auto-trigger biometric on mount if enabled
  useEffect(() => {
    if (biometricEnabled && !isLockedOut) {
      tryBiometric();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function tryBiometric() {
    const success = await authenticateWithBiometric();
    if (success) {
      usePinStore.getState().unlock();
    }
  }

  async function handleDigit(digit: string) {
    if (isLockedOut || pin.length >= PIN_LENGTH) return;

    const next = pin + digit;
    setPin(next);
    setErrorMsg('');

    if (next.length === PIN_LENGTH) {
      setTimeout(() => checkPin(next), 200);
    }
  }

  function handleBackspace() {
    if (pin.length === 0) return;
    setPin(pin.slice(0, -1));
    setErrorMsg('');
  }

  async function checkPin(enteredPin: string) {
    const correct = await verifyPin(enteredPin);

    if (correct) {
      usePinStore.getState().unlock();
      setPin('');
    } else {
      usePinStore.getState().incrementFailedAttempts();
      const newAttempts = usePinStore.getState().failedAttempts;
      shake();
      setPin('');

      if (newAttempts >= MAX_ATTEMPTS) {
        setErrorMsg('Too many attempts');
      } else {
        const remaining = MAX_ATTEMPTS - newAttempts;
        setErrorMsg(`Wrong PIN — ${remaining} attempt${remaining === 1 ? '' : 's'} remaining`);
      }
    }
  }

  async function handleSignInAgain() {
    await signOut();
  }

  if (isLockedOut) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-6xl mb-6">🔒</Text>
          <Text className="text-2xl font-bold text-gray-900 text-center mb-3">
            Too many attempts
          </Text>
          <Text className="text-base text-gray-500 text-center mb-8">
            You've entered the wrong PIN {MAX_ATTEMPTS} times. Please sign in again to
            verify your identity.
          </Text>
          <TouchableOpacity
            onPress={handleSignInAgain}
            activeOpacity={0.8}
            className="w-full bg-indigo-600 rounded-2xl py-4 items-center"
          >
            <Text className="text-white font-semibold text-base">Sign in again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 pt-16">
        {/* Header */}
        <View className="items-center px-6 mb-2">
          <Text className="text-2xl font-bold text-indigo-600 mb-1">GURUji</Text>
          <Text className="text-3xl font-bold text-gray-900 mb-2">Welcome back!</Text>
          <Text className="text-base text-gray-500">Enter your PIN to continue</Text>
        </View>

        {/* PIN dots */}
        <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
          <PinDots pin={pin} />
        </Animated.View>

        {/* Error / hint */}
        {errorMsg ? (
          <Text className="text-center text-red-500 text-sm mb-4">{errorMsg}</Text>
        ) : (
          <View className="h-5 mb-4" />
        )}

        {/* Keypad */}
        <NumericKeypad
          onPress={handleDigit}
          onBackspace={handleBackspace}
          disabled={isLockedOut}
        />

        {/* Biometric button */}
        {biometricEnabled && (
          <TouchableOpacity
            onPress={tryBiometric}
            className="items-center mt-6"
            activeOpacity={0.7}
          >
            <Text className="text-indigo-600 text-base font-medium">
              Use fingerprint / face
            </Text>
          </TouchableOpacity>
        )}

        {/* Forgot PIN */}
        <TouchableOpacity
          onPress={handleSignInAgain}
          className="items-center mt-4 mb-6"
          activeOpacity={0.7}
        >
          <Text className="text-gray-400 text-sm">Forgot PIN? Sign in again</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
