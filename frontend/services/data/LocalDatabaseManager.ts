import * as SQLite from 'expo-sqlite';

// This interface is for deletions and insertions, to let the client know if the operation was successful
interface QueryResult {
    rowsAffected?: number;
    insertId?: number;
}

/**
 * LocalDatabaseManager is a singleton class that manages the SQLite database connection
 * and provides methods to execute SQL queries.
 */
export class LocalDatabaseManager {
    private db: SQLite.SQLiteDatabase | null = null;
    private dbName = 'sleeptracker_data.db'; 

    // SQL statements to create tables if they don't exist
    private CREATE_JOURNAL_TABLE_SQL = `
        CREATE TABLE IF NOT EXISTS journals (
            journalId TEXT PRIMARY KEY NOT NULL,
            userId TEXT NOT NULL,
            date TEXT NOT NULL,           -- ISO date string
            bedtime TEXT,
            alarmTime TEXT,
            sleepDuration TEXT,
            diaryEntry TEXT,
            sleepNotes TEXT,              -- Stored as JSON string
            createdAt TEXT NOT NULL DEFAULT (STRFTIME('%Y-%m-%dT%H:%M:%fZ', 'NOW')) -- Add a creation timestamp
        );
    `;

    // ALl sensor data is stored in a single table, with nullable fields for each sensor type
    // This allows us to store different sensor data types in the same table without needing multiple tables (for simplicity)
    private CREATE_SENSOR_DATA_TABLE_SQL = `
        CREATE TABLE IF NOT EXISTS sensor_data (
            id TEXT PRIMARY KEY NOT NULL,
            userId TEXT NOT NULL,
            timestamp INTEGER NOT NULL,  -- Unix timestamp in milliseconds
            date TEXT NOT NULL,          -- YYYY-MM-DD format
            sensorType TEXT NOT NULL,    -- 'audio', 'light', 'accelerometer'
            
            -- Audio Sensor Data specific fields (nullable)
            averageDecibels TEXT,
            peakDecibels TEXT,
            frequencyBands TEXT,         -- Stored as JSON string (e.g., '{ "low": 0.5, "mid": 0.3, "high": 0.2 }')
            audioClipUri TEXT,
            snoreDetected INTEGER,       -- Boolean (0 for false, 1 for true)
            ambientNoiseLevel TEXT,      -- 'quiet', 'moderate', 'loud', 'very_loud'

            -- Light Sensor Data specific fields (nullable)
            illuminance TEXT,            -- Lux value
            lightLevel TEXT,             -- 'dark', 'dim', 'moderate', 'bright'

            -- Accelerometer Sensor Data specific fields (nullable)
            x TEXT,
            y TEXT,
            z TEXT,
            magnitude TEXT,
            movementIntensity TEXT,      -- 'still', 'light', 'moderate', 'active'
            
            createdAt TEXT NOT NULL DEFAULT (STRFTIME('%Y-%m-%dT%H:%M:%fZ', 'NOW')) -- Record creation timestamp
        );
    `;

    // Private constructor for Singleton pattern - we only want one database manager instance
    private constructor() {}

    private static instance: LocalDatabaseManager;

    public static getInstance(): LocalDatabaseManager {
        if (!LocalDatabaseManager.instance) {
            LocalDatabaseManager.instance = new LocalDatabaseManager();
        }
        return LocalDatabaseManager.instance;
    }

    public async openDatabase(): Promise<void> {
        if (this.db) {
            console.log("Database already open.");
            return;
        }
        try {
            this.db = await SQLite.openDatabaseAsync(this.dbName);
            console.log("Database opened successfully.");
            await this.createTables();
        } catch (error) {
            console.error("Error opening or creating database:", error);
            this.db = null;
            throw error;
        }
    }

    private async createTables(): Promise<void> {
        if (!this.db) {
            throw new Error("Database not open. Call openDatabase() first.");
        }
        try {
            await this.db.execAsync(this.CREATE_JOURNAL_TABLE_SQL);
            await this.db.execAsync(this.CREATE_SENSOR_DATA_TABLE_SQL);
            console.log("All tables created or already exist.");
        } catch (error) {
            console.error("Error creating tables:", error);
            throw error;
        }
    }

    /**
     * Executes a SQL query. Use for INSERT, UPDATE, DELETE.
     */
    public async executeSql(sql: string, params: any[] = []): Promise<QueryResult> {
        if (!this.db) {
            await this.openDatabase(); // Ensure database is open
        }
        try {
            const statement = await this.db!.prepareAsync(sql);
            const result = await statement.executeAsync(params);
            await statement.finalizeAsync();

            return {
                rowsAffected: result.changes,
                insertId: result.lastInsertRowId
            };
        } catch (error) {
            console.error(`Error executing SQL: ${sql} with params: ${JSON.stringify(params)}`, error);
            throw error;
        }
    }

    /**
     * Executes a SELECT query and returns all rows.
     */
    public async getAll<T>(sql: string, params: any[] = []): Promise<T[]> {
        if (!this.db) {
            await this.openDatabase();
        }
        try {
            const statement = await this.db!.prepareAsync(sql);
            const result = await statement.executeAsync(params);
            const rows = await result.getAllAsync();
            await statement.finalizeAsync();
            
            return rows as T[];
        } catch (error) {
            console.error(`Error getting all rows for SQL: ${sql} with params: ${JSON.stringify(params)}`, error);
            throw error;
        }
    }

    /**
     * Executes a SELECT query and returns a single row.
     */
    public async getOne<T>(sql: string, params: any[] = []): Promise<T | null> {
        if (!this.db) {
            await this.openDatabase();
        }
        try {
            const statement = await this.db!.prepareAsync(sql);
            const result = await statement.executeAsync(params);
            const row = await result.getFirstAsync();
            await statement.finalizeAsync();
            
            return row ? (row as T) : null;
        } catch (error) {
            console.error(`Error getting one row for SQL: ${sql} with params: ${JSON.stringify(params)}`, error);
            throw error;
        }
    }

    /**
     * This is an internal helper function to delete all tables when changes are made to the schemas
     * Use it in the openDatabase function to delete tables when needed. 
     */
    private async deleteAllTables(): Promise<void>{
        const DELETE_SENSOR_DATA_TABLE = `DROP TABLE IF EXISTS sensor_data;`;
        const DELETE_JOURNAL_TABLE = `DROP TABLE IF EXISTS journals;`;
        if (!this.db) {
            throw new Error("Database not open. Call openDatabase() first.");
        }
        try {
            await this.db.execAsync(DELETE_JOURNAL_TABLE);
            await this.db.execAsync(DELETE_SENSOR_DATA_TABLE);
        } catch (error) {
            console.error("Error deleting tables:", error);
            throw error;
        }
    }
}