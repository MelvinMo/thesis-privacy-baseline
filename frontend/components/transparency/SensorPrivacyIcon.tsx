
import accelerometerCloudLowIcon from '@/assets/images/privacy/sensor/accelerometer-cloud-low.png';
import accelerometerCloudMediumIcon from '@/assets/images/privacy/sensor/accelerometer-cloud-medium.png';
import accelerometerCloudHighIcon from '@/assets/images/privacy/sensor/accelerometer-cloud-high.png';
import accelerometerLocalLowIcon from '@/assets/images/privacy/sensor/accelerometer-local-low.png';
import accelerometerLocalMediumIcon from '@/assets/images/privacy/sensor/accelerometer-local-medium.png';
import accelerometerLocalHighIcon from '@/assets/images/privacy/sensor/accelerometer-local-high.png';
import lightLocalLowIcon from '@/assets/images/privacy/sensor/light-local-low.png';
import lightLocalMediumIcon from '@/assets/images/privacy/sensor/light-local-medium.png';
import lightLocalHighIcon from '@/assets/images/privacy/sensor/light-local-high.png';
import lightCloudLowIcon from '@/assets/images/privacy/sensor/light-cloud-low.png';
import lightCloudMediumIcon from '@/assets/images/privacy/sensor/light-cloud-medium.png';
import lightCloudHighIcon from '@/assets/images/privacy/sensor/light-cloud-high.png';
import microphoneLocalLowIcon from '@/assets/images/privacy/sensor/microphone-local-low.png';
import microphoneLocalMediumIcon from '@/assets/images/privacy/sensor/microphone-local-medium.png';
import microphoneLocalHighIcon from '@/assets/images/privacy/sensor/microphone-local-high.png';
import microphoneCloudLowIcon from '@/assets/images/privacy/sensor/microphone-cloud-low.png';
import microphoneCloudMediumIcon from '@/assets/images/privacy/sensor/microphone-cloud-medium.png';
import microphoneCloudHighIcon from '@/assets/images/privacy/sensor/microphone-cloud-high.png';
import { TouchableOpacity, Image, StyleSheet } from "react-native";


const iconMap: { [key: string]: any } = {
  'accelerometer-cloud-privacy-low': accelerometerCloudLowIcon,
  'accelerometer-cloud-privacy-medium': accelerometerCloudMediumIcon,
  'accelerometer-cloud-privacy-high': accelerometerCloudHighIcon,
	'accelerometer-local-privacy-low': accelerometerLocalLowIcon,
	'accelerometer-local-privacy-medium': accelerometerLocalMediumIcon,
	'accelerometer-local-privacy-high': accelerometerLocalHighIcon,
	'light-local-privacy-low': lightLocalLowIcon,
	'light-local-privacy-medium': lightLocalMediumIcon,
	'light-local-privacy-high': lightLocalHighIcon,
	'light-cloud-privacy-low': lightCloudLowIcon,
	'light-cloud-privacy-medium': lightCloudMediumIcon,
	'light-cloud-privacy-high': lightCloudHighIcon,
	'microphone-local-privacy-low': microphoneLocalLowIcon,
	'microphone-local-privacy-medium': microphoneLocalMediumIcon,
	'microphone-local-privacy-high': microphoneLocalHighIcon,
	'microphone-cloud-privacy-low': microphoneCloudLowIcon,
	'microphone-cloud-privacy-medium': microphoneCloudMediumIcon,
	'microphone-cloud-privacy-high': microphoneCloudHighIcon,
};

interface SensorPrivacyIconProps {
	sensorType: 'accelerometer' | 'light' | 'microphone';
	iconName: string;
	iconRef?: React.RefObject<TouchableOpacity>;
	handleIconPress: () => void;
	storageType: 'local' | 'cloud';
}

export const SensorPrivacyIcon = ({
	sensorType,
	iconName,
	iconRef,
	handleIconPress,
	storageType,
} : SensorPrivacyIconProps) => {
	const iconKey = `${sensorType}-${storageType}-${iconName}`;
	const iconImageUrl = iconMap[iconKey];

	return (
				<TouchableOpacity
					onPress={() => handleIconPress()}
					style={styles.iconButton}
					ref={iconRef}
					>
					<Image
						source={iconImageUrl}
						style={{ width: sensorType === 'accelerometer' ? 121 : 124, height: storageType === 'cloud' ? 36 : 45 }} // these dimensions are from the figma design
					/>
				</TouchableOpacity>
			)
};

const styles = StyleSheet.create({
  iconButton: {
    padding: 4,
  },
});