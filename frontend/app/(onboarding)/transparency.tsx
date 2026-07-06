import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import GeneralButton from "@/components/GeneralButton";
import { useProfileStore } from "@/store/userProfileStore";
import OnboardingHeader from "@/components/OnboardingHeader";
import { Colors } from "@/constants/Colors";
import { PrivacyIcon } from "@/components/transparency/PrivacyIcon";
import { SensorPrivacyIcon } from "@/components/transparency/SensorPrivacyIcon";

/**
 * This screen explains the new privacy UI features that are part of this app, including the tooltips, different icons and how they change
 */
export default function Transparency() {
  const router = useRouter();
  const { setHasCompletedPrivacyOnboarding } = useProfileStore();

  return (
    <View style={styles.container}>
      <OnboardingHeader title="Your Privacy Matters to Us" onBackPress={() => router.back()} />
      <View style={styles.contentContainer}>
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={true}
		  persistentScrollbar={true}
          indicatorStyle="white"
        >
          <Text style={styles.sectionTitle}>Privacy Features In this App</Text>
          
          <Text style={styles.sectionText}>
            This prototype app is designed to prioritize transparency by embedding details about data collection within the UI. Our real-time privacy analysis system monitors data collection and provides instant visual feedback through dynamic privacy icons.
          </Text>

          <View style={styles.featuresContainer}>
            <Text style={styles.featureTitle}>Key Features:</Text>
            
            <View style={styles.featureItem}>
              <Text style={styles.bulletPoint}>• </Text>
              <Text style={styles.featureText}>
                <Text style={styles.bold}>Tooltip System:</Text> Click privacy icons next to data types for contextual information
              </Text>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.bulletPoint}>• </Text>
              <Text style={styles.featureText}>
                <Text style={styles.bold}>Privacy Pages:</Text> Transform entire screens to show comprehensive privacy details
              </Text>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.bulletPoint}>• </Text>
              <Text style={styles.featureText}>
                <Text style={styles.bold}>Real-time Analysis:</Text> AI-powered system detects and explains privacy risks as they occur
              </Text>
            </View>
          </View>

          <View style={styles.iconSection}>
            <Text style={styles.iconSectionTitle}>Privacy Risk Indicators</Text>
            
            <View style={styles.iconRow}>
              <View style={styles.iconItem}>
                <PrivacyIcon 
                  handleIconPress={() => {}}
                  isOpen={false}
                  iconName="privacy-high"	
                />
                <Text style={styles.iconLabel}>Major Risk</Text>
                <Text style={styles.iconDescription}>Policy violations, unauthorized collection</Text>
              </View>
              
              <View style={styles.iconItem}>
                <PrivacyIcon 
                  handleIconPress={() => {}}
                  isOpen={false}
                  iconName="privacy-medium"	
                />
                <Text style={styles.iconLabel}>Medium Risk</Text>
                <Text style={styles.iconDescription}>Suboptimal practices, vague purposes</Text>
              </View>
              
              <View style={styles.iconItem}>
                <PrivacyIcon 
                  handleIconPress={() => {}}
                  isOpen={false}
                  iconName="privacy-low"	
                />
                <Text style={styles.iconLabel}>Low Risk</Text>
                <Text style={styles.iconDescription}>Compliant, secure data handling. You will see this by default</Text>
              </View>
            </View>
          </View>

          <View style={styles.iconSection}>
            <Text style={styles.iconSectionTitle}>Sensor Data Icons</Text>
            <Text style={styles.sensorDescription}>
              Below are examples of icons used to convey sensor data privacy risks:
            </Text>
            
            {/* First row - 2 icons */}
            <View style={styles.sensorIconRow}>
              <View style={styles.sensorIconItem}>
                <SensorPrivacyIcon 
                  handleIconPress={() => {}}
                  iconName="privacy-high"
                  storageType="cloud"
                  sensorType="accelerometer"	
                />
                <Text style={styles.sensorIconDescription}>Major risk due to accelerometer data being stored in cloud</Text>
              </View>
              <View style={styles.sensorIconItem}>
                <SensorPrivacyIcon 
                  handleIconPress={() => {}}
                  iconName="privacy-medium"
                  storageType="local"
                  sensorType="light"	
                />
                <Text style={styles.sensorIconDescription}>Medium risk due to light sensor data being stored locally</Text>
              </View>
            </View>
            
            {/* Second row - 1 icon centered */}
            <View style={styles.sensorIconRowSingle}>
              <View style={styles.sensorIconItemSingle}>
                <SensorPrivacyIcon 
                  handleIconPress={() => {}}
                  iconName="privacy-low"
                  storageType="cloud"
                  sensorType="microphone"	
                />
                <Text style={styles.sensorIconDescription}>Low risk from microphone data being stored in cloud</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        <GeneralButton 
          title='Continue' 
          onPress={() => {
            router.push('/questions-explanation');
            setHasCompletedPrivacyOnboarding(true);
          }}
        />
      </View>
    </View>
  );
}

// ===========================================================
// STYLES
// ===========================================================

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
  scrollView: {
    flex: 1,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sectionText: {
    color: 'white',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  featuresContainer: {
    marginBottom: 24,
  },
  featureTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bulletPoint: {
    color: Colors.generalBlue,
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  featureText: {
    color: 'white',
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  bold: {
    fontWeight: '600',
  },
  iconSection: {
    marginBottom: 24,
  },
  iconSectionTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
  },
  iconItem: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 8,
  },
  iconLabel: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
    marginTop: 8,
  },
  iconDescription: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 14,
  },
  sensorDescription: {
    color: 'white',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
    textAlign: 'center',
  },
  sensorIconRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sensorIconRowSingle: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  sensorIconItem: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 8,
  },
  sensorIconItemSingle: {
    alignItems: 'center',
    width: '50%', // Same width as individual items in the row above
  },
  sensorIconDescription: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 14,
    marginTop: 8,
  },
  linkText: {
    color: Colors.hyperlinkBlue,
    fontSize: 14,
    marginBottom: 32,
    textDecorationLine: 'underline',
  },
});