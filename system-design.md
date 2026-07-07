# Ondo Voting System - System Design Documentation

## Table of Contents
1. [System Overview](#1-system-overview)
2. [Facial Recognition System](#2-facial-recognition-system)
3. [Mathematical Model of Facial Recognition](#3-mathematical-model-of-facial-recognition)
4. [System Data Design](#4-system-data-design)
5. [Use Case Design](#5-use-case-design)
6. [System Flowchart](#6-system-flowchart)

---

## 1. System Overview

The Ondo Voting System is a secure, biometric-enabled electronic voting platform designed for Nigerian elections. The system consists of four main modules:

### 1.1 Module Architecture

**apps/admin-portal**
- **Tech**: Next.js 16, React 19, TypeScript, TailwindCSS, shadcn/ui
- **Purpose**: Administrative dashboard for election management
- **Key Features**: 
  - 5-tier RBAC system (SUPER_ADMIN, ELECTION_ADMIN, REGISTRATION_OFFICER, MONITORING_OFFICER, RESULTS_OFFICER)
  - Election setup and configuration
  - Ballot builder with drag-and-drop interface
  - Voter registry management
  - Live telemetry monitoring
  - Results viewing and LGA breakdowns

**apps/voter-mobile**
- **Tech**: React Native, Expo Router, TypeScript, Zustand
- **Purpose**: Mobile app for voter registration and voting
- **Key Features**:
  - Voter ID entry and authentication
  - Camera integration for face capture
  - Biometric verification flow
  - Ballot casting interface
  - Secure local storage for session management

**services/core-api**
- **Tech**: Node.js, Express, Prisma ORM, PostgreSQL
- **Purpose**: Central backend API for all business logic
- **Key Features**:
  - Voter registry and eligibility verification
  - Election configuration and management
  - Admin authentication and authorization
  - Voting record management
  - Orchestrates face verification via face-service
  - Telemetry and audit logging

**services/face-service**
- **Tech**: Python, FastAPI, InsightFace, AWS Rekognition
- **Purpose**: Biometric verification and liveness detection
- **Key Features**:
  - Face detection and alignment
  - Face embedding generation for 1:1 verification
  - AWS Face Liveness session orchestration
  - Image processing and comparison
  - Returns verification results to core-api

### 1.2 System Flow

1. Voter enters ID on mobile app
2. Mobile captures live face data
3. Core-api requests verification from face-service
4. Face-service compares live face to enrolled embedding
5. Core-api validates eligibility and voting status
6. Ballot released if all checks pass

---

## 2. Facial Recognition System

### 2.1 Technology Stack
- **Face Service**: Python FastAPI with InsightFace (ArcFace embeddings)
- **Model**: buffalo_l pretrained model via ONNX Runtime
- **Comparison**: Cosine similarity between normalized embedding vectors

### 2.2 Enrollment Flow
1. Voter registers via admin portal with profile photo
2. Photo stored in Cloudinary
3. When first verification is attempted, core-api auto-enrolls:
   - Downloads photo from Cloudinary
   - Sends to face-service `/api/v1/face/enroll`
   - Face-service detects face, extracts embedding, stores by voter_id

### 2.3 Verification Flow
1. Mobile app captures live face via camera
2. App sends image + voter_id to face-service `/api/v1/face/verify`
3. Face-service processes:
   - Detects face in image (selects largest if multiple)
   - Extracts 512D embedding vector using InsightFace
   - Normalizes embedding
   - Compares with enrolled embedding using cosine similarity
   - Returns match result (similarity score + boolean)
4. Core-api logs attempt to database (SUCCESS/FAILED)
5. If match succeeds, voter proceeds to ballot

### 2.4 Key Implementation Details
- **Face Detection**: InsightFace handles detection and alignment
- **Embedding**: ArcFace-style 512-dimensional vectors
- **Similarity Threshold**: Configurable threshold for match decision
- **Fallback**: Auto-enrollment if template missing during verification
- **Liveness**: AWS Rekognition integration available (currently commented out)

### 2.5 Security Features
- 1:1 verification (not 1:N identification)
- Embeddings stored server-side in face-service
- All attempts logged to PostgreSQL for audit trail
- Profile pictures stored securely in Cloudinary

### 2.6 Fingerprint Authentication (Device-Level)

**Technology**
- **Library**: `expo-local-authentication` 
- **Type**: Device-level biometric authentication
- **Hardware**: Uses device's secure enclave (Touch ID, Face ID, fingerprint sensor, iris scanner)

**How It Works**
1. App checks if device has biometric hardware support
2. Checks if user has enrolled biometrics on device
3. When user taps "Verify", triggers system biometric prompt
4. Device OS handles authentication locally
5. Returns success/failure to app - no biometric data ever leaves device

**Key Differences from Facial Recognition**

| **Fingerprint** | **Facial Recognition** |
|----------------|----------------------|
| Local device authentication | Server-side identity verification |
| Uses device secure hardware | Uses custom Python service (InsightFace) |
| No biometric data sent to server | Face images sent to face-service |
| For app access/convenience | For voting identity verification |
| Quick, one-tap authorization | Requires camera capture and processing |

**Purpose in System**
- **Fingerprint**: Convenient app unlock, quick authorization for already-authenticated users
- **Facial Recognition**: Required for voting - proves you are the enrolled voter before ballot access

**Security Model**
- **Fingerprint**: Data never leaves device, handled by Apple/Android secure hardware
- **Facial Recognition**: Embeddings stored server-side, logged to PostgreSQL for audit trail

---

## 3. Mathematical Model of Facial Recognition

### 3.1 Face Embedding Generation

The facial recognition system employs ArcFace (Additive Angular Margin Loss) to generate discriminative face embeddings. Given an input face image $I$, the embedding generation process can be formalized as follows:

Let $f_\theta: \mathcal{I} \rightarrow \mathbb{R}^d$ represent the deep neural network with parameters $\theta$ that maps an input image $I \in \mathcal{I}$ to a $d$-dimensional embedding vector, where $d = 512$ in this implementation.

The embedding extraction process involves:

**Face Detection and Alignment**: 
Given input image $I$, the system detects face regions and aligns them to a canonical coordinate system:
$$
\{B_1, B_2, \ldots, B_n\} = \text{Detect}(I)
$$
where $B_i$ represents the bounding box of the $i$-th detected face. The largest face is selected:
$$
B^* = \arg\max_{B_i} \text{Area}(B_i)
$$

**Feature Extraction**:
The aligned face region is passed through the ArcFace network:
$$
\mathbf{e} = f_\theta(I_{\text{aligned}})
$$
where $\mathbf{e} \in \mathbb{R}^{512}$ is the raw embedding vector.

**L2 Normalization**:
To ensure scale-invariance, the embedding is normalized to unit length:
$$
\hat{\mathbf{e}} = \frac{\mathbf{e}}{\|\mathbf{e}\|_2} = \frac{\mathbf{e}}{\sqrt{\sum_{i=1}^{512} e_i^2}}
$$
where $\|\cdot\|_2$ denotes the Euclidean (L2) norm.

### 3.2 Cosine Similarity Computation

For 1:1 face verification, the system compares the probe embedding $\hat{\mathbf{e}}_{\text{probe}}$ (live capture) with the enrolled embedding $\hat{\mathbf{e}}_{\text{enrolled}}$ (stored template) using cosine similarity:

$$
\text{sim}(\hat{\mathbf{e}}_{\text{probe}}, \hat{\mathbf{e}}_{\text{enrolled}}) = \frac{\hat{\mathbf{e}}_{\text{probe}} \cdot \hat{\mathbf{e}}_{\text{enrolled}}}{\|\hat{\mathbf{e}}_{\text{probe}}\|_2 \|\hat{\mathbf{e}}_{\text{enrolled}}\|_2}
$$

Since both embeddings are L2-normalized ($\|\hat{\mathbf{e}}\|_2 = 1$), this simplifies to:

$$
\text{sim}(\hat{\mathbf{e}}_{\text{probe}}, \hat{\mathbf{e}}_{\text{enrolled}}) = \hat{\mathbf{e}}_{\text{probe}} \cdot \hat{\mathbf{e}}_{\text{enrolled}} = \sum_{i=1}^{512} \hat{e}_{\text{probe},i} \cdot \hat{e}_{\text{enrolled},i}
$$

The cosine similarity yields a value in the range $[-1, 1]$, where:
- $\text{sim} = 1$: Identical embeddings (perfect match)
- $\text{sim} = 0$: Orthogonal embeddings (no correlation)
- $\text{sim} = -1$: Opposite embeddings (maximum dissimilarity)

### 3.3 Threshold Decision Function

The verification decision is determined by comparing the similarity score against a predefined threshold $\tau$:

$$
\text{Match}(\hat{\mathbf{e}}_{\text{probe}}, \hat{\mathbf{e}}_{\text{enrolled}}) = 
\begin{cases} 
\text{True} & \text{if } \text{sim}(\hat{\mathbf{e}}_{\text{probe}}, \hat{\mathbf{e}}_{\text{enrolled}}) \geq \tau \\
\text{False} & \text{if } \text{sim}(\hat{\mathbf{e}}_{\text{probe}}, \hat{\mathbf{e}}_{\text{enrolled}}) < \tau 
\end{cases}
$$

The threshold $\tau$ is a hyperparameter that balances false acceptance rate (FAR) and false rejection rate (FRR). Typical values for ArcFace embeddings range from $0.25$ to $0.50$, depending on the security requirements.

### 3.4 ArcFace Loss Function (Training Perspective)

During training, ArcFace optimizes the embedding space using additive angular margin loss. For a given sample with embedding $\mathbf{x}$ and ground-truth class $y$, the loss is:

$$
L_{\text{ArcFace}} = -\log\frac{e^{s(\cos(\theta_{y_i} + m))}}{e^{s(\cos(\theta_{y_i} + m))} + \sum_{j \neq y_i} e^{s\cos\theta_j}}
$$

where:
- $\theta_{y_i}$ is the angle between the embedding and the weight vector for the true class
- $m$ is the angular margin penalty (typically $0.5$)
- $s$ is the feature scale factor (typically $64$)
- The angular margin enforces intra-class compactness and inter-class separability

This loss function ensures that embeddings of the same identity are clustered tightly in the hypersphere while different identities are well-separated, enabling robust verification using simple cosine similarity.

---

## 4. System Data Design

### 4.1 Database Overview

The system uses PostgreSQL as the primary database managed through Prisma ORM. The schema consists of 9 core models organized into three functional domains: **User Management**, **Election Operations**, and **Security/Audit Logging**.

### 4.2 Entity-Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐
│     Admin       │       │     Voter       │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ firstName       │       │ firstName       │
│ surname         │       │ surname         │
│ email (UNIQUE)  │       │ email (UNIQUE)  │
│ adminId (UNIQUE)│       │ voterId (UNIQUE)│
│ role (ENUM)     │       │ profilePicture  │
│ isActivated     │       │ isActivated     │
│ createdById (FK)│◄──────│ createdById (FK)│
│ createdAt       │       │ createdAt       │
└────────┬────────┘       └────────┬────────┘
         │                          │
         │ self-referential         │
         │ (AdminCreator)           │
         │                          │
         └──────────┬───────────────┘
                    │
                    │ creates
                    │
                    ▼
         ┌─────────────────┐
         │    Election     │
         ├─────────────────┤
         │ id (PK)         │
         │ title (UNIQUE)  │
         │ status (ENUM)   │◄─── DRAFT, ACTIVE, CLOSED, UPCOMING
         │ startDate       │
         │ endDate         │
         │ createdAt       │
         └────────┬────────┘
                  │
                  │ contains
                  │
         ┌────────┴────────┐
         │                 │
         ▼                 ▼
┌─────────────────┐ ┌─────────────────┐
│    Candidate    │ │      Vote       │
├─────────────────┤ ├─────────────────┤
│ id (PK)         │ │ id (PK)         │
│ firstName       │ │ voterId (FK)    │
│ surname         │ │ electionId (FK) │
│ partyId (FK)    │ │ candidateId (FK)│
│ electionId (FK) │ │ createdAt       │
│ imageUrl        │ └─────────────────┘
│ bio             │   @@unique([voterId, electionId])
│ createdAt       │
└────────┬────────┘
         │
         │ belongs to
         │
         ▼
┌─────────────────┐
│     Party       │
├─────────────────┤
│ id (PK)         │
│ name (UNIQUE)   │
│ abbreviation    │
│ primaryColor    │
│ logoUrl         │
└─────────────────┘

┌─────────────────────┐ ┌─────────────────────┐
│ DuplicateVoteAttempt│ │  BiometricAttempt   │
├─────────────────────┤ ├─────────────────────┤
│ id (PK)             │ │ id (PK)             │
│ voterId (FK)        │ │ voterId (FK)        │
│ electionId (FK)     │ │ electionId (FK)     │
│ candidateId (FK)    │ │ status (ENUM)       │◄─── SUCCESS, FAILED
│ createdAt           │ │ createdAt           │
└─────────────────────┘ └─────────────────────┘

┌─────────────────┐
│ SecurityAlert  │
├─────────────────┤
│ id (PK)         │
│ type (ENUM)     │◄─── warning, success, info, danger
│ title           │
│ description     │
│ createdAt       │
└─────────────────┘
```

### 4.3 Core Entities

#### User Management Domain

**Admin**
- **Purpose**: Administrative users with role-based access control
- **Key Fields**: `adminId` (unique identifier), `role` (5-tier RBAC), `isActivated`
- **Relationships**: Self-referential for audit trail (who created which admin), creates Voters
- **Security**: `activationPin` for secure account activation

**Voter**
- **Purpose**: Registered voters eligible to participate in elections
- **Key Fields**: `voterId` (unique identifier), `profilePicture` (Cloudinary URL), `isActivated`
- **Relationships**: Created by Admin, has many Votes, DuplicateVoteAttempts, BiometricAttempts
- **Security**: `activationPin` for secure account activation

#### Election Operations Domain

**Election**
- **Purpose**: Represents individual electoral events
- **Key Fields**: `title` (unique), `status` (DRAFT/ACTIVE/UPCOMING/CLOSED), date range
- **Relationships**: Has many Candidates, Votes, and audit logs
- **Constraints**: Status transitions controlled through business logic

**Candidate**
- **Purpose**: Individuals contesting in elections
- **Key Fields**: Personal details, `partyId`, `electionId`, `imageUrl`, `bio`
- **Relationships**: Belongs to Party and Election, has many Votes
- **Constraints**: `onDelete: Cascade` from Election (candidates removed if election deleted)

**Party**
- **Purpose**: Political parties fielding candidates
- **Key Fields**: `name` (unique), `abbreviation`, branding colors, `logoUrl`
- **Relationships**: Has many Candidates
- **Constraints**: `isActive` flag for soft deletion

**Vote**
- **Purpose**: Records individual ballot casts
- **Key Fields**: `voterId`, `electionId`, `candidateId`
- **Relationships**: Belongs to Voter, Election, Candidate
- **Constraints**: 
  - `@@unique([voterId, electionId])` - prevents duplicate voting
  - `onDelete: Cascade` from all parent entities
  - Indexes on `electionId` and `candidateId` for query optimization

#### Security/Audit Logging Domain

**DuplicateVoteAttempt**
- **Purpose**: Logs attempted duplicate votes for security monitoring
- **Key Fields**: `voterId`, `electionId`, `candidateId`, timestamp
- **Relationships**: Links to Voter, Election, Candidate
- **Use Case**: Fraud detection and pattern analysis

**BiometricAttempt**
- **Purpose**: Logs all facial recognition verification attempts
- **Key Fields**: `voterId`, `electionId`, `status` (SUCCESS/FAILED), timestamp
- **Relationships**: Links to Voter and Election
- **Use Case**: Biometric system performance monitoring and audit trail
- **Indexes**: On `electionId` and `voterId` for telemetry queries

**SecurityAlert**
- **Purpose**: System-wide security notifications
- **Key Fields**: `type` (warning/success/info/danger), `title`, `description`
- **Use Case**: Real-time security dashboard alerts

### 4.4 Enumerations

**AdminRole** (5-tier RBAC)
- `SUPER_ADMIN` - Full system access
- `ELECTION_ADMIN` - Election operations
- `REGISTRATION_OFFICER` - Voter management
- `MONITORING_OFFICER` - Telemetry and security
- `RESULTS_OFFICER` - Results viewing only

**ElectionStatus**
- `DRAFT` - Configuration phase
- `UPCOMING` - Scheduled but not active
- `ACTIVE` - Voting in progress
- `CLOSED` - Voting ended

**Demographic Enums**
- `Sex`: MALE, FEMALE
- `MaritalStatus`: SINGLE, MARRIED, DIVORCED, WIDOWED
- `EducationLevel`: PRIMARY, SECONDARY, TERTIARY

### 4.5 Key Constraints & Indexes

- **Unique Constraints**: Prevent duplicate admins, voters, elections, parties, and votes per voter per election
- **Foreign Key Cascades**: Maintain referential integrity (votes deleted if voter/election/candidate removed)
- **Performance Indexes**: Optimized for common query patterns (election lookups, voter verification, telemetry)
- **Audit Trail**: Created/updated timestamps on all entities, creator tracking on Admin and Voter

---

## 5. Use Case Design

### 5.1 Use Case Diagram

```
                    ┌─────────────────┐
                    │   Ondo Voting   │
                    │     System      │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│     Voter     │   │     Admin     │   │   System      │
│   (Actor)     │   │   (Actor)     │   │  (External)   │
└───────┬───────┘   └───────┬───────┘   └───────────────┘
        │                   │
        │                   │
        ▼                   ▼
┌───────────────────────────────────────────────────────┐
│                    VOTER USE CASES                      │
├───────────────────────────────────────────────────────┤
│  UC-01: Register Voter Account                         │
│  UC-02: Login with Voter ID & PIN                       │
│  UC-03: View Active Elections                          │
│  UC-04: View Candidate Details                         │
│  UC-05: Perform Facial Recognition Verification       │
│  UC-06: Cast Vote                                      │
│  UC-07: Enable Fingerprint Authentication              │
│  UC-08: View Voting History                            │
└───────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────┐
│                   ADMIN USE CASES                      │
├───────────────────────────────────────────────────────┤
│  UC-09: Admin Login                                    │
│  UC-10: Create/Manage Admin Accounts                   │
│  UC-11: Register New Voters                           │
│  UC-12: Create Election                                │
│  UC-13: Configure Ballot Layout                        │
│  UC-14: Register Political Parties                     │
│  UC-15: Add Candidates to Election                     │
│  UC-16: Monitor Live Voting Telemetry                 │
│  UC-17: View Biometric Verification Logs               │
│  UC-18: View Duplicate Vote Attempts                   │
│  UC-19: Generate Election Results                      │
│  UC-20: Manage Voter Profiles                          │
└───────────────────────────────────────────────────────┘
```

### 5.2 Use Case Descriptions

#### Voter Use Cases

| **UC ID** | **Use Case** | **Description** | **Preconditions** | **Postconditions** |
|-----------|--------------|------------------|-------------------|--------------------|
| UC-01 | Register Voter Account | Voter creates account using personal details and activation PIN | Valid voter ID from registration officer | Account created, pending activation |
| UC-02 | Login with Voter ID & PIN | Voter authenticates using voter ID and activation PIN | Account activated | Session established, access granted |
| UC-03 | View Active Elections | Voter browses available elections | Logged in | Election list displayed |
| UC-04 | View Candidate Details | Voter views candidate information including bio and party | Selected election | Candidate details shown |
| UC-05 | Perform Facial Recognition Verification | Voter verifies identity via face scan before voting | Logged in, enrolled face template | Identity confirmed, ballot access granted |
| UC-06 | Cast Vote | Voter selects candidate and submits ballot | Identity verified, election active | Vote recorded, duplicate prevented |
| UC-07 | Enable Fingerprint Authentication | Voter links device fingerprint for quick access | Device supports biometrics | Fingerprint linked to account |
| UC-08 | View Voting History | Voter views past voting records | Logged in | History displayed |

#### Admin Use Cases

| **UC ID** | **Use Case** | **Description** | **Preconditions** | **Postconditions** |
|-----------|--------------|------------------|-------------------|--------------------|
| UC-09 | Admin Login | Admin authenticates with credentials | Valid admin account | Session established based on role |
| UC-10 | Create/Manage Admin Accounts | SUPER_ADMIN creates other admin accounts | SUPER_ADMIN role | New admin account created |
| UC-11 | Register New Voters | REGISTRATION_OFFICER enrolls voters with photos | REGISTRATION_OFFICER role | Voter record created with profile picture |
| UC-12 | Create Election | ELECTION_ADMIN sets up new election | ELECTION_ADMIN role | Election created in DRAFT status |
| UC-13 | Configure Ballot Layout | ELECTION_ADMIN designs ballot appearance | Election in DRAFT | Ballot layout saved |
| UC-14 | Register Political Parties | ELECTION_ADMIN adds political parties | ELECTION_ADMIN role | Party registered with branding |
| UC-15 | Add Candidates to Election | ELECTION_ADMIN adds candidates to elections | Party exists, election in DRAFT | Candidate linked to election |
| UC-16 | Monitor Live Voting Telemetry | MONITORING_OFFICER views real-time voting stats | MONITORING_OFFICER role | Telemetry dashboard displayed |
| UC-17 | View Biometric Verification Logs | MONITORING_OFFICER reviews face verification attempts | MONITORING_OFFICER role | Verification logs shown |
| UC-18 | View Duplicate Vote Attempts | MONITORING_OFFICER sees blocked duplicate attempts | MONITORING_OFFICER role | Fraud attempts displayed |
| UC-19 | Generate Election Results | RESULTS_OFFICER views election outcomes | Election CLOSED | Results by LGA displayed |
| UC-20 | Manage Voter Profiles | REGISTRATION_OFFICER updates voter information | REGISTRATION_OFFICER role | Voter profile updated |

### 5.3 Actor-System Relationships

**Primary Actors:**
- **Voter**: End-user who participates in elections
- **Admin**: System administrators with varying permission levels

**Secondary Actors:**
- **Face Recognition Service**: External Python microservice for biometric verification
- **Cloudinary**: External cloud storage for profile pictures

**Generalization Relationships:**
- Admin roles inherit base permissions with role-specific extensions
- All actors require authentication before accessing protected features

---

## 6. System Flowchart

### 6.1 End-to-End Voting Flowchart

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        VOTING PROCESS FLOWCHART                              │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌──────────┐
                              │  START   │
                              └────┬─────┘
                                   │
                                   ▼
                    ┌──────────────────────────┐
                    │  Voter Opens Mobile App  │
                    └──────────┬───────────────┘
                               │
                               ▼
                    ┌──────────────────────────┐
                    │   Enter Voter ID & PIN   │
                    └──────────┬───────────────┘
                               │
                               ▼
                    ┌──────────────────────────┐     ┌─────────────────┐
                    │   Validate Credentials   │────▶│  Invalid: Show  │
                    └──────────┬───────────────┘     │  Error Message  │
                               │ YES                 └────────┬────────┘
                               ▼                              │
                    ┌──────────────────────────┐              │
                    │  Check Account Status   │◄─────────────┘
                    └──────────┬───────────────┘
                               │
                     ┌─────────┴─────────┐
                     │                   │
                     ▼                   ▼
              ┌─────────────┐     ┌─────────────┐
              │ Activated?  │     │ Not Active │
              └──────┬──────┘     │ Redirect to │
                     │ YES         │ Activation  │
                     ▼             └─────────────┘
          ┌──────────────────────┐
          │  View Active Elections│
          └──────────┬───────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │  Select Election     │
          └──────────┬───────────┘
                     │
                     ▼
          ┌──────────────────────┐     ┌─────────────────┐
          │  Check Election      │────▶│  Not Active:    │
          │  Status             │     │  Show Message   │
          └──────────┬───────────┘     └────────┬────────┘
                     │ ACTIVE                      │
                     ▼                              │
          ┌──────────────────────┐              │
          │  View Candidates      │◄─────────────┘
          └──────────┬───────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │  Select Candidate     │
          └──────────┬───────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │  Initiate Vote       │
          └──────────┬───────────┘
                     │
                     ▼
          ┌──────────────────────┐     ┌─────────────────┐
          │  Check if Already    │────▶│  Already Voted: │
          │  Voted in Election   │     │  Block & Log    │
          └──────────┬───────────┘     └────────┬────────┘
                     │ NO                          │
                     ▼                              │
          ┌──────────────────────┐              │
          │  Request Camera      │◄─────────────┘
          │  Permission          │
          └──────────┬───────────┘
                     │
                     ▼
          ┌──────────────────────┐     ┌─────────────────┐
          │  Permission Granted? │────▶│  Denied: Show   │
          └──────────┬───────────┘     │  Error & Exit   │
                     │ YES                 └────────┬────────┘
                     ▼                              │
          ┌──────────────────────┐              │
          │  Launch Camera       │◄─────────────┘
          └──────────┬───────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │  Capture Face Image  │
          └──────────┬───────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │  Send to Face Service│
          │  (voter_id + image) │
          └──────────┬───────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │  Face Service:       │
          │  - Detect Face      │
          │  - Extract Embedding│
          │  - Compare with     │
          │    Enrolled Template│
          └──────────┬───────────┘
                     │
                     ▼
          ┌──────────────────────┐     ┌─────────────────┐
          │  Similarity ≥       │────▶│  No: Log Failed │
          │  Threshold?         │     │  Attempt, Block │
          └──────────┬───────────┘     └────────┬────────┘
                     │ YES                          │
                     ▼                              │
          ┌──────────────────────┐              │
          │  Log SUCCESS to      │◄─────────────┘
          │  BiometricAttempt    │
          └──────────┬───────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │  Display Ballot      │
          └──────────┬───────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │  Confirm Vote Choice │
          └──────────┬───────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │  Submit Vote to API  │
          └──────────┬───────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │  Server: Validate    │
          │  - Voter Eligibility │
          │  - Election Status   │
          │  - Candidate Exists  │
          └──────────┬───────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │  Create Vote Record  │
          │  (voter_id,          │
          │   election_id,       │
          │   candidate_id)      │
          └──────────┬───────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │  Update Candidate    │
          │  Vote Count          │
          └──────────┬───────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │  Return Success      │
          │  Response           │
          └──────────┬───────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │  Display Confirmation│
          │  & Vote Receipt      │
          └──────────┬───────────┘
                     │
                     ▼
                    ┌──────────┐
                    │   END    │
                    └──────────┘
```

### 6.2 Flowchart Legend

| **Symbol** | **Meaning** |
|------------|-------------|
| `START/END` | Terminal points - process beginning and end |
| `Process` | Action or operation performed |
| `Decision` | Conditional branch with YES/NO paths |
| `Input/Output` | Data entry or display to user |
| `Database` | Data storage or retrieval operation |

### 6.3 Critical Decision Points

1. **Authentication Validation** (Line 7-9)
   - Validates voter credentials before granting access
   - Prevents unauthorized system entry

2. **Account Status Check** (Line 11-14)
   - Ensures only activated voters can vote
   - Blocks inactive accounts

3. **Election Status Verification** (Line 17-19)
   - Confirms election is ACTIVE
   - Prevents voting in DRAFT, UPCOMING, or CLOSED elections

4. **Duplicate Vote Prevention** (Line 24-26)
   - Database constraint: `@@unique([voterId, electionId])`
   - Logs attempt to `DuplicateVoteAttempt` table

5. **Camera Permission** (Line 28-31)
   - Required for facial recognition
   - Graceful fallback if denied

6. **Facial Recognition Threshold** (Line 38-40)
   - Cosine similarity comparison
   - Configurable threshold for security level
   - Logs all attempts to `BiometricAttempt` table

7. **Server-Side Validation** (Line 47-49)
   - Final verification before vote recording
   - Prevents client-side manipulation

### 6.4 Error Handling Paths

- **Invalid Credentials**: Return to login with error message
- **Inactive Account**: Redirect to activation flow
- **Wrong Election Status**: Display appropriate message (not yet started/ended)
- **Duplicate Vote**: Log attempt, display error, block submission
- **Camera Denied**: Show error, exit voting flow
- **Face Mismatch**: Log failed attempt, allow retry (with rate limiting)
- **Server Error**: Display error, allow retry with exponential backoff

### 6.5 Security Checkpoints

1. **Authentication**: Voter ID + PIN validation
2. **Authorization**: Account activation status
3. **Temporal**: Election active time window
4. **Uniqueness**: One vote per voter per election
5. **Biometric**: Facial recognition verification
6. **Integrity**: Server-side validation before commit
7. **Audit**: All attempts logged (success and failure)

---

*Document Version: 1.0*  
*Last Updated: July 2026*  
*Project: Ondo Voting System Prototype*
