# Sleep Tracker App - Frontend Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Privacy UI System](#privacy-ui-system)
4. [Data Types & Management](#data-types--management)
5. [Components](#components)
6. [Services](#services)
7. [State Management](#state-management)
8. [Security Implementation](#security-implementation)
9. [Platform Considerations](#platform-considerations)
10. [Testing The UI](#testing-the-ui)
11. [Limitations](#limitations)
12. [Future Enhancements](#future-enhancements)

---

## Overview

The Sleep Tracker application is a React Native/Expo application focused on privacy-transparent health data collection. The frontend prioritizes user privacy awareness through real-time transparency features and comprehensive consent management.

### Core Features

- **Privacy-First Design**: Real-time transparency indicators for all data collection
- **Multi-Sensor Integration**: Microphone, accelerometer, and light sensor data collection
- **Flexible Storage**: Local (SQLite, SecureStore) and cloud storage options
- **AI-Powered Explanations**: LLM-generated privacy explanations using Gemini API
- **Regulatory Compliance**: PIPEDA compliance monitoring and reporting

---

## Architecture

### Development Prioritization

- **Core Focus**: Privacy transparency features over comprehensive sensor implementations
- **Simplified UI**: Non-essential features use simplified elements for rapid prototyping
- **Abstraction Layers**: Implemented for future scalability despite current scope limitations
- **Modular Design**: Sensor services, storage, and privacy components as separate, reusable modules

### Code Structure

```
frontend/
├── app/
│   ├── (auth)/                 # login and registration screens
|   ├── (tabs)/                 # the 4 main tabs of the app
|   ├── (onboarding)/
|   ├── layout.tsx
│   └── privacy-policy.tsx      # this file is at top level so that it can be navigated to easily from all tabs
├── components/                 # Reusable UI components
│   ├── modals/                 # Modal components
│   └── transparency/           # Privacy UI components
├── services/                   # Business logic for transparency, sensors, data storage
├── store/                      # state management for auth, user profile and transparency
├── utils/                      # Utility functions
├── assets/                     # images and fonts
└── constants/                  # Configuration, types, colors
```

**General User Interface Design**

- **Color Management**: Centralized color scheme management through `constants/Colors.ts` file for consistent theming
- **Asset Management**: Hard-coded images used for non-core UI elements to prioritize development focus on prototype functionality
- **Figma Design System**: The linked Figma contains the initial wireframes for the core app, as well as different UI/UX ideas for privacy transparency. [Figma Link](https://www.figma.com/design/49HUNoDLrUx78XTzayYGG9/Sleep-Tracker-UI?node-id=80-5303&t=y4efP4qqNS29Ij3E-0)

## Privacy UI System

### Onboarding features

- There are screens that explain major data collection practices in the application, including each type of sensor data, journal data, cloud vs local, and the user explicitly consents to each of these things.

- As part of onboarding. There is also a screen that explains the transparency features, including the different kinds of icons and what they mean.

- There are also screens that ask initial questions to gain more information about user's sleep quality. This does not provide much value in the current prototype, but is there for completeness.

### UI Implementation Types

#### 1. Tooltip UI

- **Individual Icons**: Each data type has its own privacy icon
- **Contextual Information**: Click to open tooltip with specific privacy details
- **Granular Control**: Per-data-type privacy information

#### 2. Privacy Page UI

- **Page-Level Icon**: Single privacy icon per page
- **Comprehensive View**: Transforms entire page into privacy information display
- **Unified Information**: Shows all privacy data for current page

### Visual Design System

#### Dynamic Icon Behavior

Privacy icons adapt based on:

- **Risk Severity**: Color and design change based on privacy risk level
- **Data Type**: Icons vary by sensor type and collection method
- **Storage Location**: Visual indicators for local vs. cloud storage
- **Real-Time Updates**: Icons update as privacy risk changes

#### Risk Severity Levels

| Level           | Criteria                                                         | Icon                                                                  |
| --------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------- |
| **Major Risk**  | Clear violations, unauthorized collection, insecure transmission | ![major icon](../frontend/assets/images/privacy/privacy-high.png)     |
| **Medium Risk** | Suboptimal practices, vague purposes, excessive collection       | ![medium icon](../frontend//assets/images/privacy/privacy-medium.png) |
| **Low Risk**    | Compliant practices, clear purpose, proper consent               | ![low icon](../frontend/assets/images/privacy/privacy-low.png)        |

### Privacy Explanation Structure

All privacy explanations include:

1. **Privacy Violation Status**

   - Clear violation indicator at top
   - "No privacy violations detected" or "Major privacy violations detected"

2. **Risk-Based Information**

   - **High/Medium Risk**: Violation explanation + data collection purpose
   - **Low Risk**: Collection purpose + storage location + access information

3. **Regulatory Information**

   - Links to relevant privacy policy sections
   - Links to applicable PIPEDA regulation sections

4. **User Controls**

   - Opt-out options for sensor data types
   - Consent modification options

5. **Special Cases**
   - Sleep mode: Storage and access information omitted to reduce explanation length

---

## Data Types & Management

### Application Data Categories

#### User Data

```typescript
interface UserData {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string; // Encrypted
}
```

#### Sensor Data

- **Unified Storage**: All sensor types stored in single table/document
- **Types**: Microphone, accelerometer, light sensor
- **Abstraction**: Service layer enables real/simulated data switching

#### Journal Data

- User input regarding daily mood, habits, sleep times, and diary entries

#### General Sleep Data

- Sleep quality, duration, and other information collected during onboarding

### Transparency Event Data Structure

This is the main data collection event type that stores all relevant information regarding every data collection that occurs in the app.

```typescript
interface TransparencyEvent {
  timestamp?: Date;
  dataType: DataType;
  source: DataSource;

  // Sensor-specific
  sensorType?: string;
  samplingRate?: number;
  duration?: number;

  // Storage-specific
  encryptionMethod?: EncryptionMethod;
  storageLocation?: DataDestination;

  // Transmission-specific
  endpoint?: string;
  protocol?: "HTTP" | "HTTPS" | "WSS";

  backgroundMode?: boolean;

  // AI-generated insights
  privacyRisk?: PrivacyRisk; // High, medium or low
  regulatoryCompliance?: RegulatoryCompliance;
  aiExplanation?: AIExplanation;
}
```

The following transparency events correspond to specific data collection activities:

- **`generalSleepTransparency`** - General sleep data (not currently implemented)
- **`journalTransparency`** - Journal data collection
- **`microphoneTransparency`** - Microphone data collection
- **`accelerometerTransparency`** - Accelerometer data collection
- **`lightSensorTransparency`** - Light sensor data collection
- **`statisticsTransparency`** - Derived data on statistics page

**Note:** User data transparency is not implemented in the current prototype iteration. Statistics page explanations and icons are hardcoded due to the absence of actual data collection or fetching.

More details regarding transparency data types can be found in `constants/types/Transparency.ts` file

## Components

### Modal Components

- **JournalEntryModal.tsx**: Daily mood and habit input
- **SleepNotesModal.tsx**: Sleep-related notes and observations
- **TimeModal.tsx**: Sleep time selection interface

### Page Components

- **DailyStatisticsPage.tsx**: Sleep analytics and insights
- **NormalJournalPage.tsx**: Standard journal entry interface
- **NormalSleepPage.tsx**: Main sleep tracking interface

### Transparency Components

#### Privacy Icons

- **SensorPrivacyIcon.tsx**: Sensor-specific privacy indicators
- **PrivacyIcon.tsx**: General privacy status indicators

#### Privacy Pages

These screens are very similar to the "normal" screens, but include the embedded privacy icons.

- **PrivacyJournalPage.tsx**
- **PrivacySleepMode.tsx**
- **PrivacySleepPage.tsx**
- **PrivacyStatisticsPage.tsx**

#### Supporting Components

- Headers, permissions toggles, menu items, loaders etc.

### Utils

`frontend/utils/transparency.ts` file contains functions that are used throughout the app by the transparency module.

This includes functions to format privacy violations, get risk levels, get icon colors etc.

## Services

### Sensor Services

`SensorRepository.ts` is the main interface for managing sensor services. It abstracts the underlying sensor implementations (Expo, Simulation) and provides a unified API.

The main app does not directly interact with `SensorRepostory`, but uses the `BackgroundTaskManager` to manage sensor data collection.

The `SensorService` abstract class defines the core interface for sensor services.

- It provides methods for starting/stopping recording, checking availability, etc.

The `ExpoSensorService` class extends this abstract class and uses expo-sensors library to interface with real sensors.
The `SimulationSensorService` class also extends the abstract class but it provides random values as sensor readings.

### Data Storage Services

#### Encryption Service

- Dedicated encryption/decryption module implemented to secure sensitive data both at rest and in transit
- The encryption service uses the crypto-js library to encrypt and decrypt sensitive health data.
- There are some compatibility issues with Expo and crypto-js. The suggestions from [this Stack Overflow thread](https://stackoverflow.com/questions/60733815/how-to-encrypt-data-in-react-native-using-expo) were followed and crypto-js version 3.1.1 was used and it worked.

#### Storage Abstraction

- **Repository Pattern**: Unified interface for all storage operations
- **Local Storage**: SQLite for large data, SecureStore for small data such as the auth token
- **Cloud Storage**: Sends a request to backend to store/retrieve data

### Background Services

Currently, the `BackgroundTaskManager` does not truly work in the background. In a real app, the microphone and other sensors would keep running even if app was not in the foreground. However, this is not the case with this application. This is something that needs to be implemented to make the prototype more realistic.

### Transparency Service

```typescript
class TransparencyService {
  analyzePrivacyRisks(event: TransparencyEvent): Promise<TransparencyEvent>;
}
```

Four key pages require transparency UI features:

- Journal page
- Sleep/index page
- Sleep mode page
- Statistics page

The transparency module utilizes **Zustand** for state management, maintaining transparency events for each data collection type. The UI responds dynamically to state changes, ensuring real-time privacy feedback.

**LLM Integration**

- LLM calls occur at the highest level of abstraction within "saveData" hooks
- Transparency events are initialized for each data type
- Transparency service is called after successful `dataRepository.save()` operations
- the LLM returns an updated TransparencyEvent that now contains the AIExplanation

```typescript
interface AIPrompt {
  transparencyEvent: TransparencyEvent;
  privacyPolicy: string;
  userConsentPreferences: UserConsentPreferences;
  regulationFrameworks: RegulatoryFramework[];
  pipedaRegulations?: string;
  userRiskTolerance?: any; // Future extension
}
```

- **Context Inclusion**: Complete privacy policy, PIPEDA principle descriptions and user consent configurations
- **Constraint Enforcement**: 30-word limit per explanation section
- **Link Generation**: Automatic privacy policy and regulation section linking
- **Risk Assessment**: Automated privacy risk level determination

This is the AIExplanation type that the LLM structures its explanations with:

```typescript
interface AIExplanation {
  why: string; // Purpose explanation (≤30 words)
  storage: string; // Storage and protection details (≤30 words)
  access: string; // Access control information (≤30 words)
  privacyExplanation: string; // Comprehensive risk and compliance explanation
  privacyPolicyLink: string[]; // Relevant policy section links
  regulationLink: string[]; // Applicable PIPEDA principle links
}
```

**Timing Considerations**
To address the timing gap between screen load and data entry, default transparency events are established for each data type. These update automatically as data collection and processing occur.

**Benefits of Global State**

- UI changes reflect privacy risks for each data type
- Facilitates global features like privacy-related notifications
- Ensures consistency across the application

---

## Platform Considerations

### iOS Specific

- **Light Sensor**: Requires native module development (not currently implemented)
- **Background Tasks**: Limited functionality, ongoing development needed

### Android Specific

- **Sensor Access**: Full sensor suite available through Expo
- **Background Processing**: More flexible background task capabilities than iOS

---

## Testing the UI

There is a config file in `frontend/constants/config/transparencyConfig.ts`. This file contains a `TRANSPARENCY_UI_CONFIG` variable to control while type of UI gets displayed on each screen.

There is also a `transparencyDemoConfig` variable which can be used to create different data collection scenarios for demonstration and testing purposes.

---

## Limitations

### Prototype Constraints

#### Registration/Authentication

- **Limited Features**: Email/password only
- **Missing Functionality**: No password reset, email verification, or phone number login

#### Data Management

- **Device-Level Consent**: Preferences stored per device, not per account
- **No Migration**: Data not automatically moved between storage locations when consent changes
- **App Reset**: Consent preferences lost if app is deleted

### Technical Limitations

#### Sensor Access

- **iOS Light Sensor**: Not available without native module
- **Background Processing**: iOS limitations affect continuous monitoring

#### LLM Integration

- **PIPEDA-Specific**: Current prompt template only supports PIPEDA regulations
- **API Dependency**: Relies on external Gemini API availability
- **Response Timing**: Default low-risk display during LLM processing to avoid confusion, no loading indicators

#### Storage Architecture

- **Simplified Structure**: All sensor data in single table for prototype simplicity

---

## Privacy Policy & Regulations Storage

### Privacy Policy Storage

Privacy policy data is stored in JSON format (`frontend/privacyPolicyData.json`), enabling:

- Easy in-app rendering
- Seamless integration with LLM processing

### PIPEDA Regulations

PIPEDA regulations are stored in JSON format (`frontend/privacyRegulations.json`), containing:

- Summaries of all 10 main PIPEDA principles
- Structured data for LLM consumption

These two json files are also copied in the backend directory as that is needed to bundle them with the deployed backend.

---

## Future Enhancements

### Planned Features

- **Background Sensor Data Collection**: collect sensor data even when app is not in foreground for more realistic prototype behaviour
- **Data Migration**: Automatic migration between storage locations

### Scalability Considerations

- **Caching Strategy**: Improved LLM response caching and performance
- **Real-Time Updates**: WebSocket integration for instant privacy notifications
- **User Risk Profiles**: Personalized privacy risk tolerance and recommendations
