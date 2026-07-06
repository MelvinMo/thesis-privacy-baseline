import { DEFAULT_ACCELEROMETER_TRANSPARENCY_EVENT, DEFAULT_LIGHT_SENSOR_TRANSPARENCY_EVENT, DEFAULT_MICROPHONE_TRANSPARENCY_EVENT, TransparencyEvent } from "@/constants/types/Transparency";
import { AccelerometerSensorData, AudioSensorData, LightSensorData } from "../../constants/types/SensorData";
import { SensorService } from "./SensorService";
import { useProfileStore } from "@/store/userProfileStore";
import { useTransparencyStore } from "@/store/transparencyStore";
import { transparencyService } from "@/services";

/**
 * This is the simulated sensor service. 
 * It is always available (does not need OS permissions) and can be used for testing and simulations. 
 */
export class SimulationSensorService extends SensorService {
  private intervals: ReturnType<typeof setInterval>[] = []; 

  private previousMicrophoneTransparencyEvent: TransparencyEvent = DEFAULT_MICROPHONE_TRANSPARENCY_EVENT
  private previousLightTransparencyEvent: TransparencyEvent = DEFAULT_LIGHT_SENSOR_TRANSPARENCY_EVENT;
  private previousAccelerometerTransparencyEvent: TransparencyEvent = DEFAULT_ACCELEROMETER_TRANSPARENCY_EVENT;
    
  
  async isAudioAvailable(): Promise<boolean> {
    return true;
  }

	async isLightAvailable(): Promise<boolean> {
	  return true;
	}

	async isAccelerometerAvailable(): Promise<boolean> {
		return true;
	}
  
  async startAudioMonitoring(): Promise<void> {
    const interval = setInterval(() => {
      this.generateMockAudioData();
    }, this.config.samplingRates.audio * 1000);

    // start the transparency event
    const microphoneTransparencyEvent = DEFAULT_MICROPHONE_TRANSPARENCY_EVENT;
    microphoneTransparencyEvent.userConsent = useProfileStore.getState().userConsentPreferences.microphoneEnabled;
    microphoneTransparencyEvent.backgroundMode = true;
    microphoneTransparencyEvent.samplingRate = this.config.samplingRates.audio;
    useTransparencyStore.getState().setMicrophoneTransparency(
      microphoneTransparencyEvent
    )
    
    this.intervals.push(interval);
  }
  
  async startLightMonitoring(): Promise<void> {
    const interval = setInterval(() => {
      this.generateMockLightData();
    }, this.config.samplingRates.light * 1000);

    // start the transparency event
    const lightSensorTransparencyEvent = DEFAULT_LIGHT_SENSOR_TRANSPARENCY_EVENT;
    lightSensorTransparencyEvent.userConsent = useProfileStore.getState().userConsentPreferences.lightSensorEnabled;
    lightSensorTransparencyEvent.backgroundMode = true;
    lightSensorTransparencyEvent.samplingRate = this.config.samplingRates.light;
    useTransparencyStore.getState().setLightSensorTransparency(
      lightSensorTransparencyEvent
    )
    
    this.intervals.push(interval);
  }
  
  async startAccelerometerMonitoring(): Promise<void> {
    const interval = setInterval(() => {
      this.generateMockAccelerometerData();
    }, this.config.samplingRates.accelerometer * 1000);

    // start the transparency event
    const accelerometerTransparencyEvent = DEFAULT_ACCELEROMETER_TRANSPARENCY_EVENT;
    accelerometerTransparencyEvent.userConsent = useProfileStore.getState().userConsentPreferences.accelerometerEnabled;
    accelerometerTransparencyEvent.backgroundMode = true;
    accelerometerTransparencyEvent.samplingRate = this.config.samplingRates.accelerometer;
    useTransparencyStore.getState().setAccelerometerTransparency(
      accelerometerTransparencyEvent
    )
    
    this.intervals.push(interval);
  }
  
  private clearAllIntervals(): void {
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals = [];
  }

  async stopAudioMonitoring(): Promise<void> {
    this.clearAllIntervals();
  }
  
  async stopLightMonitoring(): Promise<void> {
    this.clearAllIntervals();
  }
  
  async stopAccelerometerMonitoring(): Promise<void> {
    this.clearAllIntervals();
  }
  
  // ===== MOCK DATA GENERATORS =====

  /**
   * The values below for data generation and categorization are arbitrary.
   * They can be changed to make the app more realistic, but this is not the main focus of this prototype. 
   */
  
  private generateMockAudioData(): void {
    const hour = new Date().getHours();
    const isNightTime = hour >= 22 || hour <= 6;
    
    // Simulate quieter audio at night
    const baseDecibels = isNightTime ? 25 : 35;
    const mockDecibels = baseDecibels + Math.random() * 30;
    
    const audioData: Omit<AudioSensorData, 'id' | 'userId'> = {
      sensorType: 'audio',
      timestamp: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      averageDecibels: mockDecibels.toString(),
      peakDecibels: (mockDecibels + Math.random() * 20).toString(),
      frequencyBands: {
        low: (Math.random() * 40).toString(),
        mid: (Math.random() * 50).toString(),
        high: (Math.random() * 30).toString(), 
      },
      snoreDetected: Math.random() > 0.85,
      ambientNoiseLevel: this.categorizeNoiseLevel(mockDecibels),
    };
    
    this.onAudioData(audioData);

    // at this point, the microphone transparency event is ready to be sent to the backend
    const microphoneTransparencyEvent = useTransparencyStore.getState().microphoneTransparency;
    if (this.tranparencyEventEquality(microphoneTransparencyEvent, this.previousMicrophoneTransparencyEvent)) {
      return; // no changes, do not prompt LLM because there are no changes
    } else {
      this.previousMicrophoneTransparencyEvent = microphoneTransparencyEvent;
      transparencyService.analyzePrivacyRisks(microphoneTransparencyEvent)
        .then(updatedMicrophoneTransparency => {
          useTransparencyStore.getState().setMicrophoneTransparency(updatedMicrophoneTransparency);
        })
        .catch(error => {
          console.error("Error analyzing privacy risks:", error);
      });
    }
  }
  
