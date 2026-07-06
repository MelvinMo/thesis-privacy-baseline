import { TouchableOpacity, Image, StyleSheet } from "react-native"
import privacyHighIcon from '@/assets/images/privacy/privacy-high.png';
import privacyMediumIcon from '@/assets/images/privacy/privacy-medium.png';
import privacyLowIcon from '@/assets/images/privacy/privacy-low.png';
import privacyHighOpenIcon from '@/assets/images/privacy/privacy-high-open.png';
import privacyMediumOpenIcon from '@/assets/images/privacy/privacy-medium-open.png';
import privacyLowOpenIcon from '@/assets/images/privacy/privacy-low-open.png';


const iconMap: { [key: string]: any } = {
  'privacy-high': privacyHighIcon,
  'privacy-medium': privacyMediumIcon,
  'privacy-low': privacyLowIcon,
  'privacy-high-open': privacyHighOpenIcon,
  'privacy-medium-open': privacyMediumOpenIcon,
  'privacy-low-open': privacyLowOpenIcon,
};

interface PrivacyIconProps {
	handleIconPress: () => void;
	isOpen: boolean;
	iconName: string;
	iconSize?: number;
	iconRef?: React.RefObject<TouchableOpacity>; // this is a type error in VS Code but it still works
}

export const PrivacyIcon = ({
    handleIconPress,
	isOpen,
	iconName,
	iconSize = 40,
	iconRef
} : PrivacyIconProps) => {
		const iconKey = isOpen ? `${iconName}-open` : iconName;
		const iconImageUrl = iconMap[iconKey] || privacyLowIcon;
		iconSize = isOpen ? iconSize + 10 : iconSize; // increase size when open
    return (
			<TouchableOpacity
				onPress={() => handleIconPress()}
				style={styles.iconButton}
				ref={iconRef}
				>
				<Image
					source={iconImageUrl}
					style={{ width: iconSize, height: iconSize }}
				/>
			</TouchableOpacity>
    )
}

const styles = StyleSheet.create({
  iconButton: {
    padding: 4,
  },
});