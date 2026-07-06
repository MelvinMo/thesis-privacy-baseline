import { Router, Request, Response } from 'express';
import { SensorData } from '../../constants/types/SensorData';
import verifyToken from '../../middleware/auth';
import { RequestHandler } from 'express';
import { FirestoreSensorDataRepository } from '../../repositories/firestore/FirestoreSensorDataRepository';
import { SensorDataRepository } from '../../repositories/SensorDataRepository';

const router = Router();
const sensorDataRepository: SensorDataRepository = new FirestoreSensorDataRepository();

/*
	Route to create a new sensor reading for the authenticated user.
	Example URL: http://{baseURL}/api/phi/sensor-data/
	Example Request Body (Audio Sensor):
	{
		"timestamp": "1692648000000",
		"date": "2025-08-21",
		"sensorType": "audio",
		"averageDecibels": "35.5",
		"peakDecibels": "78.2",
		"frequencyBands": {
			"low": "12.3",
			"mid": "45.6",
			"high": "8.9"
		},
		"audioClipUri": "path/to/audio/clip.wav",
		"snoreDetected": true,
		"ambientNoiseLevel": "moderate"
	}
	
	Example Request Body (Light Sensor):
	{
		"timestamp": "1692648000000",
		"date": "2025-08-21",
		"sensorType": "light",
		"illuminance": "150.5",
		"lightLevel": "moderate"
	}
	
	Example Request Body (Accelerometer Sensor):
	{
		"timestamp": "1692648000000",
		"date": "2025-08-21",
		"sensorType": "accelerometer",
		"x": "0.5",
		"y": "1.2",
		"z": "9.8",
		"magnitude": "9.89",
		"movementIntensity": "light"
	}
	
	The sensor data structure varies based on the sensorType field. All sensor readings require timestamp, date, and sensorType.
	Returns a 201 status code on successful creation with the created sensor reading.
	Returns a 400 status code if required fields (timestamp, date, sensorType) are missing.
	Returns a 500 status code if there is an error creating the sensor reading.
*/
router.post('/', verifyToken as RequestHandler, async (req: Request, res: Response) => {
    try {
        const userId = req.userId; 
        const { timestamp, date, sensorType, ...sensorSpecificData } = req.body;

        // Basic validation for common required fields
        if (!userId || !timestamp || !date || !sensorType) {
            res.status(400).json({ message: 'Missing required fields: timestamp, date, and sensorType.' });
            return;
        }

        // Construct the sensor data object based on sensorType
        const newSensorData: Omit<SensorData, 'id'> = req.body;

        const createdSensorReading = await sensorDataRepository.createSensorReading(newSensorData);
        res.status(201).json({ message: 'Sensor reading created successfully', sensorReading: createdSensorReading });

    } catch (error: any) {
        console.error('Error creating sensor reading:', error);
        res.status(500).json({ message: 'Failed to create sensor reading.', error: error.message });
    }
});

