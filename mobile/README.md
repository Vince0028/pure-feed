# Pure Feed Mobile App

This directory contains the React Native (Expo) implementation of the Pure Feed web application.

## Prerequisites
- Node.js installed
- Expo Go app on your physical iOS/Android device (or an Android Emulator / iOS Simulator)

## Running Locally

1. Open a terminal and navigate to the `mobile` directory:
   ```bash
   cd mobile
   ```

2. Start the Expo development server:
   ```bash
   npm run start
   ```
   *(Optionally use `npx expo start -c` to clear the cache if styling looks weird).*

3. **To view on your phone:** Open the Expo Go app and scan the QR code that appears in your terminal.
4. **To view on an emulator:** Press `a` in the terminal for Android, or `i` for iOS Simulator.

## Environment Variables
The app connects to the Supabase backend. It uses placeholder environment variables in `src/lib/supabase.ts` which falls back to strings. 
To make it work fully with live data, create a `.env` file in the `mobile/` directory:
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Building an Installable Android APK

To generate a standalone `.apk` file that anyone can install on an Android phone without Expo Go:

1. Install Expo Application Services (EAS) CLI:
   ```bash
   npm install -g eas-cli
   ```
2. Log in to your Expo account (create one free at expo.dev if you haven't):
   ```bash
   eas login
   ```
3. Run the build command:
   ```bash
   eas build -p android --profile preview
   ```
4. Wait for the build to finish in the cloud (usually takes 10-15 mins). It will provide a download link to your `.apk`!
