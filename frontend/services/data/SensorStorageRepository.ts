import { SensorData } from '@/constants/types/SensorData';
import { useAuthStore } from '../../store/authStore';
import { useProfileStore } from '../../store/userProfileStore';
import { CloudSensorDataSource } from './data-sources/CloudSensorDataSource';
import { LocalSensorDataSource } from './data-sources/LocalSensorDataSource';
import { SensorDataSource } from './data-sources/SensorDataSource';
import { EncryptionService } from '../EncryptionService';
import { useTransparencyStore } from '@/store/transparencyStore';
import { DataDestination } from '@/constants/types/Transparency';

/**
 * Repository for managing sensor data
    * This is what the main app uses to interact with sensor data. 
    * Again, all types of sensor data is part of one interface for simplicity. This may need to be changed in the future. 
 * It abstracts the data source layer and provides a unified interface.
 * It uses the active data source based on user consent preferences.
 * 
 * It does not handle the case where user preference changes and data needs to be migrated.
 */
export class SensorStorageRepository {
    private cloudDataSource: CloudSensorDataSource;
    private localDataSource: LocalSensorDataSource;
    private encryptionService: EncryptionService;

    constructor(cloudDataSource: CloudSensorDataSource, localDataSource: LocalSensorDataSource, encryptionService: EncryptionService) {
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

    private getActiveDataSource(): SensorDataSource {
        const userConsentPreferences = useProfileStore.getState().userConsentPreferences;
        if (userConsentPreferences?.cloudStorageEnabled) {
            return this.cloudDataSource;
        } else {
            return this.localDataSource;
        }
    }

    async createSensorReading(sensorData: Omit<SensorData, 'id' | 'userId'>): Promise<SensorData> {
        const { userId } = this.getAuthenticatedUserData();
        const activeDataSource = this.getActiveDataSource();

        // log transparency event
        this.logTransparencyEvent(sensorData, activeDataSource);

        const sensorDataWithUserId: Omit<SensorData, 'id'> = {
            userId: userId,
            ...sensorData
        };
        try {
            const encryptedData = await this.encryptionService.encryptSensorData(sensorDataWithUserId);
            const response =  await activeDataSource.createSensorReading(encryptedData, userId);
            if (!response) {
                throw new Error('Failed to create sensor reading. No response from data source.');
            }
            return this.encryptionService.decryptSensorData(response);
        } catch (error: any) {
            console.error(`Error creating sensor reading in ${useProfileStore.getState().userConsentPreferences.cloudStorageEnabled ? 'cloud' : 'local'} storage:`, error);
            throw new Error(`Failed to create sensor reading: ${error.message}`);
        }
    }

    async getSensorReadingById(id: string): Promise<SensorData | null> {
        const { userId } = this.getAuthenticatedUserData();
        const activeDataSource = this.getActiveDataSource();
        try {
            const response = await activeDataSource.getSensorReadingById(userId, id);
            if (!response) {
                return null; // No sensor reading found for the given ID
            }
            return await this.encryptionService.decryptSensorData(response);
        } catch (error: any) {
            console.error(`Error fetching sensor reading by ID ${id} from ${useProfileStore.getState().userConsentPreferences.cloudStorageEnabled ? 'cloud' : 'local'} storage:`, error);
            throw new Error(`Failed to retrieve sensor reading by ID: ${error.message}`);
        }
    }

    async getSensorReadingsByUserId(): Promise<SensorData[]> {
        const { userId } = this.getAuthenticatedUserData();
        const activeDataSource = this.getActiveDataSource();
        try {
            const response = await activeDataSource.getSensorReadingsByUserId(userId);
            if (response.length === 0) {
                return []; // No sensor readings found
            }
            const decryptedReadings = await Promise.all(response.map((reading: SensorData) => this.encryptionService.decryptSensorData(reading)));
            return decryptedReadings;
        } catch (error: any) {
            console.error(`Error fetching all sensor readings from ${useProfileStore.getState().userConsentPreferences.cloudStorageEnabled ? 'cloud' : 'local'} storage:`, error);
            throw new Error(`Failed to retrieve all sensor readings: ${error.message}`);
        }
    }

    async getSensorReadingsByDate(date: string): Promise<SensorData[]> {
        const { userId } = this.getAuthenticatedUserData();
        const activeDataSource = this.getActiveDataSource();
        try {
            const response = await activeDataSource.getSensorReadingsByDate(userId, date);
            if (response.length === 0) {
                return []; 
            }
            const decryptedReadings = await Promise.all(response.map((reading: SensorData) => this.encryptionService.decryptSensorData(reading)));
            return decryptedReadings;
        } catch (error: any) {
            console.error(`Error fetching sensor reading by date ${date} from ${useProfileStore.getState().userConsentPreferences.cloudStorageEnabled ? 'cloud' : 'local'} storage:`, error);
            throw new Error(`Failed to retrieve sensor reading by date: ${error.message}`);
        }
    }

    async deleteSensorReading(id: string): Promise<boolean> {
        const { userId } = this.getAuthenticatedUserData();
        const activeDataSource = this.getActiveDataSource();
        try {
            return await activeDataSource.deleteSensorReading(userId, id);
        } catch (error: any) {
            console.error(`Error deleting sensor reading ${id} from ${useProfileStore.getState().userConsentPreferences.cloudStorageEnabled ? 'cloud' : 'local'} storage:`, error);
            throw new Error(`Failed to delete sensor reading: ${error.message}`);
        }
    }

    private logTransparencyEvent(sensorData: Omit<SensorData, 'id' | 'userId'>, activeDataSource: SensorDataSource) {
        if (activeDataSource instanceof CloudSensorDataSource) {
            if (sensorData.sensorType === 'audio'){
                const microphoneTransparencyEvent = useTransparencyStore.getState().microphoneTransparency;
                useTransparencyStore.getState().setMicrophoneTransparency({
                    ...microphoneTransparencyEvent,
                    storageLocation: DataDestination.GOOGLE_CLOUD,
                });
            } else if (sensorData.sensorType === 'light') {
                const lightSensorTransparencyEvent = useTransparencyStore.getState().lightSensorTransparency;
                useTransparencyStore.getState().setLightSensorTransparency({
                    ...lightSensorTransparencyEvent,
                    storageLocation: DataDestination.GOOGLE_CLOUD,
                });
            } else if (sensorData.sensorType === 'accelerometer') {
                const accelerometerTransparencyEvent = useTransparencyStore.getState().accelerometerTransparency;
                useTransparencyStore.getState().setAccelerometerTransparency({
                    ...accelerometerTransparencyEvent,
                    storageLocation: DataDestination.GOOGLE_CLOUD,
                });
            }
        }
    }
}