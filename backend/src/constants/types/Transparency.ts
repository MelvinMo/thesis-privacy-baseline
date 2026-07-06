/**
 * This is the main type for transparency events in the app.
 * It captures all the necessary information about data collection, processing, and transmission, regulatory compliance, and privacy risks.
 */
export interface TransparencyEvent {
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
  protocol?: 'HTTP' | 'HTTPS' | 'WSS';
  
  backgroundMode?: boolean; // was this data collected while the app was in the background

  // AI generated explanation of the event
  privacyRisk?: PrivacyRisk; // indicates the level of privacy risk associated with the event
  regulatoryCompliance?: RegulatoryCompliance; // indicates the regulatory compliance status of the event
  aiExplanation?: AIExplanation; // AI generated explanation of the event
}

// this is what is sent to the backend
export interface AIPrompt {
  transparencyEvent: TransparencyEvent;
  privacyPolicy: string; 
  userConsentPreferences: UserConsentPreferences;
  regulationFrameworks: RegulatoryFramework[]; // list of regulatory frameworks to check against
  pipedaRegulations?: string; // specific PIPEDA regulations to check against

  // Future extension for determining risk levels based on user's risk tolerance
  userRiskTolerance?: any;
}

export enum DataType {
  SENSOR_AUDIO = 'SENSOR_AUDIO',
  SENSOR_MOTION = 'SENSOR_MOTION',
  SENSOR_LIGHT = 'SENSOR_LIGHT',
  USER_JOURNAL = 'USER_JOURNAL',
  USER_PROFILE = 'USER_PROFILE',
  GENERAL_SLEEP = 'GENERAL_SLEEP',
  SLEEP_STATISTICS = 'SLEEP_STATISTICS',
  DEVICE_INFO = 'DEVICE_INFO',
  LOCATION = 'LOCATION',
  USAGE_ANALYTICS = 'USAGE_ANALYTICS'
}

export enum DataSource {
  MICROPHONE = 'MICROPHONE',
  ACCELEROMETER = 'ACCELEROMETER',
  LIGHT_SENSOR = 'LIGHT_SENSOR',
  USER_INPUT = 'USER_INPUT',
  DERIVED_DATA = 'DERIVED_DATA', 
  SYSTEM_INFO = 'SYSTEM_INFO',
}

export enum DataDestination {
  ASYNC_STORAGE = 'ASYNC_STORAGE',
  SECURE_STORE = 'SECURE_STORE',
  SQLITE_DB = 'SQLITE_DB',
  MEMORY = 'MEMORY',
  GOOGLE_CLOUD = 'GOOGLE_CLOUD',
  THIRD_PARTY = 'THIRD_PARTY'
}

export enum EncryptionMethod {
  NONE = 'NONE',
  AES_256 = 'AES_256',
  JWT = 'JWT',
  DEVICE_KEYCHAIN = 'DEVICE_KEYCHAIN'
}

