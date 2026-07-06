import { Router, Request, Response, RequestHandler } from 'express';
import { GeneralSleepData } from '../../constants/types/GeneralSleepData'; 
import verifyToken from '../../middleware/auth'; 
import { FirestoreSleepDataRepository } from '../../repositories/firestore/FirestoreSleepDataRepository';
import { SleepDataRepository } from '../../repositories/SleepDataRepository';

const router = Router();
const sleepDataRepository : SleepDataRepository = new FirestoreSleepDataRepository();

/*
	Route to create or update general sleep data for a user.
	Example URL: http://{baseURL}/api/phi/generalSleep/
	Example Request Body:
	{
		"currentSleepDuration": "7-8 hours",
		"snoring": "rarely",
		"tirednessFrequency": "sometimes",
		"daytimeSleepiness": "mild"
	}
	
	Behavior:
	- If sleep data already exists for the user, it will update the existing record
	- Only non-empty string fields from the request will overwrite existing data
	- At least one field (currentSleepDuration, snoring, tirednessFrequency, daytimeSleepiness) must be provided
	
	Returns a 201 status code on successful creation with the created sleep data.
	Returns a 200 status code on successful update with the updated sleep data.
	Returns a 400 status code if no required fields are provided.
	Returns a 401 status code if user is not authenticated.
	Returns a 409 status code if there's a conflict (sleep data already exists error from repository).
	Returns a 500 status code if there is an error creating/updating the sleep data or update fails.
*/
router.post('/', verifyToken as RequestHandler, async (req: Request, res: Response) => {
    try {
        if (!req.userId) {
            res.status(401).json({ message: 'User not authenticated.' });
            return;
        }

        const { currentSleepDuration, snoring, tirednessFrequency, daytimeSleepiness } = req.body;

        // Basic validation - need at least one field to create sleep data
        if (!currentSleepDuration && !snoring && !tirednessFrequency && !daytimeSleepiness) {
            res.status(400).json({ message: 'Missing required general sleep data fields.' });
            return;
        }

        const newSleepData: GeneralSleepData = req.body;

        const existingSleepData = await sleepDataRepository.getSleepDataById(req.userId);
        if (existingSleepData) {
            // update existing sleep data instead of creating new one
            // use the userId from the existing data
            const dataToUpdate: GeneralSleepData = {
                userId: existingSleepData.userId,
                currentSleepDuration: newSleepData.currentSleepDuration === '' ? existingSleepData.currentSleepDuration : newSleepData.currentSleepDuration,
                snoring: newSleepData.snoring === '' ? existingSleepData.snoring : newSleepData.snoring,
                tirednessFrequency: newSleepData.tirednessFrequency === '' ? existingSleepData.tirednessFrequency : newSleepData.tirednessFrequency,
                daytimeSleepiness: newSleepData.daytimeSleepiness === '' ? existingSleepData.daytimeSleepiness : newSleepData.daytimeSleepiness,
            }
            const sleepData = await sleepDataRepository.updateSleepData(req.userId, dataToUpdate);
            if (!sleepData) {
                res.status(500).json({ message: 'Failed to update general sleep data.' });
                return;
            }
            res.status(200).json({ message: 'General sleep data updated successfully', sleepData: sleepData });
        } else {
            const createdSleepData = await sleepDataRepository.createSleepData(newSleepData);
            res.status(201).json({ message: 'General sleep data created successfully', sleepData: createdSleepData });
        }
    } catch (error: any) {
        // Specifically check for the 'already exists' error from the repository
        if (error.message.includes('Sleep data already exists for user')) {
            res.status(409).json({ message: error.message }); // 409 Conflict
            return;
        }
        console.error('Error creating general sleep data:', error);
        res.status(500).json({ message: 'Failed to create general sleep data.', error: error.message });
    }
});

/*
	Route to get general sleep data for the authenticated user.
	Example URL: http://{baseURL}/api/phi/generalSleep/
	
	Example Response:
	{
		"sleepData": {
			"userId": "user123",
			"currentSleepDuration": "7-8 hours",
			"snoring": "rarely",
			"tirednessFrequency": "sometimes",
			"daytimeSleepiness": "mild"
		}
	}

  Returns the user's sleep data including userId, currentSleepDuration, snoring, tirednessFrequency, and daytimeSleepiness.
	Returns a 200 status code on success with the sleep data.
	Returns a 401 status code if user is not authenticated.
	Returns a 404 status code if no sleep data is found for the user.
	Returns a 500 status code if there is an error retrieving the sleep data.
*/
router.get('/', verifyToken as RequestHandler, async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ message: 'User not authenticated.' });
            return;
        }

        const sleepData = await sleepDataRepository.getSleepDataById(userId);

        if (!sleepData) {
            res.status(404).json({ message: 'General sleep data not found for this user.' });
            return;
        }
        res.status(200).json({ sleepData });
    } catch (error: any) {
        console.error(`Error fetching general sleep data for user ${req.userId}:`, error);
        res.status(500).json({ message: 'Failed to retrieve general sleep data.', error: error.message });
    }
});

/*
	Route to delete general sleep data for the authenticated user.
	Example URL: http://{baseURL}/api/phi/generalSleep/

	Permanently removes all sleep data associated with the authenticated user.
	Returns a 200 status code on successful deletion.
	Returns a 401 status code if user is not authenticated.
	Returns a 404 status code if no sleep data is found or deletion fails.
	Returns a 500 status code if there is an error deleting the sleep data.
*/
router.delete('/', verifyToken as RequestHandler, async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ message: 'User not authenticated.' });
            return;
        }

        const deleted = await sleepDataRepository.deleteSleepData(userId);

        if (!deleted) {
            res.status(404).json({ message: 'General sleep data not found or failed to delete.' });
            return;
        }
        res.status(200).json({ message: 'General sleep data deleted successfully.' });

    } catch (error: any) {
        console.error(`Error deleting general sleep data for user ${req.userId}:`, error);
        res.status(500).json({ message: 'Failed to delete general sleep data.', error: error.message });
    }
});

export default router;