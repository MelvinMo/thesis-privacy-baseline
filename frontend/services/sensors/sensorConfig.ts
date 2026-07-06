/**
 * This is a sample configuration interface for the SensorService:
 * This allows the Sensor Service to be configured with various options
 * Many of these options will not be used in the initial prototype, but are included 
 * for completeness of a sleep tracking application and for potential future features.
 */
export interface SensorServiceConfig {
  useSimulation: boolean; // Use simulation data instead of real sensors
  audioEnabled: boolean;
  lightEnabled: boolean;
  accelerometerEnabled: boolean;
  samplingRates: {
    audio: number; // seconds between readings
    light: number;
    accelerometer: number;
  };
  audioProcessing: {
    enableSnoreDetection: boolean;
    saveAudioClips: boolean;
    clipDuration: number; // seconds
  };
}

export const DEFAULT_SENSOR_SERVICE_CONFIG: SensorServiceConfig = {
  useSimulation: false,
  audioEnabled: false,
  lightEnabled: false,
  accelerometerEnabled: false,
  samplingRates: {
    audio: 15, // every 15 seconds
    light: 15, 
    accelerometer: 15, 
  },
  audioProcessing: {
    enableSnoreDetection: true,
    saveAudioClips: true,
    clipDuration: 30, // 30 seconds
  },
};