import * as Crypto from 'expo-crypto';
import { LocalDatabaseManager } from "../LocalDatabaseManager";
import { SensorDataSource } from "./SensorDataSource";
import { SensorData, AudioSensorData, LightSensorData, AccelerometerSensorData, BaseSensorReading } from '@/constants/types/SensorData';
import { useTransparencyStore } from '@/store/transparencyStore';
import { DataDestination } from '@/constants/types/Transparency';

/**
 * LocalSensorDataSource provides methods to interact with sensor data stored in a local SQLite database.
 * It uses crypto to generate unique IDs for sensor readings and handles CRUD operations.
 */
export class LocalSensorDataSource implements SensorDataSource {
    private dbManager: LocalDatabaseManager;
    
    constructor(dbManager: LocalDatabaseManager) {
        this.dbManager = dbManager;
    }

    private mapRowToSensorData(row: any): SensorData {
        const baseReading: BaseSensorReading = {
            id: row.id,
            userId: row.userId,
            timestamp: row.timestamp,
            date: row.date,
            sensorType: row.sensorType,
        };

        switch (row.sensorType) {
            case 'audio':
                return {
                    ...baseReading,
                    sensorType: 'audio',
                    averageDecibels: row.averageDecibels,
                    peakDecibels: row.peakDecibels,
                    frequencyBands: row.frequencyBands ? JSON.parse(row.frequencyBands) : null,
                    audioClipUri: row.audioClipUri,
                    snoreDetected: row.snoreDetected === 1, // Convert INTEGER to boolean
                    ambientNoiseLevel: row.ambientNoiseLevel,
                } as AudioSensorData;
            case 'light':
                return {
                    ...baseReading,
                    sensorType: 'light',
                    illuminance: row.illuminance,
                    lightLevel: row.lightLevel,
                } as LightSensorData;
            case 'accelerometer':
                return {
                    ...baseReading,
                    sensorType: 'accelerometer',
                    x: row.x,
                    y: row.y,
                    z: row.z,
                    magnitude: row.magnitude,
                    movementIntensity: row.movementIntensity,
                } as AccelerometerSensorData;
            default:
                throw new Error(`Unknown sensor type '${row.sensorType}' encountered in local database for ID: ${row.id}`);
        }
    }

    async createSensorReading(sensorData: Omit<SensorData, 'id'>, userId: string): Promise<SensorData> {
        try {
            const id = Crypto.randomUUID(); // Generate a unique ID for the new record
            const createdAt = new Date().toISOString(); // Timestamp for database creation

            let sql: string;
            let params: any[];

            // Dynamically construct SQL and parameters based on sensor type
            switch (sensorData.sensorType) {
                case 'audio':
                    const audioData = sensorData as Omit<AudioSensorData, 'id'>;
                    sql = `
                        INSERT INTO sensor_data 
                        (id, userId, timestamp, date, sensorType, averageDecibels, peakDecibels, frequencyBands, audioClipUri, snoreDetected, ambientNoiseLevel, createdAt) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `;
                    params = [
                        id, userId, audioData.timestamp, audioData.date, audioData.sensorType,
                        audioData.averageDecibels, audioData.peakDecibels, JSON.stringify(audioData.frequencyBands),
                        audioData.audioClipUri || null, (audioData.snoreDetected ? 1 : 0), audioData.ambientNoiseLevel, createdAt
                    ];
                    break;
                case 'light':
                    const lightData = sensorData as Omit<LightSensorData, 'id'>;
                    sql = `
                        INSERT INTO sensor_data 
                        (id, userId, timestamp, date, sensorType, illuminance, lightLevel, createdAt) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    `;
                    params = [
                        id, userId, lightData.timestamp, lightData.date, lightData.sensorType,
                        lightData.illuminance, lightData.lightLevel, createdAt
                    ];
                    break;
                case 'accelerometer':
                    const accelData = sensorData as Omit<AccelerometerSensorData, 'id'>;
                    sql = `
                        INSERT INTO sensor_data 
                        (id, userId, timestamp, date, sensorType, x, y, z, magnitude, movementIntensity, createdAt) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `;
                    params = [
                        id, userId, accelData.timestamp, accelData.date, accelData.sensorType,
                        accelData.x, accelData.y, accelData.z, accelData.magnitude, accelData.movementIntensity, createdAt
                    ];
                    break;
                default:
                    throw new Error(`Cannot create sensor reading for unknown sensor type: ${sensorData.sensorType}`);
            }

            await this.dbManager.executeSql(sql, params);

            // Return the created sensor data with its new ID
            const createdSensorData: SensorData = {
                ...sensorData,
                id: id
            } as SensorData; // Cast to SensorData as 'id' is now present

            // log transparency event
            this.logTransparencyEvent(sensorData);
            
            return createdSensorData;

        } catch (error) {
            console.error('Error creating sensor reading in local DB:', error);
            throw new Error(`Failed to create sensor reading: ${error}`);
        }
    }

