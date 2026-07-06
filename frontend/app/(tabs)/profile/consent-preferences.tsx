import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useProfileStore } from '@/store/userProfileStore';
import { sensorBackgroundTaskManager } from '@/services';
import OnboardingHeader from '@/components/OnboardingHeader';
import PermissionsToggle from '@/components/PermissionsToggle';
import { Audio } from 'expo-av';

export default function ConsentPreferences() {
  const { userConsentPreferences, setUserConsentPreferences } = useProfileStore();
	const router = useRouter();

	const setAccelerometerEnabled = async (value: boolean) => {
    setUserConsentPreferences({
      ...userConsentPreferences,
      accelerometerEnabled: value,
    });

    await sensorBackgroundTaskManager.updateConfig({
      accelerometerEnabled: value,
    })
	}

	const setCloudStorageEnabled = async (value: boolean) => {
		setUserConsentPreferences({
			...userConsentPreferences,
			cloudStorageEnabled: value,
		});
	}

	const setLightSensorEnabled = async (value: boolean) => {
		setUserConsentPreferences({
			...userConsentPreferences,
			lightSensorEnabled: value,
		});
	}

	const setMicrophoneEnabled = async (value: boolean) => {
			if (value) { // User is trying to enable microphone
				
				// Request microphone permissions from the operating system
				const { status } = await Audio.requestPermissionsAsync();
	
				if (status === 'granted') {
					setUserConsentPreferences({
						...userConsentPreferences,
						microphoneEnabled: value,
					});
				} else {
					// If permission is denied or undetermined, alert the user
					Alert.alert(
						"Microphone Access Denied",
						"It looks like microphone access was previously denied. Please enable it in your device settings if you wish to use this feature.",
						[
							{
								text: "OK",
								onPress: () => {
									setUserConsentPreferences({
										...userConsentPreferences,
										microphoneEnabled: false, // Explicitly set to false if permission was not granted
									});
								}
							}
						]
					);
				}
			} else { // User is trying to disable microphone (explicitly turning off)
				// If user disables, simply update the internal state.
				// Revoking OS permissions typically requires going to device settings directly.
				setUserConsentPreferences({
					...userConsentPreferences,
					microphoneEnabled: value,
				});
			}
		}

  return (
		<View style={styles.container}>
      <OnboardingHeader title="Your Privacy Matters to Us" onBackPress={() => router.back()} />
			<PermissionsToggle
				value={userConsentPreferences.microphoneEnabled}
				onValueChange={setMicrophoneEnabled}
				label="Yes, you have permission to access my microphone to record my sleep sounds."
			/>
			<TouchableOpacity onPress={() => router.push({pathname: "/privacy-policy", params: {sectionId: "microphone"}})} style={styles.link}>
				<Text style={styles.linkText}>
						Read more about sound data and snoring detection
				</Text>
			</TouchableOpacity>

			<PermissionsToggle
				value={userConsentPreferences.accelerometerEnabled}
				onValueChange={setAccelerometerEnabled}
				label="Yes, you have my permission to access my accelerometer to track my activity levels."
			/>
			<TouchableOpacity onPress={() => router.push({pathname: "/privacy-policy", params: {sectionId: "accelerometer"}})} style={styles.link}>
				<Text style={styles.linkText}>
						More about collecting activity data
				</Text>
			</TouchableOpacity>
			<PermissionsToggle
				value={userConsentPreferences.lightSensorEnabled}
				onValueChange={setLightSensorEnabled}
				label="Yes, you have my permission to access my light sensor to track ambient light levels."
			/>
			<TouchableOpacity onPress={() => router.push({pathname: "/privacy-policy", params: {sectionId: "lightSensor"}})} style={styles.link}>
				<Text style={styles.linkText}>
						More about collecting ambient light data
				</Text>
			</TouchableOpacity>
			<PermissionsToggle
				value={userConsentPreferences.cloudStorageEnabled}
				onValueChange={setCloudStorageEnabled}
				label="Yes, you have my permission to store my personal health information on secure Google Cloud servers"
			/>
			<TouchableOpacity onPress={() => router.push({pathname: "/privacy-policy", params: {sectionId: "cloudVsLocalStorage"}})} style={styles.link}>
				<Text style={styles.linkText}>
						More about data storage and data access
				</Text>
			</TouchableOpacity>
    </View>
  );
}

//================================================
// Styles
//================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
	link: {
		alignItems: 'center',
	},
	linkText: {
    color: Colors.hyperlinkBlue,
    fontSize: 14,
    marginBottom: 32,
    textDecorationLine: 'underline',
  },
});