import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons"
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native"

export interface NormalSleepPageProps {
    handleEditBedtime: () => void;
    bedtime: string;
    handleEditAlarm: () => void;
    alarm: string;
    handleStartSleepSession: () => void;
}

export const NormalSleepPage = ({
    handleEditBedtime,
    bedtime,
    handleEditAlarm,
    alarm,
    handleStartSleepSession
} : NormalSleepPageProps ) => {
    return (
        <>
            {/* Sleep Tracker Visual */}
            <View style={styles.sleepTrackerContainer}>
                <Image
                    source={require('@/assets/images/sleep-duration-wheel.png')}
                    style={styles.sleepDurationImage}
                />
            </View>

            {/* Bedtime Section */}
            <View style={styles.inputCard}>
                <Text style={styles.inputLabel}>Bedtime</Text>
                <Text style={styles.inputValue}>{bedtime}</Text>
                <TouchableOpacity onPress={handleEditBedtime}>
                    <Ionicons name="pencil-outline" size={20} color={'white'} />
                </TouchableOpacity>
            </View>

            {/* Alarm Section */}
            <View style={styles.inputCard}>
                <Text style={styles.inputLabel}>Alarm</Text>
                <Text style={styles.inputValue}>{alarm}</Text>
                <TouchableOpacity onPress={handleEditAlarm}>
                    <Ionicons name="pencil-outline" size={20} color={'white'} />
                </TouchableOpacity>
            </View>

            {/* Sleep Now Button */}
            <TouchableOpacity
                style={styles.sleepNowButton}
                onPress={handleStartSleepSession}
            >
                <Text style={styles.sleepNowButtonText}>SLEEP NOW</Text>
            </TouchableOpacity>
        </>
    )
};

// =============================================================
// Styles
// =============================================================

const styles = StyleSheet.create({
    sleepTrackerContainer: {
        width: '100%',
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
    },
    sleepDurationImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain', 
        borderRadius: 100,
    },
    inputCard: {
        backgroundColor: Colors.lightBlack,
        borderRadius: 12,
        paddingVertical: 15,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 15,
    },
    inputLabel: {
        color: 'white',
        fontSize: 18,
        fontWeight: '500',
        flex: 1,
    },
    inputValue: {
        color: 'white',
        fontSize: 18,
        opacity: 0.8,
        marginRight: 10,
    },
    sleepNowButton: {
        backgroundColor: Colors.generalBlue,
        borderRadius: 12,
        paddingVertical: 18,
        width: '100%',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 30,
        shadowColor: Colors.generalBlue,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 10,
    },
    sleepNowButtonText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
})