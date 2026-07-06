import { GeneralSleepDataSource } from './data-sources/GeneralSleepDataSource';
import { GeneralSleepData } from '../../constants/types/GeneralSleepData';
import { useAuthStore } from '../../store/authStore';
import { useProfileStore } from '../../store/userProfileStore';
import { EncryptionService } from '../EncryptionService';

/**
 * Repository for managing general sleep data.
 * This is what the main app uses to interact with sleep data.
 * It abstracts the data source layer and provides a unified interface.
 * It uses the active data source based on user consent preferences.
 * 
 * It does not handle the case where user preference changes and data needs to be migrated.
 */
export class GeneralSleepDataRepository {
    private cloudDataSource: GeneralSleepDataSource;
    private localDataSource: GeneralSleepDataSource;

    private encryptionService: EncryptionService;

    constructor(cloudDataSource: GeneralSleepDataSource, localDataSource: GeneralSleepDataSource, encryptionService: EncryptionService) {
        this.cloudDataSource = cloudDataSource;
        this.localDataSource = localDataSource;
        this.encryptionService = encryptionService;
    }

    private getAuthenticatedUserData() {
        const user = useAuthStore.getState().user;
        if (!user) {
            throw new Error('User is not authenticated. Please log in first.');
        }
        return user;
    }

    private getActiveDataSource(): GeneralSleepDataSource {
        const userConsentPreferences = useProfileStore.getState().userConsentPreferences;
        if (userConsentPreferences?.cloudStorageEnabled) {
            return this.cloudDataSource;
        } else {
            return this.localDataSource;
        }
    }

    async getSleepData(): Promise<GeneralSleepData | null> {
        const { userId } = this.getAuthenticatedUserData();
        const activeDataSource = this.getActiveDataSource();
        try {
            const response = await activeDataSource.getSleepDataByUserId(userId);
            if (!response) {
                return null; // No sleep data found
            }
            return await this.encryptionService.decryptGeneralSleepData(response);
        } catch (error: any) {
            console.error(`Error fetching sleep data from ${useProfileStore.getState().userConsentPreferences.cloudStorageEnabled ? 'cloud' : 'local'} storage:`, error);
            throw new Error(`Failed to retrieve sleep data: ${error.message}`);
        }
    }

    async createSleepData(sleepData: GeneralSleepData): Promise<GeneralSleepData> {
        const { userId } = this.getAuthenticatedUserData();
        const activeDataSource = this.getActiveDataSource();
        try {
            // Append userId to the data payload as backend expects it in body
            const dataToCreate: GeneralSleepData = {
                ...sleepData,
                userId: userId,
            };
            const encryptedData = await this.encryptionService.encryptGeneralSleepData(dataToCreate);
            const response = await activeDataSource.createSleepData(encryptedData);
            return await this.encryptionService.decryptGeneralSleepData(response);
        } catch (error: any) {
            console.error(`Error creating sleep data in ${useProfileStore.getState().userConsentPreferences.cloudStorageEnabled ? 'cloud' : 'local'} storage:`, error);
            throw new Error(`Failed to create sleep data: ${error.message}`);
        }
    }

    async deleteSleepData(): Promise<void> {
        const { userId } = this.getAuthenticatedUserData();
        const activeDataSource = this.getActiveDataSource();
        try {
            await activeDataSource.deleteSleepData(userId);
        } catch (error: any) {
            console.error(`Error deleting sleep data from ${useProfileStore.getState().userConsentPreferences.cloudStorageEnabled ? 'cloud' : 'local'} storage:`, error);
            throw new Error(`Failed to delete sleep data: ${error.message}`);
        }
    }
}