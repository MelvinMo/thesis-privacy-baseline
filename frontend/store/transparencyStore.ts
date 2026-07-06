import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
    DEFAULT_ACCELEROMETER_TRANSPARENCY_EVENT, 
    DEFAULT_GENERAL_SLEEP_TRANSPARENCY_EVENT, 
    DEFAULT_JOURNAL_TRANSPARENCY_EVENT, 
    DEFAULT_LIGHT_SENSOR_TRANSPARENCY_EVENT, 
    DEFAULT_STATISTICS_TRANSPARENCY_EVENT, 
    TransparencyEvent } from '@/constants/types/Transparency';

interface TransparencyState {
    lightSensorTransparency: TransparencyEvent;
    microphoneTransparency: TransparencyEvent;
    accelerometerTransparency: TransparencyEvent;
    setLightSensorTransparency: (event: TransparencyEvent) => Promise<void>;
    setMicrophoneTransparency: (event: TransparencyEvent) => Promise<void>;
    setAccelerometerTransparency: (event: TransparencyEvent) => Promise<void>;
    journalTransparency: TransparencyEvent;
    setJournalTransparency: (event: TransparencyEvent) => Promise<void>;

    generalSleepTransparency: TransparencyEvent;
    setGeneralSleepTransparency: (event: TransparencyEvent) => Promise<void>;
    statisticsTransparency: TransparencyEvent;
    setStatisticsTransparency: (event: TransparencyEvent) => Promise<void>;
    loadTransparencyStatus: () => Promise<void>;
}

/**
 * This store is used to maintain transparency events for each data collection type. 
 * This allows the global UI to respond dynamically to changes in privacy violations in real time. 
 */
export const useTransparencyStore = create<TransparencyState>((set, get) => ({
    lightSensorTransparency: DEFAULT_LIGHT_SENSOR_TRANSPARENCY_EVENT,
    microphoneTransparency: DEFAULT_ACCELEROMETER_TRANSPARENCY_EVENT,
    accelerometerTransparency: DEFAULT_ACCELEROMETER_TRANSPARENCY_EVENT,
    journalTransparency: DEFAULT_JOURNAL_TRANSPARENCY_EVENT,
    statisticsTransparency: DEFAULT_STATISTICS_TRANSPARENCY_EVENT,
    generalSleepTransparency: DEFAULT_GENERAL_SLEEP_TRANSPARENCY_EVENT,

    loadTransparencyStatus: async () => {
        try {
            const lightSensorTransparency = await AsyncStorage.getItem('lightSensorTransparency');
            const microphoneTransparency = await AsyncStorage.getItem('microphoneTransparency');
            const accelerometerTransparency = await AsyncStorage.getItem('accelerometerTransparency');
            const journalTransparency = await AsyncStorage.getItem('journalTransparency');
            const statisticsTransparency = await AsyncStorage.getItem('statisticsTransparency');
            const generalSleepTransparency = await AsyncStorage.getItem('generalSleepTransparency');

            if (lightSensorTransparency){
                set({ lightSensorTransparency: JSON.parse(lightSensorTransparency) });
            }
            if (microphoneTransparency) {
                set({ microphoneTransparency: JSON.parse(microphoneTransparency) });
            }
            if (accelerometerTransparency) {
                set({ accelerometerTransparency: JSON.parse(accelerometerTransparency) });
            }
            if (journalTransparency) {
                set({ journalTransparency: JSON.parse(journalTransparency) });
            }
            if (statisticsTransparency) {
                set({ statisticsTransparency: JSON.parse(statisticsTransparency) });
            }
            if (generalSleepTransparency) {
                set({ generalSleepTransparency: JSON.parse(generalSleepTransparency) });
            }
        } catch (error) {
            console.error('Failed to load transparency status', error);
        }
    },

    setLightSensorTransparency: async (event: TransparencyEvent) => {
        set({ lightSensorTransparency: event });
        await AsyncStorage.setItem('lightSensorTransparency', JSON.stringify(event));
    },

    setMicrophoneTransparency: async (event: TransparencyEvent) => {
        set({ microphoneTransparency: event });
        await AsyncStorage.setItem('microphoneTransparency', JSON.stringify(event));
    },

    setAccelerometerTransparency: async (event: TransparencyEvent) => {
        set({ accelerometerTransparency: event });
        await AsyncStorage.setItem('accelerometerTransparency', JSON.stringify(event));
    },

    setJournalTransparency: async (event: TransparencyEvent) => {
        set({ journalTransparency: event });
        await AsyncStorage.setItem('journalTransparency', JSON.stringify(event));
    },

    setStatisticsTransparency: async (event: TransparencyEvent) => {
        set({ statisticsTransparency: event });
        await AsyncStorage.setItem('statisticsTransparency', JSON.stringify(event));
    },

    setGeneralSleepTransparency: async (event: TransparencyEvent) => {
        set({ generalSleepTransparency: event });
        await AsyncStorage.setItem('generalSleepTransparency', JSON.stringify(event));
    }
}));
