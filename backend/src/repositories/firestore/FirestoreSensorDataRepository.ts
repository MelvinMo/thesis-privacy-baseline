import { SensorData, BaseSensorReading, AudioSensorData, LightSensorData, AccelerometerSensorData } from '../../constants/types/SensorData';
import { db } from '../../config/firebaseConfig';
import { DocumentData, DocumentSnapshot } from 'firebase-admin/firestore';
import { SensorDataRepository } from '../SensorDataRepository';

/**
 * Firestore implementation of the SensorDataRepository.
 * Handles CRUD operations for sensor data entries in Firestore.
 */
export class FirestoreSensorDataRepository implements SensorDataRepository {

    private collectionName = 'sensorData';

    private mapDocToSensorData(doc: DocumentSnapshot<DocumentData, DocumentData>): SensorData {
        const data = doc.data();
        if (!data) {
            throw new Error('Document data is undefined.');
        }

        // Base properties common to all sensor readings
        const baseReading: BaseSensorReading = {
            id: doc.id,
            userId: data.userId,
            timestamp: data.timestamp,
            date: data.date,
            sensorType: data.sensorType,
        };

        // Map specific properties based on sensor type
        switch (data.sensorType) {
            case 'audio':
                return {
                    ...baseReading,
                    sensorType: 'audio',
                    averageDecibels: data.averageDecibels,
                    peakDecibels: data.peakDecibels,
                    frequencyBands: data.frequencyBands,
                    audioClipUri: data.audioClipUri,
                    snoreDetected: data.snoreDetected,
                    ambientNoiseLevel: data.ambientNoiseLevel,
                } as AudioSensorData;
            case 'light':
                return {
                    ...baseReading,
                    sensorType: 'light',
                    illuminance: data.illuminance,
                    lightLevel: data.lightLevel,
                } as LightSensorData;
            case 'accelerometer':
                return {
                    ...baseReading,
                    sensorType: 'accelerometer',
                    x: data.x,
                    y: data.y,
                    z: data.z,
                    magnitude: data.magnitude,
                    movementIntensity: data.movementIntensity,
                } as AccelerometerSensorData;
            default:
                // Handle unknown sensor types to prevent unexpected data structures
                throw new Error(`Unknown sensor type: ${data.sensorType} for document ID: ${doc.id}`);
        }
    }

    /**
     * Creates a new sensor reading in Firestore.
     * @param sensorData The sensor data to create (without the 'id').
     * @returns The created SensorData object with its new ID.
     * @throws Error if user ID is missing or creation fails.
     */
    async createSensorReading(sensorData: Omit<SensorData, 'id'>): Promise<SensorData> {
        try {
            const userId = sensorData.userId;
            if (!userId) {
                throw new Error('User ID is required to create a sensor reading.');
            }

            // Add a timestamp for when the document was created in Firestore (separate from sensorData.timestamp)
            const docRef = await db.collection(this.collectionName).add({
                ...sensorData,
                createdAt: new Date(),
            });

            const createdDoc = await docRef.get();
            const newReading: SensorData = this.mapDocToSensorData(createdDoc);
            return newReading;
        } catch (error: any) {
            console.error('Error creating sensor reading:', error);
            throw new Error(`Failed to create sensor reading in Firestore: ${error.message}`);
        }
    }

    async getSensorReadingById(userId: string, id: string): Promise<SensorData | null> {
        try {
            const docSnapshot = await db.collection(this.collectionName).doc(id).get();

            if (!docSnapshot.exists) {
                return null; // Sensor reading not found
            }

            const sensorData = this.mapDocToSensorData(docSnapshot);

            // Important: Ensure the sensor reading belongs to the requesting user
            if (sensorData.userId !== userId) {
                console.warn(`Attempt to access sensor reading ${id} by unauthorized user ${userId}.`);
                throw new Error(`Unauthorized access to sensor reading ${id}.`);
            }

            return sensorData;
        } catch (error: any) {
            console.error(`Error fetching sensor reading ${id} for user ${userId}:`, error);
            throw new Error(`Failed to fetch sensor reading from Firestore: ${error.message}`);
        }
    }

    async getSensorReadingsByUserId(userId: string): Promise<SensorData[]> {
        try {
            // Query sensor readings where the userId field matches the provided userId
            const querySnapshot = await db.collection(this.collectionName).where('userId', '==', userId).get();

            if (querySnapshot.empty) {
                return []; // No sensor readings found for this user
            }

            const sensorReadings: SensorData[] = [];
            querySnapshot.forEach(doc => {
                sensorReadings.push(this.mapDocToSensorData(doc));
            });

            console.log(`Retrieved ${sensorReadings.length} sensor entries for user ${userId}.`);
            return sensorReadings;
        } catch (error: any) {
            console.error(`Error fetching all sensor entries for user ${userId}:`, error);
            throw new Error(`Failed to fetch sensor entries from Firestore: ${error.message}`);
        }
    }

    async deleteSensorReading(userId: string, id: string): Promise<boolean> {
        try {
            const docRef = db.collection(this.collectionName).doc(id);
            const docSnapshot = await docRef.get();

            if (!docSnapshot.exists) {
                return false; // Sensor reading not found
            }

            const existingSensorReading = this.mapDocToSensorData(docSnapshot);

            // Ensure the sensor reading belongs to the requesting user before deleting
            if (existingSensorReading.userId !== userId) {
                console.warn(`Unauthorized attempt to delete sensor reading ${id} by user ${userId}.`);
                throw new Error(`Unauthorized access to sensor reading ${id}.`);
            }

            await docRef.delete();
            console.log(`Sensor reading with ID ${id} deleted successfully for user ${userId}.`);
            return true;
        } catch (error: any) {
            console.error(`Error deleting sensor reading ${id} for user ${userId}:`, error);
            throw new Error(`Failed to delete sensor reading from Firestore: ${error.message}`);
        }
    }

    async getSensorReadingsByDate(userId: string, date: string): Promise<SensorData[]> {
        try {
            const querySnapshot = await db.collection(this.collectionName)
                .where('userId', '==', userId)
                .where('date', '==', date)
                .get();

            if (querySnapshot.empty) {
                return []; // No sensor readings found for this date
            }

            return querySnapshot.docs.map(doc => this.mapDocToSensorData(doc));
        } catch (error: any) {
            console.error(`Error fetching sensor reading for user ${userId} on date ${date}:`, error);
            throw new Error(`Failed to fetch sensor reading by date from Firestore: ${error.message}`);
        }
    }
}
