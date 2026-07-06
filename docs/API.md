# Sleep Tracker API Documentation

This documentation covers the RESTful API endpoints available in the Sleep Tracker backend service.

## Base URL

All API endpoints are prefixed with: `http://{baseURL}/api`

## Authentication

Most endpoints require authentication using the `verifyToken` middleware. Include your authentication token in the request headers as below:

```typescript
    headers: {
        "Authorization": `Bearer ${idToken}`,
    },

```

**Note:** It is critical to send the idToken in the header for authentication because the userId can be spoofed whereas the idToken is signed by Firebase and can be verified by the backend.

## Table of Contents

- [Transparency](#transparency)
- [Authentication](#authentication)
- [Sensor Data](#sensor-data)
- [Journal](#journal)
- [General Sleep Data](#general-sleep-data)
- [Types](#types)

---

## Transparency

### Analyze Privacy Risks

Uses AI to analyze privacy risks and regulatory compliance for data collection events.

**Endpoint:** `POST /transparency/ai/`

**Authentication:** Required

**Content-Type:** `application/json`

**Request Body:**

```json
{
  "transparencyEvent": {
    "dataType": "SENSOR_AUDIO",
    "source": "MICROPHONE",
    "sensorType": "audio",
    "samplingRate": 44100,
    "duration": 300,
    "encryptionMethod": "AES_256",
    "storageLocation": "GOOGLE_CLOUD",
    "endpoint": "/api/phi/sensor-data",
    "protocol": "HTTPS",
    "backgroundMode": true
  },
  "privacyPolicy": "Privacy policy text here...",
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
```

This route uses AI (Gemini LLM) to analyze transparency events and provide:

- Privacy risk assessment (LOW, MEDIUM, HIGH)
- Regulatory compliance status for specified frameworks (PIPEDA, PHIPA, GDPR)
- AI-generated explanations covering data collection rationale, storage, access, and privacy violations
- Links to relevant privacy policy sections and regulatory principles

**Responses:**

- **Success Response (200 OK):**

  ```json
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
  ```

- **Error Response (400 Bad Request):**

  ```json
  {
    "message": "Missing required fields in the request body."
  }
  ```

- **Authentication Error (401 Unauthorized):**

  ```json
  {
    "message": "Authentication token missing"
  }
  ```

- **Server Error Response (500 Internal Server Error):**
  ```json
  {
    "message": "Internal server error during privacy risk analysis.",
    "error": "Error details..."
  }
  ```

---

## Authentication

### Login

Authenticates a user and generates a JWT token.

**Endpoint:** `POST /auth/login`

**Authentication:** Not Required

**Content-Type:** `application/json`

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "userpassword123"
}
```

Validates user credentials and returns a JWT token for authenticated sessions. The token expires in 20 days and should be included in the Authorization header for protected routes. For security reasons, returns "Invalid credentials" for both non-existent users and incorrect passwords.

**Responses:**

- **Success Response (200 OK):**

  ```json
  {
    "message": "Logged in Successfully",
    "user": {
      "userId": "user123",
      "firstName": "John",
      "lastName": "Doe",
      "email": "user@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

- **Error Response (400 Bad Request):**

  ```json
  {
    "message": "Email and password are required"
  }
  ```

- **Invalid Credentials (400 Bad Request):**

  ```json
  {
    "message": "Invalid credentials"
  }
  ```

- **Server Error Response (500 Internal Server Error):**
  ```json
  {
    "message": "Something went wrong"
  }
  ```

### Register

Creates a new user account.

**Endpoint:** `POST /auth/register`

**Authentication:** Not Required

**Content-Type:** `application/json`

**Request Body:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "user@example.com",
  "password": "userpassword123"
}
```

Creates a new user account with hashed password and returns a JWT token for immediate authentication. The password is hashed using bcrypt with a salt rounds of 10 for security. The generated token expires in 20 days and can be used for authenticated requests.

**Responses:**

- **Success Response (201 Created):**

  ```json
  {
    "message": "User registered successfully",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "userId": "user123",
      "firstName": "John",
      "lastName": "Doe",
      "email": "user@example.com"
    }
  }
  ```

- **Error Response (400 Bad Request):**

  ```json
  {
    "message": "All fields (firstName, lastName, email, password) are required."
  }
  ```

- **Conflict Response (409 Conflict):**

  ```json
  {
    "message": "User with this email already exists"
  }
  ```

- **Server Error Response (500 Internal Server Error):**
  ```json
  {
    "message": "Failed to register user.",
    "error": "Error details..."
  }
  ```

---

## Sensor Data

### Create Sensor Reading

Creates a new sensor reading for the authenticated user.

**Endpoint:** `POST /phi/sensor-data/`

**Authentication:** Required

**Content-Type:** `application/json`

**Request Body Examples:**

Audio Sensor:

```json
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
```

Light Sensor:

```json
{
  "timestamp": "1692648000000",
  "date": "2025-08-21",
  "sensorType": "light",
  "illuminance": "150.5",
  "lightLevel": "moderate"
}
```

Accelerometer Sensor:

```json
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
```

The sensor data structure varies based on the sensorType field. All sensor readings require timestamp, date, and sensorType.

**Responses:**

- **Success Response (201 Created):**

  ```json
  {
    "message": "Sensor reading created successfully",
    "sensorReading": {
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
    }
  }
  ```

- **Error Response (400 Bad Request):**

  ```json
  {
    "message": "Missing required fields: timestamp, date, and sensorType."
  }
  ```

- **Server Error Response (500 Internal Server Error):**
  ```json
  {
    "message": "Failed to create sensor reading.",
    "error": "Error details..."
  }
  ```

### Get All Sensor Readings

Retrieves all sensor readings for the authenticated user.

**Endpoint:** `GET /phi/sensor-data/`

**Authentication:** Required

**Responses:**

- **Success Response (200 OK):**

  ```json
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
      }
    ]
  }
  ```

- **Authentication Error (401 Unauthorized):**

  ```json
  {
    "message": "User not authenticated."
  }
  ```

- **Server Error Response (500 Internal Server Error):**
  ```json
  {
    "message": "Failed to retrieve sensor readings.",
    "error": "Error details..."
  }
  ```

### Get Sensor Reading by ID

Retrieves a specific sensor reading by ID for the authenticated user.

**Endpoint:** `GET /sensor-data/:id`

**Authentication:** Required

**URL Parameters:**

| Parameter | Description                  |
| --------- | ---------------------------- |
| `id`      | The ID of the sensor reading |

**Responses:**

- **Success Response (200 OK):**

  ```json
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
  ```

- **Authentication Error (401 Unauthorized):**

  ```json
  {
    "message": "User not authenticated."
  }
  ```

- **Not Found (404 Not Found):**

  ```json
  {
    "message": "Sensor reading not found or unauthorized."
  }
  ```

- **Server Error Response (500 Internal Server Error):**
  ```json
  {
    "message": "Failed to retrieve sensor reading.",
    "error": "Error details..."
  }
  ```

### Get Sensor Readings by Date

Retrieves all sensor readings by date for the authenticated user.

**Endpoint:** `GET /phi/sensor-data/by-date/:date`

**Authentication:** Required

**URL Parameters:**

| Parameter | Description                   |
| --------- | ----------------------------- |
| `date`    | The date in YYYY-MM-DD format |

**Responses:**

- **Success Response (200 OK):**

  ```json
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
      }
    ]
  }
  ```

- **Authentication Error (401 Unauthorized):**

  ```json
  {
    "message": "User not authenticated."
  }
  ```

- **Server Error Response (500 Internal Server Error):**
  ```json
  {
    "message": "Failed to retrieve sensor reading by date.",
    "error": "Error details..."
  }
  ```

### Delete Sensor Reading

Deletes a specific sensor reading by ID for the authenticated user.

**Endpoint:** `DELETE /phi/sensor-data/:id`

**Authentication:** Required

**URL Parameters:**

| Parameter | Description                  |
| --------- | ---------------------------- |
| `id`      | The ID of the sensor reading |

**Responses:**

- **Success Response (204 No Content):**

  No response body.

- **Authentication Error (401 Unauthorized):**

  ```json
  {
    "message": "User not authenticated."
  }
  ```

- **Not Found (404 Not Found):**

  ```json
  {
    "message": "Sensor reading not found or unauthorized to delete."
  }
  ```

- **Server Error Response (500 Internal Server Error):**
  ```json
  {
    "message": "Failed to delete sensor reading.",
    "error": "Error details..."
  }
  ```

---

## Journal

### Get All Journal Entries

Retrieves all journal entries for the authenticated user.

**Endpoint:** `GET /phi/journal/`

**Authentication:** Required

**Responses:**

- **Success Response (200 OK):**

  ```json
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
      }
    ]
  }
  ```

- **Authentication Error (401 Unauthorized):**

  ```json
  {
    "message": "User not authenticated."
  }
  ```

- **Server Error Response (500 Internal Server Error):**
  ```json
  {
    "message": "Failed to retrieve journal entries.",
    "error": "Error details..."
  }
  ```

### Get Journal Entry by ID

Retrieves a specific journal entry by journalId for the authenticated user.

**Endpoint:** `GET /phi/journal/:journalId`

**Authentication:** Required

**URL Parameters:**

| Parameter   | Description                 |
| ----------- | --------------------------- |
| `journalId` | The ID of the journal entry |

**Responses:**

- **Success Response (200 OK):**

  ```json
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
  ```

- **Authentication Error (401 Unauthorized):**

  ```json
  {
    "message": "User not authenticated."
  }
  ```

- **Not Found (404 Not Found):**

  ```json
  {
    "message": "Journal entry not found or unauthorized."
  }
  ```

- **Server Error Response (500 Internal Server Error):**
  ```json
  {
    "message": "Failed to retrieve journal entry.",
    "error": "Error details..."
  }
  ```

### Create or Update Journal Entry by Date

Creates or updates a journal entry for a specific date.

**Endpoint:** `PUT /phi/journal/:date`

**Authentication:** Required

**Content-Type:** `application/json`

**URL Parameters:**

| Parameter | Description                   |
| --------- | ----------------------------- |
| `date`    | The date in YYYY-MM-DD format |

**Request Body:**

```json
{
  "bedtime": "10:30 PM",
  "alarmTime": "7:00 AM",
  "sleepDuration": "8.5 hours",
  "diaryEntry": "Had a good night's sleep",
  "sleepNotes": ["Caffeine", "Stress"]
}
```

Behavior:

- If a journal entry exists for the given date, it will be updated with the provided data
- If no journal entry exists for the date, a new one will be created
- Only the fields provided in the request body will be updated (partial update)

**Responses:**

- **Success Response (200 OK):**

  ```json
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
  ```

- **Error Response (400 Bad Request):**

  ```json
  {
    "message": "Date parameter is required."
  }
  ```

- **Authentication Error (401 Unauthorized):**

  ```json
  {
    "message": "User not authenticated."
  }
  ```

- **Server Error Response (500 Internal Server Error):**
  ```json
  {
    "message": "Failed to edit journal entry.",
    "error": "Error details..."
  }
  ```

### Get Journal Entry by Date

Retrieves a journal entry by date for the authenticated user.

**Endpoint:** `GET /phi/journal/by-date/:date`

**Authentication:** Required

**URL Parameters:**

| Parameter | Description                   |
| --------- | ----------------------------- |
| `date`    | The date in YYYY-MM-DD format |

**Responses:**

- **Success Response (200 OK):**

  ```json
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
  ```

- **Success Response with No Data (200 OK):**

  ```json
  {
    "journal": null
  }
  ```

- **Authentication Error (401 Unauthorized):**

  ```json
  {
    "message": "User not authenticated."
  }
  ```

- **Server Error Response (500 Internal Server Error):**
  ```json
  {
    "message": "Failed to retrieve journal by date.",
    "error": "Error details..."
  }
  ```

### Delete Journal Entry

Deletes a specific journal entry by journalId for the authenticated user.

**Endpoint:** `DELETE /phi/journal/:journalId`

**Authentication:** Required

**URL Parameters:**

| Parameter   | Description                 |
| ----------- | --------------------------- |
| `journalId` | The ID of the journal entry |

**Responses:**

- **Success Response (200 OK):**

  ```json
  {
    "message": "Journal entry deleted successfully."
  }
  ```

- **Authentication Error (401 Unauthorized):**

  ```json
  {
    "message": "User not authenticated."
  }
  ```

- **Not Found (404 Not Found):**

  ```json
  {
    "message": "Journal entry not found or unauthorized to delete."
  }
  ```

- **Server Error Response (500 Internal Server Error):**
  ```json
  {
    "message": "Failed to delete journal entry.",
    "error": "Error details..."
  }
  ```

---

## General Sleep Data

### Create or Update General Sleep Data

Creates or updates general sleep data for the authenticated user.

**Endpoint:** `POST /phi/generalSleep/`

**Authentication:** Required

**Content-Type:** `application/json`

**Request Body:**

```json
{
  "currentSleepDuration": "7-8 hours",
  "snoring": "rarely",
  "tirednessFrequency": "sometimes",
  "daytimeSleepiness": "mild"
}
```

Behavior:

- If sleep data already exists for the user, it will update the existing record
- Only non-empty string fields from the request will overwrite existing data
- At least one field (currentSleepDuration, snoring, tirednessFrequency, daytimeSleepiness) must be provided

**Responses:**

- **Success Response - Created (201 Created):**

  ```json
  {
    "message": "General sleep data created successfully",
    "sleepData": {
      "userId": "user123",
      "currentSleepDuration": "7-8 hours",
      "snoring": "rarely",
      "tirednessFrequency": "sometimes",
      "daytimeSleepiness": "mild"
    }
  }
  ```

- **Success Response - Updated (200 OK):**

  ```json
  {
    "message": "General sleep data updated successfully",
    "sleepData": {
      "userId": "user123",
      "currentSleepDuration": "7-8 hours",
      "snoring": "rarely",
      "tirednessFrequency": "sometimes",
      "daytimeSleepiness": "mild"
    }
  }
  ```

- **Error Response (400 Bad Request):**

  ```json
  {
    "message": "Missing required general sleep data fields."
  }
  ```

- **Authentication Error (401 Unauthorized):**

  ```json
  {
    "message": "User not authenticated."
  }
  ```

- **Conflict Response (409 Conflict):**

  ```json
  {
    "message": "Sleep data already exists for user"
  }
  ```

- **Server Error Response (500 Internal Server Error):**
  ```json
  {
    "message": "Failed to create general sleep data.",
    "error": "Error details..."
  }
  ```

### Get General Sleep Data

Retrieves general sleep data for the authenticated user.

**Endpoint:** `GET /phi/generalSleep/`

**Authentication:** Required

**Responses:**

- **Success Response (200 OK):**

  ```json
  {
    "sleepData": {
      "userId": "user123",
      "currentSleepDuration": "7-8 hours",
      "snoring": "rarely",
      "tirednessFrequency": "sometimes",
      "daytimeSleepiness": "mild"
    }
  }
  ```

- **Authentication Error (401 Unauthorized):**

  ```json
  {
    "message": "User not authenticated."
  }
  ```

- **Not Found (404 Not Found):**

  ```json
  {
    "message": "General sleep data not found for this user."
  }
  ```

- **Server Error Response (500 Internal Server Error):**
  ```json
  {
    "message": "Failed to retrieve general sleep data.",
    "error": "Error details..."
  }
  ```

### Delete General Sleep Data

Deletes general sleep data for the authenticated user.

**Endpoint:** `DELETE /phi/generalSleep/`

**Authentication:** Required

**Responses:**

- **Success Response (200 OK):**

  ```json
  {
    "message": "General sleep data deleted successfully."
  }
  ```

- **Authentication Error (401 Unauthorized):**

  ```json
  {
    "message": "User not authenticated."
  }
  ```

- **Not Found (404 Not Found):**

  ```json
  {
    "message": "General sleep data not found or failed to delete."
  }
  ```

- **Server Error Response (500 Internal Server Error):**
  ```json
  {
    "message": "Failed to delete general sleep data.",
    "error": "Error details..."
  }
  ```

---

## Types

### Transparency

```typescript
/**
 * This is the main type for transparency events in the app.
 * It captures all the necessary information about data collection, processing, and transmission, regulatory compliance, and privacy risks.
 */
