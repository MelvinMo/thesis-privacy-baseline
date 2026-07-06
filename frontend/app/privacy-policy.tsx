import React, { useRef } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import privacyPolicyData from '../privacyPolicyData.json';
import { Colors } from '@/constants/Colors';
import OnboardingHeader from '@/components/OnboardingHeader';


// Map table of contents titles to their corresponding section keys in the JSON
// This mapping is for navigation using the table of contents
const tocToSectionKeyMap: { [key: string]: string } = {
  'Interpretation and Definitions': 'interpretationsAndDefinitions',
  'Types of Information Collected and How We Use it': 'dataCollection',
  'Cloud vs. Local Data Storage & Processing': 'cloudVsLocalStorage',
  'Data Encryption and Pseudonymization': 'dataEncryptionAndPsuedonymization',
  'How We share Your information': 'dataSharing',
  'Retention of Your information': 'dataRetention',
  'Your Rights under PIPEDA': 'userRights',
  'Data Breach Notification': 'dataBreachNotification',
  'Changes to the Privacy Policy': 'policyChanges',
  'Contact Us': 'contact',
};

const PrivacyPolicyScreen = () => {

  const scrollViewRef = useRef<ScrollView>(null);
  // Stores the Y position of each section/subsection for scrolling
  const elementPositions = useRef<{ [key: string]: number }>({});
  // State to hold the parsed policy data
  const policy = privacyPolicyData.privacyPolicy;
	const router = useRouter();

	const { sectionId: initialSectionId } = useLocalSearchParams();


  // Function to scroll to a specific section by its ID
  const scrollToSection = (id: string) => {
    if (elementPositions.current[id] !== undefined) {
      scrollViewRef.current?.scrollTo({
        y: elementPositions.current[id],
        animated: true,
      });
    }
  };

	if (initialSectionId) {
		scrollToSection(initialSectionId);
	}

  // Helper function to store the layout position of an element
  const onLayout = (event: any, id: string) => {
    // Using measureLayout to get position relative to the ScrollView content
    if (scrollViewRef.current) {
      event.target.measureLayout(
        scrollViewRef.current,
        (x: number, y: number, width: number, height: number) => {
          elementPositions.current[id] = y;
					if (initialSectionId && id === 'contact') {
             setTimeout(() => {
                 if (elementPositions.current[initialSectionId]) {
                     scrollToSection(initialSectionId as string);
                 }
             }, 100);
          }
        },
        () => {
          // console.warn('Failed to measure layout for ID:', id);
        }
      );
    }
  };

  const sections = policy.sections;

  return (
      <View style={styles.container}>
        <OnboardingHeader title="Privacy Policy" onBackPress={() => router.back()} />
        <Text style={styles.metadataText}>
          Version: {policy.metadata.version} | Effective Date: {policy.metadata.effectiveDate} | Last Updated: {policy.metadata.lastUpdated}
        </Text>


        <ScrollView ref={scrollViewRef} style={styles.scrollView}>
					{/* Table of Contents Navigation */}
					<View style={styles.tocContainer}>
						<Text style={styles.tocTitle}>Table of Contents</Text>
						{policy.tableOfContents.map((tocTitle: string) => {
								const sectionKey = tocToSectionKeyMap[tocTitle];
								if (!sectionKey) return null; // Skip if no mapping found
								const sectionId = sectionKey; 

								return (
								<TouchableOpacity
										key={sectionId}
										onPress={() => scrollToSection(sectionId)}
										style={styles.tocItem}
								>
										<Text style={styles.tocItemText}>• {tocTitle}</Text>
								</TouchableOpacity>
								);
						})}
					</View>
          {/* Introduction Section */}
          <View
            style={styles.sectionContainer}
            onLayout={(event) => onLayout(event, sections.introduction.id)}
          >
            <Text style={styles.bodyText}>{sections.introduction.content}</Text>
          </View>

          {/* Interpretations and Definitions Section */}
          <View
            style={styles.sectionContainer}
            onLayout={(event) => onLayout(event, sections.interpretationsAndDefinitions.id)}
          >
            <Text style={styles.headingLevel1}>Interpretation and Definitions</Text>
                <View style={styles.definitionItem}>
                  <Text style={styles.definitionTerm}>
                    You:
                  </Text>
                  <Text style={styles.definitionText}>{sections.interpretationsAndDefinitions.content.you}</Text>
                </View>
                <View style={styles.definitionItem}>
                  <Text style={styles.definitionTerm}>
                    Company:
                  </Text>
                  <Text style={styles.definitionText}>{sections.interpretationsAndDefinitions.content.company}</Text>
                </View>
                <View style={styles.definitionItem}>
                  <Text style={styles.definitionTerm}>
                    App:
                  </Text>
                  <Text style={styles.definitionText}>{sections.interpretationsAndDefinitions.content.app}</Text>
                </View>
                <View style={styles.definitionItem}>
                  <Text style={styles.definitionTerm}>
                    Personal Information: 
                  </Text>
                  <Text style={styles.definitionText}>{sections.interpretationsAndDefinitions.content.personalInformation}</Text>
                </View>
                <View style={styles.definitionItem}>
                  <Text style={styles.definitionTerm}>
                    Personal Health Information: 
                  </Text>
                  <Text style={styles.definitionText}>{sections.interpretationsAndDefinitions.content.personalHealthInformation}</Text>
                </View>
          </View>

          {/* Types of Information Collected and How We Use it (dataCollection) */}
          <View
            style={styles.sectionContainer}
            onLayout={(event) => onLayout(event, sections.dataCollection.id)}
          >
            <Text style={styles.headingLevel1}>{sections.dataCollection.title}</Text>
            <Text style={styles.bodyText}>{sections.dataCollection.content}</Text>

            {/* Personal Information */}
            <View style={styles.subSectionContainer} onLayout={(event) => onLayout(event, sections.dataCollection.personalInformation.id)}>
              <Text style={styles.headingLevel2}>{sections.dataCollection.personalInformation.title}</Text>
              <Text style={styles.descriptionText}>{sections.dataCollection.personalInformation.description}</Text>
              <Text style={styles.headingLevel3}>Account Information</Text>
              <Text style={styles.dataPoint}>• Data Type: <Text style={styles.dataPointValue}>{sections.dataCollection.personalInformation.accountInformation.dataType}</Text></Text>
              <Text style={styles.dataPoint}>• Purpose: <Text style={styles.dataPointValue}>{sections.dataCollection.personalInformation.accountInformation.purpose}</Text></Text>
              <Text style={styles.dataPoint}>• Collection Method: <Text style={styles.dataPointValue}>{sections.dataCollection.personalInformation.accountInformation.collectionMethod}</Text></Text>
              <Text style={styles.dataPoint}>• Storage: <Text style={styles.dataPointValue}>{sections.dataCollection.personalInformation.accountInformation.storageLocationAndMethods}</Text></Text>
            </View>

            {/* Personal Health Information */}
            <View style={styles.subSectionContainer} onLayout={(event) => onLayout(event, sections.dataCollection.personalHealthInformation.id)}>
              <Text style={styles.headingLevel2}>{sections.dataCollection.personalHealthInformation.title}</Text>
              <Text style={styles.descriptionText}>{sections.dataCollection.personalHealthInformation.description}</Text>

              {/* Sensor Data */}
              <Text style={styles.headingLevel3} onLayout={(event) => onLayout(event, sections.dataCollection.personalHealthInformation.sensorData.id)}>{sections.dataCollection.personalHealthInformation.sensorData.title}</Text>
              <Text style={styles.subHeading} onLayout={(event) => onLayout(event, sections.dataCollection.personalHealthInformation.sensorData.microphone.id)}>Microphone:</Text>
              <Text style={styles.dataPoint}>• Data Type: <Text style={styles.dataPointValue}>{sections.dataCollection.personalHealthInformation.sensorData.microphone.dataType}</Text></Text>
              <Text style={styles.dataPoint}>• Purpose: <Text style={styles.dataPointValue}>{sections.dataCollection.personalHealthInformation.sensorData.microphone.purpose}</Text></Text>
              <Text style={styles.dataPoint}>• Collection Method: <Text style={styles.dataPointValue}>{sections.dataCollection.personalHealthInformation.sensorData.microphone.collectionMethod}</Text></Text>

              <Text style={styles.subHeading} onLayout={(event) => onLayout(event, sections.dataCollection.personalHealthInformation.sensorData.accelerometer.id)}>Accelerometer:</Text>
              <Text style={styles.dataPoint}>• Data Type: <Text style={styles.dataPointValue}>{sections.dataCollection.personalHealthInformation.sensorData.accelerometer.dataType}</Text></Text>
              <Text style={styles.dataPoint}>• Purpose: <Text style={styles.dataPointValue}>{sections.dataCollection.personalHealthInformation.sensorData.accelerometer.purpose}</Text></Text>
              <Text style={styles.dataPoint}>• Collection Method: <Text style={styles.dataPointValue}>{sections.dataCollection.personalHealthInformation.sensorData.accelerometer.collectionMethod}</Text></Text>

              <Text style={styles.subHeading} onLayout={(event) => onLayout(event, sections.dataCollection.personalHealthInformation.sensorData.lightSensor.id)}>Light Sensor:</Text>
              <Text style={styles.dataPoint}>• Data Type: <Text style={styles.dataPointValue}>{sections.dataCollection.personalHealthInformation.sensorData.lightSensor.dataType}</Text></Text>
              <Text style={styles.dataPoint}>• Purpose: <Text style={styles.dataPointValue}>{sections.dataCollection.personalHealthInformation.sensorData.lightSensor.purpose}</Text></Text>
              <Text style={styles.dataPoint}>• Collection Method: <Text style={styles.dataPointValue}>{sections.dataCollection.personalHealthInformation.sensorData.lightSensor.collectionMethod}</Text></Text>

              {/* Journal Data */}
              <Text style={styles.headingLevel3} onLayout={(event) => onLayout(event, sections.dataCollection.personalHealthInformation.journalData.id)}>Journal Data</Text>
              <Text style={styles.dataPoint}>• Data Type: <Text style={styles.dataPointValue}>{sections.dataCollection.personalHealthInformation.journalData.dataType}</Text></Text>
              <Text style={styles.dataPoint}>• Purpose: <Text style={styles.dataPointValue}>{sections.dataCollection.personalHealthInformation.journalData.purpose}</Text></Text>
              <Text style={styles.dataPoint}>• Collection Method: <Text style={styles.dataPointValue}>{sections.dataCollection.personalHealthInformation.journalData.collectionMethod}</Text></Text>

              {/* Derived Data */}
              <Text style={styles.headingLevel3} onLayout={(event) => onLayout(event, sections.dataCollection.personalHealthInformation.derivedData.id)}>Derived Data</Text>
              <Text style={styles.bodyText}>{sections.dataCollection.personalHealthInformation.derivedData.content}</Text>
            </View>

            {/* Usage Data */}
            <View style={styles.subSectionContainer} onLayout={(event) => onLayout(event, sections.dataCollection.usageData.id)}>
              <Text style={styles.headingLevel2}>{sections.dataCollection.usageData.title}</Text>
              <Text style={styles.descriptionText}>{sections.dataCollection.usageData.description}</Text>
              <Text style={styles.headingLevel3}>Technical Information</Text>
              <Text style={styles.dataPoint}>• Data Type: <Text style={styles.dataPointValue}>{sections.dataCollection.usageData.technicalInformation.dataType}</Text></Text>
              <Text style={styles.dataPoint}>• Purpose: <Text style={styles.dataPointValue}>{sections.dataCollection.usageData.technicalInformation.purpose}</Text></Text>
              <Text style={styles.dataPoint}>• Collection Method: <Text style={styles.dataPointValue}>{sections.dataCollection.usageData.technicalInformation.collectionMethod}</Text></Text>
              <Text style={styles.dataPoint}>• Storage Location: <Text style={styles.dataPointValue}>{sections.dataCollection.usageData.technicalInformation.storageLocation}</Text></Text>
              <Text style={styles.dataPoint}>• Troubleshooting: <Text style={styles.dataPointValue}>{sections.dataCollection.usageData.technicalInformation.troubleshooting}</Text></Text>
              <Text style={styles.dataPoint}>• General Analytics: <Text style={styles.dataPointValue}>{sections.dataCollection.usageData.technicalInformation.generalAnalytics}</Text></Text>
            </View>
          </View>

          {/* Cloud vs. Local Data Storage & Processing (cloudVsLocalStorage) */}
          <View
            style={styles.sectionContainer}
            onLayout={(event) => onLayout(event, sections.cloudVsLocalStorage.id)}
          >
            <Text style={styles.headingLevel1}>{sections.cloudVsLocalStorage.title}</Text>
            <Text style={styles.bodyText}>{sections.cloudVsLocalStorage.content}</Text>

            {/* Cloud Storage */}
            <View style={styles.subSectionContainer} onLayout={(event) => onLayout(event, sections.cloudVsLocalStorage.cloudStorage.id)}>
              <Text style={styles.headingLevel2}>{sections.cloudVsLocalStorage.cloudStorage.title}</Text>
              <Text style={styles.descriptionText}>{sections.cloudVsLocalStorage.cloudStorage.description}</Text>
              <Text style={styles.dataPoint}>• Benefits: <Text style={styles.dataPointValue}>{sections.cloudVsLocalStorage.cloudStorage.benefits}</Text></Text>
              <Text style={styles.dataPoint}>• Data Location: <Text style={styles.dataPointValue}>{sections.cloudVsLocalStorage.cloudStorage.dataLocation}</Text></Text>
              <Text style={styles.dataPoint}>• Accountability: <Text style={styles.dataPointValue}>{sections.cloudVsLocalStorage.cloudStorage.accountability}</Text></Text>
            </View>

            {/* Local Storage */}
            <View style={styles.subSectionContainer} onLayout={(event) => onLayout(event, sections.cloudVsLocalStorage.localStorage.id)}>
              <Text style={styles.headingLevel2}>{sections.cloudVsLocalStorage.localStorage.title}</Text>
              <Text style={styles.descriptionText}>{sections.cloudVsLocalStorage.localStorage.description}</Text>
              <Text style={styles.dataPoint}>• Limitations: <Text style={styles.dataPointValue}>{sections.cloudVsLocalStorage.localStorage.limitations}</Text></Text>
              <Text style={styles.dataPoint}>• Responsibility: <Text style={styles.dataPointValue}>{sections.cloudVsLocalStorage.localStorage.responsibility}</Text></Text>
              <Text style={styles.dataPoint}>• Consent: <Text style={styles.dataPointValue}>{sections.cloudVsLocalStorage.localStorage.consent}</Text></Text>
            </View>
          </View>

          {/* Data Encryption and Pseudonymization (dataEncryptionAndPsuedonymization) */}
          <View
            style={styles.sectionContainer}
            onLayout={(event) => onLayout(event, sections.dataEncryptionAndPsuedonymization.id)}
          >
            <Text style={styles.headingLevel1}>{sections.dataEncryptionAndPsuedonymization.title}</Text>
            <Text style={styles.descriptionText}>{sections.dataEncryptionAndPsuedonymization.description}</Text>

            {/* Encryption */}
            <View style={styles.subSectionContainer} onLayout={(event) => onLayout(event, sections.dataEncryptionAndPsuedonymization.encryption.id)}>
              <Text style={styles.headingLevel2}>Encryption</Text>
              <Text style={styles.subHeading}>At Rest:</Text>
              <Text style={styles.dataPoint}>• Server Data: <Text style={styles.dataPointValue}>{sections.dataEncryptionAndPsuedonymization.encryption.atRest.serverData}</Text></Text>
              <Text style={styles.dataPoint}>• Local Data: <Text style={styles.dataPointValue}>{sections.dataEncryptionAndPsuedonymization.encryption.atRest.localData}</Text></Text>
              <Text style={styles.subHeading}>In Transit:</Text>
              <Text style={styles.dataPointValue}>{sections.dataEncryptionAndPsuedonymization.encryption.inTransit}</Text>
            </View>

            {/* Pseudonymization */}
            <View style={styles.subSectionContainer} onLayout={(event) => onLayout(event, sections.dataEncryptionAndPsuedonymization.pseudonymization.id)}>
              <Text style={styles.headingLevel2}>Pseudonymization</Text>
              <Text style={styles.descriptionText}>{sections.dataEncryptionAndPsuedonymization.pseudonymization.description}</Text>
              <Text style={styles.dataPoint}>• Purpose: <Text style={styles.dataPointValue}>{sections.dataEncryptionAndPsuedonymization.pseudonymization.purpose}</Text></Text>
            </View>
          </View>

          {/* How We share Your information (dataSharing) */}
          <View
            style={styles.sectionContainer}
            onLayout={(event) => onLayout(event, sections.dataSharing.id)}
          >
            <Text style={styles.headingLevel1}>{sections.dataSharing.title}</Text>
            <Text style={styles.descriptionText}>{sections.dataSharing.description}</Text>

            {/* Google Cloud */}
            <View style={styles.subSectionContainer}>
              <Text style={styles.headingLevel2}>{sections.dataSharing.googleCloud.title}</Text>
              <Text style={styles.descriptionText}>{sections.dataSharing.googleCloud.description}</Text>
            </View>

            {/* Legal Reasons */}
            <View style={styles.subSectionContainer}>
              <Text style={styles.headingLevel2}>{sections.dataSharing.legal.title}</Text>
              <Text style={styles.descriptionText}>{sections.dataSharing.legal.description}</Text>
            </View>
          </View>

          {/* Retention of Your Information (dataRetention) */}
          <View
            style={styles.sectionContainer}
            onLayout={(event) => onLayout(event, sections.dataRetention.id)}
          >
            <Text style={styles.headingLevel1}>{sections.dataRetention.title}</Text>
            <Text style={styles.descriptionText}>{sections.dataRetention.description}</Text>

            {/* Account Information */}
            <View style={styles.subSectionContainer}>
              <Text style={styles.headingLevel2}>Account Information</Text>
              <Text style={styles.descriptionText}>{sections.dataRetention.accountInformation.description}</Text>
              <Text style={styles.dataPoint}>• Data Type: <Text style={styles.dataPointValue}>{sections.dataRetention.accountInformation.dataType}</Text></Text>
            </View>

            {/* Personal Health Information */}
            <View style={styles.subSectionContainer}>
              <Text style={styles.headingLevel2}>Personal Health Information</Text>
              <Text style={styles.dataPoint}>• Cloud Stored: <Text style={styles.dataPointValue}>{sections.dataRetention.personalHealthInformation.cloudStored}</Text></Text>
              <Text style={styles.dataPoint}>• User Initiated Deletion: <Text style={styles.dataPointValue}>{sections.dataRetention.personalHealthInformation.userInitiated}</Text></Text>
              <Text style={styles.dataPoint}>• Local Stored: <Text style={styles.dataPointValue}>{sections.dataRetention.personalHealthInformation.localStored}</Text></Text>
              <Text style={styles.dataPoint}>• Data Type: <Text style={styles.dataPointValue}>{sections.dataRetention.personalHealthInformation.dataType}</Text></Text>
            </View>

            {/* Usage Data */}
            <View style={styles.subSectionContainer}>
              <Text style={styles.headingLevel2}>Usage Data</Text>
              <Text style={styles.dataPoint}>• Pseudonymized: <Text style={styles.dataPointValue}>{sections.dataRetention.usageData.pseudonymized}</Text></Text>
              <Text style={styles.dataPoint}>• Anonymized: <Text style={styles.dataPointValue}>{sections.dataRetention.usageData.anonymized}</Text></Text>
            </View>
          </View>

          {/* Your Rights under PIPEDA (userRights) */}
          <View
            style={styles.sectionContainer}
            onLayout={(event) => onLayout(event, sections.userRights.id)}
          >
            <Text style={styles.headingLevel1}>{sections.userRights.title}</Text>
            <Text style={styles.descriptionText}>{sections.userRights.description}</Text>

            {/* Rights details */}
            <View style={styles.subSectionContainer}>
              <Text style={styles.headingLevel2}>{sections.userRights.access.title}</Text>
              <Text style={styles.bodyText}>{sections.userRights.access.description}</Text>

              <Text style={styles.headingLevel2}>{sections.userRights.correction.title}</Text>
              <Text style={styles.bodyText}>{sections.userRights.correction.description}</Text>

              <Text style={styles.headingLevel2}>{sections.userRights.withdrawConsent.title}</Text>
              <Text style={styles.bodyText}>{sections.userRights.withdrawConsent.description}</Text>

              <Text style={styles.headingLevel2}>{sections.userRights.accountability.title}</Text>
              <Text style={styles.bodyText}>{sections.userRights.accountability.description}</Text>

              <Text style={styles.headingLevel2}>{sections.userRights.challengeCompliance.title}</Text>
              <Text style={styles.bodyText}>{sections.userRights.challengeCompliance.description}</Text>

              <Text style={styles.bodyText}>{sections.userRights.exerciseRights}</Text>
            </View>
          </View>

          {/* Data Breach Notification (dataBreachNotification) */}
          <View
            style={styles.sectionContainer}
            onLayout={(event) => onLayout(event, sections.dataBreachNotification.id)}
          >
            <Text style={styles.headingLevel1}>{sections.dataBreachNotification.title}</Text>
            <Text style={styles.descriptionText}>{sections.dataBreachNotification.description}</Text>

            <View style={styles.subSectionContainer}>
              <Text style={styles.headingLevel2}>{sections.dataBreachNotification.riskAssessment.title}</Text>
              <Text style={styles.bodyText}>{sections.dataBreachNotification.riskAssessment.description}</Text>

              <Text style={styles.headingLevel2}>{sections.dataBreachNotification.notificationOPC.title}</Text>
              <Text style={styles.bodyText}>{sections.dataBreachNotification.notificationOPC.description}</Text>

              <Text style={styles.headingLevel2}>{sections.dataBreachNotification.notificationIndividuals.title}</Text>
              <Text style={styles.bodyText}>{sections.dataBreachNotification.notificationIndividuals.description}</Text>
              {sections.dataBreachNotification.notificationIndividuals.content.map((item: string, index: number) => (
                <Text key={`breach-item-${index}`} style={styles.listItemText}>
                  - {item}
                </Text>
              ))}

              <Text style={styles.headingLevel2}>{sections.dataBreachNotification.notificationOtherOrganizations.title}</Text>
              <Text style={styles.bodyText}>{sections.dataBreachNotification.notificationOtherOrganizations.description}</Text>

              <Text style={styles.headingLevel2}>{sections.dataBreachNotification.recordKeeping.title}</Text>
              <Text style={styles.bodyText}>{sections.dataBreachNotification.recordKeeping.description}</Text>
            </View>
          </View>

          {/* Changes to the Privacy Policy (policyChanges) */}
          <View
            style={styles.sectionContainer}
            onLayout={(event) => onLayout(event, sections.policyChanges.id)}
          >
            <Text style={styles.headingLevel1}>Changes to the Privacy Policy</Text>
            <Text style={styles.bodyText}>{sections.policyChanges.content}</Text>
          </View>

          {/* Contact Us (contact) */}
          <View
            style={styles.sectionContainer}
            onLayout={(event) => onLayout(event, sections.contact.id)}
          >
            <Text style={styles.headingLevel1}>{sections.contact.title}</Text>
            <Text style={styles.descriptionText}>{sections.contact.description}</Text>
            <Text style={styles.dataPoint}>• Email: <Text style={styles.dataPointValue}>{sections.contact.email}</Text></Text>
          </View>
        </ScrollView>
      </View>
  );
}

