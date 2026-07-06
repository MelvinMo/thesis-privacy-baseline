import { GeneralSleepDataSource } from './GeneralSleepDataSource';
import { GeneralSleepData } from '@/constants/types/GeneralSleepData'; 
import { HttpClient } from '@/services/HttpClient'; 

/**
 * This is the cloud implementation of the GeneralSleepDataSource
 */
export class CloudGeneralSleepDataSource implements GeneralSleepDataSource {
    private httpClient: HttpClient;
    private getTokenFn: () => string | null; // Function to get the token, injected

    constructor(httpClient: HttpClient, getTokenFn: () => string | null) {
        this.httpClient = httpClient;
        this.getTokenFn = getTokenFn;
    }

    private getAuthToken(): string {
        const token = this.getTokenFn();
        if (!token) {
            throw new Error('Authentication token missing for cloud operation.');
        }
        return token;
    }

    async getSleepDataByUserId(userId: string): Promise<GeneralSleepData | null> {
        const token = this.getAuthToken();
        try {
            const response = await this.httpClient.get<{ sleepData: GeneralSleepData }>('/phi/generalSleep/', token);
            return response.sleepData;
        } catch (error: any) {
            if (error.message.includes('404') || error.message.toLowerCase().includes('not found')) {
                return null;
            }
            console.error(`Error fetching sleepData from cloud for user ${userId}:`, error);
            throw error;
        }
    }

    async createSleepData(sleepData: GeneralSleepData): Promise<GeneralSleepData> {
        const token = this.getAuthToken();
        try {
            // Backend's POST /phi/generalSleep expects the full object in the body
            const response = await this.httpClient.post<{ sleepData: GeneralSleepData }>('/phi/generalSleep/', sleepData, token);
            return response.sleepData;
        } catch (error: any) {
            console.error("Error creating sleepData in cloud:", error);
            // Re-throw the error so the calling repository can handle it (e.g., show user message)
            throw new Error(`Failed to create sleepData in cloud: ${error.message}`);
        }
    }

    async deleteSleepData(userId: string): Promise<void> {
        const token = this.getAuthToken();
        try {
            await this.httpClient.delete<{}>(`/phi/generalSleep/`, token);
        } catch (error: any) {
            console.error("Error deleting sleepData from cloud:", error);
            throw new Error(`Failed to delete sleepData from cloud: ${error.message}`);
        }
    }
}