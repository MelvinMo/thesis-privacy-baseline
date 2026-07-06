import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from "@/constants/Colors"; 

interface OnboardingQuestionOptionProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}

const OnboardingQuestionOption = ({ label, isSelected, onPress }: OnboardingQuestionOptionProps) => {
  return (
    <TouchableOpacity
      style={[styles.optionButton, isSelected && styles.optionButtonSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
        {label}
      </Text>
      {isSelected && (
        <Ionicons
          name="checkmark-circle"
          size={24}
          color="white" 
          style={styles.checkmarkIcon}
        />
      )}
    </TouchableOpacity>
  );
};

// =============================================================
// STYLES
// =============================================================

const styles = StyleSheet.create({
  optionButton: {
    backgroundColor: 'transparent', 
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: Colors.generalBlue,
    marginBottom: 16, 
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%', 
  },
  optionButtonSelected: {
    backgroundColor: Colors.generalBlue,
    borderColor: Colors.generalBlue,
  },
  optionText: {
    color: Colors.generalBlue,
    fontSize: 18,
    fontWeight: 'bold',
  },
  optionTextSelected: {
    color: 'white',
  },
  checkmarkIcon: {
    position: 'absolute',
    right: 20,
  },
});

export default OnboardingQuestionOption;