import { View, Text, StyleSheet } from "react-native";
import {useRouter} from "expo-router";
import GeneralButton from "@/components/GeneralButton";
import OnboardingHeader from "@/components/OnboardingHeader";

/**
 * This screen explains the purpose of the upcoming questions about sleep quality, and where the data will be stored.
 */
export default function QuestionsExplanation() {

  const router = useRouter();

	return (
		<View style={styles.container}>
			<OnboardingHeader title="Your Privacy Matters to Us" onBackPress={() => router.back()} />
			<View style={styles.contentContainer}>
				<Text style={styles.sectionTitle}>Help us understand your current sleep quality</Text>
				<Text style={styles.sectionText}>
					The next few screens will ask you questions about your current sleep quality and sleep habits. This will help us understand your sleep better and provide personalized insights. 
				</Text>
				<Text style={styles.sectionText}>
					Since this data is also personal health information, it will be encrypted and stored in your device (otherwise the cloud if you opted in)
				</Text>
				<GeneralButton title='Continue' onPress={() => {
						router.push('/questions')
				}}/>
			</View>
		</View>
	);
}

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
})