/**
 * Utility functions for working with CORS and external video sources
 */

// List of reliable public CORS proxies
const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://cors-anywhere.herokuapp.com/',
  'https://api.allorigins.win/raw?url=',
  'https://cors.bridged.cc/',
  'https://thingproxy.freeboard.io/fetch/'
];

/**
 * Creates a CORS-friendly URL for accessing external video content
 * @param {string} url - The original URL
 * @returns {string} A CORS-friendly URL
 */
export const createCorsProxyUrl = (url) => {
  if (!url) return '';
  
  // Only proxy URLs that are likely to have CORS issues (S3, etc.)
  if (url.includes('s3.') || url.includes('amazonaws.com')) {
    // Use first proxy in the list
    return `${CORS_PROXIES[0]}${encodeURIComponent(url)}`;
  }
  
  return url;
};

/**
 * Try another CORS proxy when the current one fails
 * @param {string} url - Original video URL
 * @param {number} currentProxyIndex - Index of the currently failed proxy
 * @returns {string} URL with next proxy, or original if all proxies failed
 */
export const tryNextCorsProxy = (url, currentProxyIndex = 0) => {
  if (!url || currentProxyIndex >= CORS_PROXIES.length - 1) {
    console.log('All CORS proxies failed, returning original URL');
    return url;
  }
  
  const nextProxyIndex = currentProxyIndex + 1;
  const originalUrl = getOriginalUrlFromProxy(url);
  
  console.log(`Trying CORS proxy #${nextProxyIndex}: ${CORS_PROXIES[nextProxyIndex]}`);
  return `${CORS_PROXIES[nextProxyIndex]}${encodeURIComponent(originalUrl)}`;
};

/**
 * Extract original URL from a proxied URL
 * @param {string} proxyUrl - The proxy URL
 * @returns {string} Original URL
 */
export const getOriginalUrlFromProxy = (proxyUrl) => {
  if (!proxyUrl) return '';
  
  for (const proxy of CORS_PROXIES) {
    if (proxyUrl.startsWith(proxy)) {
      return decodeURIComponent(proxyUrl.substring(proxy.length));
    }
  }
  
  return proxyUrl;
};

/**
 * Set up a video element with CORS proxy
 * @param {HTMLVideoElement} videoEl - The video element to configure
 * @param {string} url - The original video URL
 * @param {number} proxyIndex - The proxy index to use
 */
export const setupCorsVideoElement = (videoEl, url, proxyIndex = 0) => {
  if (!videoEl || !url) return;
  
  const proxyUrl = proxyIndex === -1 ? url : `${CORS_PROXIES[proxyIndex]}${encodeURIComponent(url)}`;
  
  // Clear previous source
  videoEl.pause();
  videoEl.removeAttribute('src');
  videoEl.load();
  
  // Add proper CORS attributes
  videoEl.crossOrigin = 'anonymous';
  videoEl.setAttribute('crossorigin', 'anonymous');
  
  // Set source from proxy
  videoEl.src = proxyUrl;
  
  // Add error handler to try next proxy if this one fails
  const errorHandler = (e) => {
    console.error(`CORS proxy #${proxyIndex} failed:`, e);
    
    if (proxyIndex < CORS_PROXIES.length - 1) {
      // Try next proxy
      videoEl.removeEventListener('error', errorHandler);
      setupCorsVideoElement(videoEl, url, proxyIndex + 1);
    } else {
      // All proxies failed, try direct URL as last resort
      console.log('All CORS proxies failed, trying direct URL');
      setupDirectVideoElement(videoEl, url);
    }
  };
  
  videoEl.addEventListener('error', errorHandler, { once: true });
  
  // Load the video
  videoEl.load();
};

/**
 * Set up video element to try direct loading with CORS attributes
 * @param {HTMLVideoElement} videoEl - The video element
 * @param {string} url - The direct video URL
 */
export const setupDirectVideoElement = (videoEl, url) => {
  if (!videoEl || !url) return;
  
  // Clear previous source and listeners
  videoEl.pause();
  videoEl.removeAttribute('src');
  videoEl.load();
  
  // Configure for cross-origin
  videoEl.crossOrigin = 'anonymous';
  videoEl.setAttribute('crossorigin', 'anonymous');
  
  // Set direct source
  videoEl.src = url;
  
  // Try forcing preload
  videoEl.preload = 'auto';
  videoEl.setAttribute('preload', 'auto');
  
  // Load the video
  videoEl.load();
};

/**
 * Create a data URL from a Blob for local playback
 * @param {string} url - The video URL
 * @returns {Promise<string>} A local data URL
 */
export const createLocalVideoUrl = async (url) => {
  try {
    const response = await fetch(url, { 
      mode: 'cors',
      credentials: 'omit'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch video: ${response.status}`);
    }
    
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error creating local video URL:', error);
    return null;
  }
};

/**
 * Instructions for S3 bucket CORS configuration
 */
export const s3CorsConfigInstructions = `To fix CORS issues with your S3 videos permanently, add this CORS configuration to your S3 bucket:

1. Go to AWS S3 Console
2. Select your bucket "varhub-videos"
3. Click on "Permissions" tab
4. Scroll down to "Cross-origin resource sharing (CORS)"
5. Click "Edit" and add this JSON:

[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedOrigins": ["https://varhub-client.vercel.app", "http://localhost:5173"],
    "ExposeHeaders": [],
    "MaxAgeSeconds": 3000
  }
]

This will properly configure your bucket to allow access from your application.`;

export default {
  createCorsProxyUrl,
  tryNextCorsProxy,
  setupCorsVideoElement,
  setupDirectVideoElement,
  createLocalVideoUrl,
  s3CorsConfigInstructions
}; 