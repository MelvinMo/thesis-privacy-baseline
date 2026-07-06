import { GeneralSleepData } from "@/constants/types/GeneralSleepData";

/**
 * Provides an interface to interact with general sleep data 
 * General sleep data includes sleep, snoring, tiredness, and daytime sleepiness.
 * 
 * Note that while many of these functions take userId as an argument, this is only for local storage.
 * In cloud storage, the userId is not needed as the backend will get it from the JWT token.
 */
export interface GeneralSleepDataSource {
    getSleepDataByUserId(userId: string): Promise<GeneralSleepData | null>;
    createSleepData(sleepData: GeneralSleepData): Promise<GeneralSleepData>;
    deleteSleepData(userId: string): Promise<void>;
}