  private generateMockLightData(): void {
    const hour = new Date().getHours();
    let mockLux: number;
    
    // Simulate realistic light patterns
    if (hour >= 22 || hour <= 6) {
      mockLux = Math.random() * 5; // Very low light at night
    } else if (hour >= 7 && hour <= 9) {
      mockLux = Math.random() * 200; // Morning light
    } else {
      mockLux = Math.random() * 500; // Daytime
    }
    
    const lightData: Omit<LightSensorData, 'id' | 'userId'> = {
      sensorType: 'light',
      timestamp: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      illuminance: mockLux.toString(),
      lightLevel: this.categorizeLightLevel(mockLux),
    };
    
    this.onLightData(lightData);

    // at this point, the light sensor transparency event is ready to be sent to the backend
    const lightSensorEvent = useTransparencyStore.getState().lightSensorTransparency;
    if (this.tranparencyEventEquality(lightSensorEvent, this.previousLightTransparencyEvent)) {
      return; // no changes, do not prompt LLM because there are no changes
    } else {
      this.previousLightTransparencyEvent= lightSensorEvent;
      transparencyService.analyzePrivacyRisks(lightSensorEvent)
        .then(updatedLightTransparencyEvent => {
          useTransparencyStore.getState().setLightSensorTransparency(updatedLightTransparencyEvent);
        })
        .catch(error => {
          console.error("Error analyzing privacy risks:", error);
      });
    }
  }
  
  private generateMockAccelerometerData(): void {
    // Simulate sleep movement patterns
    const isAsleep = Math.random() > 0.7; // 70% chance of being asleep
    const baseMovement = isAsleep ? 0.05 : 0.3;
    
    const x = (Math.random() - 0.5) * baseMovement;
    const y = (Math.random() - 0.5) * baseMovement;  
    const z = (Math.random() - 0.5) * baseMovement;
    const magnitude = Math.sqrt(x * x + y * y + z * z);
    
    const accelData: Omit<AccelerometerSensorData, 'id' | 'userId'> = {
      sensorType: 'accelerometer',
      timestamp: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      x: x.toString(),
      y: y.toString(),
      z: z.toString(),
      magnitude: magnitude.toString(),
      movementIntensity: this.categorizeMovement(magnitude),
    };
    
    this.onAccelerometerData(accelData);

     // at this point, the accelerometer transparency event is ready to be sent to the backend
    const accelerometerTransparencyEvent = useTransparencyStore.getState().accelerometerTransparency;
    if (this.tranparencyEventEquality(accelerometerTransparencyEvent, this.previousAccelerometerTransparencyEvent)) {
      return; // no changes, do not prompt LLM because there are no changes
    } else {
      this.previousAccelerometerTransparencyEvent = accelerometerTransparencyEvent;
      transparencyService.analyzePrivacyRisks(accelerometerTransparencyEvent)
        .then(updatedAccelerometerTransparency => {
          useTransparencyStore.getState().setAccelerometerTransparency(updatedAccelerometerTransparency);
        })
        .catch(error => {
          console.error("Error analyzing privacy risks:", error);
      });
    }
  }
  
  // Helper methods (same as ExpoSensorService)
  private categorizeLightLevel(lux: number): 'dark' | 'dim' | 'moderate' | 'bright' {
    if (lux < 1) return 'dark';
    if (lux < 10) return 'dim';
    if (lux < 100) return 'moderate';
    return 'bright';
  }
  
  private categorizeMovement(magnitude: number): 'still' | 'light' | 'moderate' | 'active' {
    if (magnitude < 0.1) return 'still';
    if (magnitude < 0.5) return 'light';
    if (magnitude < 1.0) return 'moderate';
    return 'active';
  }
  
  private categorizeNoiseLevel(decibels: number): 'quiet' | 'moderate' | 'loud' | 'very_loud' {
    if (decibels < 30) return 'quiet';
    if (decibels < 50) return 'moderate';
    if (decibels < 70) return 'loud';
    return 'very_loud';
  }

  // HELPER METHOD TO CHECK EQUALITY OF TRANSPARENCY EVENTS
  private tranparencyEventEquality(event1: TransparencyEvent, event2: TransparencyEvent): boolean {
    return (
      event1.userConsent === event2.userConsent &&
      event1.backgroundMode === event2.backgroundMode &&
      event1.encryptionMethod === event2.encryptionMethod &&
      event1.protocol === event2.protocol &&
      event1.storageLocation === event2.storageLocation &&
      event1.source === event2.source &&
      event1.sensorType === event2.sensorType
    );
  }
}