import * as SecureStore from 'expo-secure-store';
import CryptoJS from 'crypto-js';
import { AccelerometerSensorData, AudioSensorData, LightSensorData, SensorData } from '@/constants/types/SensorData';
import { GeneralSleepData } from '@/constants/types/GeneralSleepData';
import { User } from '@/constants/types/User';
import { JournalData, SleepNote } from '@/constants/types/JournalData';
import { useTransparencyStore } from '@/store/transparencyStore';
import { EncryptionMethod } from '@/constants/types/Transparency';
import { IN_DEMO_MODE, transparencyDemoConfig } from '@/constants/config/transparencyConfig';

/**
 * The EncryptionService handles encryption and decryption of sensitive data using AES.
 * It initializes an encryption key either by loading it from SecureStore or generating a new one.
 * This service is designed as a singleton to ensure a single instance manages the encryption key
 * and operations across the application.
 */
export class EncryptionService {
  // Static instance to implement the singleton pattern
  private static instance: EncryptionService;

  // Name for storing the encryption key in SecureStore
  private readonly ENCRYPTION_KEY_NAME = 'myAppEncryptionKey';

  private encryptionKey: string | null = null;

  // A promise that resolves when the encryption key has been initialized.
  // All encryption/decryption operations will await this promise.
  private isInitialized: Promise<void>;

  /**
   * Private constructor to enforce the singleton pattern.
   * Initializes the encryption key asynchronously.
   */
  private constructor() {
    this.isInitialized = this.initializeKey();
  }

