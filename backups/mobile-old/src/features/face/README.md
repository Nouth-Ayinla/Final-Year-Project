# Mobile Face Capture Notes

Use `react-native-vision-camera` for:

- front-facing camera access
- guided selfie capture
- previewing the face before upload

Recommended mobile responsibilities:

- request camera permission
- collect voter ID before capture
- capture one clear face photo for verification
- upload to FastAPI

Do not do the final biometric decision in the app. The backend should decide.
