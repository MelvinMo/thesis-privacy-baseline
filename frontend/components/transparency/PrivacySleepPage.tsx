import { Colors } from '@/constants/Colors';
import { PrivacyRisk } from '@/constants/types/Transparency';
import { useTransparencyStore } from '@/store/transparencyStore';
import { formatPrivacyViolations, getPrivacyRiskLabel, handleLinkPress } from '@/utils/transparency';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export const PrivacySleepPage = () => {
    const { journalTransparency } = useTransparencyStore();
    const router = useRouter();
    
    return (
        <View style={styles.container}>
            {/* Header Section */}
            <View style={styles.headerSection}>
                <Text style={styles.headerTitle}>
                    {getPrivacyRiskLabel(journalTransparency.privacyRisk || PrivacyRisk.LOW)}
                </Text>
                {!(journalTransparency.privacyRisk === PrivacyRisk.LOW) && 
                    <>
                        <Text style={styles.headerText}>
                            {formatPrivacyViolations(journalTransparency)}
                        </Text>
                    </>
                }
            </View>

            <View style={styles.section}>
                <View style={styles.subSectionContainer}>
                    <Text style={styles.subSectionText}>
                        <Text style={{fontWeight: 'bold'}}>Purpose: </Text> {journalTransparency.aiExplanation!.why}
                    </Text>
                </View>
            </View>

            {journalTransparency.privacyRisk === PrivacyRisk.LOW && (
                <>
                    <View style={styles.section}>
                        <View style={styles.subSectionContainer}>
                            <Text style={styles.subSectionText}>
                                <Text style={{fontWeight: 'bold'}}>Storage: </Text> {journalTransparency.aiExplanation!.storage}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <View style={styles.subSectionContainer}>
                            <Text style={styles.subSectionText}>
                                <Text style={{fontWeight: 'bold'}}>Access: </Text> {journalTransparency.aiExplanation!.access}
                            </Text>
                        </View>
                    </View>
                </>
            )}


            <TouchableOpacity style={styles.linkButton} onPress={() => router.push({pathname: "/privacy-policy", params: {sectionId: journalTransparency.aiExplanation?.privacyPolicyLink[0]}})}>
                <Text style={styles.linkText}>Privacy Policy Section</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.linkButton} onPress={() => handleLinkPress(journalTransparency.aiExplanation?.regulationLink[0] || '')}>
                <Text style={styles.linkText}>PIPEDA Regulation</Text>
            </TouchableOpacity>

            {/* Privacy Policy Link */}
            <TouchableOpacity style={styles.privacyPolicyButton}>
                <Text style={styles.privacyPolicyText}>View our Full Privacy Policy</Text>
            </TouchableOpacity>
        </View>
    );
};

// =============================================================
// Styles
// =============================================================

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
        paddingVertical: 20,
        paddingHorizontal: 20,
    },
    headerSection: {
        marginBottom: 30,
    },
    headerTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: '600',
    },
    headerText: {
        color: 'white',
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 12,
    },
    linkButton: {
        alignSelf: 'flex-start',
        marginTop: 8,
    },
    linkText: {
        color: Colors.hyperlinkBlue,
        fontSize: 14,
        textDecorationLine: 'underline',
    },
    section: {
        marginBottom: 20,
    },
    subSectionContainer: {
        backgroundColor: Colors.lightBlack,
        padding: 15,
        borderRadius: 12,
    },
    subSectionText: {
        color: 'white',
        fontSize: 14,
        lineHeight: 20,
    },
    privacyPolicyButton: {
        alignSelf: 'flex-start',
        marginTop: 20,
    },
    privacyPolicyText: {
        color: Colors.hyperlinkBlue,
        fontSize: 16,
        textDecorationLine: 'underline',
    },
});
