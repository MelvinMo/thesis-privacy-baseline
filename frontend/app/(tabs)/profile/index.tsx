import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useAuthStore } from '@/store/authStore'; 
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import MenuItem from '@/components/MenuItem';

export default function Profile() {
  const { user, logout } = useAuthStore();
	const router = useRouter();

  if (!user){
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Profile Header */}
        <Text style={styles.header}>Profile</Text>

        {/* User Information */}
        <View style={styles.userInfoContainer}>
          <Text style={styles.name}>
            {`Hello, ${user!.firstName || 'Guest'}`} 
          </Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <MenuItem
						title="Consent Preferences"
						onPress={() => router.push('/(tabs)/profile/consent-preferences')}/>
					
					<MenuItem
						title="Privacy Policy"
						onPress={() => router.push('/privacy-policy')}/>
					{/* Add more menu items as needed */}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutButtonText}>LOGOUT</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

//================================================
// Styles
//================================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'black', 
  },
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'space-between', 
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 40, 
  },
  userInfoContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 50,
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    color: 'white',
    marginBottom: 5,
  },
  menuContainer: {
    width: '100%',
    marginBottom: 50,
  },
  logoutButton: {
    backgroundColor: Colors.generalBlue,
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 12, 
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 10,
  },
  logoutButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
});