interface TransparencyEvent {
  timestamp?: Date;
  dataType: DataType;
  source: DataSource;

  // sensor data collection specific
  sensorType?: string;
  samplingRate?: number;
  duration?: number;

  // Storage specific
  encryptionMethod?: EncryptionMethod;
  storageLocation?: DataDestination;

  // Transmission specific
  endpoint?: string;
  protocol?: "HTTP" | "HTTPS" | "WSS";

  backgroundMode?: boolean; // was this data collected while the app was in the background

  // AI generated explanation of the event
  privacyRisk?: PrivacyRisk; // indicates the level of privacy risk associated with the event
  regulatoryCompliance?: RegulatoryCompliance; // indicates the regulatory compliance status of the event
  aiExplanation?: AIExplanation; // AI generated explanation of the event
}

// this is what is sent to the backend
interface AIPrompt {
  transparencyEvent: TransparencyEvent;
  privacyPolicy: string;
  userConsentPreferences: UserConsentPreferences;
  regulationFrameworks: RegulatoryFramework[]; // list of regulatory frameworks to check against
  pipedaRegulations?: string; // specific PIPEDA regulations to check against

  // Future extension for determining risk levels based on user's risk tolerance
  userRiskTolerance?: any;
}

enum DataType {
  SENSOR_AUDIO = "SENSOR_AUDIO",
  SENSOR_MOTION = "SENSOR_MOTION",
  SENSOR_LIGHT = "SENSOR_LIGHT",
  USER_JOURNAL = "USER_JOURNAL",
  USER_PROFILE = "USER_PROFILE",
  GENERAL_SLEEP = "GENERAL_SLEEP",
  SLEEP_STATISTICS = "SLEEP_STATISTICS",
  DEVICE_INFO = "DEVICE_INFO",
  LOCATION = "LOCATION",
  USAGE_ANALYTICS = "USAGE_ANALYTICS",
}

