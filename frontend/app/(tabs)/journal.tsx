import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Alert,
    ScrollView,
    StyleSheet,
    ImageBackground,
    StatusBar,
} from "react-native";
import { journalDataRepository } from "@/services";
import { JournalData, SleepNote } from "@/constants/types/JournalData";
import Loader from "@/components/Loader";
import Ionicons from '@expo/vector-icons/Ionicons';
import { Calendar } from "@/components/Calendar";
import { useTransparencyStore } from "@/store/transparencyStore";
import { DEFAULT_JOURNAL_TRANSPARENCY_EVENT, PrivacyRisk, TransparencyEvent } from "@/constants/types/Transparency";
import { transparencyService } from "@/services";
import { JournalEntryModal } from "@/components/modal/JournalEntryModal";
import { SleepNotesModal } from "@/components/modal/SleepNotesModal";
import { PrivacyIcon } from "@/components/transparency/PrivacyIcon";
import { getPrivacyRiskIconForPage } from "@/utils/transparency";
import { NormalJournalPage } from "@/components/NormalJournalPage";
import { PrivacyJournalPage } from "@/components/transparency/PrivacyJournalPage";
import { TRANSPARENCY_UI_CONFIG } from "@/constants/config/transparencyConfig";

export default function Journal() {
    const [diaryEntry, setDiaryEntry] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [journalExists, setJournalExists] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [alarm, setAlarm] = useState("");
    const [bedtime, setBedtime] = useState("");
    const [sleepGoal, setSleepGoal] = useState("");

    // State for the journal entry modal
    const [isJournalModalVisible, setIsJournalModalVisible] = useState(false);
    const [tempDiaryEntry, setTempDiaryEntry] = useState(""); // Temporary state for modal's TextInput

    const [sleepNotes, setSleepNotes] = useState<SleepNote[]>([]);

    // State for Sleep Notes Modal
    const [isSleepNotesModalVisible, setIsSleepNotesModalVisible] = useState(false);
    const [tempSleepNotes, setTempSleepNotes] = useState<SleepNote[]>([]); // Temporary state for modal's sleep notes

    // Transparency State
    const { journalTransparency, setJournalTransparency, accelerometerTransparency } = useTransparencyStore();
    // this is only needed when rendering the privacy page UI, not for the tooltip UI
    const [ displayNormalUI, setDisplayNormalUI ] = useState(true);

    useEffect(() => {
        loadJournalData();
    }, [selectedDate]);

    const loadJournalData = async () => {
        try {
            setIsLoading(true);
            const dateToLoad = selectedDate.toISOString().split('T')[0];
            const existingJournal = await journalDataRepository.getJournalByDate(dateToLoad);
            
            if (existingJournal) {
                setJournalExists(true);
                setDiaryEntry(existingJournal.diaryEntry || "");
                setSleepNotes(existingJournal.sleepNotes || []);
                setAlarm(existingJournal.alarmTime);
                setBedtime(existingJournal.bedtime);
                setSleepGoal(existingJournal.sleepDuration);
            } else {
                setJournalExists(false);
                setDiaryEntry("");
                setSleepNotes([]);
                setAlarm("");
                setBedtime("");
                setSleepGoal("");
            }
        } catch (error) {
            console.error("Error loading journal data:", error);
            Alert.alert("Error", `Failed to load journal data: ${error}`);
        } finally {
            setIsLoading(false);
        }
    };

    const saveJournal = async (updatedDiaryEntry: string, updatedSleepNotes: SleepNote[]) => {
        try {
            setIsSaving(true);
            const journalData: Partial<JournalData> = {
                date: selectedDate.toISOString().split('T')[0],
                diaryEntry: updatedDiaryEntry,
                sleepNotes: updatedSleepNotes
            };
            
            // set up a new transparency event
            const transparencyEvent : TransparencyEvent = DEFAULT_JOURNAL_TRANSPARENCY_EVENT;
            setJournalTransparency(transparencyEvent);

            const result = await journalDataRepository.editJournal(journalData, selectedDate.toISOString().split('T')[0]);

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
                setJournalExists(true);
                setDiaryEntry(result.diaryEntry || "");
                setSleepNotes(result.sleepNotes || []);
                setAlarm(result.alarmTime);
                setBedtime(result.bedtime);
                setSleepGoal(result.sleepDuration);
            } else {
                Alert.alert("Error", "Failed to save journal");
            }
        } catch (error) {
            console.error("Error saving journal:", error);
            Alert.alert("Error", `Failed to save journal: ${error}`);
        } finally {
            setIsSaving(false);
        }
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: '2-digit'
        });
    };

    const handleAddSleepNote = () => {
        setTempSleepNotes([...sleepNotes]);
        setIsSleepNotesModalVisible(true);
    };

    const handleEditJournalEntry = () => {
        setTempDiaryEntry(diaryEntry); // Set the temporary state to current diary entry
        setIsJournalModalVisible(true);
    };

    const handleSaveModalEdit = async () => {
        setDiaryEntry(tempDiaryEntry);
        await saveJournal(tempDiaryEntry, sleepNotes);
        setIsJournalModalVisible(false); // Close the modal
    };

    const handleCancelModalEdit = () => {
        setIsJournalModalVisible(false); // Just close the modal, changes in tempDiaryEntry are discarded
    };

    // Save and Cancel functions for Sleep Notes Modal
    const handleSaveSleepNotes = async () => {
        setSleepNotes(tempSleepNotes); // Update the main sleep notes state
        await saveJournal(diaryEntry, tempSleepNotes);
        setIsSleepNotesModalVisible(false);
    };

    const handleCancelSleepNotes = () => {
        setIsSleepNotesModalVisible(false); // Discard changes by closing
    };

    if (isLoading || isSaving) {
        return (
            <Loader/>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <ImageBackground
                source={{ uri: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80' }}
                style={styles.calendarBackgroundImage}
                imageStyle={styles.calendarBackgroundImageStyle}
            >
                <View style={styles.calendarOverlay} />
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.dateHeader}
                        onPress={() => setShowCalendar(!showCalendar)}
                    >
                        <Text style={styles.todayText}>Today</Text>
                        <Text style={styles.dateText}>
                            {formatDate(selectedDate)} <Ionicons name={showCalendar ? "chevron-up" : "chevron-down"} size={18} color="white" />
                        </Text>
                    </TouchableOpacity>
                </View>
                {showCalendar && <Calendar selectedDate={selectedDate} setSelectedDate={setSelectedDate} />}
                {!TRANSPARENCY_UI_CONFIG.journalTooltipEnabled && 
                    <View style={{ position: 'absolute', top: 50, right: 30 }}>
                        <PrivacyIcon handleIconPress={() => setDisplayNormalUI(!displayNormalUI)}
                            isOpen={!displayNormalUI}
                            iconName={getPrivacyRiskIconForPage([journalTransparency.privacyRisk || PrivacyRisk.LOW, accelerometerTransparency.privacyRisk || PrivacyRisk.LOW])}
                            iconSize={50}
                        />
                    </View>
                }
            </ImageBackground>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {displayNormalUI && <NormalJournalPage
                    showToolTipUI={TRANSPARENCY_UI_CONFIG.journalTooltipEnabled}
                    bedtime={bedtime}
                    alarm={alarm}
                    sleepGoal={sleepGoal}
                    diaryEntry={diaryEntry}
                    sleepNotes={sleepNotes}
                    handleEditJournalEntry={handleEditJournalEntry}
                    handleAddSleepNote={handleAddSleepNote}
                />}
                {!displayNormalUI && <PrivacyJournalPage/>}
            </ScrollView>

            {/* Journal Entry Modal */}
            <JournalEntryModal 
                isJournalModalVisible={isJournalModalVisible} 
                setIsJournalModalVisible={setIsJournalModalVisible} 
                tempDiaryEntry={tempDiaryEntry}
                setTempDiaryEntry={setTempDiaryEntry}
                handleCancelModalEdit={handleCancelModalEdit}
                handleSaveModalEdit={handleSaveModalEdit}
            />

            {/* Sleep Notes Modal */}
            <SleepNotesModal 
                isSleepNotesModalVisible={isSleepNotesModalVisible}
                setIsSleepNotesModalVisible={setIsSleepNotesModalVisible}
                tempSleepNotes={tempSleepNotes}
                handleCancelSleepNotes={handleCancelSleepNotes}
                handleSaveSleepNotes={handleSaveSleepNotes}
                setTempSleepNotes={setTempSleepNotes}
            />
        </View>
    );
}

// ===================================================================
// Styles
// ===================================================================

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 20,
    },
    header: {
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 30,
    },
    dateHeader: {
        alignItems: 'flex-start',
    },
    todayText: {
        color: 'white',
        fontSize: 32,
        fontWeight: '600',
        marginBottom: 5,
    },
    dateText: {
        color: 'white',
        fontSize: 18,
        opacity: 0.8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    calendarBackgroundImage: {
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 20,
    },
    calendarBackgroundImageStyle: {
        opacity: 0.6,
    },
    calendarOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 20, 40, 0.8)',
        borderRadius: 16,
    },
});