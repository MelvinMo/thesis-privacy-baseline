import { DEFAULT_SENSOR_SERVICE_CONFIG, SensorServiceConfig } from "./sensorConfig";
import { SensorService } from "./SensorService";
import { SensorStorageRepository } from "../data/SensorStorageRepository";
import { AccelerometerSensorData, AudioSensorData, LightSensorData } from "@/constants/types/SensorData";
import { ExpoSensorService } from "./ExpoSensorService";
import { SimulationSensorService } from "./SimulationSensorService";
import { useProfileStore } from "@/store/userProfileStore";
import { Platform } from "react-native";
import { transparencyDemoConfig, IN_DEMO_MODE } from "@/constants/config/transparencyConfig";

/**
 * SensorRepository is the main interface for managing sensor services.
 * It abstracts the underlying sensor implementations (Expo, Simulation) and provides a unified API.
 * The SensorStorageRepository is injected to handle data storage. 
 * 
 * The main app does not directly interact with SensorRepostory, but uses the BackgroundTaskManager to manage sensor data collection.
 */

export class SensorRepository {
    private expoSensorService: ExpoSensorService;
    private simulationSensorService: SimulationSensorService;
    private sensorStorageRepository: SensorStorageRepository;
    private sensorConfig: SensorServiceConfig = DEFAULT_SENSOR_SERVICE_CONFIG;
    private currentSensorService: SensorService = new ExpoSensorService(DEFAULT_SENSOR_SERVICE_CONFIG); // Default to Expo service

    constructor(
        ExpoSensorService: ExpoSensorService,
        SimulationSensorService: SimulationSensorService,
        SensorStorageRepository: SensorStorageRepository,
    ) {
        this.expoSensorService = ExpoSensorService;
        this.simulationSensorService = SimulationSensorService;
        this.sensorStorageRepository = SensorStorageRepository;
        this.setSimulationMode();

        const userConsentPreferences = useProfileStore.getState().userConsentPreferences;

        // Initialize sensor configuration based on user consent preferences
        this.sensorConfig = {
            ...this.sensorConfig,
            audioEnabled: userConsentPreferences?.microphoneEnabled ?? false,
            lightEnabled: userConsentPreferences?.lightSensorEnabled ?? false,
            accelerometerEnabled: userConsentPreferences?.accelerometerEnabled ?? false,
        };

        // Set up data callbacks for both services
        this.setupDataCallbacks(this.expoSensorService);
        this.setupDataCallbacks(this.simulationSensorService);
    }

    // ===== SERVICE SWITCHING =====
    
    /**
     * Switch between real sensors and simulation
     */
    setSimulationMode(): void {
        const useSimulation = this.sensorConfig.useSimulation;
        if (this.isRecordingActive()) {
            console.log("Is recording active, cannot switch sensor mode");
            throw new Error("Cannot switch sensor mode while recording is active. Stop recording first.");
        }
        console.log(`Switching sensor mode to ${useSimulation ? 'simulation' : 'real sensors'}`);
        this.sensorConfig.useSimulation = useSimulation;
        this.currentSensorService = useSimulation ? this.simulationSensorService : this.expoSensorService;
    }

    isSimulationMode(): boolean {
        return this.sensorConfig.useSimulation;
    }

    getCurrentSensorService(): SensorService {
        return this.currentSensorService;
    }

    // ===== SENSOR AVAILABILITY =====
    
    async isAudioAvailable(): Promise<boolean> {
        return await this.currentSensorService.isAudioAvailable();
    }

    async isLightAvailable(): Promise<boolean> {
        return await this.currentSensorService.isLightAvailable();
    }

    async isAccelerometerAvailable(): Promise<boolean> {
        return await this.currentSensorService.isAccelerometerAvailable();
    }

    /**
     * Check availability of all sensors
     */
    async getAllSensorAvailability(): Promise<{
        audio: boolean;
        light: boolean;
        accelerometer: boolean;
    }> {
        const [audio, light, accelerometer] = await Promise.all([
            this.isAudioAvailable(),
            this.isLightAvailable(),
            this.isAccelerometerAvailable()
        ]);

        return { audio, light, accelerometer };
    }

    // ===== RECORDING CONTROL =====
    
    /**
     * Start monitoring all enabled sensors
     */
    async startAllSensors(): Promise<void> {
        const promises: Promise<void>[] = [];

        if ( (IN_DEMO_MODE && transparencyDemoConfig.collectAudio) || this.sensorConfig.audioEnabled) {
            promises.push(this.currentSensorService.startAudioMonitoring());
        }
        if ( (IN_DEMO_MODE && transparencyDemoConfig.collectLight) || this.sensorConfig.lightEnabled) {
            if (Platform.OS === 'ios') {
                promises.push(this.simulationSensorService.startLightMonitoring());
            } else {
                promises.push(this.currentSensorService.startLightMonitoring());
            }
        }
        if ( (IN_DEMO_MODE && transparencyDemoConfig.collectAccelerometer) || this.sensorConfig.accelerometerEnabled) {
            promises.push(this.currentSensorService.startAccelerometerMonitoring());
        }

        await Promise.all(promises);
    }

    /**
     * Stop monitoring all sensors
     */
    async stopAllSensors(): Promise<void> {
        const promises: Promise<void>[] = [];

        promises.push(this.currentSensorService.stopAudioMonitoring());
        if (Platform.OS === 'ios') {
            promises.push(this.simulationSensorService.stopLightMonitoring());
        }
        else {
            promises.push(this.currentSensorService.stopLightMonitoring());
        }
        promises.push(this.currentSensorService.stopAccelerometerMonitoring());

        await Promise.all(promises);
    }

