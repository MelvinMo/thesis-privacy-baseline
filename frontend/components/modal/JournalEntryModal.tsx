import { Colors } from "@/constants/Colors";
import { KeyboardAvoidingView, Modal, TextInput, View, Text, TouchableOpacity, Platform, StyleSheet } from "react-native";

interface JournalEntryModalProps {
    isJournalModalVisible: boolean;
    setIsJournalModalVisible: (visible: boolean) => void;
    tempDiaryEntry: string;
    setTempDiaryEntry: (entry: string) => void;
    handleCancelModalEdit: () => void;
    handleSaveModalEdit: () => void;
}

export const JournalEntryModal = ({
    isJournalModalVisible,
    setIsJournalModalVisible,
    tempDiaryEntry,
    setTempDiaryEntry,
    handleCancelModalEdit,
    handleSaveModalEdit,
} : JournalEntryModalProps ) => {
  return (
    <Modal
        animationType="slide"
        transparent={true}
        visible={isJournalModalVisible}
        onRequestClose={() => {
            setIsJournalModalVisible(!isJournalModalVisible);
        }}
    >
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalBackground}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -50}
        >
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Diary</Text>
                <TextInput
                    style={styles.modalTextInput}
                    value={tempDiaryEntry}
                    onChangeText={setTempDiaryEntry}
                    placeholder="Write something to record this special day..."
                    placeholderTextColor="#8E8E93"
                    multiline
                />
                <View style={styles.modalButtonsContainer}>
                    <TouchableOpacity
                        style={[styles.modalButton, styles.modalCancelButton]}
                        onPress={handleCancelModalEdit}
                    >
                        <Text style={styles.modalButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.modalButton, styles.modalSaveButton]}
                        onPress={handleSaveModalEdit}
                    >
                        <Text style={styles.modalButtonText}>Save</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    </Modal>
  );
}

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

    // ===== Journal Entry Modal Specific Styles =====
    modalTextInput: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        padding: 15,
        color: 'white',
        fontSize: 16,
        minHeight: 150,
        textAlignVertical: 'top',
        marginBottom: 20,
    },
})