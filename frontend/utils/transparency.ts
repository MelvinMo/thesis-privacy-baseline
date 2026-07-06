import { Colors } from "@/constants/Colors";
import { PrivacyRisk, TransparencyEvent } from "@/constants/types/Transparency";
import { Linking, Alert } from "react-native";

/**
 * This file provides utility functions for the transparency service that are used throughout the app. 
 */

export const pipedaBaseUrl = "https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/p_principle/principles"
export const handleLinkPress = async (regulationLink : string) => {
    try {
      let url = `${pipedaBaseUrl}/p_${regulationLink}/`;
      if (regulationLink === "") {
        url = pipedaBaseUrl; // Fallback to base URL if no specific link is provided
      }
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', `Cannot open ${regulationLink} link`);
      }
    } catch (error) {
      Alert.alert('Error', `Failed to open ${regulationLink} link`);
    }
};

// Helper function to get privacy risk color based on the risk level
export const getPrivacyRiskColor = (risk: PrivacyRisk) => {
    switch (risk) {
        case PrivacyRisk.HIGH:
            return Colors.tooltipRed;
        case PrivacyRisk.MEDIUM:
            return Colors.tooltipYellow;
        case PrivacyRisk.LOW:
            return Colors.tooltipGreen;
        default:
            return Colors.tooltipGreen;
    }
};

// Helper function to get privacy risk icon
export const getPrivacyRiskIcon = (risk: PrivacyRisk) => {
    switch (risk) {
        case PrivacyRisk.HIGH:
            return "privacy-high"
        case PrivacyRisk.MEDIUM:
            return "privacy-medium"
        case PrivacyRisk.LOW:
            return "privacy-low"
        default:
            return "privacy-low"
    }
};

// Function to get the appropriate privacy risk icon for a page based on all risks on that page
export const getPrivacyRiskIconForPage = (risks: PrivacyRisk[]) => {
    if (risks.includes(PrivacyRisk.HIGH)) {
        return "privacy-high";
    } else if (risks.includes(PrivacyRisk.MEDIUM)) {
        return "privacy-medium";
    } else {
        return "privacy-low";
    }
}

// Function to get the appropriate privacy risk color for a page based on all risks on that page
export const getPrivacyRiskColorForPage = (risks: PrivacyRisk[]) => {
    if (risks.includes(PrivacyRisk.HIGH)) {
        return Colors.tooltipRed;
    } else if (risks.includes(PrivacyRisk.MEDIUM)) {
        return Colors.tooltipYellow;
    } else {
        return Colors.tooltipGreen;
    }
}

export const getPrivacyRiskLabel = (risk: PrivacyRisk) => {
    switch (risk) {
        case PrivacyRisk.HIGH:
            return "Major Privacy Violation Detected:";
        case PrivacyRisk.MEDIUM:
            return "Some Privacy Concerns Detected:";
        case PrivacyRisk.LOW:
            return "No Privacy Violations Detected";
        default:
            return "Unknown Privacy Risk";
    }
}

// Helper function to format violations detected
export const formatPrivacyViolations = (transparency: TransparencyEvent) => {
    if (!transparency.regulatoryCompliance?.issues || transparency.regulatoryCompliance.issues.length === 0) {
        return "No privacy violations detected";
    }
    return `${transparency.aiExplanation?.privacyExplanation}`;
};