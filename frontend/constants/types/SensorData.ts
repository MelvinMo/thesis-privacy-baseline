export interface BaseSensorReading {
  id: string;
  userId: string;
  timestamp: string; // Unix timestamp in milliseconds
  date: string; // YYYY-MM-DD format for the sleep date
  sensorType: string; 
}

export interface AudioSensorData extends BaseSensorReading {
  sensorType: 'audio';
  // Processed audio metrics (to avoid storing massive audio files)
  // For the prototype, we dont actually have to process these metrics
  averageDecibels: string;
  peakDecibels: string;
  frequencyBands: {
    low: string;    // 0-250 Hz
    mid: string;    // 250-4000 Hz  
    high: string;   // 4000+ Hz
  };
  // Optional: Store short snippets for snoring detection, I am not sure how we would store these
  audioClipUri?: string; // Reference to file if we store clips
  snoreDetected: boolean;
  ambientNoiseLevel: 'quiet' | 'moderate' | 'loud' | 'very_loud';
}

export interface LightSensorData extends BaseSensorReading {
  sensorType: 'light';
  illuminance: string; // Lux value
  lightLevel: 'dark' | 'dim' | 'moderate' | 'bright';
}

export interface AccelerometerSensorData extends BaseSensorReading {
  sensorType: 'accelerometer';
  x: string;
  y: string;
  z: string;
  magnitude: string; // root(x² + y² + z²)
  movementIntensity: 'still' | 'light' | 'moderate' | 'active';
}

export type SensorData = AudioSensorData | LightSensorData | AccelerometerSensorData;