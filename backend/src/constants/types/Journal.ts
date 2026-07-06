export type JournalData = {
	date: string; // ISO date string
	userId: string;
	journalId: string;
	bedtime: string;
	alarmTime: string;
	sleepDuration: string;
	diaryEntry: string;
	sleepNotes: SleepNote[];
}

export type SleepNote = "Pain" | "Stress" | "Anxiety" | "Medication" | "Caffeine" | "Alcohol" | "Warm Bath" | "Heavy Meal";