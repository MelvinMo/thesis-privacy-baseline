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