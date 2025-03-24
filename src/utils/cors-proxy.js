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
    // Use a working public CORS proxy service
    return `https://corsproxy.io/?${encodeURIComponent(url)}`;
    
    // Alternative options:
    // return `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    // return `https://cors-anywhere.herokuapp.com/${url}`;
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
  
  // Set the URL both ways for better compatibility
  videoElement.src = proxyUrl;
  videoElement.setAttribute('src', proxyUrl);
  
  // Add other important attributes
  videoElement.setAttribute('webkit-playsinline', 'true');
  videoElement.setAttribute('playsinline', '');
  videoElement.setAttribute('preload', 'auto');
  
  console.log("Video element configured with URL:", proxyUrl);
};

/**
 * Instructions for AWS S3 bucket owners to properly configure CORS
 * This can be shared with users who own the S3 buckets 
 */
export const s3CorsConfigInstructions = `
To fix CORS issues with your S3 videos, add this CORS configuration to your S3 bucket:

1. Go to AWS S3 Console
2. Select your bucket
3. Click on "Permissions" tab
4. Scroll down to "Cross-origin resource sharing (CORS)"
5. Click "Edit" and add this JSON:

[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedOrigins": ["*"],  
    "ExposeHeaders": [],
    "MaxAgeSeconds": 3000
  }
]

If you want to restrict access to specific domains instead of "*", 
replace "*" in AllowedOrigins with your specific domains:
["https://yourdomain.com", "https://www.yourdomain.com"]
`;

export default {
  createCorsProxyUrl,
  setupCorsVideoElement,
  s3CorsConfigInstructions
}; 