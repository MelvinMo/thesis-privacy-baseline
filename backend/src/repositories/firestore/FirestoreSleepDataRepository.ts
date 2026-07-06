import { SleepDataRepository } from '../SleepDataRepository';
import { GeneralSleepData } from '../../constants/types/GeneralSleepData';
import { db } from '../../config/firebaseConfig';
import { DocumentData, DocumentSnapshot } from 'firebase-admin/firestore';

/**
 * Firestore implementation of the SleepDataRepository.
 * Handles CRUD operations for sleep data entries in Firestore.
 */
export class FirestoreSleepDataRepository implements SleepDataRepository {
    private collectionName = 'sleepData';

    private mapDocToSleepData(doc: DocumentSnapshot<DocumentData>): GeneralSleepData {
        const data = doc.data();
        if (!data) {
            throw new Error('Document data is undefined');
        }
        return {
            userId: data.userId,
            currentSleepDuration: data.currentSleepDuration,
            snoring: data.snoring,
            tirednessFrequency: data.tirednessFrequency,
            daytimeSleepiness: data.daytimeSleepiness,
        };
    }

    async createSleepData(sleepData: GeneralSleepData): Promise<GeneralSleepData> {
        try {
            // Basic validation - need at least userId to create sleep data
            if (!sleepData.userId) {
                throw new Error('User ID is required to create sleep data.');
            }

            const docRef = await db.collection(this.collectionName).add({
                ...sleepData,
                createdAt: new Date(),
            });

            if (docRef.id) {
                const newSleepData: GeneralSleepData = {
                    ...sleepData,
                }
                console.log(`Sleep data created for user: ${newSleepData.userId}`);
                return newSleepData;
            }
            throw new Error('Failed to create sleep data.');

        } catch (error: any) {
            console.error('Error creating sleep data:', error);
            throw new Error(`Failed to create sleep data in Firestore: ${error.message}`);
        }
    }

    async getSleepDataById(userId: string): Promise<GeneralSleepData | null> {
        try {
            const querySnapshot = await db.collection(this.collectionName).where('userId', '==', userId).get();
            if (querySnapshot.empty) {
                return null; // No sleep data found for this user
            }
            const doc = querySnapshot.docs[0];
            return this.mapDocToSleepData(doc);
        } catch (error: any) {
            console.error('Error fetching sleep data:', error);
            throw new Error(`Failed to fetch sleep data from Firestore: ${error.message}`);
        }
    }

    async updateSleepData(userId: string, sleepData: Omit<GeneralSleepData, 'userId'>): Promise<GeneralSleepData | null> {
        try {
            if (!userId) {
                throw new Error('User ID is required to update sleep data.');
            }

            const querySnapshot = await db.collection(this.collectionName).where('userId', '==', userId).get();
            if (querySnapshot.empty) {
                return null; // No sleep data found for this user
            }

            const doc = querySnapshot.docs[0];
            await doc.ref.update({
                ...sleepData,
                updatedAt: new Date(),
            });

            return this.mapDocToSleepData(doc);
        } catch (error: any) {
            console.error('Error updating sleep data:', error);
            throw new Error(`Failed to update sleep data in Firestore: ${error.message}`);
        }
    }

    async deleteSleepData(userId: string): Promise<boolean> {
        try {
            const querySnapshot = await db.collection(this.collectionName).where('userId', '==', userId).get();
            if (querySnapshot.empty) {
                console.warn(`No sleep data found for user ${userId} to delete.`);
                return false; // No sleep data found for this user
            }

            const doc = querySnapshot.docs[0];
            await doc.ref.delete();
            console.log(`Sleep data deleted for user: ${userId}`);
            return true;
        } catch (error: any) {
            console.error('Error deleting sleep data:', error);
            throw new Error(`Failed to delete sleep data from Firestore: ${error.message}`);
        }
    }
}