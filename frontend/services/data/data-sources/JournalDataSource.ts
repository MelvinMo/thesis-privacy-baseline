import { JournalData } from '@/constants/types/JournalData';

/**
 * Provides an interface to interact with journal data.
 * Journal data includes entries made by users, which can be stored in cloud or local storage.
 * 
 * Note that while many of these functions take userId as an argument, this is only for local storage.
 * In cloud storage, the userId is not needed as the backend will get it from the JWT token.
 */
export interface JournalDataSource {
    getJournalsByUserId(userId: string): Promise<JournalData[]>;
    getJournalById(journalId: string): Promise<JournalData | null>;
    editJournal(date: string, updatedData: Partial<Omit<JournalData, 'journalId' | 'userId'>>, userId: string): Promise<JournalData | null>;
    deleteJournal(journalId: string, userId: string): Promise<void>;
    getJournalByDate(userId: string, date: string): Promise<JournalData | null>; 
}