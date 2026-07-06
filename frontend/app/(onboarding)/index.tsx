import { View, Text, ImageBackground, StyleSheet, TouchableOpacity, Alert } from "react-native";
import {useRouter} from "expo-router";
import GeneralButton from "@/components/GeneralButton";
import OnboardingHeader from "@/components/OnboardingHeader";
import { useProfileStore } from "@/store/userProfileStore";
import PermissionsToggle from "@/components/PermissionsToggle";
import { Colors } from "@/constants/Colors";
import {Audio } from "expo-av";

export default function MicrophoneConsent() {

  const router = useRouter();
	const { userConsentPreferences, setUserConsentPreferences } = useProfileStore();

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
			<View style={styles.topHalf}>
				<ImageBackground
					source={require('@/assets/images/microphone-bg.png')}
					style={styles.backgroundImage}
					resizeMode="cover"
				>
					<OnboardingHeader title="Your Privacy Matters to Us" />
				</ImageBackground>
			</View>
			<View style={styles.bottomHalf}>
				<View style={styles.contentContainer}>
					<Text style={styles.purposeTitle}>Purpose:</Text>
					<Text style={styles.purposeText}>
						Your microphone will listen for sounds like snoring or sleep talking only while you are sleeping. Analyzing these sounds will help you detect potential sleep disruptions and get a clearer picture of your sleep environment.
					</Text>
		
					<TouchableOpacity onPress={() => router.push({pathname: "/privacy-policy", params: {sectionId: "microphone"}})}>
						<Text style={styles.linkText}>
								Read more about sound data and snoring detection
						</Text>
					</TouchableOpacity>

					<PermissionsToggle
						value={userConsentPreferences.microphoneEnabled}
						onValueChange={setMicrophoneEnabled}
						label="Yes, you have permission to access my microphone to record my sleep sounds."
					/>
					<GeneralButton title='Continue' onPress={() => {router.push('/accelerometer-consent')}}/>
				</View>
			</View>
		</View>
  )
};

// ==============================================================================
// STYLES
// ==============================================================================

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