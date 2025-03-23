import React, { Component } from 'react';
import { Container, Card, Button, Alert } from 'react-bootstrap';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    
    // You could also log the error to an error reporting service
    // Example: logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Check if it's an API or XHR related error
      const errorString = String(this.state.error);
      const isApiError = errorString.includes('API') || 
                         errorString.includes('fetch') || 
                         errorString.includes('XMLHttpRequest') ||
                         errorString.includes('Network Error');
      
      return (
        <Container className="py-4">
          <Card className="shadow-sm">
            <Card.Header className={isApiError ? "bg-warning" : "bg-danger text-white"}>
              <h2 className="h4 mb-0">
                {isApiError ? "API Connection Error" : "Application Error"}
              </h2>
            </Card.Header>
            <Card.Body>
              <Alert variant={isApiError ? "warning" : "danger"}>
                <p><strong>Something went wrong.</strong></p>
                <p>
                  {isApiError 
                    ? "We're having trouble connecting to the server. This might be due to network issues or server maintenance."
                    : "An unexpected error occurred in the application."}
                </p>
              </Alert>
              
              <h3 className="h5 mt-4">Error Details:</h3>
              <pre className="bg-light p-3 rounded">
                {this.state.error?.toString()}
              </pre>
              
              {this.props.showStack && this.state.errorInfo && (
                <>
                  <h3 className="h5 mt-4">Component Stack:</h3>
                  <pre className="bg-light p-3 rounded" style={{ maxHeight: '200px', overflow: 'auto' }}>
                    {this.state.errorInfo.componentStack}
                  </pre>
                </>
              )}
              
              <div className="d-flex gap-2 mt-4">
                <Button 
                  variant="primary" 
                  onClick={() => window.location.reload()}
                >
                  Reload Page
                </Button>
                <Button 
                  variant="outline-secondary" 
                  onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                >
                  Try to Recover
                </Button>
                {isApiError && (
                  <Button 
                    variant="outline-dark" 
                    onClick={() => {
                      // Use sample/mock data instead of real API
                      localStorage.setItem('useMockData', 'true');
                      window.location.reload();
                    }}
                  >
                    Use Offline Mode
                  </Button>
                )}
              </div>
            </Card.Body>
          </Card>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 