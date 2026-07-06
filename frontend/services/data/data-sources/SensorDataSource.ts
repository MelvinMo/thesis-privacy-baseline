import { SensorData } from '@/constants/types/SensorData';

/**
 * Provides an interface to interact with sensor data. 
 * which includes audio, light, and accelerometer data.
 * 
 * Note that while many of these functions take userId as an argument, this is only for local storage.
 * In cloud storage, the userId is not needed as the backend will get it from the JWT token.
 * 
 * To simplify things, there is just one interface for all sensor data sources. For the prototype, 
 * I do not expect to have to fetch sensor data at all (for now), so most of this interface is just for completeness.
 */
export interface SensorDataSource {
    createSensorReading(sensorData: Omit<SensorData, 'id'>, userId: string): Promise<SensorData>;

    getSensorReadingById(userId: string, id: string): Promise<SensorData | null>;

    getSensorReadingsByUserId(userId: string): Promise<SensorData[]>;

    getSensorReadingsByDate(userId: string, date: string): Promise<SensorData[]>;

    deleteSensorReading(userId: string, id: string): Promise<boolean>;
}