export enum PrivacyRisk {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum RegulatoryFramework {
	// This prototype only focuses on PIPEDA but others are included for future extensibility
  PIPEDA = 'PIPEDA',
  PHIPA = 'PHIPA',
  GDPR = 'GDPR'
}

export interface RegulatoryCompliance {
  framework: RegulatoryFramework;
  compliant: boolean;
  issues?: string;
  relevantSections?: string[];
}

export interface AIExplanation {
  why: string; // explain in simple terms why this data is being collected and what benefits the user gets
  storage: string; // where is the data stored and how is it protected
  access: string; // who has access to the data 
  privacyExplanation: string; // comprehensive explanation covering: (1) privacy risks associated with this data collection, (2) what PIPEDA regulations say about these risks, (3) whether collection complies with regulations, (4) what users should know about regulatory protections
  privacyPolicyLink: string[]; // link to the most relevant privacy policy sections that explains this data collection
  regulationLink: string[]; // link to the most relevant principles of PIPEDA that applies to this data collection 
}

// this config is used to determine what transparency features are enabled in the app
export interface TransparencySettings {
  realTimeNotifications: boolean;
  privacyDashboard: boolean;
  uiElementsVisible: boolean;
  aiExplanations: boolean;
  riskAssessment: boolean;
  regulatoryChecks: boolean;
}

export const DEFAULT_TRANSPARENCY_SETTINGS: TransparencySettings = {
	realTimeNotifications: false,
	privacyDashboard: false,
	uiElementsVisible: true,
	aiExplanations: true,
	riskAssessment: true,
	regulatoryChecks: true
}

/**
 * Defaults for transparency events for each data type.
 * These are used to initialize the UI elements before any data is collected.
 */
export const DEFAULT_JOURNAL_TRANSPARENCY_EVENT: TransparencyEvent = {
  dataType: DataType.USER_JOURNAL,
  source: DataSource.USER_INPUT,

  privacyRisk: PrivacyRisk.LOW,
  regulatoryCompliance: {
    framework: RegulatoryFramework.PIPEDA,
    compliant: true,
    issues: '',
    relevantSections: []
  },
  aiExplanation: {
    why: 'To analyze how your daily mood, habits, sleep goals affects your sleep quality.',
    privacyExplanation: '',
    storage: '',
    access: '',
    privacyPolicyLink: [],
    regulationLink: []
  }
}

export const DEFAULT_LIGHT_SENSOR_TRANSPARENCY_EVENT: TransparencyEvent = {
  dataType: DataType.SENSOR_LIGHT,
  source: DataSource.LIGHT_SENSOR,
  
  privacyRisk: PrivacyRisk.LOW,
  regulatoryCompliance: {
    framework: RegulatoryFramework.PIPEDA,
    compliant: true,
    issues: '',
    relevantSections: []
  },
  aiExplanation: {
    why: 'To understand how the light conditions in your sleep environment may affect your sleep quality',
    privacyExplanation: '',
    storage: '',
    access: '',
    privacyPolicyLink: [],
    regulationLink: []
  }
}

export const DEFAULT_MICROPHONE_TRANSPARENCY_EVENT: TransparencyEvent = {
  dataType: DataType.SENSOR_AUDIO,
  source: DataSource.MICROPHONE,

  privacyRisk: PrivacyRisk.LOW,
  regulatoryCompliance: {
    framework: RegulatoryFramework.PIPEDA,
    compliant: true,
    issues: '',
    relevantSections: []
  },
  aiExplanation: {
    why: 'To analyze sleep disturbances such as snoring and talking, as well as understanding the noise level in your sleep environment',
    privacyExplanation: '',
    storage: '',
    access: '',
    privacyPolicyLink: [],
    regulationLink: []
  }
}

export const DEFAULT_ACCELEROMETER_TRANSPARENCY_EVENT: TransparencyEvent = {
  dataType: DataType.SENSOR_MOTION,
  source: DataSource.ACCELEROMETER,

  privacyRisk: PrivacyRisk.LOW,
  regulatoryCompliance: {
    framework: RegulatoryFramework.PIPEDA,
    compliant: true,
    issues: '',
    relevantSections: []
  },
  aiExplanation: {
    why: 'To analyze how your movements during sleep and throughout the day impact sleep quality',
    privacyExplanation: '',
    storage: '',
    access: '',
    privacyPolicyLink: [],
    regulationLink: []
  }
}

export const DEFAULT_STATISTICS_TRANSPARENCY_EVENT: TransparencyEvent = {
  dataType: DataType.SLEEP_STATISTICS,
  source: DataSource.DERIVED_DATA,

  privacyRisk: PrivacyRisk.LOW,
  regulatoryCompliance: {
    framework: RegulatoryFramework.PIPEDA,
    compliant: true,
    issues: '',
    relevantSections: []
  },
  aiExplanation: {
    why: 'Provide summaries and actionable insights to help improve your sleep quality',
    privacyExplanation: 'No privacy risks',
    storage: 'This data is stored securely in your preferred storage location with encryption.',
    access: 'No third parties have access to this data. Only you can view it through the app.',
    privacyPolicyLink: ['derivedData'],
    regulationLink: ['access']
  }
}

export const DEFAULT_GENERAL_SLEEP_TRANSPARENCY_EVENT: TransparencyEvent = {
  dataType: DataType.GENERAL_SLEEP,
  source: DataSource.USER_INPUT,

  privacyRisk: PrivacyRisk.LOW,
  regulatoryCompliance: {
    framework: RegulatoryFramework.PIPEDA,
    compliant: true,
    issues: '',
    relevantSections: []
  },
  aiExplanation: {
    why: 'To understand your current sleep quality and how we can improve it',
    privacyExplanation: '',
    storage: '',
    access: '',
    privacyPolicyLink: [],
    regulationLink: []
  }
}

export type UserConsentPreferences = {
	accelerometerEnabled: boolean,
	lightSensorEnabled: boolean,
	microphoneEnabled: boolean,
  cloudStorageEnabled: boolean,
  agreedToPrivacyPolicy: boolean, // true if the user has agreed to the privacy policy

	// These preferences are not set by the user in the first iteration of the prototype
	// but are included for completeness and future extensibility, also for testing the LLM with different consent states
  analyticsEnabled: boolean,  
  marketingCommunications: boolean, 
  
  // other non-sensitive app preferences
  notificationsEnabled: boolean,
};

// By default, all consent variables are false and the user will have to explicitly consent to all of them
export const DEFAULT_USER_CONSENT_PREFERENCES: UserConsentPreferences = {
	accelerometerEnabled: false,
	lightSensorEnabled: false,
	microphoneEnabled: false,
	cloudStorageEnabled: false,
	agreedToPrivacyPolicy: false,

	analyticsEnabled: false,
	marketingCommunications: false,
	
	// other non-sensitive app preferences
	notificationsEnabled: false, 
};

// If real time notifications are implemented, the below interfaces may be used

export interface TransparencyNotification {
  id: string;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: Date;
  eventId: string;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: () => void;
}
