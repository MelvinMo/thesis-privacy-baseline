import { View, Text, ImageBackground, StyleSheet, TouchableOpacity } from "react-native";
import {useRouter} from "expo-router";
import GeneralButton from "@/components/GeneralButton";
import OnboardingHeader from "@/components/OnboardingHeader";
import { useProfileStore } from "@/store/userProfileStore";
import PermissionsToggle from "@/components/PermissionsToggle";
import { Colors } from "@/constants/Colors";
import { sensorBackgroundTaskManager } from "@/services";

export default function AccelerometerConsent() {

  const router = useRouter();
	const { userConsentPreferences, setUserConsentPreferences } = useProfileStore();

	const setAccelerometerEnabled = async (value: boolean) => {
    setUserConsentPreferences({
      ...userConsentPreferences,
      accelerometerEnabled: value,
    });

    await sensorBackgroundTaskManager.updateConfig({
      accelerometerEnabled: value,
    })
	}

  return (
		<View style={styles.container}>
			<View style={styles.topHalf}>
				<ImageBackground
					source={require('@/assets/images/running-bg.png')}
					style={styles.backgroundImage}
					resizeMode="cover"
				>
					<OnboardingHeader title="Your Privacy Matters to Us" onBackPress={() => router.back()} />
				</ImageBackground>
			</View>
			<View style={styles.bottomHalf}>
				<View style={styles.contentContainer}>
					<Text style={styles.purposeTitle}>Purpose:</Text>
					<Text style={styles.purposeText}>
						The accelerometer on your device will be used to track your body movements during sleep and throughout the day continuously in the background. This will help us to correlate activity levels with sleep quality. 
					</Text>
		
					<TouchableOpacity onPress={() => router.push({pathname: "/privacy-policy", params: {sectionId: "accelerometer"}})}>
						<Text style={styles.linkText}>
								More about collecting activity data
						</Text>
					</TouchableOpacity>

					<PermissionsToggle
						value={userConsentPreferences.accelerometerEnabled}
						onValueChange={setAccelerometerEnabled}
						label="Yes, you have my permission to access my accelerometer to track my activity levels."
					/>
					<GeneralButton title='Continue' onPress={() => {router.push('/light-sensor-consent')}}/>
				</View>
			</View>
		</View>
  )
};

// ========================================================================
// STYLES
// ========================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  topHalf: {
    flex: 3,
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  bottomHalf: {
    flex: 4,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
		flexDirection: 'column',
		justifyContent: 'space-between',
  },
  purposeTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  purposeText: {
    color: 'white',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  linkText: {
    color: Colors.hyperlinkBlue,
    fontSize: 14,
    marginBottom: 32,
    textDecorationLine: 'underline',
  },
})