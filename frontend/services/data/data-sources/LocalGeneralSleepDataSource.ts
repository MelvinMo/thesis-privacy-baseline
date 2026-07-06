import { GeneralSleepData } from "@/constants/types/GeneralSleepData";
import { GeneralSleepDataSource } from "./GeneralSleepDataSource";
import * as SecureStore from 'expo-secure-store';

/**
 * Since there is only small amounts of general sleep data for each user, we can use 
 * expo secure store to store this data locally instead of a sqlite database.
 */
export class LocalGeneralSleepDataSource implements GeneralSleepDataSource{
    async getSleepDataByUserId(userId: string): Promise<GeneralSleepData | null> {
        const sleepData = await SecureStore.getItemAsync(`sleepData_${userId}`);
        if (sleepData) {
            return JSON.parse(sleepData) as GeneralSleepData;
        } else {
            return null;
        }
    }
    async createSleepData(sleepData: GeneralSleepData): Promise<GeneralSleepData> {
        const userId = sleepData.userId;
        if (!userId) {
            throw new Error("User ID is required to create sleep data.");
        }

        // get existing sleep data if it exists
        const existingSleepData = await this.getSleepDataByUserId(userId);
        if (existingSleepData) {
            // use the userId from the existing data
            const updatedSleepData: GeneralSleepData = {
                userId: existingSleepData.userId,
                currentSleepDuration: sleepData.currentSleepDuration === '' ? existingSleepData.currentSleepDuration : sleepData.currentSleepDuration,
                snoring: sleepData.snoring === '' ? existingSleepData.snoring : sleepData.snoring,
                tirednessFrequency: sleepData.tirednessFrequency === '' ? existingSleepData.tirednessFrequency : sleepData.tirednessFrequency,
                daytimeSleepiness: sleepData.daytimeSleepiness === '' ? existingSleepData.daytimeSleepiness : sleepData.daytimeSleepiness,
            }

            await SecureStore.setItemAsync(`sleepData_${userId}`, JSON.stringify(updatedSleepData));
            return updatedSleepData;
        } else {
            // create new sleep data
            await SecureStore.setItemAsync(`sleepData_${userId}`, JSON.stringify(sleepData));
            return sleepData;
        }
    }
    async deleteSleepData(userId: string): Promise<void> {
        await SecureStore.deleteItemAsync(`sleepData_${userId}`);
    }
}