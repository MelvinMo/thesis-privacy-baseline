import { SensorData } from '../constants/types/SensorData';

/**
 * Interface for interacting with sensor data
 * Defines the contract for CRUD operations on SensorData.
 */
export interface SensorDataRepository {

    createSensorReading(sensorData: Omit<SensorData, 'id'>): Promise<SensorData>;

    getSensorReadingById(userId: string, id: string): Promise<SensorData | null>;

    getSensorReadingsByUserId(userId: string): Promise<SensorData[]>;

    getSensorReadingsByDate(userId: string, date: string): Promise<SensorData[]>;

    deleteSensorReading(userId: string, id: string): Promise<boolean>;
}