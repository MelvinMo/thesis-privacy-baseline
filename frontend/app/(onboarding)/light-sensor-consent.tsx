import { View, Text, ImageBackground, StyleSheet, TouchableOpacity } from "react-native";
import {useRouter} from "expo-router";
import GeneralButton from "@/components/GeneralButton";
import OnboardingHeader from "@/components/OnboardingHeader";
import { useProfileStore } from "@/store/userProfileStore";
import PermissionsToggle from "@/components/PermissionsToggle";
import { Colors } from "@/constants/Colors";

export default function LightSensorConsent() {

  const router = useRouter();
	const { userConsentPreferences, setUserConsentPreferences } = useProfileStore();

	const setLightSensorEnabled = async (value: boolean) => {
		setUserConsentPreferences({
			...userConsentPreferences,
			lightSensorEnabled: value,
		});
	}

  return (
		<View style={styles.container}>
			<View style={styles.topHalf}>
				<ImageBackground
					source={require('@/assets/images/bedroom-light-bg.png')}
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
						The ambient light sensor on your device will be used to monitor the light conditions in your sleep environment only while you are sleeping, helping us to understand how light exposure affects your sleep quality. 
					</Text>
		
					<TouchableOpacity onPress={() => router.push({pathname: "/privacy-policy", params: {sectionId: "lightSensor"}})}>
						<Text style={styles.linkText}>
								More about collecting ambient light data
						</Text>
					</TouchableOpacity>

					<PermissionsToggle
						value={userConsentPreferences.lightSensorEnabled}
						onValueChange={setLightSensorEnabled}
						label="Yes, you have my permission to access my light sensor to track ambient light levels."
					/>
					<GeneralButton title='Continue' onPress={() => {router.push('/journal-data')}}/>
				</View>
			</View>
		</View>
  )
};

// =========================================================================
// STYLES
// =========================================================================
  
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