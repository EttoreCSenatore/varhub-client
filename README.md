# VARHub: Interactive Marketing Tool for VARLab

![License](https://img.shields.io/badge/license-MIT-green) ![Build Status](https://img.shields.io/badge/build-passing-brightgreen)

**VARHub** is a web-based marketing platform designed to showcase VARLab's projects, services, and innovations through immersive AR experiences and visitor engagement tools. Built with a focus on interactivity, the platform enables users to explore projects via AR, submit feedback, and access offline content.

---

## Table of Contents
- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Setup & Installation](#setup--installation)
- [Deployment](#deployment)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

---

## Project Overview
VARHub serves as a centralized hub for VARLab to:
- Showcase projects with AR-driven demos and 360° videos.
- Engage visitors through feedback surveys and personalized accounts.
- Provide offline access to brochures, videos, and AR markers.
- Track analytics to refine marketing strategies.

---

## Key Features
1. **Project Gallery**  
   - Searchable/filterable projects with AR integration.
2. **AR Interaction**  
   - QR code scanning for AR content (e.g., 3D models, 360° videos).
   - 2D campus map (proof of concept) with ARWay integration planned.
3. **User Accounts & Feedback**  
   - Firebase authentication for personalized experiences.
   - In-app surveys and feedback forms.
4. **Offline Mode**  
   - Download brochures, videos, and AR assets.
5. **Analytics Dashboard**  
   - Track user engagement and feedback trends.

---

## Tech Stack
| Component       | Technology                                                                 |
|-----------------|---------------------------------------------------------------------------|
| **Frontend**    | React.js, Vite, Bootstrap, WebXR, Three.js, AWS S3 (360° videos)          |
| **Backend**     | Node.js, Express.js, PostgreSQL (Neon Serverless)                         |
| **Auth**        | Firebase Authentication, JWT                                             |
| **Deployment**  | Vercel (frontend), Railway (backend)                                      |
| **AR Tools**    | AR.js, jsQR, WebXR Device API                                             |

---

## Setup & Installation

### Prerequisites
- Node.js 18+ and npm/yarn
- PostgreSQL (local setup) or Neon account
- AWS account (for 360° video hosting)
- Firebase project for authentication

### Local Development

#### 1. Clone Repositories
```bash
# Frontend
git clone https://github.com/your-repo/varhub-client
cd varhub-client
npm install

# Backend
git clone https://github.com/your-repo/varhub-server
cd varhub-server
npm install

---

## License
**MIT License**  
*Why MIT?*  
We chose the MIT License for its simplicity and permissive nature. This license:  
- Allows unrestricted use, modification, and distribution (even commercially)  
- Encourages community collaboration while protecting original contributors  
- Maintains open-source integrity without imposing complex requirements  
