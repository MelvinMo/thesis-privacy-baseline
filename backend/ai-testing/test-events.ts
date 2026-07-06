/* This file contains structured test cases for accuracy and readability testing.
 * Each test case is designed to evaluate specific privacy compliance scenarios
 * with descriptive keys that reflect the violation or compliance pattern.
*/

import { DataDestination, DataSource, DataType, EncryptionMethod, TransparencyEvent, UserConsentPreferences } from "../src/constants/types/Transparency";

// Test case structure: [TransparencyEvent, UserConsentPreferences]
export type TestCase = [TransparencyEvent, UserConsentPreferences];

export const testEvents: Map<string, TestCase> = new Map([
  
  // 1. FULLY COMPLIANT - Everything properly configured and consented
  ["compliant", [
    {
      dataType: DataType.SENSOR_MOTION,
      source: DataSource.ACCELEROMETER,
      encryptionMethod: EncryptionMethod.AES_256,
      storageLocation: DataDestination.GOOGLE_CLOUD,
      endpoint: 'https://api.example.com/sleep-data',
      protocol: 'HTTPS',
      backgroundMode: true,
    },
    {
      accelerometerEnabled: true,
      lightSensorEnabled: true,
      microphoneEnabled: true,
      cloudStorageEnabled: true,
      agreedToPrivacyPolicy: true,
      analyticsEnabled: true,
      marketingCommunications: false,
      notificationsEnabled: true,
    }
  ]],

  // 2. NO ENCRYPTION AT REST - Sensitive data stored without encryption
  ["not-encrypted-at-rest", [
    {
      dataType: DataType.USER_JOURNAL,
      source: DataSource.USER_INPUT,
      encryptionMethod: EncryptionMethod.NONE,
      storageLocation: DataDestination.SQLITE_DB,
      endpoint: 'https://api.example.com/user-journal',
      protocol: 'HTTPS',
      backgroundMode: false,
    },
    {
      accelerometerEnabled: true,
      lightSensorEnabled: true,
      microphoneEnabled: true,
      cloudStorageEnabled: true,
      agreedToPrivacyPolicy: true,
      analyticsEnabled: true,
      marketingCommunications: false,
      notificationsEnabled: true,
    }
  ]],

  // 3. UNENCRYPTED TRANSMISSION - HTTP instead of HTTPS for sensitive data
  ["unencrypted-transmission", [
    {
      dataType: DataType.SENSOR_AUDIO,
      source: DataSource.MICROPHONE,
      encryptionMethod: EncryptionMethod.AES_256,
      storageLocation: DataDestination.GOOGLE_CLOUD,
      endpoint: 'http://api.example.com/audio-data',
      protocol: 'HTTP',
      backgroundMode: true,
    },
    {
      accelerometerEnabled: true,
      lightSensorEnabled: true,
      microphoneEnabled: true,
      cloudStorageEnabled: true,
      agreedToPrivacyPolicy: true,
      analyticsEnabled: true,
      marketingCommunications: false,
      notificationsEnabled: true,
    }
  ]],

  // 4. CONSENT VIOLATION - Collecting data without user consent
  ["consent-violation", [
    {
      dataType: DataType.SENSOR_AUDIO,
      source: DataSource.MICROPHONE,
      encryptionMethod: EncryptionMethod.AES_256,
      storageLocation: DataDestination.GOOGLE_CLOUD,
      endpoint: 'https://api.example.com/audio-data',
      protocol: 'HTTPS',
      backgroundMode: true,
    },
    {
      accelerometerEnabled: false,
      lightSensorEnabled: false,
      microphoneEnabled: false, // User explicitly disabled microphone
      cloudStorageEnabled: false,
      agreedToPrivacyPolicy: false, // User hasn't agreed to privacy policy
      analyticsEnabled: false,
      marketingCommunications: false,
      notificationsEnabled: false,
    }
  ]],

  // 5. WRONG STORAGE LOCATION - Cloud storage when user disabled it
  ["wrong-storage-location", [
    {
      dataType: DataType.SENSOR_LIGHT,
      source: DataSource.LIGHT_SENSOR,
      encryptionMethod: EncryptionMethod.AES_256,
      storageLocation: DataDestination.GOOGLE_CLOUD, // Storing in cloud
      endpoint: 'https://api.example.com/light-data',
      protocol: 'HTTPS',
      backgroundMode: true,
    },
    {
      accelerometerEnabled: true,
      lightSensorEnabled: true,
      microphoneEnabled: true,
      cloudStorageEnabled: false, // User disabled cloud storage
      agreedToPrivacyPolicy: true,
      analyticsEnabled: true,
      marketingCommunications: false,
      notificationsEnabled: true,
    }
  ]],

  // 6. MULTIPLE VIOLATIONS - No encryption + HTTP + consent violation
  ["multiple-violations", [
    {
      dataType: DataType.USER_JOURNAL,
      source: DataSource.USER_INPUT,
      encryptionMethod: EncryptionMethod.NONE, // No encryption
      storageLocation: DataDestination.GOOGLE_CLOUD,
      endpoint: 'http://api.example.com/user-journal', // Insecure HTTP
      protocol: 'HTTP',
      backgroundMode: true,
    },
    {
      accelerometerEnabled: false,
      lightSensorEnabled: false,
      microphoneEnabled: false,
      cloudStorageEnabled: false, // User disabled cloud storage
      agreedToPrivacyPolicy: false, // No privacy policy agreement
      analyticsEnabled: false,
      marketingCommunications: false,
      notificationsEnabled: false,
    }
  ]],

  // 7. INSECURE LOCAL STORAGE - Sensitive data in unencrypted local storage
  ["insecure-local-storage", [
    {
      dataType: DataType.SENSOR_AUDIO,
      source: DataSource.MICROPHONE,
      encryptionMethod: EncryptionMethod.NONE, // No encryption
      storageLocation: DataDestination.ASYNC_STORAGE, // Insecure local storage
      endpoint: 'https://api.example.com/audio-data',
      protocol: 'HTTPS',
      backgroundMode: false,
    },
    {
      accelerometerEnabled: true,
      lightSensorEnabled: true,
      microphoneEnabled: true,
      cloudStorageEnabled: false, // User prefers local storage
      agreedToPrivacyPolicy: true,
      analyticsEnabled: false,
      marketingCommunications: false,
      notificationsEnabled: true,
    }
  ]],

  // 8. BACKGROUND COLLECTION WITHOUT CLEAR CONSENT - Collecting data in background
  ["background-without-clear-consent", [
    {
      dataType: DataType.SENSOR_MOTION,
      source: DataSource.ACCELEROMETER,
      encryptionMethod: EncryptionMethod.AES_256,
      storageLocation: DataDestination.SECURE_STORE,
      endpoint: 'https://api.example.com/motion-data',
      protocol: 'HTTPS',
      backgroundMode: true, // Collecting in background
    },
    {
      accelerometerEnabled: true, // User enabled accelerometer
      lightSensorEnabled: true,
      microphoneEnabled: true,
      cloudStorageEnabled: false,
      agreedToPrivacyPolicy: false, // But hasn't agreed to privacy policy
      analyticsEnabled: false,
      marketingCommunications: false,
      notificationsEnabled: false,
    }
  ]]
]);