import { Router, Request, Response, RequestHandler } from 'express';
import verifyToken from '../../middleware/auth';
import { GeminiLLMService } from '../../llm/GeminiLLMService';
import { createPrivacyAnalysisPrompt } from '../../llm/prompts';

const router = Router();

/*
	Route to analyze privacy risks and regulatory compliance for data collection events using AI.
	Example URL: http://{baseURL}/api/transparency/ai/
	Example Request Body:
	{
		"transparencyEvent": {
			"dataType": "SENSOR_AUDIO",
			"source": "MICROPHONE",
			"sensorType": "audio",
			"samplingRate": 44100,
			"duration": 300,
			"encryptionMethod": "AES_256",
			"storageLocation": "GOOGLE_CLOUD",
			"endpoint": "/api/sensor-data",
			"protocol": "HTTPS",
			"backgroundMode": true
		},
		"privacyPolicy": "privacy policy text here...",
		"userConsentPreferences": {
			"accelerometerEnabled": true,
			"lightSensorEnabled": true,
			"microphoneEnabled": true,
			"cloudStorageEnabled": true,
			"agreedToPrivacyPolicy": true,
			"analyticsEnabled": false,
			"marketingCommunications": false,
			"notificationsEnabled": true
		},
		"regulationFrameworks": ["PIPEDA", "GDPR"],
		"pipedaRegulations": "Specific PIPEDA regulation text to check against..."
	}
	
	This route uses AI (Gemini LLM) to analyze transparency events and provide:
	- Privacy risk assessment (LOW, MEDIUM, HIGH)
	- Regulatory compliance status for specified frameworks (PIPEDA, PHIPA, GDPR)
	- AI-generated explanations covering data collection rationale, storage, access, and privacy violations
	- Links to relevant privacy policy sections and regulatory principles
	
	The AI analysis considers the user's consent preferences and checks compliance against specified regulatory frameworks.
	
	Returns a 200 status code on successful analysis with the updated transparency event containing AI analysis.
	Returns a 400 status code if required fields are missing from the request body.
	Returns a 401 status code if user is not authenticated.
	Returns a 500 status code if there is an error during the AI analysis process.
	
	Example Response:
	{
		"transparencyEvent": {
			"dataType": "SENSOR_AUDIO",
			"source": "MICROPHONE",
			"sensorType": "audio",
			"samplingRate": 44100,
			"duration": 300,
			"encryptionMethod": "AES_256",
			"storageLocation": "GOOGLE_CLOUD",
			"endpoint": "/api/sensor-data",
			"protocol": "HTTPS",
			"backgroundMode": true,
			"privacyRisk": "MEDIUM",
			"regulatoryCompliance": {
				"framework": "PIPEDA",
				"compliant": true,
				"issues": "",
				"relevantSections": ["Principle 1", "Principle 4"]
			},
			"aiExplanation": {
				"why": "Audio data is collected to analyze sleep disturbances and snoring patterns to improve your sleep quality insights.",
				"storage": "Data is encrypted using AES-256 and stored securely in Google Cloud with access controls.",
				"access": "Only you have access to this data through the app. No third parties can access your audio recordings.",
				"privacyExplanation": "Audio recordings present medium privacy risk as they could potentially contain identifiable information. PIPEDA requires explicit consent for audio collection, which you have provided. The data is properly secured and used only for stated sleep analysis purposes.",
				"privacyPolicyLink": ["audioCollection", "dataStorage"],
				"regulationLink": ["principle1", "principle4", "principle7"]
			}
		}
	}
*/
router.post('/', verifyToken as RequestHandler, async (req: Request, res: Response) => {
	try {

		const { transparencyEvent, privacyPolicy, userConsentPreferences, regulationFrameworks, pipedaRegulations } = req.body;

		// Basic validation of the incoming data
		if (!transparencyEvent || !privacyPolicy || !userConsentPreferences || !regulationFrameworks) {
			res.status(400).json({ message: 'Missing required fields in the request body.' });
			return;
		}

		const llmService = new GeminiLLMService();

		const prompt = createPrivacyAnalysisPrompt(
			transparencyEvent,
			privacyPolicy,
			userConsentPreferences,
			regulationFrameworks,
			pipedaRegulations
		);

		// Call the LLM service to analyze privacy risks
		const updatedTransparencyEvent = await llmService.analyzePrivacyRisks(
			transparencyEvent,
			prompt
		);

		res.status(200).json({ transparencyEvent: updatedTransparencyEvent });

	} catch (error: any) {
		console.error('Error analyzing privacy risks:', error);
		if (error.message.includes('Authentication token missing')) {
			res.status(401).json({ message: error.message });
			return;
		}
		res.status(500).json({ message: 'Internal server error during privacy risk analysis.', error: error.message });
	}
});

export default router;