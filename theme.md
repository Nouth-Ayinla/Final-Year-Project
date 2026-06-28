# Bi-Modal E-Voting System UI Theme Guide

This document outlines the visual identity and color schemes for the final-year project: a bi-modal e-voting system utilizing facial recognition and fingerprint authentication.

## Design Philosophy
Because this application involves biometrics and democratic processes, the UI must evoke **trust, reliability, and clarity**. It should lean towards a "FinTech" or "GovTech" aesthetic rather than a consumer-focused "fun" style.

---

## 🎨 Color Scheme Options

### 1. The "Institutional Trust" Palette (Recommended for Admin Web App)
Ideal for data-heavy registration and results monitoring screens, providing an authoritative and stable feel.

| Element | Color Code | Visual Representation |
| :--- | :--- | :--- |
| **Primary** (Buttons, Headers) | `#1B365D` | Navy Blue |
| **Secondary** (Active States) | `#2E5AAC` | Royal Blue |
| **Background** | `#F8FAFC` | Off-White/Slate |
| **Success/Verified** | `#059669` | Emerald Green |
| **Alerts/Errors** | `#DC2626` | Red |

### 2. The "Modern Secure" Palette (Recommended for Mobile Voter App)
A dark-mode focus that assists with facial recognition contrast and creates a "high-tech" security atmosphere.

| Element | Color Code | Visual Representation |
| :--- | :--- | :--- |
| **Primary** (Main UI) | `#0F172A` | Deep Midnight |
| **Secondary** (Card Backgrounds) | `#1E293B` | Slate Gray |
| **Highlight** (Scanning Animations) | `#38BDF8` | Sky Blue |
| **Text** | `#F1F5F9` | Contrast White |
| **Biometric Active** | `#10B981` | Vibrant Green |

### 3. The "Accessible Neutral" Palette
A high-contrast option designed for maximum inclusivity to ensure all citizens can navigate the voting process easily.

| Element | Color Code | Visual Representation |
| :--- | :--- | :--- |
| **Primary** | `#2563EB` | True Blue |
| **Secondary** | `#64748B` | Cool Gray |
| **Background** | `#FFFFFF` | Pure White |
| **Interaction** | `#1E40AF` | Dark Blue |
| **Data/Charts** | `#8B5CF6` | Purple |

---

## 🛠️ Implementation Guidelines

### Biometric Feedback States
Immediate visual feedback is critical during the bi-modal authentication workflow:
* **Idle State:** Use Neutral Gray (`#94A3B8`) for the fingerprint or face scanner frame [cite: 32].
* **Success State:** Switch to Success Green (`#10B981`) immediately upon a match [cite: 32, 43].
* **Failure State:** Switch to Failure Red (`#EF4444`) if recognition fails [cite: 32, 43].

### Platform Specifics
* **Web App (Admin):** Use the **Institutional Trust** scheme to maintain a professional environment for managing candidates and verifying registrations [cite: 33, 39]. It is optimized for data-heavy monitoring tasks [cite: 40].
*