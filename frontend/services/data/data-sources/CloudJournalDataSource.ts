import { JournalData } from '@/constants/types/JournalData';
import { HttpClient } from '@/services/HttpClient'; 
import { JournalDataSource } from './JournalDataSource';

/**
 * Cloud Implementation of JournalDataSource
 */
export class CloudJournalDataSource implements JournalDataSource {
    private httpClient: HttpClient;
    private getTokenFn: () => string | null; // Function to get the token, injected

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

    async getJournalsByUserId(userId: string): Promise<JournalData[]> {
        const token = this.getAuthToken();
        try {
            const response = await this.httpClient.get<{ journals: JournalData[] }>(`/phi/journal/`, token);
            return response.journals;
        } catch (error: any) {
            console.error(`Error fetching journals from cloud for user ${userId}:`, error);
            throw error;
        }
    }

    async getJournalById(journalId: string): Promise<JournalData | null> {
        const token = this.getAuthToken();
        try {
            const response = await this.httpClient.get<{ journal: JournalData }>(`/phi/journal/${journalId}`, token);
            return response.journal || null;
        } catch (error: any) {
            if (error.message.includes('404') || error.message.toLowerCase().includes('not found')) {
                return null;
            }
            console.error(`Error fetching journal from cloud for journalId ${journalId}:`, error);
            throw error;
        }
    }

    async getJournalByDate(userId: string, date: string): Promise<JournalData | null> {
        const token = this.getAuthToken();
        try {
            const response = await this.httpClient.get<{ journal: JournalData }>(`/phi/journal/by-date/${date}`, token);
            return response.journal || null;
        } catch (error: any) {
            if (error.message.includes('404') || error.message.toLowerCase().includes('not found')) {
                return null;
            }
            console.error(`Error fetching journal from cloud for user ${userId} on date ${date}:`, error);
            throw error;
        }
    }

    async editJournal(date: string, journalData: Partial<Omit<JournalData, 'journalId' | 'userId'>>, userId: string): Promise<JournalData | null> {
        const token = this.getAuthToken();
        try {
            // Backend's POST /phi/journals expects the full object in the body
            const response = await this.httpClient.put<{ journal: JournalData }>(`/phi/journal/${date}`, { ...journalData, date }, token);
            return response.journal;
        } catch (error: any) {
            console.error(`Error creating or updating journal in cloud for user ${userId} on date ${date}:`, error);
            throw new Error(`Failed to create or update journal: ${error.message}`);
        }
    }

    async deleteJournal(journalId: string, userId: string): Promise<void> {
        const token = this.getAuthToken();
        try {
            await this.httpClient.delete<{}>(`/phi/journal/${journalId}`, token);
        } catch (error: any) {
            console.error(`Error deleting journal from cloud for user ${userId} with journalId ${journalId}:`, error);
            throw new Error(`Failed to delete journal: ${error.message}`);
        }
    }
    
}