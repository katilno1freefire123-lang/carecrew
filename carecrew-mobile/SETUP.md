# CareCrew Mobile - Setup Guide

## Folder placement
```text
carecrew/
|-- carecrew-backend/
|-- carecrew-admin/
`-- carecrew-mobile/   <- this folder
```

## Step 1 - Prerequisites
```bash
npm install -g expo-cli
```

## Step 2 - Install dependencies
```bash
cd carecrew-mobile
npm install
```

## Step 3 - Set your backend IP
Open `src/constants/api.js` and replace the IP with your machine local IP:

```js
export const API_BASE = "http://192.168.1.YOUR_IP:5000/api";
export const SOCKET_BASE = "http://192.168.1.YOUR_IP:5000";
```

Also update the same IP in:
- `src/screens/customer/HomeScreen.jsx` (`API_BASE_IMG`)
- `src/screens/customer/ServiceDetailScreen.jsx` (`API_BASE_IMG`)

## Step 4 - Firebase setup
1. Go to Firebase Console -> project `carecrew-9f2e3`.
2. Open Project settings -> Android app.
3. Confirm package name is `com.carecrew.app`.
4. Download `google-services.json` and replace the one in this folder.
5. In Authentication -> Sign-in method, enable `Phone` provider.

## Step 5 - Switch from fake OTP testing to real SMS OTP
1. Firebase Console -> Authentication -> Sign-in method -> Phone.
2. Remove all entries under `Phone numbers for testing`.
3. Ensure App Check enforcement is not blocking auth for your current app build.
4. Add your app SHA certificates in Firebase Android app settings:
   - SHA-1 (required)
   - SHA-256 (strongly recommended)
5. Re-download `google-services.json` after SHA changes and replace local file.
6. Build and run a native Android build (not Expo Go) for phone auth testing.
7. Test with a real phone number that is not listed as a Firebase test number.

Notes:
- The mobile code already uses real Firebase phone auth via `auth().signInWithPhoneNumber(...)`.
- If you still get instant fixed OTP behavior, your Firebase project is still in test-number mode.

## Step 6 - Run the app
```bash
npx expo start
```

For OTP testing, prefer:
```bash
npx expo run:android
```

## App flow
### Customer
`RoleSelect -> PhoneLogin -> OTPVerify -> ProfileSetup -> Home`

### Professional
`RoleSelect -> PhoneLogin -> OTPVerify -> ProfessionalRegister -> PendingApproval`

## Key files
- `src/screens/auth/PhoneLoginScreen.jsx`
- `src/screens/auth/OTPVerifyScreen.jsx`
- `src/context/AuthContext.jsx`
- `src/services/api.js`
