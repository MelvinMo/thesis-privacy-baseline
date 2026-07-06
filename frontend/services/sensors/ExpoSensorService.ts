import { Audio } from 'expo-av';
import { LightSensor } from 'expo-sensors';
import { Accelerometer } from 'expo-sensors';
import { SensorService } from './SensorService';
import { AccelerometerSensorData, AudioSensorData, LightSensorData } from '@/constants/types/SensorData';
import { useTransparencyStore } from '@/store/transparencyStore';
import { DEFAULT_ACCELEROMETER_TRANSPARENCY_EVENT, DEFAULT_LIGHT_SENSOR_TRANSPARENCY_EVENT, DEFAULT_MICROPHONE_TRANSPARENCY_EVENT, TransparencyEvent } from '@/constants/types/Transparency';
import { transparencyService } from '@/services';

/**
 * This class implements the SensorService interface using Expo's sensor APIs.
 * It provides methods to start/stop recording, monitor audio, light, and accelerometer data. 
 */
export class ExpoSensorService extends SensorService {
  private audioRecording: Audio.Recording | null = null;
  private lightSubscription: any = null;
  private accelerometerSubscription: any = null;
  private audioAnalysisInterval: ReturnType<typeof setInterval> | null = null;

  private previousMicrophoneTransparencyEvent: TransparencyEvent = DEFAULT_MICROPHONE_TRANSPARENCY_EVENT
  private previousLightTransparencyEvent: TransparencyEvent = DEFAULT_LIGHT_SENSOR_TRANSPARENCY_EVENT;
  private previousAccelerometerTransparencyEvent: TransparencyEvent = DEFAULT_ACCELEROMETER_TRANSPARENCY_EVENT;
  
  async isAudioAvailable(): Promise<boolean> {
    try {
      const audioAvailable = await Audio.requestPermissionsAsync();
      
      return audioAvailable.granted;
    } catch (error) {
      return false;
    }
  }

	async isLightAvailable(): Promise<boolean> {
		try {
			const lightAvailable = await LightSensor.isAvailableAsync();
			return lightAvailable;
		} catch (error) {
			return false;
		}
	}

	async isAccelerometerAvailable(): Promise<boolean> {
			try {
				const accelerometerAvailable = await Accelerometer.isAvailableAsync();
				return accelerometerAvailable;
			} catch (error) {
				return false;
			}
	}
  
  async startAudioMonitoring(): Promise<void> {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // start the transparency event
      const microphoneTransparencyEvent = DEFAULT_MICROPHONE_TRANSPARENCY_EVENT;
      microphoneTransparencyEvent.backgroundMode = true;
      microphoneTransparencyEvent.samplingRate = this.config.samplingRates.audio;
      useTransparencyStore.getState().setMicrophoneTransparency(
        microphoneTransparencyEvent
      )
      
      // Start continuous recording for analysis
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      this.audioRecording = recording;
      
      // Analyze audio periodically
      this.audioAnalysisInterval = setInterval(async () => {
        await this.analyzeAudioData();
      }, this.config.samplingRates.audio * 1000);
      
    } catch (error) {
      this.onError(error as Error, 'audio');
    }
  }
  
  async stopAudioMonitoring(): Promise<void> {
    if (this.audioAnalysisInterval) {
      clearInterval(this.audioAnalysisInterval);
      this.audioAnalysisInterval = null;
    }
    
    if (this.audioRecording) {
      await this.audioRecording.stopAndUnloadAsync();
      this.audioRecording = null;
    }
  }
  
  /**
   * The ambient light sensor WILL NOT WORK through Expo Sensors on IOS devices. It would require a native module.
   * The code below will only work on Android devices. 
   */
  async startLightMonitoring(): Promise<void> {
    try {
      LightSensor.setUpdateInterval(this.config.samplingRates.light * 1000);

      // start the transparency event
      const lightSensorTransparencyEvent = DEFAULT_LIGHT_SENSOR_TRANSPARENCY_EVENT;
      lightSensorTransparencyEvent.backgroundMode = true;
      lightSensorTransparencyEvent.samplingRate = this.config.samplingRates.light;
      useTransparencyStore.getState().setLightSensorTransparency(
        lightSensorTransparencyEvent
      )
      
      this.lightSubscription = LightSensor.addListener(({ illuminance }) => {
        const lightLevel = this.categorizeLightLevel(illuminance);
        
        const lightData: Omit<LightSensorData, 'id' | 'userId'> = {
          sensorType: 'light',
          timestamp: Date.now().toString(),
          date: new Date().toISOString().split('T')[0],
          illuminance: illuminance.toString(),
          lightLevel,
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
      });
    } catch (error) {
      this.onError(error as Error, 'light');
    }
  }
  
  async stopLightMonitoring(): Promise<void> {
    if (this.lightSubscription) {
      this.lightSubscription.remove();
      this.lightSubscription = null;
    }
  }
  
  async startAccelerometerMonitoring(): Promise<void> {
    try {
      Accelerometer.setUpdateInterval(this.config.samplingRates.accelerometer * 1000);

      // start the transparency event
      const accelerometerTransparencyEvent = DEFAULT_ACCELEROMETER_TRANSPARENCY_EVENT;
      accelerometerTransparencyEvent.backgroundMode = true;
      accelerometerTransparencyEvent.samplingRate = this.config.samplingRates.accelerometer;
      useTransparencyStore.getState().setAccelerometerTransparency(
        accelerometerTransparencyEvent
      )
      
      this.accelerometerSubscription = Accelerometer.addListener(({ x, y, z }) => {
        const magnitude = Math.sqrt(x * x + y * y + z * z);
        const movementIntensity = this.categorizeMovement(magnitude);        
        const accelData: Omit<AccelerometerSensorData, 'id' | 'userId'> = {
          sensorType: 'accelerometer',
          timestamp: Date.now().toString(),
          date: new Date().toISOString().split('T')[0],
          x: x.toString(),
          y: y.toString(),
          z: z.toString(),
          magnitude: magnitude.toString(),
          movementIntensity,
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
      });
    } catch (error) {
      this.onError(error as Error, 'accelerometer');
    }
  }
  
  async stopAccelerometerMonitoring(): Promise<void> {
    if (this.accelerometerSubscription) {
      this.accelerometerSubscription.remove();
      this.accelerometerSubscription = null;
    }
  }
  
  // ===== HELPER METHODS =====

  /**
   * The values below for analysis and categorization are arbitrary.
   * They can be changed to make the app more realistic, but sensor data analysis is not the main focus of this prototype. 
   */
  
  private async analyzeAudioData(): Promise<void> {
    // This would need actual audio processing library
    // For now, simulate audio analysis
    const mockDecibels = 30 + Math.random() * 40; // 30-70 dB range
    const mockPeak = mockDecibels + Math.random() * 20;
    
    const audioData: Omit<AudioSensorData, 'id' | 'userId'> = {
      sensorType: 'audio',
      timestamp: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      averageDecibels: mockDecibels.toString(),
      peakDecibels: mockPeak.toString(),
      frequencyBands: {
        low: (Math.random() * 40).toString(), 
        mid: (Math.random() * 50).toString(),
        high: (Math.random() * 30).toString(),
      },
      snoreDetected: Math.random() > 0.9, // 10% chance
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
      event1.backgroundMode === event2.backgroundMode &&
      event1.encryptionMethod === event2.encryptionMethod &&
      event1.protocol === event2.protocol &&
      event1.storageLocation === event2.storageLocation &&
      event1.source === event2.source &&
      event1.sensorType === event2.sensorType
    );
  }
}