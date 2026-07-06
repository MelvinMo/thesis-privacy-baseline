import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

interface HeaderProps {
  title: string;
  onBackPress?: () => void;
}

const OnboardingHeader = ({ title, onBackPress }: HeaderProps) => {
  return (
    <View style={styles.headerContainer}>
      <View style={[
        styles.headerContent,
        onBackPress ? styles.headerContentWithBackButton : styles.headerContentWithoutBackButton
      ]}>
        {onBackPress && (
          <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={Colors.generalBlue} />
          </TouchableOpacity>
        )}
        <Text style={[
          styles.headerTitle,
          onBackPress ? styles.headerTitleWithBackButton : styles.headerTitleWithoutBackButton
        ]}>
          {title}
        </Text>
      </View>
    </View>
  );
};

// =============================================================
// STYLES
// =============================================================

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    paddingTop: 60,
    paddingBottom: 20,
    minHeight: 120,
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center', 
    paddingHorizontal: 20,
  },
  headerContentWithBackButton: {
    justifyContent: 'flex-start',
  },
  headerContentWithoutBackButton: {
    justifyContent: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 10,
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitleWithBackButton: {
    flex: 1, 
    textAlign: 'left', 
  },
  headerTitleWithoutBackButton: {
    textAlign: 'center',
  },
});

export default OnboardingHeader;