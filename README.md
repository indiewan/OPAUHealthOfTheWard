# OPAU Health of the Ward — Simulation System

> ⚠️ **SIMULATION ONLY — NOT FOR REAL CLINICAL CARE**
> This application contains synthetic, anonymised placeholder data for NHS transformation training and Older Persons Admissions Unit (OPAU) simulation exercises.

An electronic whiteboard simulator faithfully reproducing the hospital ward display for transformation simulations, staff training drills, bed flow exercises, and rapid escalation scenarios.

---

## Features

- **Realistic Hospital Whiteboard Layout**: 5 Bays (**Bay 01, Bay 02, Bay 03, Bay 05, Bay 06**) and 43 total bed spaces including side rooms.
- **Accurate Bed Status Indicators**:
  - Specialty/Location badges (`OPS`, `EACM`, `T.B.T.`, `CARD`, `GMG`).
  - Destination indicators (`DIS` for discharge, `RBOPS1`, `RBOPS4`, `HOME`, `REHAB`).
  - NEWS scores (National Early Warning Score) with clinical risk color thresholds and rapid inline `+` / `-` steppers.
  - Important clinical flags (`**`, `***`, `EOL`, `NR`, `TEL`, `*TEL`, `FALLS`).
  - Infection control overlays (Yellow highlight bar and green `SWAB` tag).
  - Closed bed management (e.g. endoscopy/holding/deep clean).
- **Normal Viewing Mode**: Locked read-only state for projectors, large displays, and simulation observer screens.
- **Admin Edit Mode**: Unlocked via password prompt (**Password: `Admin`**). Allows live editing of all bed spaces, patient details, and telemetry.
- **JSON Transfer (Export & Import)**: Export simulation states to `.json` files or copy to clipboard to easily transfer scenarios to other training computers.
- **Pre-Configured Scenarios**: Standard Baseline, Rapid Deterioration & MET Drill, Discharge Flow Drill, and Infection Outbreak.
- **Local Storage Persistence**: Simulation edits automatically persist in the browser.

---

## Local Development

```bash
# Install dependencies
npm install

# Start local development server (runs at http://localhost:3000)
npm run dev

# Run type check and lint
npm run lint

# Production build
npm run build
```

---

## Deploying to Vercel

This repository is pre-configured for one-click deployment on [Vercel](https://vercel.com):

1. Push this repository to GitHub or GitLab.
2. Log into **Vercel** and click **"Add New Project"**.
3. Import your Git repository.
4. Vercel will automatically detect the **Vite** framework preset:
   - **Build Command**: `vite build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Click **Deploy**. The included `vercel.json` ensures all client-side routes and SPA rewrites work seamlessly with zero extra configuration.

---

## Default Credentials

- **Admin Password**: `Admin` (case-tolerant: `Admin` or `admin`)
