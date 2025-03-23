import React, { Component } from 'react';
import { Alert, Button, Card, Container } from 'react-bootstrap';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null,
      isNetworkError: false
    };
  }

  static getDerivedStateFromError(error) {
    // Check if this is a network error
    const isNetworkError = 
      error.message && (
        error.message.includes('net::ERR_FAILED') ||
        error.message.includes('NetworkError') ||
        error.message.includes('Failed to fetch') ||
        error.message.includes('Network request failed')
      );
      
    return { 
      hasError: true, 
      error: error,
      isNetworkError
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Log error to analytics/monitoring service
    // This would be a good place to send errors to a service like Sentry
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, isNetworkError: false });
    window.location.reload();
  }
  
  handleOfflineMode = () => {
    localStorage.setItem('useMockData', 'true');
    localStorage.setItem('autoOfflineMode', 'true');
    window.location.reload();
  }

  render() {
    if (this.state.hasError) {
      // Network error specific fallback UI
      if (this.state.isNetworkError) {
        return (
          <Container className="py-4">
            <Card className="shadow-sm">
              <Card.Header className="bg-warning">
                <h2 className="h4 mb-0">
                  Network Connection Issue
                </h2>
              </Card.Header>
              <Card.Body>
                <Alert variant="warning">
                  <Alert.Heading>Unable to connect to server</Alert.Heading>
                  <p>
                    We're having trouble connecting to our servers. This could be due to:
                  </p>
                  <ul>
                    <li>Your internet connection</li>
                    <li>Our server may be temporarily down</li>
                    <li>A network firewall blocking the connection</li>
                  </ul>
                  <hr />
                  <div className="d-flex justify-content-between">
                    <Button variant="outline-secondary" onClick={this.handleRetry}>
                      Try Again
                    </Button>
                    <Button variant="primary" onClick={this.handleOfflineMode}>
                      Switch to Offline Mode
                    </Button>
                  </div>
                </Alert>
                <p className="text-muted mt-3 small">
                  Offline mode will use sample data until connectivity is restored.
                  When you switch to offline mode, you can still use the application with demo content.
                </p>
              </Card.Body>
            </Card>
          </Container>
        );
      }
      
      // Generic error fallback UI
      return (
        <Container className="py-4">
          <Card className="shadow-sm">
            <Card.Header className="bg-danger text-white">
              <h2 className="h4 mb-0">
                Something went wrong
              </h2>
            </Card.Header>
            <Card.Body>
              <Alert variant="danger">
                <Alert.Heading>Error Details</Alert.Heading>
                <p>{this.state.error && this.state.error.toString()}</p>
                <hr />
                <Button variant="outline-danger" onClick={this.handleRetry}>
                  Retry
                </Button>
              </Alert>
              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <details className="mt-3 border p-3 rounded bg-light">
                  <summary>Component Stack</summary>
                  <pre className="mt-2 text-danger">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </Card.Body>
          </Card>
        </Container>
      );
    }

    // If there's no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary; 