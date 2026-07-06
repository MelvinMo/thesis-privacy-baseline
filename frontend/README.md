# How to run frontend

1. Navigate to the frontend directory and install dependencies:

   ```bash
   cd frontend
   npm install
   ```

2. Configure environment variables by creating a `.env` file with the following:

   ```
      EXPO_PUBLIC_API_UNENCRYPTED_URL=http://localhost:7000/api # If running locally
      # or
      EXPO_PUBLIC_API_ENCRYPTED_URL=URL_TO_DEPLOYED_APP # If using deployed backend
   ```

- **Explanation of Variables:** These two variables are required to demonstrate the encrypted in transit vs unencrypted in transit part of the data collection process.

3. Running the app:

There are two ways to run the frontend.

- **Using Expo Go**:

  - Expo Go is a sandbox environment for developing and testing React Native applications built with the Expo framework.
  - You must download the Expo Go app to your mobile device.

    ```bash
    npx expo start
    ```

    Scan the barcode in the console with your phone camera and this app will automatically open in the Expo Go app.

- **Using Android Emulator**:

  - **Prebuild the App:** This step prepares the project for building:

    ```bash
    npx expo prebuild
    ```

  - **Run the App on an Emulator:** Ensure you have an Android emulator installed and running. Then, run:

    ```bash
    npx expo run:android
    ```

Expo Go is much quicker and easier to use than the Android emulator, but you need to make sure that the version of Expo Go app downloaded on your device supports the Expo SDK version of this application which is currently SDK 53. You may need to downgrade your Expo Go app and make sure to prevent automatic updates for Expo Go. 
