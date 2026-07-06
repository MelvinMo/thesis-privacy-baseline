import { Router, Request, Response } from 'express';
import { JournalData } from '../../constants/types/Journal';
import verifyToken from '../../middleware/auth';
import { RequestHandler } from 'express';
import { FirestoreJournalRepository } from '../../repositories/firestore/FirestoreJournalRepository';
import { JournalRepository } from '../../repositories/JournalRepository';

const router = Router();
const journalRepository : JournalRepository = new FirestoreJournalRepository();

/*
	Route to get all journal entries for the authenticated user.
	Example URL: http://{baseURL}/api/phi/journal/

	Returns an array of all journal entries belonging to the authenticated user.
	Returns a 200 status code on success with the journal entries array.
	Returns a 401 status code if user is not authenticated.
	Returns a 500 status code if there is an error retrieving the journal entries.
	
	Example Response:
	{
		"journals": [
			{
				"journalId": "journal123",
				"userId": "user123",
				"date": "2025-08-21",
				"bedtime": "10:30 PM",
				"alarmTime": "7:00 AM",
				"sleepDuration": "8.5 hours",
				"diaryEntry": "Had a good night's sleep",
				"sleepNotes": ["Caffeine", "Stress"]
			},
			// ... more journal entries
		]
	}
*/
router.get('/', verifyToken as RequestHandler, async (req: Request, res: Response) => {
    try {
        const userID = req.userId;

        if (!userID) {
            res.status(401).json({ message: 'User not authenticated.' });
            return;
        }

        const journals = await journalRepository.getJournalsByUserId(userID);
        res.status(200).json({ journals });
    } catch (error: any) {
        console.error('Error fetching journal entries:', error);
        res.status(500).json({ message: 'Failed to retrieve journal entries.', error: error.message });
    }
});

/*
	Route to get a specific journal entry by journalId for the authenticated user.
	Example URL: http://{baseURL}/api/phi/journal/journal123
	
	Returns the specific journal entry if found and belongs to the authenticated user.
	Returns a 200 status code on success with the journal entry.
	Returns a 401 status code if user is not authenticated.
	Returns a 404 status code if journal entry is not found or user is not authorized to access it.
	Returns a 500 status code if there is an error retrieving the journal entry.
	
	Example Response:
	{
		"journal": {
			"journalId": "journal123",
			"userId": "user123",
			"date": "2025-08-21",
			"bedtime": "10:00 PM",
			"alarmTime": "7:00 AM",
			"sleepDuration": "9 hours",
			"diaryEntry": "Had a good night's sleep",
			"sleepNotes": ["Caffeine", "Stress"]
		}
	}
*/
router.get('/:journalId', verifyToken as RequestHandler, async (req: Request, res: Response) => {
    try {
        const userID = req.userId;
        const { journalId } = req.params;
        if (!userID) {
            res.status(401).json({ message: 'User not authenticated.' });
            return;
        }

        const journal = await journalRepository.getJournalById(userID, journalId);

        if (!journal) {
            res.status(404).json({ message: 'Journal entry not found or unauthorized.' });
            return;
        }
        res.status(200).json({ journal });
    } catch (error: any) {
        console.error(`Error fetching journal entry ${req.params.journalId}:`, error);
        res.status(500).json({ message: 'Failed to retrieve journal entry.', error: error.message });
    }
});

