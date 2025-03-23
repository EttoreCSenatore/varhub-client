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

## Troubleshooting

### CORS Issues

If you encounter CORS errors (visible in the browser console as errors with messages like "Access to XMLHttpRequest has been blocked by CORS policy"), try the following:

1. **Use Offline Mode**: The application has a built-in offline mode with sample data that works even when the API is inaccessible.
   - Open the browser console and enter: `localStorage.setItem('useMockData', 'true'); window.location.reload()`
   - Or visit `/offline-mode.html` for guided instructions

2. **For developers**:
   - Ensure the server has proper CORS configuration in both `server.js` and `vercel.json`
   - Check that the client domain (`https://varhub-client.vercel.app`) is in the allowed origins list
   - Verify that the appropriate headers are set:
     ```
     Access-Control-Allow-Origin: https://varhub-client.vercel.app
     Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
     Access-Control-Allow-Headers: Content-Type, Authorization
     Access-Control-Allow-Credentials: true
     ```
   - For local development, use the proxy configuration in `vite.config.js`

### Authentication Problems

If you're unable to log in:

1. Check if there are any console errors related to CORS or network connectivity
2. Try using offline mode (instructions above)
3. Clear browser cache and cookies, then try again
4. Use a different browser to rule out browser-specific issues

## Technologies

- React
- Bootstrap for responsive UI
- A-Frame for VR/AR experiences
- jsQR for QR code scanning