    async getSensorReadingById(userId: string, id: string): Promise<SensorData | null> {
        try {
            const sql = `
                SELECT *
                FROM sensor_data 
                WHERE id = ? AND userId = ?
            `;
            
            const row = await this.dbManager.getOne<any>(sql, [id, userId]);
            
            return row ? this.mapRowToSensorData(row) : null;
        } catch (error) {
            console.error('Error getting sensor reading by ID:', error);
            throw new Error(`Failed to get sensor reading ${id}: ${error}`);
        }
    }

    async getSensorReadingsByUserId(userId: string): Promise<SensorData[]> {
        try {
            const sql = `
                SELECT *
                FROM sensor_data 
                WHERE userId = ? 
                ORDER BY timestamp DESC
            `;
            
            const rows = await this.dbManager.getAll<any>(sql, [userId]);
            
            if (rows.length === 0) {
                return []; 
            }

            return rows.map(row => this.mapRowToSensorData(row));
        } catch (error) {
            console.error('Error getting sensor readings by user ID:', error);
            throw new Error(`Failed to get sensor readings for user ${userId}: ${error}`);
        }
    }

    async getSensorReadingsByDate(userId: string, date: string): Promise<SensorData[]> {
        try {
            const sql = `
                SELECT *
                FROM sensor_data 
                WHERE userId = ? AND date = ?
            `;
            
            const rows = await this.dbManager.getAll<any>(sql, [userId, date]);

            if (rows.length === 0) {
                return []; 
            }

            return rows.map(row => this.mapRowToSensorData(row));
        } catch (error) {
            console.error(`Error getting sensor reading for user ${userId} on date ${date}:`, error);
            throw new Error(`Failed to get sensor reading by date: ${error}`);
        }
    }

    async deleteSensorReading(userId: string, id: string): Promise<boolean> {
        try {
            const sql = `DELETE FROM sensor_data WHERE id = ? AND userId = ?`;
            
            const result = await this.dbManager.executeSql(sql, [id, userId]);
            
            return result.rowsAffected !== undefined && result.rowsAffected > 0;
        } catch (error) {
            console.error(`Error deleting sensor reading ${id} from local DB:`, error);
            throw new Error(`Failed to delete sensor reading ${id}: ${error}`);
        }
    }

    private logTransparencyEvent(sensorData: Omit<SensorData, 'id'>) {
        if (sensorData.sensorType === 'audio'){
            const microphoneTransparencyEvent = useTransparencyStore.getState().microphoneTransparency;
            useTransparencyStore.getState().setMicrophoneTransparency({
                ...microphoneTransparencyEvent,
                storageLocation: DataDestination.SQLITE_DB,
            });
        } else if (sensorData.sensorType === 'light') {
            const lightSensorTransparencyEvent = useTransparencyStore.getState().lightSensorTransparency;
            useTransparencyStore.getState().setLightSensorTransparency({
                ...lightSensorTransparencyEvent,
                storageLocation: DataDestination.SQLITE_DB,
            });
        } else if (sensorData.sensorType === 'accelerometer') {
            const accelerometerTransparencyEvent = useTransparencyStore.getState().accelerometerTransparency;
            useTransparencyStore.getState().setAccelerometerTransparency({
                ...accelerometerTransparencyEvent,
                storageLocation: DataDestination.SQLITE_DB,
            });
        }
    }
}