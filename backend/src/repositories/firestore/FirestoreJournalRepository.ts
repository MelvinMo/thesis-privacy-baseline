import { JournalRepository } from '../JournalRepository';
import { JournalData } from '../../constants/types/Journal'; 
import { db } from '../../config/firebaseConfig';
import { DocumentData, DocumentSnapshot } from 'firebase-admin/firestore';

/**
 * Firestore implementation of the JournalRepository.
 * Handles CRUD operations for journal entries in Firestore.
 */
export class FirestoreJournalRepository implements JournalRepository {

    private collectionName = 'journals';

    private mapDocToJournalData(doc: DocumentSnapshot<DocumentData, DocumentData>): JournalData {
        const data = doc.data();
        return {
            date: data!.date,
            journalId: doc.id,
            userId: data!.userId,
            bedtime: data!.bedtime,
            alarmTime: data!.alarmTime,
            sleepDuration: data!.sleepDuration,
            diaryEntry: data!.diaryEntry,
            sleepNotes: data!.sleepNotes || [], // Ensure sleepNotes is an array, default to empty if not present
        };
    }

    async getJournalById(userId: string, journalId: string): Promise<JournalData | null> {
        try {
            const docSnapshot = await db.collection(this.collectionName).doc(journalId).get();

            if (!docSnapshot.exists) {
                return null; // Journal not found
            }

            const journalData = this.mapDocToJournalData(docSnapshot);

            // Ensure the journal belongs to the requesting user
            if (journalData.userId !== userId) {
                console.warn(`Attempt to access journal ${journalId} by unauthorized user ${userId}.`);
                throw new Error(`Unauthorized access to journal entry ${journalId}.`);
            }

            return journalData;
        } catch (error: any) {
            console.error(`Error fetching journal entry ${journalId} for user ${userId}:`, error);
            throw new Error(`Failed to fetch journal entry from Firestore: ${error.message}`);
        }
    }

    async getJournalsByUserId(userId: string): Promise<JournalData[]> {
        try {
            // Query journals where the userId field matches the provided userId
            const querySnapshot = await db.collection(this.collectionName).where('userId', '==', userId).get();

            if (querySnapshot.empty) {
                return []; // No journals found for this user
            }

            const journals: JournalData[] = [];
            querySnapshot.forEach(doc => {
                journals.push(this.mapDocToJournalData(doc));
            });

            console.log(`Retrieved ${journals.length} journal entries for user ${userId}.`);
            return journals;
        } catch (error: any) {
            console.error(`Error fetching all journal entries for user ${userId}:`, error);
            throw new Error(`Failed to fetch journal entries from Firestore: ${error.message}`);
        }
    }

    async editJournal(userId: string, date: string, updatedData: Partial<Omit<JournalData, 'journalId' | 'userId'>>): Promise<JournalData | null> {
        try {
            // First, try to fetch the journal by userId and date
            const existingJournal = await this.getJournalByDate(userId, date);

            if (existingJournal) {
                // If found, update the existing journal entry
                const journalRef = db.collection(this.collectionName).doc(existingJournal.journalId);
                await journalRef.update(updatedData);
                console.log(`Journal entry with ID ${existingJournal.journalId} updated successfully for user ${userId} on date ${date}.`);
                // Fetch and return the updated journal data
                const updatedDoc = await journalRef.get();
                return this.mapDocToJournalData(updatedDoc);
            } else {
                // If not found, create a new journal entry
                const newJournal: Omit<JournalData, 'journalId'> = {
                    userId,
                    date,
                    ...updatedData,
                    // Provide default values for fields that might be missing in updatedData if necessary
                    bedtime: updatedData.bedtime || "",
                    alarmTime: updatedData.alarmTime || "",
                    sleepDuration: updatedData.sleepDuration || "",
                    diaryEntry: updatedData.diaryEntry || '',
                    sleepNotes: updatedData.sleepNotes || [],
                };
                const docRef = await db.collection(this.collectionName).add(newJournal);
                const newDoc = await docRef.get();
                console.log(`New journal entry created with ID ${newDoc.id} for user ${userId} on date ${date}.`);
                return this.mapDocToJournalData(newDoc);
            }
        } catch (error: any) {
            console.error(`Error editing/creating journal entry for user ${userId} on date ${date}:`, error);
            throw new Error(`Failed to edit/create journal entry in Firestore: ${error.message}`);
        }
    }

    async deleteJournal(userId: string, journalId: string): Promise<boolean> {
        try {
            const docRef = db.collection(this.collectionName).doc(journalId);
            const docSnapshot = await docRef.get();

            if (!docSnapshot.exists) {
                return false; // Journal not found
            }

            const existingJournal = this.mapDocToJournalData(docSnapshot);

            // Ensure the journal belongs to the requesting user before deleting
            if (existingJournal.userId !== userId) {
                console.warn(`Unauthorized attempt to delete journal ${journalId} by user ${userId}.`);
                throw new Error(`Unauthorized access to journal entry ${journalId}.`);
            }

            await docRef.delete();
            console.log(`Journal entry with ID ${journalId} deleted successfully for user ${userId}.`);
            return true;
        } catch (error: any) {
            console.error(`Error deleting journal entry ${journalId} for user ${userId}:`, error);
            throw new Error(`Failed to delete journal entry from Firestore: ${error.message}`);
        }
    }

    async getJournalByDate(userId: string, date: string): Promise<JournalData | null> {
        try {
            const querySnapshot = await db.collection(this.collectionName)
                .where('userId', '==', userId)
                .where('date', '==', date)
                .get();

            if (querySnapshot.empty) {
                return null; // No journal found for this date
            }

            // Assuming only one journal entry per date per user
            const doc = querySnapshot.docs[0];
            return this.mapDocToJournalData(doc);
        } catch (error: any) {
            console.error(`Error fetching journal entry for user ${userId} on date ${date}:`, error);
            throw new Error(`Failed to fetch journal entry by date from Firestore: ${error.message}`);
        }
    }
}