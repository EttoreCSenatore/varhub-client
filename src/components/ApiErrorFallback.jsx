import React, { useEffect, useState } from 'react';
import { Alert, Card, Button } from 'react-bootstrap';

const ApiErrorFallback = ({ error, resetErrorBoundary = null, variant = "warning", children, className = "", showOfflineToggle = true }) => {
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
  
  // Function to try a different API endpoint
  const tryAlternativeApi = () => {
    localStorage.setItem('useAlternativeApi', 'true');
    window.location.reload();
  };

  // Function to retry with current API
  const retryCurrentApi = () => {
    localStorage.removeItem('useAlternativeApi');
    if (resetErrorBoundary) {
      resetErrorBoundary();
    } else {
      window.location.reload();
    }
  };

  if (!showAlert) return null;
  
  return (
    <Card className="shadow-sm mb-4">
      <Card.Header className="bg-warning">
        <h3 className="h5 mb-0">API Connection Issue</h3>
      </Card.Header>
      <Card.Body>
        <Alert 
          variant={variant} 
          className={`${className} d-flex align-items-start justify-content-between`}
          dismissible
          onClose={() => setShowAlert(false)}
        >
          <div>
            {autoSwitched && isOfflineMode && (
              <Alert.Heading className="h5">
                Switched to Offline Mode
              </Alert.Heading>
            )}
            
            <div className="mb-0">
              {isOfflineMode ? (
                <>
                  <strong>Offline Mode Active:</strong> {" "}
                  {children || "Using sample data. Some features may be limited."}
                </>
              ) : (
                children
              )}
            </div>
          </div>
          
          {showOfflineToggle && (
            <Button 
              variant={isOfflineMode ? "outline-secondary" : "outline-primary"} 
              size="sm"
              className="ms-3 flex-shrink-0"
              onClick={handleToggleOfflineMode}
            >
              {isOfflineMode ? "Go Online" : "Use Offline Mode"}
            </Button>
          )}
        </Alert>

        <h4 className="h6 mb-2">Error Details:</h4>
        <pre className="bg-light p-2 rounded small mb-3" style={{ maxHeight: '100px', overflow: 'auto' }}>
          {String(error)}
        </pre>

        <h4 className="h6 mb-2">Troubleshooting Options:</h4>
        <ol className="mb-3">
          <li>Check your internet connection</li>
          <li>Make sure you're not using a VPN that blocks the connection</li>
          <li>Try using a different browser</li>
          <li>Clear your browser cache and cookies</li>
        </ol>

        <div className="d-flex gap-2">
          <Button 
            variant="primary" 
            onClick={retryCurrentApi}
          >
            Retry Connection
          </Button>
          <Button 
            variant="outline-secondary" 
            onClick={tryAlternativeApi}
          >
            Try Alternative API
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ApiErrorFallback; 