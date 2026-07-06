import { View, Text, KeyboardAvoidingView, Platform, TouchableOpacity, StyleSheet } from "react-native";
import PrivacyTooltip from "./transparency/PrivacyTooltip";
import { formatPrivacyViolations, getPrivacyRiskColor, getPrivacyRiskIcon, getPrivacyRiskLabel } from "@/utils/transparency";
import { Ionicons } from "@expo/vector-icons";
import { useTransparencyStore } from "@/store/transparencyStore";
import { PrivacyRisk } from "@/constants/types/Transparency";
import { Colors } from "@/constants/Colors";
import { SleepNote } from "@/constants/types/JournalData";

interface NormalJournalPageProps {
    showToolTipUI: boolean;
    bedtime: string;
    alarm: string;
    sleepGoal: string;
    diaryEntry: string;
    sleepNotes: SleepNote[];
    handleEditJournalEntry: () => void;
    handleAddSleepNote: () => void;
}

export const NormalJournalPage = ({
    showToolTipUI,
    bedtime,
    alarm,
    sleepGoal,
    sleepNotes,
    diaryEntry,
    handleEditJournalEntry,
    handleAddSleepNote,
}: NormalJournalPageProps) => {

    const { journalTransparency, accelerometerTransparency } = useTransparencyStore();

    return (
        <>
            <Text style={styles.sectionTitle}>Sleep Goal</Text>
            <View style={styles.sectionCard}>
                <View style={styles.sleepGoalContent}>
                    <View style={styles.sleepTimeAndAlarm}>
                        <View>
                            <Text style={styles.timeLabel}><Ionicons name="moon-outline" size={16} color="white" /> Bedtime</Text>
                            <Text style={styles.timeValue}>{bedtime}</Text>
                        </View>
                        <View style={styles.alarmRow}>
                            <Text style={styles.alarmLabel}><Ionicons name="alarm-outline" size={16} color="white" /> Alarm</Text>
                            <Text style={styles.alarmTime}>{alarm}</Text>
                        </View>
                    </View>
                    <View style={styles.goalItem}>
                        <Text style={styles.goalLabel}><Ionicons name="compass-outline" size={16} color="white" /> Goal</Text>
                        <Text style={styles.goalValue}>{sleepGoal}</Text>
                    </View>
                </View>
            </View>

            {/* Diary Section - Title with Privacy Tooltip */}
            <View style={styles.sectionTitleWithTooltip}>
                <Text style={styles.sectionTitle}>Diary</Text>
                {showToolTipUI &&
                    <PrivacyTooltip
                        color={getPrivacyRiskColor(journalTransparency.privacyRisk || PrivacyRisk.LOW)}
                        iconSize={40}
                        iconName={getPrivacyRiskIcon(journalTransparency.privacyRisk || PrivacyRisk.LOW)}
                        violationsDetected={getPrivacyRiskLabel(journalTransparency.privacyRisk || PrivacyRisk.LOW)}
                        privacyViolations={formatPrivacyViolations(journalTransparency)}
                        purpose={journalTransparency.aiExplanation!.why}
                        storage={journalTransparency.aiExplanation!.storage}
                        access={journalTransparency.aiExplanation!.access}
                        privacyPolicySectionLink={journalTransparency.aiExplanation?.privacyPolicyLink[0]}
                        regulationLink={journalTransparency.aiExplanation?.regulationLink[0]}
                        dataType="Journal"
                    />
                }
            </View>
            <KeyboardAvoidingView
                style={styles.keyboardAvoidingContainer}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
            >
                {/* Sleep Notes Subsection */}
                <View style={styles.subSectionCard}>
                    <View style={styles.subSectionHeader}>
                        <Text style={styles.subSectionTitle}>Sleep Notes</Text>
                        <TouchableOpacity onPress={handleAddSleepNote}>
                            <Ionicons name="add-circle-outline" size={24} color={Colors.generalBlue} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.sleepNotesContainer}>
                        {sleepNotes && sleepNotes.map((note, index) => (
                            <View key={index} style={styles.sleepNoteItem}>
                                <Text style={styles.sleepNoteBullet}>•</Text>
                                <Text style={styles.sleepNoteText}>{note}</Text>
                            </View>
                        ))}
                        {sleepNotes.length === 0 && (
                            <Text style={styles.noNotesText}>No sleep notes added yet.</Text>
                        )}
                    </View>
                </View>

                {/* Journal Entry Subsection - Display only when not in modal */}
                <View style={styles.journalEntryCard}>
                    <Text style={styles.diaryEntryPreview}>
                        {diaryEntry || "Write something to record your day... "}
                    </Text>
                    <TouchableOpacity onPress={handleEditJournalEntry} style={styles.editButton}>
                        <Ionicons name="pencil-outline" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>

            {/* Activity Tracker Section - Title with Privacy Tooltip */}
            <View style={styles.sectionTitleWithTooltip}>
                <Text style={styles.sectionTitle}>Activity Tracker</Text>
                {showToolTipUI &&
                    <PrivacyTooltip
                        color={getPrivacyRiskColor(accelerometerTransparency.privacyRisk || PrivacyRisk.LOW)}
                        iconSize={40}
                        iconName={getPrivacyRiskIcon(accelerometerTransparency.privacyRisk || PrivacyRisk.LOW)}
                        violationsDetected={getPrivacyRiskLabel(accelerometerTransparency.privacyRisk || PrivacyRisk.LOW)}
                        privacyViolations={formatPrivacyViolations(accelerometerTransparency)}
                        purpose={accelerometerTransparency.aiExplanation!.why}
                        storage={accelerometerTransparency.aiExplanation!.storage}
                        access={accelerometerTransparency.aiExplanation!.access}
                        optOutLink={'/(tabs)/profile/consent-preferences'}
                        privacyPolicySectionLink={accelerometerTransparency.aiExplanation?.privacyPolicyLink[0]}
                        regulationLink={accelerometerTransparency.aiExplanation?.regulationLink[0]}
                        dataType={"Activity Tracker"}
                    />
                }
            </View>
            <View style={styles.sectionCard}>
                <View style={styles.activityContent}>
                    <TouchableOpacity style={styles.activityItem}>
                        <Text style={styles.activityLabel}>Steps</Text>
                        <View style={styles.circularProgress}>
                            <Text style={styles.progressNumber}>83</Text>
                            <Text style={styles.progressUnit}>steps</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.activityItem}>
                        <Text style={styles.activityLabel}>Calories</Text>
                        <View style={styles.circularProgress}>
                            <Text style={styles.progressNumber}>83</Text>
                            <Text style={styles.progressUnit}>kcal</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </>
    )
};

