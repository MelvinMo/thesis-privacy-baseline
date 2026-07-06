/**
 * This file is where all the services are instantiated and exported
 */

import { HttpClient } from './HttpClient';
import { CloudStorageService } from './data/CloudStorageService';
import { useAuthStore } from '@/store/authStore';
import { GeneralSleepDataRepository } from './data/GeneralSleepDataRepository';
import { CloudGeneralSleepDataSource } from './data/data-sources/CloudGeneralSleepDataSource';
import { LocalGeneralSleepDataSource } from './data/data-sources/LocalGeneralSleepDataSource';
import { LocalDatabaseManager } from './data/LocalDatabaseManager';
import { LocalJournalDataSource } from './data/data-sources/LocalJournalDataSource';
import { JournalDataRepository } from './data/JournalDataRepository';
import { CloudJournalDataSource } from './data/data-sources/CloudJournalDataSource';
import { SensorBackgroundTaskManager } from './BackgroundTaskManager';
import { CloudSensorDataSource } from './data/data-sources/CloudSensorDataSource';
import { SensorStorageRepository } from './data/SensorStorageRepository';
import { LocalSensorDataSource } from './data/data-sources/LocalSensorDataSource';
import { ExpoSensorService } from './sensors/ExpoSensorService';
import { DEFAULT_SENSOR_SERVICE_CONFIG } from './sensors/sensorConfig';
import { SimulationSensorService } from './sensors/SimulationSensorService';
import { SensorRepository } from './sensors/SensorRepository';
import { EncryptionService } from './EncryptionService';
import { TransparencyService } from './TransparencyService';
import { transparencyDemoConfig, IN_DEMO_MODE } from '@/constants/config/transparencyConfig';

// Instantiate the base HTTP client
const apiBaseUrl = IN_DEMO_MODE ? (transparencyDemoConfig.encryptedInTransit ? process.env.EXPO_PUBLIC_API_ENCRYPTED_URL as string : process.env.EXPO_PUBLIC_API_UNENCRYPTED_URL as string) : process.env.EXPO_PUBLIC_API_ENCRYPTED_URL as string;
if (!apiBaseUrl) {
    console.error('EXPO_PUBLIC_API_ENCRYPTED_URL is not defined in your .env file!');
}
export const httpClient : HttpClient = new CloudStorageService(apiBaseUrl);
const dbManager = LocalDatabaseManager.getInstance();
const encryptionService = EncryptionService.getInstance();

// Helper function to get the current auth token for data sources
const getAuthToken = (): string | null => {
    return useAuthStore.getState().token;
};

export const cloudHealthDataSource = new CloudGeneralSleepDataSource(httpClient, getAuthToken);
export const localHealthDataSource = new LocalGeneralSleepDataSource();
export const generalSleepDataRepository = new GeneralSleepDataRepository(cloudHealthDataSource, localHealthDataSource, encryptionService);

export const cloudJournalDataSource = new CloudJournalDataSource(httpClient, getAuthToken);
export const localJournalDataSource = new LocalJournalDataSource(dbManager);
export const journalDataRepository = new JournalDataRepository(cloudJournalDataSource, localJournalDataSource, encryptionService);

export const cloudSensorDataSource = new CloudSensorDataSource(httpClient, getAuthToken);
export const localSensorDataSource = new LocalSensorDataSource(dbManager);
export const sensorStorageRepository = new SensorStorageRepository(cloudSensorDataSource, localSensorDataSource, encryptionService);

export const expoSensorService = new ExpoSensorService(DEFAULT_SENSOR_SERVICE_CONFIG);
export const simulationSensorService = new SimulationSensorService(DEFAULT_SENSOR_SERVICE_CONFIG);
export const sensorRepository = new SensorRepository(expoSensorService, simulationSensorService, sensorStorageRepository);
export const sensorBackgroundTaskManager = new SensorBackgroundTaskManager(sensorRepository);

export const transparencyService = new TransparencyService(httpClient, getAuthToken);