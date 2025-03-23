# VARhub Client

A responsive web application for AR/VR project management and viewing.

## Features

- **Project Management**: View, create, and manage AR/VR projects
- **VR Viewer**: View 360° VR videos with immersive controls
- **AR Viewer**: Experience augmented reality through marker-based tracking
- **QR Scanner**: Scan QR codes to instantly load AR experiences
- **Responsive Design**: Optimized for both desktop and mobile devices
- **Offline Mode**: Fallback to sample content when server connectivity issues occur

## Offline Mode

The application includes an offline mode that automatically activates when:

1. The server is unavailable
2. Network connectivity issues are detected
3. Resources fail to load with `net::ERR_FAILED` errors

When offline mode is active:
- Sample projects and VR videos are used instead of server data
- A notification appears informing users of the offline status
- All core features remain functional with demo content

You can manually toggle offline mode by:
- Clicking the "Switch to Offline Mode" button in error messages
- Setting `localStorage.setItem('useMockData', 'true')` in the browser console

To return to online mode:
- Clear offline setting with `localStorage.removeItem('useMockData')`
- Refresh the page

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

## Technologies

- React
- Bootstrap for responsive UI
- A-Frame for VR/AR experiences
- jsQR for QR code scanning