/*
	Route to create or update a journal entry for a specific date.
	Example URL: http://{baseURL}/api/phi/journal/2025-08-21
	Example Request Body:
	{
		"bedtime": "10:30 PM",
		"alarmTime": "7:00 AM",
		"sleepDuration": "8.5 hours",
		"diaryEntry": "Had a good night's sleep",
		"sleepNotes": ["Caffeine", "Stress"]
	}
	
	Behavior:
	- If a journal entry exists for the given date, it will be updated with the provided data
	- If no journal entry exists for the date, a new one will be created
	- The date parameter in the URL should be in YYYY-MM-DD format
	- Only the fields provided in the request body will be updated (partial update)
	
	Returns a 200 status code on successful creation or update with the journal entry.
	Returns a 400 status code if the date parameter is missing.
	Returns a 401 status code if user is not authenticated.
	Returns a 500 status code if there is an error creating/updating the journal entry.
*/
router.put('/:date', verifyToken as RequestHandler, async (req: Request, res: Response) => {
    try {
        const userID = req.userId;
        const { date } = req.params; // Get date from URL parameters
        const updatedData: Partial<Omit<JournalData, 'journalId' | 'userId'>> = req.body;

        if (!userID) {
            res.status(401).json({ message: 'User not authenticated.' });
            return;
        }

        if (!date) {
            res.status(400).json({ message: 'Date parameter is required.' });
            return;
        }

        const journal = await journalRepository.editJournal(userID, date, updatedData);

        if (!journal) {
            res.status(500).json({ message: 'Failed to process journal entry (create/update).' });
            return;
        }
        res.status(200).json({ journal });

    } catch (error: any) {
        console.error(`Error editing journal entry for date ${req.params.date}:`, error);
        res.status(500).json({ message: 'Failed to edit journal entry.', error: error.message });
    }
});

/*
	Route to get a journal entry by date for the authenticated user.
	Example URL: http://{baseURL}/api/phi/journal/by-date/2025-08-21
	
	Returns the journal entry for the specified date if it exists.
	The date parameter should be in YYYY-MM-DD format.
	Returns a 200 status code on success with the journal entry (or null if no entry exists for that date).
	Returns a 401 status code if user is not authenticated.
	Returns a 500 status code if there is an error retrieving the journal entry.
	
	Example Response:
	{
		"journal": {
			"journalId": "journal123",
			"userId": "user123",
			"date": "2025-08-21",
			"bedtime": "10:30 PM",
			"alarmTime": "7:00 AM",
			"sleepDuration": "8.5 hours",
			"diaryEntry": "Had a good night's sleep",
			"sleepNotes": ["Caffeine", "Stress"]
		}
	}
	
	Or if no journal exists for that date:
	{
		"journal": null
	}
*/
router.get('/by-date/:date', verifyToken as RequestHandler, async (req: Request, res: Response) => {
    try {
        const userID = req.userId;
        const { date } = req.params; // Date in YYYY-MM-DD format

        if (!userID) {
            res.status(401).json({ message: 'User not authenticated.' });
            return;
        }

        const journal = await journalRepository.getJournalByDate(userID, date);

        res.status(200).json({ journal });
    } catch (error: any) {
        console.error(`Error fetching journal for user ${req.userId} on date ${req.params.date}:`, error);
        res.status(500).json({ message: 'Failed to retrieve journal by date.', error: error.message });
    }
});

/*
	Route to delete a specific journal entry by journalId for the authenticated user.
	Example URL: http://{baseURL}/api/phi/journal/journal123
	
	Permanently removes the journal entry if it exists and belongs to the authenticated user.
	Returns a 200 status code on successful deletion.
	Returns a 401 status code if user is not authenticated.
	Returns a 404 status code if journal entry is not found or user is not authorized to delete it.
	Returns a 500 status code if there is an error deleting the journal entry.
*/
router.delete('/:journalId', verifyToken as RequestHandler, async (req: Request, res: Response) => {
    try {
        const userID = req.userId;
        const { journalId } = req.params;
        if (!userID) {
            res.status(401).json({ message: 'User not authenticated.' });
            return;
        }

        const deleted = await journalRepository.deleteJournal(userID, journalId);

        if (!deleted) {
            res.status(404).json({ message: 'Journal entry not found or unauthorized to delete.' });
            return;
        }
        res.status(200).json({ message: 'Journal entry deleted successfully.' });

    } catch (error: any) {
        console.error(`Error deleting journal entry ${req.params.journalId}:`, error);
        res.status(500).json({ message: 'Failed to delete journal entry.', error: error.message });
    }
});

export default router;