/*
	Route to get all sensor readings for the authenticated user.
	Example URL: http://{baseURL}/api/phi/sensor-data/
	
	Returns an array of all sensor readings belonging to the authenticated user across all sensor types.
	Returns a 200 status code on success with the sensor readings array.
	Returns a 401 status code if user is not authenticated.
	Returns a 500 status code if there is an error retrieving the sensor readings.
	
	Example Response:
	{
		"sensorReadings": [
			{
				"id": "sensor123",
				"userId": "user123",
				"timestamp": "1692648000000",
				"date": "2025-08-21",
				"sensorType": "audio",
				"averageDecibels": "35.5",
				"peakDecibels": "78.2",
				"frequencyBands": {
					"low": "12.3",
					"mid": "45.6",
					"high": "8.9"
				},
				"snoreDetected": true,
				"ambientNoiseLevel": "moderate"
			},
			// ... more sensor readings
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

        const sensorReadings = await sensorDataRepository.getSensorReadingsByUserId(userID);
        res.status(200).json({ sensorReadings });
    } catch (error: any) {
        console.error('Error fetching sensor readings:', error);
        res.status(500).json({ message: 'Failed to retrieve sensor readings.', error: error.message });
    }
});

/*
	Route to get a specific sensor reading by ID for the authenticated user.
	Example URL: http://{baseURL}/api/phi/sensor-data/sensor123
	
	Returns the specific sensor reading if found and belongs to the authenticated user.
	Returns a 200 status code on success with the sensor reading.
	Returns a 401 status code if user is not authenticated.
	Returns a 404 status code if sensor reading is not found or user is not authorized to access it.
	Returns a 500 status code if there is an error retrieving the sensor reading.
	
	Example Response:
	{
		"sensorReading": {
			"id": "sensor123",
			"userId": "user123",
			"timestamp": "1692648000000",
			"date": "2025-08-21",
			"sensorType": "light",
			"illuminance": "150.5",
			"lightLevel": "moderate"
		}
	}
*/
router.get('/:id', verifyToken as RequestHandler, async (req: Request, res: Response) => {
    try {
        const userID = req.userId;
        const { id } = req.params; 

        if (!userID) {
            res.status(401).json({ message: 'User not authenticated.' });
            return;
        }

        const sensorReading = await sensorDataRepository.getSensorReadingById(userID, id);

        if (!sensorReading) {
            res.status(404).json({ message: 'Sensor reading not found or unauthorized.' });
            return;
        }
        res.status(200).json({ sensorReading });
    } catch (error: any) {
        console.error(`Error fetching sensor reading ${req.params.id}:`, error);
        res.status(500).json({ message: 'Failed to retrieve sensor reading.', error: error.message });
    }
});

/*
	Route to get all sensor readings by date for the authenticated user.
	Example URL: http://{baseURL}/api/phi/sensor-data/by-date/2025-08-21
	
	Returns all sensor readings for the specified date across all sensor types.
	The date parameter should be in YYYY-MM-DD format.
	Returns a 200 status code on success with the sensor readings array (empty array if no readings exist for that date).
	Returns a 401 status code if user is not authenticated.
	Returns a 500 status code if there is an error retrieving the sensor readings.
	
	Example Response:
	{
		"sensorReadings": [
			{
				"id": "sensor123",
				"userId": "user123",
				"timestamp": "1692648000000",
				"date": "2025-08-21",
				"sensorType": "accelerometer",
				"x": "0.5",
				"y": "1.2",
				"z": "9.8",
				"magnitude": "9.89",
				"movementIntensity": "light"
			},
			// ... more sensor readings for that date
		]
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

        const sensorReadings = await sensorDataRepository.getSensorReadingsByDate(userID, date);

        res.status(200).json({ sensorReadings });
    } catch (error: any) {
        console.error(`Error fetching sensor reading for user ${req.userId} on date ${req.params.date}:`, error);
        res.status(500).json({ message: 'Failed to retrieve sensor reading by date.', error: error.message });
    }
});

/*
	Route to delete a specific sensor reading by ID for the authenticated user.
	Example URL: http://{baseURL}/api/phi/sensor-data/sensor123
	
	Permanently removes the sensor reading if it exists and belongs to the authenticated user.
	Returns a 204 status code on successful deletion with no response body.
	Returns a 401 status code if user is not authenticated.
	Returns a 404 status code if sensor reading is not found or user is not authorized to delete it.
	Returns a 500 status code if there is an error deleting the sensor reading.
*/
router.delete('/:id', verifyToken as RequestHandler, async (req: Request, res: Response) => {
    try {
        const userID = req.userId;
        const { id } = req.params;

        if (!userID) {
            res.status(401).json({ message: 'User not authenticated.' });
            return;
        }

        const deleted = await sensorDataRepository.deleteSensorReading(userID, id);

        if (!deleted) {
            res.status(404).json({ message: 'Sensor reading not found or unauthorized to delete.' });
            return;
        }
        // No content (204) for successful deletion
        res.status(204).send();

    } catch (error: any) {
        console.error(`Error deleting sensor reading ${req.params.id}:`, error);
        res.status(500).json({ message: 'Failed to delete sensor reading.', error: error.message });
    }
});

export default router;