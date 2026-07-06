import { GeneralSleepData } from '../constants/types/GeneralSleepData';

/**
 * This interface is for general sleep data repository operations. 
 * General sleep data includes information like current sleep duration, snoring, tiredness frequency, and daytime sleepiness.
 */
export interface SleepDataRepository {
    createSleepData: (sleepData : GeneralSleepData) => Promise<GeneralSleepData>;
    getSleepDataById: (userId: string) => Promise<GeneralSleepData | null>;
    updateSleepData: (userId: string, sleepData : Omit<GeneralSleepData, 'userId'>) => Promise<GeneralSleepData | null>;
    deleteSleepData: (userId: string) => Promise<boolean>;
}