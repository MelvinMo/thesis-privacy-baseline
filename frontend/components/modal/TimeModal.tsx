import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Modal,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { Colors } from '@/constants/Colors'; 

interface TimeModalProps {
    isVisible: boolean;
    label: string;
    defaultTime: string; // Expected format: "HH:MM AM/PM" or "HH:MM" (24-hour)
    onSave: (time: string) => void;
    onCancel: () => void;
}

export const TimeModal = ({
    isVisible,
    label,
    defaultTime,
    onSave,
    onCancel,
} : TimeModalProps) => {
    const [hours, setHours] = useState<string>('');
    const [minutes, setMinutes] = useState<string>('');
    const [ampm, setAmpm] = useState<string>('AM'); // Default to AM

    useEffect(() => {
        if (isVisible && defaultTime) {
            // Parse defaultTime (e.g., "10:00 PM" or "07:00 AM")
            const parts = defaultTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
            if (parts) {
                let h = parseInt(parts[1], 10);
                const m = parseInt(parts[2], 10);
                const period = parts[3] ? parts[3].toUpperCase() : '';

                if (period === 'PM' && h < 12) {
                    h += 12;
                } else if (period === 'AM' && h === 12) {
                    h = 0; // Midnight
                }

                setHours(String(h).padStart(2, '0'));
                setMinutes(String(m).padStart(2, '0'));
                setAmpm(period || (h >= 12 ? 'PM' : 'AM')); // Default AM/PM if not in defaultTime
            } else {
                // If defaultTime is not in expected format, try 24-hour format
                const twentyFourHourParts = defaultTime.match(/(\d{1,2}):(\d{2})/);
                if (twentyFourHourParts) {
                    let h = parseInt(twentyFourHourParts[1], 10);
                    const m = parseInt(twentyFourHourParts[2], 10);

                    setHours(String(h).padStart(2, '0'));
                    setMinutes(String(m).padStart(2, '0'));
                    setAmpm(h >= 12 ? 'PM' : 'AM');
                } else {
                    // Fallback to empty if parsing fails
                    setHours('');
                    setMinutes('');
                    setAmpm('AM');
                }
            }
        } else if (!isVisible) {
            // Reset state when modal closes
            setHours('');
            setMinutes('');
            setAmpm('AM');
        }
    }, [isVisible, defaultTime]);

    const handleSave = () => {
        let h = parseInt(hours, 10);
        const m = parseInt(minutes, 10);

        if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) {
            Alert.alert('Invalid Time', 'Please enter valid hours (0-23) and minutes (0-59).');
            return;
        }

        // Convert to 12-hour format for display
        let displayHours = h;

        if (ampm === 'PM' && h < 12) {
            displayHours = h; // Already 12-23 for PM
        } else if (ampm === 'AM' && h === 12) {
            displayHours = 0; // Midnight
        } else if (ampm === 'PM' && h === 0) {
            displayHours = 12; // 12 AM (midnight)
        } else if (ampm === 'AM' && h > 12) {
            displayHours = h - 12;
        } else if (ampm === 'PM' && h > 12) {
            displayHours = h - 12;
        } else if (ampm === 'AM' && h === 0) {
            displayHours = 12; // 12 AM (midnight)
        }


        const formattedTime = `${String(displayHours === 0 ? 12 : displayHours).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
        onSave(formattedTime);
    };

    const handleHoursChange = (text: string) => {
        const numericValue = text.replace(/[^0-9]/g, ''); // Only allow numbers
        if (numericValue.length <= 2) {
            const num = parseInt(numericValue, 10);
            if (!isNaN(num) && num >= 0 && num <= 12) { // Restrict to 1-12 for 12-hour format
                setHours(numericValue);
            } else if (numericValue === '') {
                setHours('');
            }
        }
    };

    const handleMinutesChange = (text: string) => {
        const numericValue = text.replace(/[^0-9]/g, ''); // Only allow numbers
        if (numericValue.length <= 2) {
            const num = parseInt(numericValue, 10);
            if (!isNaN(num) && num >= 0 && num <= 59) {
                setMinutes(numericValue);
            } else if (numericValue === '') {
                setMinutes('');
            }
        }
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            onRequestClose={onCancel}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalBackground}
            >
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>{label}</Text>
                    <View style={styles.timeInputContainer}>
                        <TextInput
                            style={styles.timeInput}
                            value={hours}
                            onChangeText={handleHoursChange}
                            keyboardType="numeric"
                            maxLength={2}
                            placeholder="HH"
                            placeholderTextColor="#8E8E93"
                        />
                        <Text style={styles.separator}>:</Text>
                        <TextInput
                            style={styles.timeInput}
                            value={minutes}
                            onChangeText={handleMinutesChange}
                            keyboardType="numeric"
                            maxLength={2}
                            placeholder="MM"
                            placeholderTextColor="#8E8E93"
                        />
                        <View style={styles.ampmContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.ampmButton,
                                    ampm === 'AM' && styles.ampmButtonSelected,
                                ]}
                                onPress={() => setAmpm('AM')}
                            >
                                <Text style={styles.ampmButtonText}>AM</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.ampmButton,
                                    ampm === 'PM' && styles.ampmButtonSelected,
                                ]}
                                onPress={() => setAmpm('PM')}
                            >
                                <Text style={styles.ampmButtonText}>PM</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.modalButtonsContainer}>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.modalCancelButton]}
                            onPress={onCancel}
                        >
                            <Text style={styles.modalButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.modalSaveButton]}
                            onPress={handleSave}
                        >
                            <Text style={styles.modalButtonText}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
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
    timeInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
    },
    timeInput: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 15,
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
        width: 70, // Fixed width for hours/minutes
        textAlign: 'center',
    },
    separator: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
        marginHorizontal: 5,
    },
    ampmContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        marginLeft: 10,
        overflow: 'hidden', 
    },
    ampmButton: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 50,
    },
    ampmButtonSelected: {
        backgroundColor: Colors.generalBlue, 
    },
    ampmButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
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
});