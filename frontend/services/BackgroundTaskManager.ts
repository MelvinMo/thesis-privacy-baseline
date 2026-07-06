import { SensorRepository } from './sensors/SensorRepository';
import { SensorServiceConfig } from './sensors/sensorConfig';

/**
 * Currently, this is used as a middle man between the main app and the SensorRepository, managing background task of sensor data collection.
 *
 * TODO - Implement true background functionality
 * This does not truly work in the background. In a real app, the sensors would continue collecting data even when the app is not in the foreground or even when the phone is off.
 * That functionality still needs to be implemented to increase the realisticness of the prototype.
 */
export class SensorBackgroundTaskManager {
    private sensorRepository: SensorRepository;

    constructor(sensorRepository: SensorRepository) {
        this.sensorRepository = sensorRepository;
    }
    
    public registerAccelerometer() {
        console.log("Defining accelerometer background task");
        this.sensorRepository.startAccelerometerMonitoring();
    }

    public registerLightSensor(){
        console.log("Defining light sensor background task");
        this.sensorRepository.startLightMonitoring();
    }

    public registerAudioSensor() {
        console.log("Defining audio sensor background task");
        this.sensorRepository.startAudioMonitoring();
    }

    public async updateConfig(newConfig: Partial<SensorServiceConfig>) {
        console.log("Updating sensor service config with:", newConfig);
        this.sensorRepository.updateConfig(newConfig);
        if ("useSimulation" in newConfig) {
            this.sensorRepository.setSimulationMode();
        }
        if ("accelerometerEnabled" in newConfig){
            await this.sensorRepository.stopAccelerometerMonitoring();
            await this.sensorRepository.startAccelerometerMonitoring();
        }
        if ("audioEnabled" in newConfig) {
            await this.sensorRepository.stopAudioMonitoring();
            await this.sensorRepository.startAudioMonitoring();
        }
        if ("lightEnabled" in newConfig) {
            await this.sensorRepository.stopLightMonitoring();
            await this.sensorRepository.startLightMonitoring();
        }
    }
}