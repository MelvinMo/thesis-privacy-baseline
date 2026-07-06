import { JournalData } from '../constants/types/Journal';

/**
 * Interface for interacting with journal data storage.
 * Defines the contract for CRUD operations on JournalData.
 */
export interface JournalRepository {

    getJournalById(userId: string, journalId: string): Promise<JournalData | null>;

    getJournalsByUserId(userId: string): Promise<JournalData[]>;

    getJournalByDate(userId: string, date: string): Promise<JournalData | null>;

    editJournal(userId: string, date: string, updatedData: Partial<Omit<JournalData, 'journalId' | 'userId'>>): Promise<JournalData | null>;

    deleteJournal(userId: string, journalId: string): Promise<boolean>;
}