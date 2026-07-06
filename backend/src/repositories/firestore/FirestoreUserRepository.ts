import { User } from '../../constants/types/User';
import { UserRepository } from '../UserRepository';
import { db } from '../../config/firebaseConfig'; 
import { DocumentData } from 'firebase-admin/firestore';

/**
 * Firestore implementation of the UserRepository.
 * Handles CRUD operations for user entries in Firestore.
 */
export class FirestoreUserRepository implements UserRepository {
    async createUser(userData: User): Promise<User> {
        try {

            if (!userData.firstName || !userData.lastName || !userData.email || !userData.password) {
                throw new Error('Missing required user data fields.');
            }
            
            // Ensure that this email is unique
            const existingUserSnapshot = await this.getUserByEmail(userData.email);
            if (existingUserSnapshot) {
                throw new Error('User with this email already exists.');
            }

            // Firestore automatically generates a unique ID when .add is used
            const docRef = await db.collection('users').add({
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                password: userData.password, // This should be the already hashed password
                createdAt: new Date(), // Add a timestamp for creation
            });

            const newUser: User = {
                userId: docRef.id,
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                password: userData.password,
            };

            console.log(`User created with ID: ${newUser.userId}`);
            return newUser;
        } catch (error) {
            console.error('Error creating user:', error);
            throw new Error('Failed to create user in Firestore.');
        }
    }

    async getUserById(userId: string): Promise<User | null> {
        try {
            const userDoc = await db.collection('users').doc(userId).get();
            if (!userDoc.exists) {
                return null; // User not found
            }

            const userData = userDoc.data() as DocumentData;
            const user: User = {
                userId: userDoc.id,
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                password: userData.password,
            };

            return user;
        } catch (error) {
            console.error('Error fetching user by ID:', error);
            throw new Error('Failed to fetch user from Firestore.');
        }
    }

    async getUserByEmail(email: string): Promise<User | null> {
        try {
            const usersSnapshot = await db.collection('users').where('email', '==', email).get();
            if (usersSnapshot.empty) {
                return null; // No user found with this email
            }

            const userDoc = usersSnapshot.docs[0];
            const userData = userDoc.data() as DocumentData;
            const user: User = {
                userId: userDoc.id,
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                password: userData.password,
            };

            return user;
        } catch (error) {
            console.error('Error fetching user by email:', error);
            throw new Error('Failed to fetch user from Firestore.');
        }
    }

    async deleteUser(userId: string): Promise<void> {
        try {
            const userDoc = db.collection('users').doc(userId);
            const docSnapshot = await userDoc.get();
            if (!docSnapshot.exists) {
                throw new Error('User not found.');
            }

            await userDoc.delete();
            console.log(`User with ID ${userId} deleted successfully.`);
        } catch (error) {
            console.error('Error deleting user:', error);
            throw new Error('Failed to delete user from Firestore.');
        }
    }

}