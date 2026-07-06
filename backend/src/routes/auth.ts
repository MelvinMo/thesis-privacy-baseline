import express, { Request, Response, Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/UserRepository';
import { FirestoreUserRepository } from '../repositories/firestore/FirestoreUserRepository';
import { User } from '../constants/types/User';

const router: Router = express.Router();

const userRepository: UserRepository = new FirestoreUserRepository();

/*
	Route to authenticate a user and generate a JWT token.
	Example URL: http://{baseURL}/api/auth/login
	Example Request Body:
	{
		"email": "user@example.com",
		"password": "userpassword123"
	}
	
	Validates user credentials and returns a JWT token for authenticated sessions.
	The token expires in 20 days and should be included in the Authorization header for protected routes.
	For security reasons, returns "Invalid credentials" for both non-existent users and incorrect passwords.
	
	Returns a 200 status code on successful authentication with user data and JWT token.
	Returns a 400 status code if email or password are missing, or if credentials are invalid.
	Returns a 500 status code if there is an error during the authentication process.
	
	Example Response:
	{
		"message": "Logged in Successfully",
		"user": {
			"userId": "user123",
			"firstName": "John",
			"lastName": "Doe",
			"email": "user@example.com"
		},
		"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
	}
*/
router.post("/login", async (req: Request, res: Response) => {
	console.log("Login request received");
	const { email, password } = req.body;

	// Basic input validation
	if (!email || !password) {
		res.status(400).json({
			message: "Email and password are required",
		});
		return;
	}

	try {
		const user = await userRepository.getUserByEmail(email);

		// it is better to say invalid credentials than invalid email or invalid password for security reasons
		if (!user) {
			res.status(400).json({
				message: "Invalid credentials",
			});
			return;
		}

		const isPasswordMatch = await bcrypt.compare(password, user.password);

		if (!isPasswordMatch) {
			res.status(400).json({
				message: "Invalid credentials",
			});
			return;
		}

		// generate a token
		const token = jwt.sign({
			userId: user.userId,
		}, process.env.JWT_SECRET_KEY as string, {
			expiresIn: "20d",
		})

		// send the token as part of the response
		res.status(200).json({
			message: "Logged in Successfully",
			user: {
				userId: user.userId,
				firstName: user.firstName,
				lastName: user.lastName,
				email: user.email,
			},
			token
		})

	} catch (error) {
		console.log(error);
		res.status(500).json({
			message: "Something went wrong",
		});
	}
});

/*
	Route to register a new user account.
	Example URL: http://{baseURL}/api/auth/register
	Example Request Body:
	{
		"firstName": "John",
		"lastName": "Doe",
		"email": "user@example.com",
		"password": "userpassword123"
	}
	
	Creates a new user account with hashed password and returns a JWT token for immediate authentication.
	The password is hashed using bcrypt with a salt rounds of 10 for security.
	The generated token expires in 20 days and can be used for authenticated requests.
	
	Returns a 201 status code on successful registration with user data and JWT token.
	Returns a 400 status code if any required fields are missing.
	Returns a 409 status code if a user with the provided email already exists.
	Returns a 500 status code if there is an error during the registration process.
	
	Example Response:
	{
		"message": "User registered successfully",
		"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
		"user": {
			"userId": "user123",
			"firstName": "John",
			"lastName": "Doe",
			"email": "user@example.com"
		}
	}
*/
router.post("/register", async (req: Request, res: Response) => {
	try {
		const { firstName, lastName, email, password } = req.body;
		// Basic input validation
		if (!firstName || !lastName || !email || !password) {
			res.status(400).json({ message: 'All fields (firstName, lastName, email, password) are required.' });
			return;
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		const userData: User = {
			userId: '', // Will be filled by UserRepository
			firstName,
			lastName,
			email,
			password: hashedPassword,
		};

		const newUser = await userRepository.createUser(userData);

		if (!newUser) {
			res.status(500).json({ message: 'Failed to create user.' });
			return;
		}

		const jwtSecret = process.env.JWT_SECRET_KEY;

		const token = jwt.sign({ userId: newUser.userId }, jwtSecret as string, { expiresIn: '20d' }); // Token expires in 20 days

		res.status(201).json({
			message: 'User registered successfully',
			token,
			user: {
				userId: newUser.userId,
				firstName: newUser.firstName,
				lastName: newUser.lastName,
				email: newUser.email
			}
		});
	} catch (error: any) {
		console.error('Registration error:', error);
		// Provide more specific error messages based on the type of error
		if (error.message.includes('User with this email already exists')) {
			res.status(409).json({ message: error.message }); // 409 Conflict
			return;
		}
		res.status(500).json({ message: 'Failed to register user.', error: error.message });
	}
});

export default router;