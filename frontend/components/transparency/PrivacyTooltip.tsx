import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
import Tooltip from 'react-native-walkthrough-tooltip';
import { PrivacyIcon } from './PrivacyIcon';
import { getPrivacyRiskLabel, handleLinkPress } from '@/utils/transparency';
import { PrivacyRisk } from '@/constants/types/Transparency';
import { Colors } from '@/constants/Colors';
import { SensorPrivacyIcon } from './SensorPrivacyIcon';
import { useRouter } from 'expo-router';

interface PrivacyTooltipProps {
  color: string;
  iconSize?: number;
  iconName: string;
  violationsDetected: string;
  privacyViolations?: string;
  purpose: string;
  storage: string;
  access: string;
  optOutLink?: string;
  privacyPolicySectionLink?: string;
  regulationLink?: string;
  dataType: string;
}

/**
 * TODO - fix the scrolling on the tool tips, currently scrolling is very sensitive and hard to do
 * and the tooltip often closes when you scroll. Not a priority fix, as generally tooltip should not be too long.
 * May need to make a custom tooltip component for this. 
 */
export const PrivacyTooltip = ({
  color,
  iconSize = 40,
  iconName,
  violationsDetected,
  privacyViolations,
  purpose,
  storage,
  access,
  optOutLink,
  privacyPolicySectionLink,
  regulationLink,
  dataType
}: PrivacyTooltipProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
	const [tooltipPlacement, setTooltipPlacement] = useState<'top' | 'bottom'>('bottom');
	const iconRef = useRef<TouchableOpacity>(null); // VS code shows type error but this still works
  const router = useRouter();

	const screenHeight = Dimensions.get('window').height;
	const screenWidth = Dimensions.get('window').width;

	const handleIconPress = () => {
		if (iconRef.current) {
			iconRef.current.measure((x : number, y : number, width : number, height : number, pageX : number, pageY : number) => {
				if (pageY > screenHeight / 2) {
					setTooltipPlacement('top');
					setShowTooltip(true);
				} else {
					setTooltipPlacement('bottom');
					setShowTooltip(true);
				}
				
			});
		}
	};

  const renderTooltipContent = () => (
    <ScrollView 
      style={[styles.tooltipContent, { maxHeight: 500 }]}
      contentContainerStyle={styles.scrollContentContainer}
      showsVerticalScrollIndicator={true}
      persistentScrollbar={true}
      bounces={true}
      nestedScrollEnabled={true}
      scrollEventThrottle={16}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.content}>
        {/* Privacy Violations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{violationsDetected}</Text>
          {(violationsDetected !== getPrivacyRiskLabel(PrivacyRisk.LOW)) && (
            <Text style={styles.sectionText}>
              {privacyViolations}
            </Text>
          )}
        </View>

        {/* Purpose */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Purpose:</Text>
          <Text style={styles.sectionText}>{purpose}</Text>
        </View>

        {violationsDetected === getPrivacyRiskLabel(PrivacyRisk.LOW) && (
          <>
            {/* Storage */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Storage:</Text>
              <Text style={styles.sectionText}>{storage}</Text>
            </View>

            {/* Access */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Access:</Text>
              <Text style={styles.sectionText}>{access}</Text>
            </View>
          </>
        )}

        {/* Links */}
        {(optOutLink || privacyPolicySectionLink || regulationLink) && (
          <View style={styles.linksSection}>
            {privacyPolicySectionLink && (
              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => {
                  setShowTooltip(false);
                  router.push({pathname: "/privacy-policy", params: {sectionId: privacyPolicySectionLink}})
                }}
              >
                <Text style={styles.linkText}>Link to privacy policy section</Text>
              </TouchableOpacity>
            )}

            {regulationLink && (
              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => handleLinkPress(regulationLink)}
              >
                <Text style={styles.linkText}>PIPEDA regulation</Text>
              </TouchableOpacity>
            )}

            {optOutLink && (
              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => {
                  setShowTooltip(false);
                  router.push(optOutLink)}}
              >
                <Text style={styles.linkText}>Opt Out</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => {
                setShowTooltip(false);
                router.push('/privacy-policy')}}
            >
              <Text style={styles.linkText}>View Full Privacy Policy</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );

  return (
    <Tooltip
      isVisible={showTooltip}
      content={renderTooltipContent()}
      onClose={() => setShowTooltip(false)}
      contentStyle={[styles.tooltipContainer, { backgroundColor: color, width: screenWidth * 0.8 }]}
      arrowStyle={styles.tooltipArrow}
      placement={tooltipPlacement}
      // This fixes the Android duplicate icon issue
      childrenWrapperStyle={{ 
        opacity: showTooltip ? 0 : 1 // Hide the duplicate when tooltip is open
      }}
    >
      {dataType.includes('sensor') ? (
        <SensorPrivacyIcon
          sensorType={dataType.split('-')[1] as 'accelerometer' | 'light' | 'microphone'}
          iconName={iconName}
          storageType={dataType.includes('cloud') ? 'cloud' : 'local'}
          handleIconPress={handleIconPress}
          iconRef={iconRef}
        />
      )
      
      : (
        <PrivacyIcon
          handleIconPress={handleIconPress}
          isOpen={showTooltip}
          iconName={iconName}
          iconSize={iconSize}
          iconRef={iconRef}
        />
      )}
    </Tooltip>
  );
};

// =============================================================
// Styles
// =============================================================

const styles = StyleSheet.create({
  tooltipContainer: {
    padding: 0,
    maxHeight: 500, 
  },
  tooltipContent: {
    borderRadius: 8,
  },
  scrollContentContainer: {
    flexGrow: 1,
    paddingBottom: 10, 
  },
  tooltipArrow: {
    // Custom arrow styling if needed
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  content: {
    padding: 16, 
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 2,
  },
  sectionText: {
    fontSize: 12,
    color: 'black',
    lineHeight: 16,
    flexWrap: 'wrap',
  },
  linksSection: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
  },
  linkButton: {
    paddingVertical: 6,
  },
  linkText: {
    fontSize: 12,
    color: Colors.tooltipLinkBlue,
    textDecorationLine: 'underline',
    flexWrap: 'wrap',
  },
});

export default PrivacyTooltip;