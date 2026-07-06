import { TouchableOpacity, View, Text, StyleSheet } from "react-native";

interface CalendarProps {
    selectedDate: Date;
    setSelectedDate: (date: Date) => void;
}

export const Calendar = ( {selectedDate, setSelectedDate} : CalendarProps) => {
        const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

        const getDaysInCurrentWeek = () => {
            const startOfWeek = new Date(selectedDate);
            startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay()); // Go to the Sunday of the current week

            const days = [];
            for (let i = 0; i < 7; i++) {
                const day = new Date(startOfWeek);
                day.setDate(startOfWeek.getDate() + i);
                days.push(day);
            }
            return days;
        };

        const daysInWeek = getDaysInCurrentWeek();

        return (
            <View style={styles.calendarContainer}>
                <View style={styles.weekDaysRow}>
                    {weekDays.map((day, index) => (
                        <Text key={index} style={styles.weekDayText}>{day}</Text>
                    ))}
                </View>
                <View style={styles.daysGrid}>
                    {daysInWeek.map((day, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.dayCell,
                                day.toDateString() === selectedDate.toDateString() && styles.selectedDay
                            ]}
                            onPress={() => setSelectedDate(day)}
                        >
                            <Text style={[
                                styles.dayText,
                                day.toDateString() === selectedDate.toDateString() && styles.selectedDayText
                            ]}>
                                {day.getDate()}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        );
    };

const styles = StyleSheet.create({
    calendarContainer: {
        padding: 16,
        backdropFilter: 'blur(10px)',
    },
    weekDaysRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 15,
    },
    weekDayText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '500',
        opacity: 0.7,
    },
    daysGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
    },
    dayCell: {
        width: 35,
        height: 35,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 2,
        borderRadius: 18,
    },
    selectedDay: {
        backgroundColor: 'white',
    },
    dayText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    },
    selectedDayText: {
        color: '#001122',
        fontWeight: '600',
    },
})