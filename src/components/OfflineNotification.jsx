import React, { useEffect, useState } from 'react';
import { Alert, Button } from 'react-bootstrap';

const OfflineNotification = ({ variant = "warning", children, className = "", showOfflineToggle = true }) => {
  const [showAlert, setShowAlert] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [autoSwitched, setAutoSwitched] = useState(false);
  
  useEffect(() => {
    // Check if we're in offline mode
    const offlineMode = localStorage.getItem('useMockData') === 'true';
    setIsOfflineMode(offlineMode);
    
    // Check if we automatically switched to offline mode
    const autoOfflineMode = localStorage.getItem('autoOfflineMode') === 'true';
    setAutoSwitched(autoOfflineMode);
    
    // Clear the auto flag after reading it
    if (autoOfflineMode) {
      localStorage.removeItem('autoOfflineMode');
    }
  }, []);
  
  const handleToggleOfflineMode = () => {
    if (isOfflineMode) {
      // Switch to online mode
      localStorage.removeItem('useMockData');
      window.location.reload();
    } else {
      // Switch to offline mode
      localStorage.setItem('useMockData', 'true');
      window.location.reload();
    }
  };
  
  if (!showAlert || !isOfflineMode) return null;
  
  return (
    <Alert 
      variant={variant} 
      className={`${className} d-flex align-items-start justify-content-between`}
      dismissible
      onClose={() => setShowAlert(false)}
    >
      <div>
        {autoSwitched && (
          <Alert.Heading className="h5">
            Switched to Offline Mode
          </Alert.Heading>
        )}
        
        <div className="mb-0">
          <strong>Offline Mode Active:</strong> {" "}
          {children || "Using sample data. Some features may be limited."}
        </div>
      </div>
      
      {showOfflineToggle && (
        <Button 
          variant="outline-secondary" 
          size="sm"
          className="ms-3 flex-shrink-0"
          onClick={handleToggleOfflineMode}
        >
          Go Online
        </Button>
      )}
    </Alert>
  );
};

export default OfflineNotification; 