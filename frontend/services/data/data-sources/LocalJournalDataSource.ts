import { JournalData } from "@/constants/types/JournalData";
import { LocalDatabaseManager } from "../LocalDatabaseManager";
import { JournalDataSource } from "./JournalDataSource";
import * as Crypto from 'expo-crypto';
import { useTransparencyStore } from "@/store/transparencyStore";
import { DataDestination } from "@/constants/types/Transparency";

/**
 * LocalJournalDataSource provides methods to interact with journal data stored in a local SQLite database.
 * It uses crypto to generate unique IDs for journals and handles CRUD operations.
 */
export class LocalJournalDataSource implements JournalDataSource {
    private dbManager: LocalDatabaseManager;

    constructor(dbManager: LocalDatabaseManager) {
        this.dbManager = dbManager;
    }

    async getJournalsByUserId(userId: string): Promise<JournalData[]> {
        try {
            const sql = `
                SELECT journalId, userId, date, bedtime, alarmTime, sleepDuration,
                        diaryEntry, sleepNotes
                FROM journals
                WHERE userId = ?
                ORDER BY date DESC
            `;

            const rows = await this.dbManager.getAll<any>(sql, [userId]);

            return rows.map(row => this.mapRowToJournalData(row));
        } catch (error) {
            console.error('Error getting journals by user ID:', error);
            throw new Error(`Failed to get journals for user ${userId}: ${error}`);
        }
    }

      async getJournalById(journalId: string): Promise<JournalData | null> {
        try {
            const sql = `
                SELECT journalId, userId, date, bedtime, alarmTime, sleepDuration,
                        diaryEntry, sleepNotes
                FROM journals
                WHERE journalId = ?
            `;

            const row = await this.dbManager.getOne<any>(sql, [journalId]);

            return row ? this.mapRowToJournalData(row) : null;
        } catch (error) {
            console.error('Error getting journal by ID:', error);
            throw new Error(`Failed to get journal ${journalId}: ${error}`);
        }
    }

    async editJournal(
        date: string,
        journalData: Partial<Omit<JournalData, 'journalId' | 'userId'>>,
        userId: string
    ): Promise<JournalData | null> {
        try {
            // First, check if the journal exists and belongs to the user
            const existingJournal = await this.getJournalByDate(userId, date);
            const journalTransparencyEvent = useTransparencyStore.getState().journalTransparency;
            if (!existingJournal){
                const journalId = Crypto.randomUUID();
                const createdAt = new Date().toISOString();

                const sql = `
                    INSERT INTO journals
                    (journalId, userId, date, bedtime, alarmTime, sleepDuration, diaryEntry, sleepNotes, createdAt)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;

                const sleepNotesJson = journalData.sleepNotes ? JSON.stringify(journalData.sleepNotes) : null;

                if (sql) {
                    useTransparencyStore.getState().setJournalTransparency({
                        ...journalTransparencyEvent,
                        storageLocation: DataDestination.SQLITE_DB
                    });
                }

                const params = [
                    journalId,
                    userId,
                    journalData.date,
                    journalData.bedtime,
                    journalData.alarmTime,
                    journalData.sleepDuration,
                    journalData.diaryEntry,
                    sleepNotesJson,
                    createdAt
                ];

                await this.dbManager.executeSql(sql, params);

                // Return the created journal
                const createdJournal: JournalData = {
                    journalId,
                    userId,
                    date: date,
                    bedtime: journalData.bedtime ?? "",
                    alarmTime: journalData.alarmTime ?? "",
                    sleepDuration: journalData.sleepDuration ?? "",
                    diaryEntry: journalData.diaryEntry ?? "",
                    sleepNotes: journalData.sleepNotes ? (JSON.parse(sleepNotesJson!) || []) : [],
                };

                return createdJournal;
            }

            // Build dynamic UPDATE query based on provided fields
            const updateFields: string[] = [];
            const params: any[] = [];

            if (journalData.date !== undefined) {
                updateFields.push('date = ?');
                params.push(journalData.date);
            }
            if (journalData.bedtime !== undefined) {
                updateFields.push('bedtime = ?');
                params.push(journalData.bedtime);
            }
            if (journalData.alarmTime !== undefined) {
                updateFields.push('alarmTime = ?');
                params.push(journalData.alarmTime);
            }
            if (journalData.sleepDuration !== undefined) {
                updateFields.push('sleepDuration = ?');
                params.push(journalData.sleepDuration);
            }
            if (journalData.diaryEntry !== undefined) {
                updateFields.push('diaryEntry = ?');
                params.push(journalData.diaryEntry);
            }
            if (journalData.sleepNotes !== undefined) {
                updateFields.push('sleepNotes = ?');
                params.push(journalData.sleepNotes ? JSON.stringify(journalData.sleepNotes) : null);
            }

            // If no fields to update, return the existing journal
            if (updateFields.length === 0) {
                return existingJournal;
            }

            const sql = `
                UPDATE journals
                SET ${updateFields.join(', ')}
                WHERE date = ? AND userId = ?
            `;

            if (sql) {
                useTransparencyStore.getState().setJournalTransparency({
                    ...journalTransparencyEvent,
                    storageLocation: DataDestination.SQLITE_DB
                });
            }

            params.push(date, userId);

            const result = await this.dbManager.executeSql(sql, params);
            // Check if any rows were affected
            if (result.rowsAffected === 0) {
                return null;
            }

            // Return the updated journal
            return await this.getJournalByDate(userId, date);
        } catch (error) {
            console.error('Error updating journal:', error);
            throw new Error(`Failed to update journal ${date}: ${error}`);
        }
    }

    async deleteJournal(journalId: string, userId: string): Promise<void> {
        try {
            const sql = `DELETE FROM journals WHERE journalId = ? AND userId = ?`;

            const result = await this.dbManager.executeSql(sql, [journalId, userId]);

            if (result.rowsAffected === 0) {
                throw new Error(`Journal ${journalId} not found or does not belong to user ${userId}`);
            }
        } catch (error) {
            console.error('Error deleting journal:', error);
            throw new Error(`Failed to delete journal ${journalId}: ${error}`);
        }
    }

    async getJournalByDate(userId: string, date: string): Promise<JournalData | null> {
        try {
            const sql = `
                SELECT journalId, userId, date, bedtime, alarmTime, sleepDuration,
                        diaryEntry, sleepNotes, createdAt
                FROM journals
                WHERE userId = ? AND date == ?
            `;

            const row = await this.dbManager.getOne<any>(sql, [userId, date]);

            return row ? this.mapRowToJournalData(row) : null;
        } catch (error) {
            console.error('Error getting journals by date range:', error);
            throw new Error(`Failed to get journals for date range: ${error}`);
        }
    }

    /**
     * Helper method to map database row to JournalData object
     */
    private mapRowToJournalData(row: any): JournalData {
        return {
            ...row,
            sleepNotes: row.sleepNotes ? (JSON.parse(row.sleepNotes) || []) : [],
            diaryEntry: row.diaryEntry ?? "", 
            bedtime: row.bedtime ?? "",
            alarmTime: row.alarmTime ?? "",
            sleepDuration: row.sleepDuration ?? "",
        };
    }
}