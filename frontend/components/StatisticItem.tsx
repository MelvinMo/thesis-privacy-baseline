import { Colors } from '@/constants/Colors';
import React from 'react';
import { View, StyleSheet, Text, Image, ImageSourcePropType } from 'react-native';

interface StatisticItemProps {
  label: string;
  imageUrl: ImageSourcePropType;
}

export default function StatisticItem ({ label, imageUrl }: StatisticItemProps) {
  return (
    <View>
        <Text style={styles.statisticLabel}>{label}</Text>
        <View style={styles.statisticItem}>
        <Image 
            source={imageUrl} 
            style={styles.statisticImage}
            resizeMode="contain"
        />
        </View>
    </View>
  );
}

// ===============================================================
// Styles
// ===============================================================

const styles = StyleSheet.create({
  statisticItem: {
    backgroundColor: Colors.lightBlack,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  statisticLabel: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  statisticImage: {
    width: '100%',
    height: 200,
  },
});