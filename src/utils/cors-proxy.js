/**
 * Utils for handling CORS issues with videos, particularly from S3 buckets
 */

/**
 * Creates a CORS-friendly URL for video content using a proxy service
 * @param {string} url - The original video URL
 * @returns {string} A proxied URL that can bypass CORS restrictions
 */
export const createCorsProxyUrl = (url) => {
  if (!url) return '';
  
  // Check if it's an S3 URL
  if (url.includes('s3.') && url.includes('amazonaws.com')) {
    // Use client-side CORS bypass approach instead of proxy services
    // Note: this is less ideal but doesn't rely on potentially rate-limited third-party services
    
    // Option 1: Try using a different CORS proxy that's more reliable
    return `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    
    // Option 2: There's also thingproxy but it has limited bandwidth
    // return `https://thingproxy.freeboard.io/fetch/${url}`;
  }
  
  // If not an S3 URL, return the original
  return url;
};

/**
 * Sets up a video element with the correct CORS attributes and sources
 * @param {HTMLVideoElement} videoElement - The video element to configure
 * @param {string} originalUrl - The original video URL
 */
export const setupCorsVideoElement = (videoElement, originalUrl) => {
  if (!videoElement || !originalUrl) return;
  
  // Always set crossOrigin to anonymous
  videoElement.crossOrigin = "anonymous";
  
  // Get a CORS-friendly URL
  const proxyUrl = createCorsProxyUrl(originalUrl);
  
  // Log what we're trying to do
  console.log("Setting up video element with CORS handling");
  console.log("Original URL:", originalUrl);
  console.log("Proxied URL:", proxyUrl);
  
  // Set the URL both ways for better compatibility
  videoElement.src = proxyUrl;
  videoElement.setAttribute('src', proxyUrl);
  
  // Add other important attributes
  videoElement.setAttribute('webkit-playsinline', 'true');
  videoElement.setAttribute('playsinline', '');
  videoElement.setAttribute('preload', 'auto');
};

/**
 * Alternative approach that directly loads the video from S3 without a proxy
 * This requires proper CORS configuration on the S3 bucket
 * @param {HTMLVideoElement} videoElement - The video element to configure
 * @param {string} originalUrl - The original video URL
 */
export const setupDirectVideoElement = (videoElement, originalUrl) => {
  if (!videoElement || !originalUrl) return;
  
  console.log("Setting up direct video element (no proxy)");
  
  // Set crossOrigin to anonymous
  videoElement.crossOrigin = "anonymous";
  
  // Use the original URL directly
  videoElement.src = originalUrl;
  videoElement.setAttribute('src', originalUrl);
  
  // Add other important attributes
  videoElement.setAttribute('webkit-playsinline', 'true');
  videoElement.setAttribute('playsinline', '');
  videoElement.setAttribute('preload', 'auto');
};

/**
 * Instructions for AWS S3 bucket owners to properly configure CORS
 * This can be shared with users who own the S3 buckets 
 */
export const s3CorsConfigInstructions = `
To fix CORS issues with your S3 videos permanently, add this CORS configuration to your S3 bucket:

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

This will properly configure your bucket to allow access from your application.
`;

export default {
  createCorsProxyUrl,
  setupCorsVideoElement,
  setupDirectVideoElement,
  s3CorsConfigInstructions
}; 