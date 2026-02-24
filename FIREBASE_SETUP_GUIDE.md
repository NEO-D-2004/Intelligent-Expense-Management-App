# Firebase Setup Guide for Expenzo

Follow these steps to get your Firebase configuration values for the `.env` file and enable authentication.

## 1. Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** (or **Create a project**).
3. Enter a name (e.g., `Expenzo-App`) and follow the setup prompts. (Google Analytics is optional).

## 2. Register Your Web App
1. On the Project Overview page, click the **Web icon (</>)**.
2. Enter an App nickname (e.g., `Expenzo-Web`).
3. Click **Register app**.
4. You will see a `firebaseConfig` object. **Copy these values** into your `.env` file in the project root.

> [!TIP]
> If you already closed this window, go to **Project Settings** (gear icon) > **General** > **Your apps** to find it again.

## 3. Enable Authentication Providers
1. In the left sidebar, go to **Build** > **Authentication**.
2. Click **Get Started**.
3. Go to the **Sign-in method** tab.
4. Enable **Email/Password** (Enable both 'Email/Password' and 'Email link').
5. Enable **Google** (You may need to select a support email).

## 4. (Required for Android) Download Configuration
1. Go back to **Project Settings** (gear icon) > **General**.
2. Click **Add app** and select the **Android icon**.
3. Enter your package name: `com.kadha.expensemanager` (You can find this in `capacitor.config.json`).
4. Click **Register app**.
5. Download the `google-services.json` file.
6. Move this file to the `android/app/` directory in your project.

## 5. Summary of .env Values
Your `.env` file should look like this:
```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=expenzo-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=expenzo-app
VITE_FIREBASE_STORAGE_BUCKET=expenzo-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef...
```
