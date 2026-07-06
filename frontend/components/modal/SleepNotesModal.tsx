import { Colors } from "@/constants/Colors";
import { SleepNote } from "@/constants/types/JournalData";
import { Ionicons } from "@expo/vector-icons";
import { Modal, TouchableOpacity, View, Text, StyleSheet } from "react-native";

interface SleepNotesModalProps {
    isSleepNotesModalVisible: boolean;
    setIsSleepNotesModalVisible: (visible: boolean) => void;
    tempSleepNotes: SleepNote[];
    handleCancelSleepNotes: () => void;
    handleSaveSleepNotes: () => void;
    setTempSleepNotes: React.Dispatch<React.SetStateAction<SleepNote[]>>; // this is the React type for setters
}

// Data for sleep notes options
const sleepNoteOptions: SleepNote[] = [
    "Pain", "Stress", "Anxiety", "Medication", "Caffeine", "Alcohol", "Warm Bath", "Heavy Meal"
];

export const SleepNotesModal = ({
    isSleepNotesModalVisible,
    setIsSleepNotesModalVisible,
    tempSleepNotes,
    handleCancelSleepNotes,
    handleSaveSleepNotes,
    setTempSleepNotes,
} : SleepNotesModalProps ) => {

    // Function to toggle a sleep note selection in the modal
    const toggleSleepNote = (note: SleepNote) => {
        setTempSleepNotes((prevNotes : SleepNote[]) => {
            if (prevNotes.includes(note)) {
                return prevNotes.filter((n : SleepNote) => n !== note); // Remove note if already selected
            } else {
                return [...prevNotes, note]; // Add note if not selected
            }
        });
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isSleepNotesModalVisible}
            onRequestClose={() => {
                setIsSleepNotesModalVisible(!isSleepNotesModalVisible);
            }}
        >
            <View style={styles.modalBackground}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Sleep notes</Text>
                        <TouchableOpacity onPress={handleCancelSleepNotes}>
                            <Ionicons name="close-circle-outline" size={28} color="white" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.sleepNotesOptionsContainer}>
                        {sleepNoteOptions.map((note, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.sleepNoteOption,
                                    tempSleepNotes.includes(note) && styles.sleepNoteOptionSelected
                                ]}
                                onPress={() => toggleSleepNote(note)}
                            >
                                <Text style={styles.sleepNoteOptionText}>{note}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View style={styles.modalButtonsContainer}>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.modalSaveButton]}
                            onPress={handleSaveSleepNotes}
                        >
                            <Text style={styles.modalButtonText}>Save</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.modalCancelButton]}
                            onPress={handleCancelSleepNotes}
                        >
                            <Text style={styles.modalButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    )
};

const styles = StyleSheet.create({
    // ===== General Modal Styles (Reused) =====
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    modalContent: {
        backgroundColor: Colors.lightBlack,
        borderRadius: 16,
        padding: 20,
        width: '90%',
        maxHeight: '70%',
    },
    modalTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 20,
        textAlign: 'center',
    },
    modalButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    modalCancelButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    modalSaveButton: {
        backgroundColor: Colors.generalBlue,
    },
    modalButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    // ===== Sleep Notes Modal Specific Styles =====
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    sleepNotesOptionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center', 
        marginBottom: 20,
        gap: 10,
    },
    sleepNoteOption: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)', 
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    sleepNoteOptionSelected: {
        backgroundColor: Colors.generalBlue, 
        borderColor: Colors.generalBlue, 
    },
    sleepNoteOptionText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    },
})