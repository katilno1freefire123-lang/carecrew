# CareCrew
It is a app like urban company to where user can book a service and patner will accept the task.
App(react native)+ Admin panel (React+ vite)

CareCrew is a service booking platform with three apps:
- `carecrew-mobile` - React Native (Expo) app for customers and professionals
- `carecrew-admin` - React + Vite admin dashboard
- `carecrew-backend` - Node.js + Express + MongoDB API with Socket.IO
## Project Structure
```text
carecrew/
|-- carecrew-backend/
|-- carecrew-admin/
`-- carecrew-mobile/
Tech Stack
Backend: Node.js, Express, MongoDB (Mongoose), Firebase Admin, Razorpay, Socket.IO
Admin Web: React, Vite, React Router, Axios
Mobile App: React Native (Expo), Firebase Auth, React Navigation, Axios, Socket.IO client
Prerequisites
Node.js 18+ (recommended)
npm
MongoDB (local or Atlas)
Firebase project (for phone auth)
Razorpay account (for payments)
Android Studio/Xcode if building native mobile apps
Setup
1) Clone and install dependencies
git clone <your-repo-url>
cd carecrew
cd carecrew-backend && npm install
cd ../carecrew-admin && npm install
cd ../carecrew-mobile && npm install
2) Configure environment variables
Create/update env files:

carecrew-backend/.env
carecrew-admin/.env
Suggested backend env keys:

NODE_ENV=development
PORT=5000
MONGODB_URI=<your-mongodb-uri>
JWT_SECRET=<your-jwt-secret>
RAZORPAY_KEY_ID=<your-razorpay-key-id>
RAZORPAY_KEY_SECRET=<your-razorpay-key-secret>
FIREBASE_SERVICE_ACCOUNT_KEY=<json-service-account-string>
ADMIN_EMAIL=<admin-email>
ADMIN_PASSWORD=<admin-password>
GOOGLE_TRANSLATE_API_KEY=<optional-google-translate-key>
Admin env:

VITE_API_URL=http://localhost:5000/api
Security note: if real secrets were committed, rotate them immediately and move to secure env management.

3) Mobile API base URL
In carecrew-mobile/src/constants/api.js, set your machine/local API host:

export const API_BASE = "http://<YOUR_LOCAL_IP>:5000/api";
export const SOCKET_BASE = "http://<YOUR_LOCAL_IP>:5000";
Also update image/API base usage where needed (as documented in carecrew-mobile/SETUP.md).

4) Firebase mobile setup
Follow carecrew-mobile/SETUP.md:

add/update google-services.json
verify package id com.carecrew.app
enable Phone auth
configure SHA-1/SHA-256 for Android app
use native build for OTP verification tests when required
Run the Apps
Backend
cd carecrew-backend
npm run dev
Dev: npm run dev (nodemon)
Prod: npm start
Health check: GET /health
Admin
cd carecrew-admin
npm run dev
Dev server (Vite): npm run dev
Build: npm run build
Preview: npm run preview
Mobile
cd carecrew-mobile
npm run start
Useful commands:

npm run start (Expo)
npm run android
npm run ios
API Overview
Base URL: http://localhost:5000/api

Main route groups:

/auth
/bookings
/payments
/admin
/services
/professionals
/notifications
/reviews
/users
/translate
Core Flows
Customer
RoleSelect -> PhoneLogin -> OTPVerify -> ProfileSetup -> Home

Professional
RoleSelect -> PhoneLogin -> OTPVerify -> ProfessionalRegister -> PendingApproval

Deployment Notes
Ensure CORS origins are configured via CORS_ORIGIN (backend supports comma-separated origins)
Keep uploaded files storage and static serving (/uploads) in mind for production
Do not commit .env files or service account keys
Consider separate Firebase/Razorpay keys for dev and prod
Troubleshooting
Mobile cannot hit backend: verify local IP and same network/device access
Phone OTP issues: check Firebase phone auth, SHA keys, and test-number settings
Admin API errors: confirm VITE_API_URL and backend running on port 5000
Socket features not working: confirm backend is running and SOCKET_BASE is correct
