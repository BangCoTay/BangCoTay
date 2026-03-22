import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSignIn, useOAuth } from '@clerk/clerk-expo';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

export const SignInScreen = () => {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });

  const onSignInPress = async () => {
    if (!isLoaded) return;
    setLoading(true);
    try {
      const completeSignIn = await signIn.create({
        identifier: emailAddress,
        password,
      });
      await setActive({ session: completeSignIn.createdSessionId });
    } catch (err: any) {
      console.error(err);
      alert(err.errors?.[0]?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const onGoogleSignInPress = async () => {
    try {
      setLoading(true);
      const { createdSessionId, setActive: setOAuthActive } = await startOAuthFlow();
      if (createdSessionId) {
        setOAuthActive!({ session: createdSessionId });
      }
    } catch (err) {
      console.error('OAuth error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Better Self</Text>
        <Text style={styles.subtitle}>Welcome back! Let's build good habits together.</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          autoCapitalize="none"
          value={emailAddress}
          placeholder="Email address"
          placeholderTextColor="#9ca3af"
          onChangeText={(email) => setEmailAddress(email)}
          style={styles.input}
        />
        <TextInput
          value={password}
          placeholder="Password"
          placeholderTextColor="#9ca3af"
          secureTextEntry={true}
          onChangeText={(password) => setPassword(password)}
          style={styles.input}
        />
        
        <TouchableOpacity style={styles.primaryButton} onPress={onSignInPress} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.primaryButtonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.line} />
        </View>

        <TouchableOpacity style={styles.secondaryButton} onPress={onGoogleSignInPress} disabled={loading}>
          <Text style={styles.secondaryButtonText}>Continue with Google</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA', // from design system
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 48,
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    color: '#18181B', // from design system
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'System', // Will update to Caveat later
  },
  subtitle: {
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    fontSize: 16,
    color: '#18181B',
  },
  primaryButton: {
    backgroundColor: '#2563EB', // from design system
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#18181B',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#18181B',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  orText: {
    marginHorizontal: 16,
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
  },
});
