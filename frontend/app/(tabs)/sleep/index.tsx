import { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    Alert,
    SafeAreaView
} from "react-native";
import { useRouter } from 'expo-router';
import { journalDataRepository, transparencyService } from "@/services";
import Loader from "@/components/Loader";
import { TimeModal } from "@/components/modal/TimeModal";
import { NormalSleepPage } from "@/components/NormalSleepPage";
import { useTransparencyStore } from "@/store/transparencyStore";
import PrivacyTooltip from "@/components/transparency/PrivacyTooltip";
import { PrivacyIcon } from "@/components/transparency/PrivacyIcon";
import { formatPrivacyViolations, getPrivacyRiskColor, getPrivacyRiskIcon, getPrivacyRiskLabel } from "@/utils/transparency";
import { DEFAULT_JOURNAL_TRANSPARENCY_EVENT, PrivacyRisk, TransparencyEvent } from "@/constants/types/Transparency";
import { PrivacySleepPage } from "@/components/transparency/PrivacySleepPage";
import { TRANSPARENCY_UI_CONFIG } from "@/constants/config/transparencyConfig";

export default function Sleep() {
    const [loading, setIsLoading] = useState(true);
    const router = useRouter();

    const [bedtime, setBedtime] = useState<string>('');
    const [alarm, setAlarm] = useState<string>('');

    const { journalTransparency, setJournalTransparency} = useTransparencyStore();

    // Modal visibility states
    const [isBedtimeModalVisible, setIsBedtimeModalVisible] = useState(false);
    const [isAlarmModalVisible, setIsAlarmModalVisible] = useState(false);

    // this is only needed when rendering the privacy page UI, not for the tooltip UI
    const [ displayNormalUI, setDisplayNormalUI ] = useState(true);

    useEffect(() => {
        const loadJournalData = async () => {
            try {
                setIsLoading(true);
                const dateToLoad = new Date().toISOString().split('T')[0];
                const existingJournal = await journalDataRepository.getJournalByDate(dateToLoad);

                if (existingJournal) {
                    setAlarm(existingJournal.alarmTime);
                    setBedtime(existingJournal.bedtime); 
                }
            } catch (error) {
                console.error("Error loading journal data:", error);
                Alert.alert("Error", `Failed to load journal data: ${error}`);
            } finally {
                setIsLoading(false);
            }
        };
        loadJournalData();
    }, []);

    const saveBedTimeToJournal = async (newBedtime: string) => {
        try {
            const dateToSave = new Date().toISOString().split('T')[0];
            // set up a new transparency event
            const transparencyEvent : TransparencyEvent = DEFAULT_JOURNAL_TRANSPARENCY_EVENT;
            setJournalTransparency(transparencyEvent);
            
            const result = await journalDataRepository.editJournal({
                    date: dateToSave,
                    bedtime: newBedtime,
                    sleepDuration: newBedtime && alarm ? '8 hours' : '', // TODO - calculate actual sleep duration
                }, dateToSave
            );
            // Analyze privacy risks - do not wait for this to complete
            transparencyService.analyzePrivacyRisks(transparencyEvent)
                .then(updatedJournalTransparency => {
                    setJournalTransparency(updatedJournalTransparency);
                    console.log("Updated journal transparency", updatedJournalTransparency);
                })
                .catch(error => {
                    console.error("Error analyzing privacy risks:", error);
            });

            if (result) {
                setBedtime(result.bedtime);
            } else {
                Alert.alert("Error", "Failed to save bedtime");
            }
        } catch (error) {
            console.error("Error saving bedtime to journal:", error);
            Alert.alert("Error", `Failed to save bedtime: ${error}`);
        }
    };

    const saveAlarmToJournal = async (newAlarm: string) => {
        try {
            const dateToSave = new Date().toISOString().split('T')[0];

            // set up a new transparency event
            const transparencyEvent : TransparencyEvent = DEFAULT_JOURNAL_TRANSPARENCY_EVENT;
            setJournalTransparency(transparencyEvent);

            const result = await journalDataRepository.editJournal({
                    date: dateToSave,
                    alarmTime: newAlarm,
                    sleepDuration: bedtime && newAlarm ? '8 hours' : '', // TODO - calculate actual sleep duration
                }, dateToSave
            );

            // Analyze privacy risks - do not wait for this to complete
            transparencyService.analyzePrivacyRisks(transparencyEvent)
                .then(updatedJournalTransparency => {
                    setJournalTransparency(updatedJournalTransparency);
                    console.log("Updated journal transparency", updatedJournalTransparency);
                })
                .catch(error => {
                    console.error("Error analyzing privacy risks:", error);
            });

            if (result) {
                setAlarm(result.alarmTime);
            } else {
                Alert.alert("Error", "Failed to save alarm time");
            }
        } catch (error) {
            console.error("Error saving alarm time to journal:", error);
            Alert.alert("Error", `Failed to save alarm time: ${error}`);
        }
    };

    const handleStartSleepSession = async () => {
        // Validate that bedtime and alarm are set
        if (!bedtime || !alarm || bedtime === 'Set Time' || alarm === 'Set Time') {
            Alert.alert("Missing Information", "Please set your Bedtime and Alarm before starting sleep mode.");
            return;
        }
        router.push('/(tabs)/sleep/sleep-mode'); // Navigate to sleep-mode.tsx
    };

    // Bedtime Modal Handlers
    const handleEditBedtime = () => {
        setIsBedtimeModalVisible(true);
    };

    const handleSaveBedtime = (time: string) => {
        setBedtime(time); // Time is already formatted by TimeModal
        saveBedTimeToJournal(time); // Save to journal
        setIsBedtimeModalVisible(false);
    };

    const handleCancelBedtime = () => {
        setIsBedtimeModalVisible(false);
    };

    // Alarm Modal Handlers
    const handleEditAlarm = () => {
        setIsAlarmModalVisible(true);
    };

    const handleSaveAlarm = (time: string) => {
        setAlarm(time); // Time is already formatted by TimeModal
        saveAlarmToJournal(time); // Save to journal
        setIsAlarmModalVisible(false);
    };

    const handleCancelAlarm = () => {
        setIsAlarmModalVisible(false);
    };

    if (loading) {
        return <Loader size="large" />;
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.headerContainer}>
                    <Text style={styles.headerText}>
                        Sleep Tracker
                    </Text>
                    {TRANSPARENCY_UI_CONFIG.sleepPageTooltipEnabled ? (
                        <PrivacyTooltip
                            color={getPrivacyRiskColor(journalTransparency.privacyRisk || PrivacyRisk.LOW)}
                            iconSize={50}
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
                    ) : (
                        <PrivacyIcon 
                            handleIconPress={() => setDisplayNormalUI(!displayNormalUI)}
                            isOpen={!displayNormalUI}
                            iconName={getPrivacyRiskIcon(journalTransparency.privacyRisk || PrivacyRisk.LOW)}
                            iconSize={50}
                        />
                    )}
                </View>

                {(displayNormalUI || TRANSPARENCY_UI_CONFIG.sleepPageTooltipEnabled) && 
                <NormalSleepPage
                    handleEditBedtime={handleEditBedtime}
                    bedtime={bedtime || 'Set Time'}
                    handleEditAlarm={handleEditAlarm}
                    alarm={alarm || 'Set Time'}
                    handleStartSleepSession={handleStartSleepSession}
                />}

                {(!displayNormalUI && !TRANSPARENCY_UI_CONFIG.sleepPageTooltipEnabled) &&
                    <PrivacySleepPage/>
                }

                {/* Bedtime TimeModal */}
                <TimeModal
                    isVisible={isBedtimeModalVisible}
                    label="Set Bedtime"
                    defaultTime={bedtime}
                    onSave={handleSaveBedtime}
                    onCancel={handleCancelBedtime}
                />

                {/* Alarm TimeModal */}
                <TimeModal
                    isVisible={isAlarmModalVisible}
                    label="Set Alarm"
                    defaultTime={alarm}
                    onSave={handleSaveAlarm}
                    onCancel={handleCancelAlarm}
                />
            </SafeAreaView>
        </View>
    );
};

// ========================================================================
// Styles
// ========================================================================

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    safeArea: {
        flex: 1,
        width: '100%',
    },
    headerContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingTop: 50, 
        paddingHorizontal: 0, 
        marginBottom: 10, 
    },
    headerText: {
        color: 'white',
        fontSize: 30,
        fontWeight: 'bold',
        textAlign: 'center',
        flex: 1, 
        marginRight: 60, 
    },
});