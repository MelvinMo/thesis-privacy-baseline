import { AccelerometerSensorData, AudioSensorData, LightSensorData } from "../../constants/types/SensorData";
import { SensorServiceConfig } from "./sensorConfig";

/**
 * This abstract class defines the core interface for sensor services.
 * It provides methods for starting/stopping recording, checking availability, etc. 
 */

export abstract class SensorService {
  protected config: SensorServiceConfig;
  protected isRecording: boolean = false;
  protected currentSessionId: string | null = null;
  
  constructor(config: SensorServiceConfig) {
    this.config = config;
  }
  
  // ===== ABSTRACT METHODS (must be implemented) =====
  abstract isAudioAvailable(): Promise<boolean>;
  abstract isLightAvailable(): Promise<boolean>;
  abstract isAccelerometerAvailable(): Promise<boolean>;
  
  // Individual sensor controls
  abstract startAudioMonitoring(): Promise<void>;
  abstract stopAudioMonitoring(): Promise<void>;
  abstract startLightMonitoring(): Promise<void>;
  abstract stopLightMonitoring(): Promise<void>;
  abstract startAccelerometerMonitoring(): Promise<void>;
  abstract stopAccelerometerMonitoring(): Promise<void>;
  
  // ===== COMMON METHODS =====
  getSessionId(): string | null {
    return this.currentSessionId;
  }
  
  isRecordingActive(): boolean {
    return this.isRecording;
  }
  
  updateConfig(newConfig: Partial<SensorServiceConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
  
  /**
	 * The callbacks below will be used to bridge the sensor data to the sensor storage services. 
   * They will be called by the sensor service implementations when new data is available.
	 * They will call the appropriate storage service methods to save the data.
	 */
  onAudioData(data: Omit<AudioSensorData, 'id' | 'userId'>): void {
    
  }
  
  onLightData(data: Omit<LightSensorData, 'id' | 'userId'>): void {
      
  }
  
  onAccelerometerData(data: Omit<AccelerometerSensorData, 'id' | 'userId'>): void {
    
  }
  
  onError(error: Error, sensorType: string): void {
    console.error(`Sensor error (${sensorType}):`, error);
  }
}