import { SensorData } from '@/constants/types/SensorData';
import { HttpClient } from '@/services/HttpClient';
import { SensorDataSource } from './SensorDataSource';

/**
 * This is the cloud implementation of the SensorDataSource.
 * It interacts with the backend API to perform CRUD operations on sensor data.
 */
export class CloudSensorDataSource implements SensorDataSource {
    private httpClient: HttpClient;
    private getTokenFn: () => string | null; // Function to get the authentication token

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

    async createSensorReading(sensorData: Omit<SensorData, 'id'>): Promise<SensorData> {
        const token = this.getAuthToken();
        try {
            const response = await this.httpClient.post<{ sensorReading: SensorData }>('/phi/sensor-data/', sensorData, token);
            return response.sensorReading;
        } catch (error: any) {
            console.error("Error creating sensor reading in cloud:", error);
            throw new Error(`Failed to create sensor reading in cloud: ${error.message}`);
        }
    }

    async getSensorReadingById(userId: string, id: string): Promise<SensorData | null> {
        const token = this.getAuthToken();
        try {
            const response = await this.httpClient.get<{ sensorReading: SensorData }>(`/phi/sensor-data/${id}`, token);
            return response.sensorReading;
        } catch (error: any) {
            if (error.message.includes('404') || error.message.toLowerCase().includes('not found')) {
                return null;
            }
            console.error(`Error fetching sensor reading ${id} from cloud for user ${userId}:`, error);
            throw error;
        }
    }

    async getSensorReadingsByUserId(userId: string): Promise<SensorData[]> {
        const token = this.getAuthToken();
        try {
            const response = await this.httpClient.get<{ sensorReadings: SensorData[] }>('/phi/sensor-data', token);
            return response.sensorReadings;
        } catch (error: any) {
            console.error(`Error fetching sensor readings from cloud for user ${userId}:`, error);
            throw error;
        }
    }

    async getSensorReadingsByDate(userId: string, date: string): Promise<SensorData[]> {
        const token = this.getAuthToken();
        try {
            const response = await this.httpClient.get<{ sensorReadings: SensorData[] }>(`/phi/sensor-data/by-date/${date}`, token);
            return response.sensorReadings;
        } catch (error: any) {
            if (error.message.includes('404') || error.message.toLowerCase().includes('not found')) {
                return [];
            }
            console.error(`Error fetching sensor reading by date ${date} from cloud for user ${userId}:`, error);
            throw error;
        }
    }

    async deleteSensorReading(userId: string, id: string): Promise<boolean> {
        const token = this.getAuthToken();
        try {
            await this.httpClient.delete<{}>(`/phi/sensor-data/${id}`, token);
            return true;
        } catch (error: any) {
            console.error(`Error deleting sensor reading ${id} from cloud:`, error);
            // If the error indicates a 404, it means the item wasn't found, so return false
            if (error.message.includes('404') || error.message.toLowerCase().includes('not found')) {
                return false;
            }
            throw new Error(`Failed to delete sensor reading from cloud: ${error.message}`);
        }
    }
}