  /**
   * Returns the singleton instance of the EncryptionService.
   * If the instance does not exist, it creates one.
   */
  public static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }

  /**
   * Initializes the encryption key. It first attempts to load the key from SecureStore.
   * If no key is found, a new strong key is generated and stored securely.
   * This method is called once during the constructor.
   */
  private async initializeKey(): Promise<void> {
    try {
      let key = await SecureStore.getItemAsync(this.ENCRYPTION_KEY_NAME);

      if (!key) {
        // Generate a new 256-bit key if one doesn't exist
        key = CryptoJS.lib.WordArray.random(256 / 8).toString(CryptoJS.enc.Base64);
        await SecureStore.setItemAsync(this.ENCRYPTION_KEY_NAME, key!);
        console.log('Encryption key generated and stored securely.');
      } else {
        console.log('Encryption key loaded from SecureStore.');
      }
      this.encryptionKey = key;
    } catch (error) {
      console.error('Failed to initialize encryption key:', error);
      throw new Error('Encryption service failed to initialize key.');
    }
  }

  /**
   * Encrypts a string using AES with the initialized encryption key.
   * Each encryption operation uses a unique, randomly generated Initialization Vector (IV).
   * The IV is prepended to the ciphertext, separated by a colon, to allow for decryption.
   */
  public async encrypt(data: string): Promise<string> {
    await this.isInitialized; // Ensure the key is loaded before encrypting

    if (!this.encryptionKey) {
      throw new Error('Encryption key not initialized.');
    }

    try {
      const parsedKey = CryptoJS.enc.Base64.parse(this.encryptionKey);
      // CBC mode requires a 128-bit (16-byte) IV for optimal security and performance.
      const iv = CryptoJS.lib.WordArray.random(128 / 8);

      const encrypted = CryptoJS.AES.encrypt(data, parsedKey, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });

      // We return the IV and the full ciphertext separated by a colon.
      return iv.toString(CryptoJS.enc.Base64) + ':' + encrypted.toString();
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data.');
    }
  }

  /**
   * Decrypts an AES encrypted string using the initialized encryption key.
   * It expects the input string to be in the format "IV:Ciphertext".
   */
  public async decrypt(encryptedBase64: string): Promise<string> {
    await this.isInitialized; // Ensure the key is loaded before decrypting

    if (!this.encryptionKey) {
      throw new Error('Encryption key not initialized.');
    }

    try {
      const parts = encryptedBase64.split(':');
      if (parts.length !== 2) {
        throw new Error('Invalid encrypted data format. Expected "IV:Ciphertext".');
      }

      const ivBase64 = parts[0];
      const ciphertextBase64 = parts[1];

      const parsedKey = CryptoJS.enc.Base64.parse(this.encryptionKey);
      const iv = CryptoJS.enc.Base64.parse(ivBase64);

      const decrypted = CryptoJS.AES.decrypt(ciphertextBase64, parsedKey, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });

      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data.');
    }
  }

  /**
   * Encrypts sensitive fields of a JournalData object.
   */
  public async encryptJournalData(journalData: Partial<Omit<JournalData, 'userId' | 'journalId'>>): Promise<Partial<Omit<JournalData, 'journalId' | 'userId'>>> {
    const encryptedData: Partial<Omit<JournalData, 'journalId' | 'userId'>> = { ...journalData };
    const journalTransparencyEvent = useTransparencyStore.getState().journalTransparency;
    try {
      journalData.bedtime && (encryptedData.bedtime = await this.encrypt(journalData.bedtime));
      journalData.alarmTime && (encryptedData.alarmTime = await this.encrypt(journalData.alarmTime));
      journalData.sleepDuration && (encryptedData.sleepDuration = await this.encrypt(journalData.sleepDuration));
      journalData.diaryEntry && (encryptedData.diaryEntry = await this.encrypt(journalData.diaryEntry));
      journalData.sleepNotes && (encryptedData.sleepNotes = await Promise.all(
        journalData.sleepNotes.map(note => this.encrypt(note))
      ) as SleepNote[]);
      useTransparencyStore.getState().setJournalTransparency({
        ...journalTransparencyEvent,
        encryptionMethod: !IN_DEMO_MODE ? EncryptionMethod.AES_256 : (transparencyDemoConfig.encryptedAtRest ? EncryptionMethod.AES_256 : EncryptionMethod.NONE)
      });
    } catch (error) {
      console.error('Failed to encrypt JournalData:', error);
      throw error; 
    }
    return encryptedData;
  }

  /**
   * Decrypts sensitive fields of a JournalData object.
   */
  public async decryptJournalData(encryptedJournalData: JournalData): Promise<JournalData> {
    const decryptedData: JournalData = { ...encryptedJournalData };
    try {
      if (encryptedJournalData.bedtime !== '') {
        decryptedData.bedtime = await this.decrypt(encryptedJournalData.bedtime);
      }
      if (encryptedJournalData.alarmTime !== '') {
        decryptedData.alarmTime = await this.decrypt(encryptedJournalData.alarmTime);
      }
      if (encryptedJournalData.sleepDuration !== '') {
        decryptedData.sleepDuration = await this.decrypt(encryptedJournalData.sleepDuration);
      }
      if (encryptedJournalData.diaryEntry !== '') {
        decryptedData.diaryEntry = await this.decrypt(encryptedJournalData.diaryEntry);
      }
      decryptedData.sleepNotes = await Promise.all(
        encryptedJournalData.sleepNotes.map(note => this.decrypt(note))
      ) as SleepNote[];
    } catch (error) {
      console.error('Failed to decrypt JournalData:', error);
      throw error;
    }
    return decryptedData;
  }

  /**
   * Encrypts sensitive fields of a User object.
   * IMPORTANT: The 'password' field should be hashed on the backend, not encrypted here.
   */
  public async encryptUserData(userData: User): Promise<User> {
    const encryptedData: User = { ...userData };
    try {
      encryptedData.firstName = await this.encrypt(userData.firstName);
      encryptedData.lastName = await this.encrypt(userData.lastName);
      encryptedData.email = await this.encrypt(userData.email);
      // Do NOT encrypt password here. It should be hashed on the backend.
    } catch (error) {
      console.error('Failed to encrypt UserData:', error);
      throw error;
    }
    return encryptedData;
  }

  /**
   * Decrypts sensitive fields of a User object.
   */
  public async decryptUserData(encryptedUserData: User): Promise<User> {
    const decryptedData: User = { ...encryptedUserData };
    try {
      decryptedData.firstName = await this.decrypt(encryptedUserData.firstName);
      decryptedData.lastName = await this.decrypt(encryptedUserData.lastName);
      decryptedData.email = await this.decrypt(encryptedUserData.email);
      // Password field remains as is (hashed or original if not handled by this service)
    } catch (error) {
      console.error('Failed to decrypt UserData:', error);
      throw error;
    }
    return decryptedData;
  }

  /**
   * Encrypts sensitive fields of a GeneralSleepData object.
   */
  public async encryptGeneralSleepData(generalSleepData: GeneralSleepData): Promise<GeneralSleepData> {
    const encryptedData: GeneralSleepData = { ...generalSleepData };
    const generalSleepTransparencyEvent = useTransparencyStore.getState().generalSleepTransparency;
    try {
      if (generalSleepData.currentSleepDuration !== ''){
        encryptedData.currentSleepDuration = await this.encrypt(generalSleepData.currentSleepDuration);
      }
      if (generalSleepData.snoring !== ''){
        encryptedData.snoring = await this.encrypt(generalSleepData.snoring);
      }
      if (generalSleepData.tirednessFrequency !== ''){
        encryptedData.tirednessFrequency = await this.encrypt(generalSleepData.tirednessFrequency);
      }
      if (generalSleepData.daytimeSleepiness !== ''){
        encryptedData.daytimeSleepiness = await this.encrypt(generalSleepData.daytimeSleepiness);
      }
      useTransparencyStore.getState().setGeneralSleepTransparency({
        ...generalSleepTransparencyEvent,
        encryptionMethod: !IN_DEMO_MODE ? EncryptionMethod.AES_256 : (transparencyDemoConfig.encryptedAtRest ? EncryptionMethod.AES_256 : EncryptionMethod.NONE)
      });
    } catch (error) {
      console.error('Failed to encrypt GeneralSleepData:', error);
      throw error;
    }
    return encryptedData;
  }

  /**
   * Decrypts sensitive fields of a GeneralSleepData object.
   */
  public async decryptGeneralSleepData(encryptedGeneralSleepData: GeneralSleepData): Promise<GeneralSleepData> {
    const decryptedData: GeneralSleepData = { ...encryptedGeneralSleepData };
    try {
      if (encryptedGeneralSleepData.currentSleepDuration !== ''){
        decryptedData.currentSleepDuration = await this.decrypt(encryptedGeneralSleepData.currentSleepDuration);
      }
      if (encryptedGeneralSleepData.snoring !== ''){
        decryptedData.snoring = await this.decrypt(encryptedGeneralSleepData.snoring);
      }
      if (encryptedGeneralSleepData.tirednessFrequency !== ''){
        decryptedData.tirednessFrequency = await this.decrypt(encryptedGeneralSleepData.tirednessFrequency);
      }
      if (encryptedGeneralSleepData.daytimeSleepiness !== ''){
        decryptedData.daytimeSleepiness = await this.decrypt(encryptedGeneralSleepData.daytimeSleepiness);
      }
    } catch (error) {
      console.error('Failed to decrypt GeneralSleepData:', error);
      throw error;
    }
    return decryptedData;
  }

  /**
   * Encrypts sensitive fields of a SensorData object based on its sensorType.
   * Numbers are converted to strings for encryption and back to numbers upon decryption.
   */
  public async encryptSensorData(sensorData: Omit<SensorData, 'id'>): Promise<Omit<SensorData, 'id'>> {
    let encryptedData: Omit<SensorData, 'id'>;

    try {
      if (sensorData.sensorType === 'audio') {
        const audioData = sensorData as AudioSensorData;
        const microphoneTransparencyEvent = useTransparencyStore.getState().microphoneTransparency;
        encryptedData = {
          ...audioData,
          averageDecibels: await this.encrypt(audioData.averageDecibels.toString()),
          peakDecibels: await this.encrypt(audioData.peakDecibels.toString()),
          frequencyBands: {
            low: await this.encrypt(audioData.frequencyBands.low.toString()),
            mid: await this.encrypt(audioData.frequencyBands.mid.toString()),
            high: await this.encrypt(audioData.frequencyBands.high.toString()),
          }
        } as AudioSensorData;
        useTransparencyStore.getState().setMicrophoneTransparency({
          ...microphoneTransparencyEvent,
          encryptionMethod: !IN_DEMO_MODE ? EncryptionMethod.AES_256 : (transparencyDemoConfig.encryptedAtRest ? EncryptionMethod.AES_256 : EncryptionMethod.NONE)
        });
      } else if (sensorData.sensorType === 'light') {
        const lightData = sensorData as LightSensorData;
        const lightTransparencyEvent = useTransparencyStore.getState().lightSensorTransparency;
        encryptedData = {
          ...lightData,
          illuminance: await this.encrypt(lightData.illuminance.toString()),
        } as LightSensorData;
        useTransparencyStore.getState().setLightSensorTransparency({
          ...lightTransparencyEvent,
          encryptionMethod: !IN_DEMO_MODE ? EncryptionMethod.AES_256 : (transparencyDemoConfig.encryptedAtRest ? EncryptionMethod.AES_256 : EncryptionMethod.NONE)
        });
      } else if (sensorData.sensorType === 'accelerometer') {
        const accelData = sensorData as AccelerometerSensorData;
        const accelerometerTransparencyEvent = useTransparencyStore.getState().accelerometerTransparency;
        encryptedData = {
          ...accelData,
          x: await this.encrypt(accelData.x.toString()),
          y: await this.encrypt(accelData.y.toString()),
          z: await this.encrypt(accelData.z.toString()),
          magnitude: await this.encrypt(accelData.magnitude.toString()),
        } as AccelerometerSensorData;
        useTransparencyStore.getState().setAccelerometerTransparency({
          ...accelerometerTransparencyEvent,
          encryptionMethod: !IN_DEMO_MODE ? EncryptionMethod.AES_256 : (transparencyDemoConfig.encryptedAtRest ? EncryptionMethod.AES_256 : EncryptionMethod.NONE)
        });
      } else {
        // If sensorType is not recognized or doesn't require encryption, return original
        encryptedData = sensorData;
      }
    } catch (error) {
      console.error('Failed to encrypt SensorData:', error);
      throw error;
    }
    return encryptedData;
  }

  /**
   * Decrypts sensitive fields of a SensorData object based on its sensorType.
   * Decrypted strings are converted back to numbers where appropriate.
   */
  public async decryptSensorData(encryptedSensorData: SensorData): Promise<SensorData> {
    let decryptedData: SensorData;

    try {
      if (encryptedSensorData.sensorType === 'audio') {
        const audioData = encryptedSensorData as AudioSensorData;
        decryptedData = {
          ...audioData,
          averageDecibels: await this.decrypt(audioData.averageDecibels.toString()),
          peakDecibels: await this.decrypt(audioData.peakDecibels.toString()),
          frequencyBands: {
            low: await this.decrypt(audioData.frequencyBands.low.toString()),
            mid: await this.decrypt(audioData.frequencyBands.mid.toString()),
            high: await this.decrypt(audioData.frequencyBands.high.toString()),
          }
        } as AudioSensorData;
      } else if (encryptedSensorData.sensorType === 'light') {
        const lightData = encryptedSensorData as LightSensorData;
        decryptedData = {
          ...lightData,
          illuminance: await this.decrypt(lightData.illuminance.toString()),
        } as LightSensorData;
      } else if (encryptedSensorData.sensorType === 'accelerometer') {
        const accelData = encryptedSensorData as AccelerometerSensorData;
        decryptedData = {
          ...accelData,
          x: await this.decrypt(accelData.x.toString()),
          y: await this.decrypt(accelData.y.toString()),
          z: await this.decrypt(accelData.z.toString()),
          magnitude: await this.decrypt(accelData.magnitude.toString()),
        } as AccelerometerSensorData;
      } else {
        // If sensorType is not recognized or doesn't require decryption, return original
        decryptedData = encryptedSensorData;
      }
    } catch (error) {
      console.error('Failed to decrypt SensorData:', error);
      throw error;
    }
    return decryptedData;
  }
}