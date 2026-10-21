# 🧬 Report Saathi — Clinical AI & Biomarker Intelligence

> From Cryptic Lab Values to Clear, Actionable Medical Intelligence.

Report Saathi translates CBC, metabolic, lipid, and thyroid blood report panels into intuitive clinical diagnostics, calibrated biomarker meters, longitudinal trajectory tracking, and virtual telehealth exam rooms.

---

## 🚀 Live Deployment on Vercel

This repository is pre-configured for one-click deployment on **Vercel**:

1. Log in to [Vercel](https://vercel.com).
2. Click **Add New...** > **Project**.
3. Import this repository: `Digraj-asthana/Report_saathi`.
4. Vercel automatically detects the project settings:
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Click **Deploy**.

`vercel.json` is pre-configured with `"cleanUrls": true` to support seamless multi-page routing.

---

## 🛠️ Tech Stack & Architecture

- **Build Engine & Bundler:** [Vite](https://vitejs.dev/) (Multi-page configuration)
- **Styling:** Custom Vanilla CSS Design System with light beige & cool lab diagnostic tokens
- **Graphics Engine:** 3D DNA Helix Canvas & dynamic frame buffer pipeline
- **Architecture:** Multi-page modular web application:
  - `index.html` — Clinical Overview & Architecture
  - `upload.html` — Report ingestion & OCR parsing
  - `intelligence.html` — Analyte range meters & AI diagnostic insights
  - `tracker.html` — Longitudinal biomarker trend trajectories
  - `telehealth.html` — Virtual doctor consults & e-prescription dispatch
  - `assistant.html` — Clinical diagnostic AI assistant
  - `profile.html` — Patient dossier & historical reports
  - `login.html` — Patient & clinician authentication

---

## 💻 Local Development Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm`

### Installation & Run
```bash
# Clone the repository
git clone https://github.com/Digraj-asthana/Report_saathi.git
cd Report_saathi

# Install dependencies
npm install

# Start local development server
npm run dev
```

The app will be available at `http://localhost:5173/`.

### Production Build
```bash
# Compile and optimize for production
npm run build

# Preview production build locally
npm run preview
```

---

## 📜 Clinical Governance & Compliance

- **CLIA & CAP:** Aligned with laboratory analytical standards.
- **HIPAA & DPDP 2023:** 256-bit AES encryption at rest and TLS 1.3 in transit.
- **Interoperability:** Native support for HL7 / FHIR data models.
- **Disclaimer:** Report Saathi provides clinical decision-support and educational tools. Outputs do not replace licensed clinical judgment.

---

## 📄 License
ISC License © 2026 Report Saathi Systems Inc.
