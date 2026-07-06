import { View, ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/Colors';

type LoaderProps = {
    size?: 'small' | 'large';
};

export default function Loader({ size = "large" }: LoaderProps) {
    return (
        <View
            style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: Colors.lightBlack,
            }}
        >
            <ActivityIndicator size={size} color={Colors.generalBlue} />
        </View>
    );
}