    // Individual sensor controls
    async startAudioMonitoring(): Promise<void> {
        if ((IN_DEMO_MODE && !transparencyDemoConfig.collectAudio) || (!IN_DEMO_MODE && !this.sensorConfig.audioEnabled)) {
            console.log("Audio monitoring is disabled in configuration");
            throw new Error("Audio monitoring is disabled in configuration");
        }
        await this.currentSensorService.startAudioMonitoring();
    }

    async stopAudioMonitoring(): Promise<void> {
        await this.currentSensorService.stopAudioMonitoring();
    }

    async startLightMonitoring(): Promise<void> {
        if ((IN_DEMO_MODE && !transparencyDemoConfig.collectLight) || (!IN_DEMO_MODE && !this.sensorConfig.lightEnabled)) {
            console.log("Light monitoring is disabled in configuration");
            throw new Error("Light monitoring is disabled in configuration");
        }
        // This if statement if because real light sensor will not work on IOS without a native module
        if (Platform.OS === 'ios') {
            await this.simulationSensorService.startLightMonitoring();
        } else {
            await this.currentSensorService.startLightMonitoring();
        }
    }

    async stopLightMonitoring(): Promise<void> {
        if (Platform.OS === 'ios') {
            await this.simulationSensorService.stopLightMonitoring();
        } else {
            await this.currentSensorService.stopLightMonitoring();
        }
    }

    async startAccelerometerMonitoring(): Promise<void> {
        if ((IN_DEMO_MODE && !transparencyDemoConfig.collectAccelerometer) || (!IN_DEMO_MODE && !this.sensorConfig.accelerometerEnabled)) {
            console.log("Accelerometer monitoring is disabled in configuration");
            throw new Error("Accelerometer monitoring is disabled in configuration");
        }
        await this.currentSensorService.startAccelerometerMonitoring();
    }

    async stopAccelerometerMonitoring(): Promise<void> {
        await this.currentSensorService.stopAccelerometerMonitoring();
    }

    // ===== STATUS METHODS =====
    
    isRecordingActive(): boolean {
        return this.currentSensorService.isRecordingActive();
    }

    getSessionId(): string | null {
        return this.currentSensorService.getSessionId();
    }

    // ===== CONFIGURATION =====
    
    updateConfig(newConfig: Partial<SensorServiceConfig>): void {
        this.sensorConfig = { ...this.sensorConfig, ...newConfig };
    }

    getConfig(): SensorServiceConfig {
        return { ...this.sensorConfig };
    }

    // ===== PRIVATE HELPER METHODS =====
    
    /**
     * Set up data callbacks to bridge sensor data to storage
     */
    private setupDataCallbacks(sensorService: SensorService): void {
        // Override the sensor service's callback methods to forward data to storage
        const originalOnAudioData = sensorService.onAudioData.bind(sensorService);
        const originalOnLightData = sensorService.onLightData.bind(sensorService);
        const originalOnAccelerometerData = sensorService.onAccelerometerData.bind(sensorService);

        sensorService.onAudioData = (data: Omit<AudioSensorData, 'id' | 'userId'>) => {
            originalOnAudioData(data);
            this.handleAudioData(data);
        };

        sensorService.onLightData = (data: Omit<LightSensorData, 'id' | 'userId'>) => {
            originalOnLightData(data);
            this.handleLightData(data);
        };

        sensorService.onAccelerometerData = (data: Omit<AccelerometerSensorData, 'id' | 'userId'>) => {
            originalOnAccelerometerData(data);
            this.handleAccelerometerData(data);
        };
    }

    /**
     * Handle audio data and forward to storage
     */
    private async handleAudioData(data: Omit<AudioSensorData, 'id' | 'userId'>): Promise<void> {
        try {
            await this.sensorStorageRepository.createSensorReading(data);
        } catch (error) {
            console.error('Failed to save audio data:', error);
            this.currentSensorService.onError(error as Error, 'audio');
        }
    }

    /**
     * Handle light data and forward to storage
     */
    private async handleLightData(data: Omit<LightSensorData, 'id' | 'userId'>): Promise<void> {
        try {
            await this.sensorStorageRepository.createSensorReading(data);
        } catch (error) {
            console.error('Failed to save light data:', error);
            this.currentSensorService.onError(error as Error, 'light');
        }
    }

    /**
     * Handle accelerometer data and forward to storage
     */
    private async handleAccelerometerData(data: Omit<AccelerometerSensorData, 'id' | 'userId'>): Promise<void> {
        try {
            await this.sensorStorageRepository.createSensorReading(data);
        } catch (error) {
            console.error('Failed to save accelerometer data:', error);
            this.currentSensorService.onError(error as Error, 'accelerometer');
        }
    }

    // ===== UTILITY METHODS =====
    
    /**
     * Get current sensor status for debugging/monitoring
     */
    getSensorStatus(): {
        isRecording: boolean;
        sessionId: string | null;
        simulationMode: boolean;
        enabledSensors: string[];
        availableSensors?: { audio: boolean; light: boolean; accelerometer: boolean };
    } {
        const enabledSensors: string[] = [];
        if (this.sensorConfig.audioEnabled) enabledSensors.push('audio');
        if (this.sensorConfig.lightEnabled) enabledSensors.push('light');
        if (this.sensorConfig.accelerometerEnabled) enabledSensors.push('accelerometer');

        return {
            isRecording: this.isRecordingActive(),
            sessionId: this.getSessionId(),
            simulationMode: this.isSimulationMode(),
            enabledSensors
        };
    }

    /**
     * Clean up resources
     */
    async cleanup(): Promise<void> {
        if (this.isRecordingActive()) {
            await this.stopAllSensors();
        }
    }
}