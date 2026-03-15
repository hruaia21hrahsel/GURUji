import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  savePin,
  checkBiometricAvailability,
  authenticateWithBiometric,
} from '@/lib/pin';
import { usePinStore } from '@/store/usePinStore';

const PIN_LENGTH = 4;

type Step = 'enter' | 'confirm';

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

export default function PinSetupScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('enter');
  const [firstPin, setFirstPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const shakeAnim = useRef(new Animated.Value(0)).current;

  const currentPin = step === 'enter' ? firstPin : confirmPin;
  const setCurrentPin = step === 'enter' ? setFirstPin : setConfirmPin;

  function shake() {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }

  function handleDigit(digit: string) {
    if (currentPin.length >= PIN_LENGTH) return;
    const next = currentPin + digit;
    setCurrentPin(next);
    setErrorMsg('');

    if (next.length === PIN_LENGTH) {
      if (step === 'enter') {
        // Move to confirm step after short delay for UX
        setTimeout(() => setStep('confirm'), 200);
      } else {
        // Validate confirmation
        setTimeout(() => handleConfirm(next), 200);
      }
    }
  }

  function handleBackspace() {
    if (currentPin.length === 0) return;
    setCurrentPin(currentPin.slice(0, -1));
    setErrorMsg('');
  }

  async function handleConfirm(confirmedPin: string) {
    if (confirmedPin !== firstPin) {
      shake();
      setErrorMsg("PINs don't match — try again");
      // Reset both PINs after a short delay
      setTimeout(() => {
        setFirstPin('');
        setConfirmPin('');
        setStep('enter');
        setErrorMsg('');
      }, 1200);
      return;
    }

    setSaving(true);
    await savePin(confirmedPin);
    setSaving(false);

    // Offer biometric enrollment
    const biometricAvailable = await checkBiometricAvailability();

    if (biometricAvailable) {
      Alert.alert(
        'Enable fingerprint unlock?',
        'Use your fingerprint or face to unlock GURUji faster.',
        [
          {
            text: 'No thanks',
            style: 'cancel',
            onPress: () => finishSetup(false),
          },
          {
            text: 'Enable',
            onPress: async () => {
              const success = await authenticateWithBiometric();
              if (success) {
                usePinStore.getState().setBiometricEnabled(true);
              }
              finishSetup(true);
            },
          },
        ]
      );
    } else {
      finishSetup(false);
    }
  }

  function finishSetup(_biometricEnabled: boolean) {
    usePinStore.getState().unlock();
    router.replace('/(tabs)');
  }

  const title = step === 'enter' ? 'Set your PIN' : 'Confirm your PIN';
  const subtitle =
    step === 'enter'
      ? "You'll use this every time you open GURUji"
      : 'Enter the same PIN again to confirm';

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 pt-16">
        {/* Header */}
        <View className="items-center px-6 mb-2">
          <Text className="text-3xl font-bold text-gray-900 mb-2">{title}</Text>
          <Text className="text-base text-gray-500 text-center">{subtitle}</Text>
        </View>

        {/* PIN dots */}
        <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
          <PinDots pin={step === 'enter' ? firstPin : confirmPin} />
        </Animated.View>

        {/* Error message */}
        {errorMsg ? (
          <Text className="text-center text-red-500 text-sm mb-4">{errorMsg}</Text>
        ) : (
          <View className="h-5 mb-4" />
        )}

        {/* Keypad */}
        <NumericKeypad
          onPress={handleDigit}
          onBackspace={handleBackspace}
          disabled={saving}
        />
      </View>
    </SafeAreaView>
  );
}