// =====================================================================
// STYLES
// =====================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
		backgroundColor: 'black', 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainHeader: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  metadataText: {
    fontSize: 12,
    color: '#BBBBBB',
    textAlign: 'center',
    marginBottom: 20,
  },
  tocContainer: {
    marginBottom: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tocTitle: { 
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textAlign: 'left',
  },
  tocItem: {
    paddingVertical: 4, 
    paddingHorizontal: 5,
    borderRadius: 5, 
    marginBottom: 5,
  },
  tocItemText: {
    fontSize: 15, 
    color: Colors.generalBlue, 
    fontWeight: '500',
    marginLeft: 10,
  },
  scrollView: {
    flex: 1,
		paddingHorizontal: 15,
  },
  sectionContainer: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.lightGrey,
  },
  subSectionContainer: {
    marginLeft: 10,
    marginTop: 10,
  },
  headingLevel1: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.generalBlue,
    marginTop: 15,
    marginBottom: 10,
  },
  headingLevel2: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.generalBlue, 
    marginTop: 10,
    marginBottom: 8,
    marginLeft: 5,
  },
  headingLevel3: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.generalBlue,
    marginTop: 8,
    marginBottom: 5,
    marginLeft: 10,
  },
  subHeading: { 
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ADD8E6',
    marginTop: 5,
    marginBottom: 3,
    marginLeft: 15,
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 24,
    color: 'white', 
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
    color: 'white',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  definitionItem: {
    marginBottom: 8,
    marginLeft: 10,
  },
  definitionTerm: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  definitionText: {
    fontSize: 15,
    color: 'white',
    marginLeft: 5,
  },
  dataPoint: {
    fontSize: 14,
    color: '#ADD8E6',
    marginBottom: 5,
    marginLeft: 15,
  },
  dataPointValue: {
    color: 'white',
    fontWeight: 'normal',
  },
  listItemText: {
    fontSize: 15,
    color: 'white',
    marginLeft: 25, 
    marginBottom: 5,
  },
});

export default PrivacyPolicyScreen;