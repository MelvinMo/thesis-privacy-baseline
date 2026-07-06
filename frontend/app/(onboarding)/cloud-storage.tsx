import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import {useRouter} from "expo-router";
import GeneralButton from "@/components/GeneralButton";
import OnboardingHeader from "@/components/OnboardingHeader";
import { Colors } from "@/constants/Colors";
import { useProfileStore } from "@/store/userProfileStore";
import PermissionsToggle from "@/components/PermissionsToggle";

export default function CloudStorage() {

  const router = useRouter();
	const { userConsentPreferences, setUserConsentPreferences } = useProfileStore();

	const setCloudStorageEnabled = async (value: boolean) => {
		setUserConsentPreferences({
			...userConsentPreferences,
			cloudStorageEnabled: value,
		});
	}

  return (
		<View style={styles.container}>
			<OnboardingHeader title="Your Privacy Matters to Us" onBackPress={() => router.back()} />
			<View style={styles.contentContainer}>
				<Text style={styles.sectionTitle}>Data Storage</Text>
				<Text style={styles.sectionText}>
					By default all of your personal health information (data collected and derived data) will be stored on your mobile device. If you opt in, we will store your personal health information in the cloud, allowing us to provide more complex sleep analysis. All data will be encrypted while in storage and when it is being transmitted. 
				</Text>

				<PermissionsToggle
						value={userConsentPreferences.cloudStorageEnabled}
						onValueChange={setCloudStorageEnabled}
						label="Yes, you have my permission to store my personal health information on secure Google Cloud servers"
					/>

				<Text style={styles.sectionTitle}>Data Access:</Text>
				<Text style={styles.sectionText}>
					We are committed to strict limitations on data sharing. We do not give your personal information to any third parties for marketing, advertising, or any other commercial purposes.  
				</Text>

				<TouchableOpacity onPress={() => router.push({pathname: "/privacy-policy", params: {sectionId: "cloudVsLocalStorage"}})}>
					<Text style={styles.linkText}>
							More about data storage and data access
					</Text>
				</TouchableOpacity>
				<GeneralButton title='Continue' onPress={() => {router.push('/privacy-policy-agreement')}}/>
			</View>
		</View>
  )
};

// =================================================================
// STYLES
// =================================================================

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
	flexDirection: 'column',
	justifyContent: 'space-between',
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionText: {
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