# Ondo Voting System Prototype

This workspace is set up for `Option B`:

- `mobile/`: React Native app for voter capture and voting flow
- `admin/`: React admin web app for election setup and monitoring
- `api/`: Node.js main backend for auth, voter registry, election config, voting, and admin APIs
- `backend/`: Python face service for AWS Face Liveness orchestration and InsightFace-based 1:1 verification
- `docs/`: architecture and setup notes

## Recommended stack

### Mobile

- React Native CLI (bare workflow)
- `react-native-vision-camera` for selfie/video capture
- `react-native-permissions` for camera permission handling
- `@react-native-async-storage/async-storage` for local state/session caching

### Main Backend

- Node.js
- Express
- `cors`, `helmet`, `morgan`
- `axios` for calling the Python face service

### Face Service

- FastAPI
- Uvicorn
- `insightface` for face detection/alignment/embeddings
- `onnxruntime` to run the underlying face model efficiently
- `boto3` for AWS Face Liveness session APIs
- `opencv-python-headless`, `numpy`, `Pillow` for image processing

## Why this split

- `VisionCamera` handles high-quality live image capture on the device.
- `AWS Face Liveness` confirms the person is physically present.
- `InsightFace` generates embeddings for 1:1 voter verification.
- `Express` exposes the main API for mobile and web clients.
- `FastAPI` keeps biometric matching and liveness orchestration in a dedicated service.

## Important design rule

Face verification should confirm identity. Voter eligibility should come from the voter registry managed by the Node.js API.

Flow:

1. Voter enters voter ID.
2. Mobile app captures live face input.
3. Node.js API requests liveness and verification from the face service.
4. Face service compares the live face embedding to the enrolled embedding for that voter.
5. Node.js API checks voter eligibility and voting status.
6. If all checks pass, the ballot is released.

## Current state

This repo is scaffolded locally, but JavaScript package installation has not been run because this machine currently has `node` available without `npm`, `yarn`, `pnpm`, or `corepack`.

See [docs/option-b-setup.md](/Users/dan__vinci/Downloads/final-year-project/docs/option-b-setup.md) for the concrete implementation plan.
See [docs/api-endpoints.md](/Users/dan__vinci/Downloads/final-year-project/docs/api-endpoints.md) for the full Node.js API surface.
See [docs/face-recognition-demo.md](/Users/dan__vinci/Downloads/final-year-project/docs/face-recognition-demo.md) for the first local face-recognition test.
See [docs/mongoose-schemas.md](/Users/dan__vinci/Downloads/final-year-project/docs/mongoose-schemas.md) for the admin/voting database object model.
See [docs/admin-actions-todo.md](/Users/dan__vinci/Downloads/final-year-project/docs/admin-actions-todo.md) for the admin web build checklist.

## Role-Based Access Control (RBAC) System

The administration dashboard is protected by a 5-tier role-based access control system to secure election setups, telemetry, and voters' audits:

### 1. Admin Roles & Permissions

- **SUPER_ADMIN**: Complete access to all sections of the dashboard, including system settings, register/manage administrative users, audit logs, elections, ballot builder, voters, and monitoring.
- **ELECTION_ADMIN**: Focuses on election operations. Allowed to manage elections, ballot layout configurations, candidates registry, audit log listings, and political parties.
- **REGISTRATION_OFFICER**: Focuses on voter intake and profile management. Permitted to browse registered voters lists and manage biometric review profiles.
- **MONITORING_OFFICER**: Focuses on system telemetry and security, with permission to access live telemetry metrics, biometric matching reviews, and verification logs.
- **RESULTS_OFFICER**: Focuses on election outcomes, with exclusive access to results summaries and LGA outcome breakdowns.

### 2. Database Schema Configuration (`AdminRole`)

```prisma
enum AdminRole {
  SUPER_ADMIN
  ELECTION_ADMIN
  REGISTRATION_OFFICER
  MONITORING_OFFICER
  RESULTS_OFFICER
}
```

### 3. Route Protection Middleware

The backend uses `adminOnly` middleware mapping for express endpoints and the frontend uses `<AdminGuard />` to prevent access to administrative panels (like elections and user setups) for restricted roles:

```typescript
// Allow SUPER_ADMIN and ELECTION_ADMIN to pass admin-only endpoints
if (req.user.role !== "SUPER_ADMIN" && req.user.role !== "ELECTION_ADMIN") {
  return res.status(403).json({ message: "Access denied: Admins only" });
}
```

## Security Architecture & Cryptographic Randomization

### 1. Overall Security Architecture
OndoDecide employs a defense-in-depth security model to ensure the confidentiality, integrity, and availability of sensitive voter registration and biometric telemetry:
- **Role-Based Access Control (RBAC)**: Fine-grained tiering restricts access to routes and administrative actions. Users can only perform actions explicitly allowed by their system role.
- **Secure Session Management**: Authentication is performed via JSON Web Tokens (JWT) stored in HTTP-Only cookies. The cookies use `SameSite: strict` and `Secure` (in production) properties to mitigate Cross-Site Scripting (XSS) and Cross-Site Request Forgery (CSRF).
- **Network & API Security**: Cross-Origin Resource Sharing (CORS) rules allow only trusted frontends, and API payload sizes are limited to protect against Denial of Service (DoS) attempts.
- **Data Protection**: Sensible data is stored in PostgreSQL database with strong hashing (using `bcrypt` for passwords and PINs).

### 2. Cryptographically Secure Pseudo-Random Number Generation (CSPRNG)
Predictable random numbers (like `Math.random()`) can be easily guessed by attackers, leading to compromised session IDs, IDs, or activation PINs. OndoDecide mandates cryptographically secure randomization:

- **Why Math.random() is Insufficient**: Standard JavaScript `Math.random()` relies on algorithms (like xorshift128+) that are optimized for speed, not security. Given a sequence of outputs, an attacker can reconstruct the internal state generator and predict all future values.
- **Cryptographical Seeding**: To enforce entropy, OndoDecide uses Node.js's built-in `crypto` module (for backend ID/PIN generation). 
- **CSPRNG Implementation**: The backend utilizes secure random bytes from the operating system's entropy pool (e.g., `/dev/urandom` on Unix or CryptGenRandom on Windows).
- **PIN/ID Security**: The generated six-digit activation PINs are derived from CSPRNG random bytes, preventing reverse-engineering or brute-force predictive modeling.


