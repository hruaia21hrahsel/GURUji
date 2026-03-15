import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';
import { usePinStore } from '@/store/usePinStore';
import {
  signOut,
  getLinkedIdentities,
  linkGoogleAccount,
  unlinkIdentity,
  requestAccountDeletion,
  type Identity,
} from '@/lib/auth';
import { checkBiometricAvailability } from '@/lib/pin';

const APP_VERSION = '1.0.0';

// ----------------------------------------------------------------
// Section header
// ----------------------------------------------------------------
function SectionHeader({ title }: { title: string }) {
  return (
    <Text className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 px-1">
      {title}
    </Text>
  );
}

// ----------------------------------------------------------------
// Card row component
// ----------------------------------------------------------------
function CardRow({
  label,
  value,
  onPress,
  actionLabel,
  actionColor = 'text-indigo-600',
  borderBottom = true,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
  actionLabel?: string;
  actionColor?: string;
  borderBottom?: boolean;
}) {
  return (
    <View
      className={`flex-row items-center justify-between px-4 py-3 ${
        borderBottom ? 'border-b border-gray-100' : ''
      }`}
    >
      <Text className="text-base text-gray-700">{label}</Text>
      <View className="flex-row items-center gap-2">
        {value ? (
          <Text className="text-base font-semibold text-gray-900">{value}</Text>
        ) : null}
        {actionLabel && onPress ? (
          <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
            <Text className={`text-sm font-semibold ${actionColor}`}>{actionLabel}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

// ----------------------------------------------------------------
// Provider display name and icon
// ----------------------------------------------------------------
function providerDisplay(provider: string): string {
  switch (provider.toLowerCase()) {
    case 'phone':
      return 'Phone (OTP)';
    case 'google':
      return 'Google';
    case 'email':
      return 'Email / Password';
    default:
      return provider.charAt(0).toUpperCase() + provider.slice(1);
  }
}

// ----------------------------------------------------------------
// Main Settings Screen
// ----------------------------------------------------------------
export default function SettingsScreen() {
  const router = useRouter();

  const studentClass = useAppStore((s) => s.class);
  const board = useAppStore((s) => s.board);
  const language = useAppStore((s) => s.language);

  const biometricEnabled = usePinStore((s) => s.biometricEnabled);
  const setBiometricEnabled = usePinStore((s) => s.setBiometricEnabled);

  const [identities, setIdentities] = useState<Identity[]>([]);
  const [identitiesLoading, setIdentitiesLoading] = useState(true);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const loadIdentities = useCallback(async () => {
    setIdentitiesLoading(true);
    const list = await getLinkedIdentities();
    setIdentities(list);
    setIdentitiesLoading(false);
  }, []);

  useEffect(() => {
    loadIdentities();
    checkBiometricAvailability().then(setBiometricAvailable);
  }, [loadIdentities]);

  // ----------------------------------------------------------------
  // Handlers
  // ----------------------------------------------------------------

  function handleChangePIN() {
    // Navigate to PIN setup — user will re-create PIN
    // The PIN setup route clears and recreates the PIN
    usePinStore.getState().setHasPin(false);
    router.push('/auth/pin-setup');
  }

  async function handleToggleBiometric(value: boolean) {
    if (value && !biometricAvailable) {
      Alert.alert(
        'Biometric Not Available',
        'Your device does not have biometric hardware or no biometrics are enrolled in Settings.'
      );
      return;
    }
    setBiometricEnabled(value);
  }

  async function handleLinkGoogle() {
    const result = await linkGoogleAccount();
    if (result.error) {
      Alert.alert('Could Not Link Google', result.error.message);
    } else {
      Alert.alert('Google Linked', 'Your Google account has been linked.');
      loadIdentities();
    }
  }

  async function handleUnlink(identity: Identity) {
    Alert.alert(
      'Remove Sign-In Method',
      `Remove ${providerDisplay(identity.provider)} from your account?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const result = await unlinkIdentity(identity.id ?? identity.identity_id);
            if (result.error) {
              Alert.alert('Could Not Remove', result.error.message);
            } else {
              loadIdentities();
            }
          },
        },
      ]
    );
  }

  async function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          setSigningOut(true);
          await signOut();
          setSigningOut(false);
        },
      },
    ]);
  }

  async function handleDeleteAccount() {
    Alert.alert(
      'Delete Account',
      'Your account will be permanently deleted after a 7-day grace period. All your data — including chat history and progress — will be wiped. This cannot be undone.\n\nAre you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete My Account',
          style: 'destructive',
          onPress: async () => {
            await requestAccountDeletion();
            // signOut() is called inside requestAccountDeletion
          },
        },
      ]
    );
  }

  const googleLinked = identities.some((id) => id.provider === 'google');
  const phoneLinked = identities.some((id) => id.provider === 'phone');
  const emailLinked = identities.some((id) => id.provider === 'email');

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 32, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-2xl font-bold text-gray-900 mb-6">Settings</Text>

        {/* ---- Profile ---- */}
        <View className="mb-6">
          <SectionHeader title="Profile" />
          <View className="bg-gray-50 rounded-2xl overflow-hidden">
            <CardRow
              label="Class"
              value={studentClass ? `Class ${studentClass}` : '—'}
            />
            <CardRow label="Board" value={board || '—'} />
            <CardRow label="Language" value={language || '—'} borderBottom={false} />
          </View>
          <TouchableOpacity
            onPress={() => router.push('/onboarding')}
            className="mt-2 px-1"
            activeOpacity={0.7}
          >
            <Text className="text-sm text-indigo-600 font-medium">Edit profile</Text>
          </TouchableOpacity>
        </View>

        {/* ---- Connected Accounts ---- */}
        <View className="mb-6">
          <SectionHeader title="Connected Accounts" />
          <View className="bg-gray-50 rounded-2xl overflow-hidden">
            {identitiesLoading ? (
              <View className="py-4 items-center">
                <ActivityIndicator size="small" color="#6366f1" />
              </View>
            ) : (
              <>
                {/* Phone */}
                <CardRow
                  label="Phone (OTP)"
                  value={phoneLinked ? 'Connected' : undefined}
                  actionLabel={phoneLinked ? undefined : 'Add'}
                  actionColor="text-indigo-600"
                  onPress={phoneLinked ? undefined : () => router.push('/auth')}
                />

                {/* Google */}
                <CardRow
                  label="Google"
                  value={googleLinked ? 'Connected' : undefined}
                  actionLabel={
                    googleLinked
                      ? identities.length > 1
                        ? 'Remove'
                        : undefined
                      : 'Connect'
                  }
                  actionColor={googleLinked ? 'text-orange-500' : 'text-indigo-600'}
                  onPress={
                    googleLinked
                      ? identities.length > 1
                        ? () =>
                            handleUnlink(identities.find((id) => id.provider === 'google')!)
                        : undefined
                      : handleLinkGoogle
                  }
                />

                {/* Email */}
                <CardRow
                  label="Email / Password"
                  value={emailLinked ? 'Connected' : undefined}
                  actionLabel={emailLinked ? undefined : 'Add'}
                  actionColor="text-indigo-600"
                  onPress={emailLinked ? undefined : () => router.push('/auth/email-form')}
                  borderBottom={false}
                />
              </>
            )}
          </View>
        </View>

        {/* ---- Security ---- */}
        <View className="mb-6">
          <SectionHeader title="Security" />
          <View className="bg-gray-50 rounded-2xl overflow-hidden">
            <CardRow
              label="Change PIN"
              actionLabel="Change"
              actionColor="text-indigo-600"
              onPress={handleChangePIN}
            />
            <View className="flex-row items-center justify-between px-4 py-3">
              <View className="flex-1">
                <Text className="text-base text-gray-700">Biometric Unlock</Text>
                <Text className="text-xs text-gray-400 mt-0.5">
                  {biometricAvailable
                    ? 'Use fingerprint or face to unlock'
                    : 'Not available on this device'}
                </Text>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={handleToggleBiometric}
                disabled={!biometricAvailable}
                trackColor={{ false: '#d1d5db', true: '#6366f1' }}
                thumbColor="#ffffff"
              />
            </View>
          </View>
        </View>

        {/* ---- Account ---- */}
        <View className="mb-8">
          <SectionHeader title="Account" />
          <View className="bg-gray-50 rounded-2xl overflow-hidden">
            <TouchableOpacity
              onPress={handleSignOut}
              disabled={signingOut}
              activeOpacity={0.7}
              className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100"
            >
              <Text className="text-base text-red-500 font-medium">
                {signingOut ? 'Signing out…' : 'Log Out'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDeleteAccount}
              activeOpacity={0.7}
              className="flex-row items-center justify-between px-4 py-3"
            >
              <Text className="text-base text-red-600 font-semibold">Delete Account</Text>
              <Text className="text-xs text-gray-400">7-day grace period</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ---- App info footer ---- */}
        <View className="items-center gap-1">
          <Text className="text-xs text-gray-400">GURUji v{APP_VERSION}</Text>
          <Text className="text-xs text-gray-300">Made with love for Indian students</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
