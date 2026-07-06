import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import GeneralButton from '@/components/GeneralButton'; 
import OnboardingHeader from '@/components/OnboardingHeader'; 
import { useProfileStore } from '@/store/userProfileStore'; 
import { Colors } from '@/constants/Colors'; 

export default function PrivacyPolicyConsent() {
  const router = useRouter();
  // Accessing user consent preferences from the global store
  const { userConsentPreferences, setUserConsentPreferences } = useProfileStore();

  // State to manage the checkbox for privacy policy agreement
  // Initialize with the current value from the store, or false if not set
  const [privacyPolicyAgreed, setPrivacyPolicyAgreed] = useState(
    userConsentPreferences.agreedToPrivacyPolicy || false
  );

  const togglePrivacyPolicyAgreement = () => {
    setPrivacyPolicyAgreed(!privacyPolicyAgreed);
  };

  /**
   * Handles the "Continue" button press.
   * Updates the user's consent preferences in the store and navigates to the next screen.
   */
  const handleContinue = () => {
    setUserConsentPreferences({
      ...userConsentPreferences,
      agreedToPrivacyPolicy: privacyPolicyAgreed,
    });
    router.push('/transparency'); 
  };

  const handlePrivacyPolicyLink = () => {
    router.push('/privacy-policy');
  };

  return (
    <View style={styles.container}>
      <OnboardingHeader title="Your Privacy Matters to Us" onBackPress={() => router.back()} />
      <View style={styles.contentContainer}>
        <Text style={styles.descriptionText}>
          The previous screens explained the most important parts of the privacy policy.
          Before you proceed, please review the full Privacy Policy to understand in greater detail how we collect, use, and protect your health data.
        </Text>
        {/* Link to the full Privacy Policy */}
        <TouchableOpacity onPress={handlePrivacyPolicyLink}>
          <Text style={styles.linkText}>
            Read our full Privacy Policy
          </Text>
        </TouchableOpacity>

        {/* Checkbox for Privacy Policy Agreement */}
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={togglePrivacyPolicyAgreement}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, privacyPolicyAgreed && styles.checkboxChecked]}>
            {privacyPolicyAgreed && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>
            I have read and agree to the Privacy Policy.
          </Text>
        </TouchableOpacity>

        {/* Continue Button - enabled only if privacy policy is agreed */}
        <GeneralButton
          title='Continue'
          onPress={handleContinue}
          disabled={!privacyPolicyAgreed} // Button is disabled if checkbox is not checked
        />
      </View>
    </View>
  );
}

//=====================================================================
// STYLES
//=====================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black', 
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  descriptionText: {
    color: 'white',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.generalBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: Colors.generalBlue,
  },
  checkmark: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    color: 'white',
    fontSize: 16,
    flexShrink: 1, 
  },
  linkText: {
    color: Colors.hyperlinkBlue,
    fontSize: 16,
    textDecorationLine: 'underline',
    marginBottom: 32,
  },
});