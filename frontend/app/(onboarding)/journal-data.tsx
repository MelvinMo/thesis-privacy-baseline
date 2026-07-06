import { View, Text, ImageBackground, StyleSheet, TouchableOpacity } from "react-native";
import {useRouter} from "expo-router";
import GeneralButton from "@/components/GeneralButton";
import OnboardingHeader from "@/components/OnboardingHeader";
import { Colors } from "@/constants/Colors";

export default function JournalData() {

  const router = useRouter();

  return (
		<View style={styles.container}>
			<View style={styles.topHalf}>
				<ImageBackground
					source={require('@/assets/images/journal-bg.png')}
					style={styles.backgroundImage}
					resizeMode="cover"
				>
					<OnboardingHeader title="Your Privacy Matters to Us" onBackPress={() => router.back()} />
				</ImageBackground>
			</View>
			<View style={styles.bottomHalf}>
				<View style={styles.contentContainer}>
					<Text style={styles.sectionTitle}>Journal Data:</Text>
					<Text style={styles.sectionText}>
						Information about your mood, habits, symptoms can help us correlate your personal experiences with your sleep patterns. You can voluntarily provide us with this data by making diary entries and sleep notes in the app's Journal section. 
					</Text>
					<TouchableOpacity onPress={() => router.push({pathname: "/privacy-policy", params: {sectionId: "journalData"}})}>
						<Text style={styles.linkText}>
								More about collecting journal data
						</Text>
					</TouchableOpacity>

					<Text style={styles.sectionTitle}>Derived Data:</Text>
					<Text style={styles.sectionText}>
						The app will derive data about you such as sleep quality, correlations, insights and recommendations. This will be treated as sensitive personal health information. 
					</Text>

					<TouchableOpacity onPress={() => router.push({pathname: "/privacy-policy", params: {sectionId: "derivedData"}})}>
						<Text style={styles.linkText}>
								More about derived data
						</Text>
					</TouchableOpacity>
					<GeneralButton title='Continue' onPress={() => {router.push('/cloud-storage')}}/>
				</View>
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
  topHalf: {
    flex: 3,
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  bottomHalf: {
    flex: 6,
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