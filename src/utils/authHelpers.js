// Authentication helper functions

/**
 * Checks if the user is currently logged in based on token in localStorage
 * @returns {boolean} True if user is logged in, false otherwise
 */
export const isLoggedIn = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return !!token && !!user;
};

/**
 * Gets the current user from localStorage
 * @returns {Object|null} The user object or null if not logged in
 */
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  if (user) {
    try {
      return JSON.parse(user);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }
  return null;
};

/**
 * Gets the JWT token from localStorage
 * @returns {string|null} The JWT token or null if not logged in
 */
export const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * Helper to validate security of token expiration
 * @returns {boolean} True if token is likely expired
 */
export const isTokenExpired = () => {
  const token = getToken();
  if (!token) return true;
  
  try {
    // Token is in format: header.payload.signature
    const payload = token.split('.')[1];
    // Base64 decode the payload
    const decodedPayload = atob(payload);
    const tokenData = JSON.parse(decodedPayload);
    
    // Check if token has an expiration claim
    if (!tokenData.exp) return false;
    
    // Check if token is expired
    const expirationTime = tokenData.exp * 1000; // Convert to milliseconds
    return Date.now() >= expirationTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true; // If we can't validate, assume expired
  }
}; 