// =============================================================
// Styles
// =============================================================

const styles = StyleSheet.create({
    sectionCard: {
        backgroundColor: Colors.lightBlack,
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
    },
    sectionTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 15,
        paddingHorizontal: 10,
    },
    sectionTitleWithTooltip: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 15,
        paddingHorizontal: 10,
    },
    subSectionCard: {
        backgroundColor: Colors.lightBlack,
        borderRadius: 16,
        padding: 20,
        marginBottom: 15,
    },
    subSectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    subSectionTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
    sleepNotesContainer: {
        marginTop: 5,
    },
    sleepNoteItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 5,
    },
    sleepNoteBullet: {
        color: 'white',
        fontSize: 18,
        marginRight: 8,
        lineHeight: 20,
    },
    sleepNoteText: {
        color: 'white',
        fontSize: 16,
        flex: 1,
    },
    noNotesText: {
        color: '#8E8E93',
        fontSize: 16,
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 10,
    },
    journalEntryCard: {
        backgroundColor: Colors.lightBlack,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        borderRadius: 16,
    },
    editButton: {
        flex: 1,
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    diaryEntryPreview: {
        paddingVertical: 15,
        paddingHorizontal: 20,
        flex: 6,
        color: 'white',
        fontSize: 16,
        opacity: 0.8,
        minHeight: 60,
    },
    sleepGoalContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sleepTimeAndAlarm: {
        flex: 1,
        gap: 15,
    },
    timeLabel: {
        color: 'white',
        fontSize: 14,
        opacity: 0.7,
        marginBottom: 5,
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeValue: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
    goalItem: {
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    goalLabel: {
        color: 'white',
        fontSize: 14,
        opacity: 0.7,
        marginBottom: 5,
        flexDirection: 'row',
        alignItems: 'center',
    },
    goalValue: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
    alarmRow: {
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    alarmLabel: {
        color: 'white',
        fontSize: 14,
        opacity: 0.7,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    alarmTime: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    },
    activityContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 15,
    },
    activityItem: {
        flex: 1,
        alignItems: 'center',
        gap: 10,
    },
    activityLabel: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    },
    circularProgress: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: Colors.generalBlue,
    },
    progressNumber: {
        color: 'white',
        fontSize: 20,
        fontWeight: '600',
    },
    progressUnit: {
        color: 'white',
        fontSize: 12,
        opacity: 0.7,
    },
    keyboardAvoidingContainer: {
        flex: 1,
    },
})