enum DataSource {
  MICROPHONE = "MICROPHONE",
  ACCELEROMETER = "ACCELEROMETER",
  LIGHT_SENSOR = "LIGHT_SENSOR",
  USER_INPUT = "USER_INPUT",
  DERIVED_DATA = "DERIVED_DATA",
  SYSTEM_INFO = "SYSTEM_INFO",
}

enum DataDestination {
  ASYNC_STORAGE = "ASYNC_STORAGE",
  SECURE_STORE = "SECURE_STORE",
  SQLITE_DB = "SQLITE_DB",
  MEMORY = "MEMORY",
  GOOGLE_CLOUD = "GOOGLE_CLOUD",
  THIRD_PARTY = "THIRD_PARTY",
}

enum EncryptionMethod {
  NONE = "NONE",
  AES_256 = "AES_256",
  JWT = "JWT",
  DEVICE_KEYCHAIN = "DEVICE_KEYCHAIN",
}

enum PrivacyRisk {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

enum RegulatoryFramework {
  // This prototype only focuses on PIPEDA but others are included for future extensibility
  PIPEDA = "PIPEDA",
  PHIPA = "PHIPA",
  GDPR = "GDPR",
}

interface RegulatoryCompliance {
  framework: RegulatoryFramework;
  compliant: boolean;
  issues?: string;
  relevantSections?: string[];
}

interface AIExplanation {
  why: string; // explain in simple terms why this data is being collected and what benefits the user gets
  storage: string; // where is the data stored and how is it protected
  access: string; // who has access to the data
  privacyExplanation: string; // comprehensive explanation covering: (1) privacy risks associated with this data collection, (2) what PIPEDA regulations say about these risks, (3) whether collection complies with regulations, (4) what users should know about regulatory protections
  privacyPolicyLink: string[]; // link to the most relevant privacy policy sections that explains this data collection
  regulationLink: string[]; // link to the most relevant principles of PIPEDA that applies to this data collection
}
```

### Authentication

```typescript
type User = {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};
```

### Journal

```typescript
type JournalData = {
  date: string; // ISO date string
  userId: string;
  journalId: string;
  bedtime: string;
  alarmTime: string;
  sleepDuration: string;
  diaryEntry: string;
  sleepNotes: SleepNote[];
};

type SleepNote =
  | "Pain"
  | "Stress"
  | "Anxiety"
  | "Medication"
  | "Caffeine"
  | "Alcohol"
  | "Warm Bath"
  | "Heavy Meal";
```

### Sensor Data

```typescript
export interface BaseSensorReading {
  id: string;
  userId: string;
  timestamp: string; // Unix timestamp in milliseconds
  date: string; // YYYY-MM-DD format for the sleep date
  sensorType: string;
}

export interface AudioSensorData extends BaseSensorReading {
  sensorType: "audio";
  // Processed audio metrics (to avoid storing massive audio files)
  // For the prototype, we dont actually have to process these metrics
  averageDecibels: string;
  peakDecibels: string;
  frequencyBands: {
    low: string; // 0-250 Hz
    mid: string; // 250-4000 Hz
    high: string; // 4000+ Hz
  };
  // Optional: Store short snippets for snoring detection, I am not sure how we would store these
  audioClipUri?: string; // Reference to file if we store clips
  snoreDetected: boolean;
  ambientNoiseLevel: "quiet" | "moderate" | "loud" | "very_loud";
}

export interface LightSensorData extends BaseSensorReading {
  sensorType: "light";
  illuminance: string; // Lux value
  lightLevel: "dark" | "dim" | "moderate" | "bright";
}

export interface AccelerometerSensorData extends BaseSensorReading {
  sensorType: "accelerometer";
  x: string;
  y: string;
  z: string;
  magnitude: string; // root(x² + y² + z²)
  movementIntensity: "still" | "light" | "moderate" | "active";
}

export type SensorData =
  | AudioSensorData
  | LightSensorData
  | AccelerometerSensorData;
```

### General Sleep Data

```typescript
export type GeneralSleepData = {
  userId: string;
  currentSleepDuration: string;
  snoring: string;
  tirednessFrequency: string;
  daytimeSleepiness: string;
};
```
