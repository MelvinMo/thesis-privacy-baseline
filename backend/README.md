## Backend Setup

1. Navigate to the backend directory and install dependencies:

   ```bash
   cd backend
   npm install
   ```

2. Configure environment variables by creating a `.env` file with the following:

   ```
   GEMINI_API_KEY=your_gemini_api_key
   FIREBASE_SERVICE_ACCOUNT_KEY='{ "type": "...", ... , "private_key": "..." }' # Paste the entire JSON string on one line
   JWT_SECRET_KEY=your_jwt_secret_key
   ```

   - **Explanation of Variables:**

     - `GEMINI_API_KEY`: If you choose to use GEMINI - Obtain this from the Google Cloud Console. Otherwise you can use any LLM provider by extending the `LLMService` interface and obtaining the appropriate API key.
     - `FIREBASE_SERVICE_ACCOUNT_KEY`: The JSON service account key from your Firebase project. This key is necessary for the backend to interact with Firebase services (like Firestore). **Important:** Ensure you paste the entire JSON content of the key file into the `.env` file **on a single line**.
     - `JWT_SECRET_KEY`: used to sign and verify the auth tokens

3. Start the development server:

   ```bash
   npm run dev
   ```

   The backend server will typically start on `http://localhost:7000` (or a similar port). Check the console output for the exact URL.
