import React, { useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import QRScanner from '../components/QRScanner';

const QRScannerPage = () => {
  const [showTestQR, setShowTestQR] = useState(false);
  
  // Function to generate a QR code SVG inline for testing
  const getSampleQRCode = () => {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 29 29" shape-rendering="crispEdges" width="200" height="200">
        <path fill="#ffffff" d="M0 0h29v29H0z"></path>
        <path stroke="#000000" d="M4 4.5h7m1 0h1m1 0h1m3 0h7M4 5.5h1m5 0h1m1 0h1m1 0h1m2 0h1m5 0h1M4 6.5h1m1 0h3m1 0h1m2 0h1m1 0h1m2 0h1m1 0h3m1 0h1M4 7.5h1m1 0h3m1 0h1m2 0h3m1 0h1m1 0h3m1 0h1M4 8.5h1m1 0h3m1 0h1m1 0h1m3 0h1m1 0h3m1 0h1M4 9.5h1m5 0h1m3 0h1m1 0h1m1 0h1m5 0h1M4 10.5h7m1 0h1m1 0h1m1 0h1m1 0h7M12 11.5h1m2 0h1M4 12.5h1m1 0h1m2 0h3m4 0h2m1 0h1m2 0h1m1 0h1M5 13.5h1m1 0h1m1 0h1m1 0h1m3 0h3m1 0h1m1 0h1m2 0h1M4 14.5h1m1 0h1m1 0h5m1 0h1m2 0h1m1 0h1m1 0h1m1 0h1M5 15.5h1m3 0h5m1 0h1m1 0h2m1 0h1m1 0h2M4 16.5h2m1 0h2m2 0h1m1 0h9m3 0h1M4 17.5h1m1 0h2m1 0h1m7 0h7M12 18.5h2m1 0h1m3 0h2M4 19.5h7m1 0h1m1 0h1m1 0h1m1 0h3m1 0h3M4 20.5h1m5 0h1m1 0h3m3 0h1m2 0h3M4 21.5h1m1 0h3m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m2 0h1m1 0h1M4 22.5h1m1 0h3m1 0h1m1 0h1m1 0h2m1 0h1m1 0h4m1 0h1M4 23.5h1m1 0h3m1 0h1m1 0h2m1 0h2m2 0h2m1 0h1m1 0h1M4 24.5h1m5 0h1m2 0h1m6 0h5M4 25.5h7m3 0h1m3 0h1m5 0h1"></path>
      </svg>
    `;
  };

  return (
    <Container className="py-3 py-md-4">
      <Row className="justify-content-center">
        <Col xs={12} lg={10}>
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-primary text-white">
              <h2 className="h4 mb-0">QR Code Scanner</h2>
            </Card.Header>
            <Card.Body className="p-0">
              <QRScanner />
            </Card.Body>
          </Card>
          
          {/* Test QR Code Card */}
          <Card className="shadow-sm mb-4">
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <h3 className="h5 mb-0">Test QR Code</h3>
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => setShowTestQR(!showTestQR)}
                >
                  {showTestQR ? 'Hide' : 'Show'} Test QR
                </Button>
              </div>
            </Card.Header>
            {showTestQR && (
              <Card.Body className="text-center">
                <p className="mb-3">Scan this QR code with your camera to test the scanner:</p>
                <div 
                  dangerouslySetInnerHTML={{ __html: getSampleQRCode() }} 
                  className="d-inline-block p-3 border rounded"
                  style={{ backgroundColor: 'white' }}
                />
                <p className="mt-3 text-muted small">
                  This QR code contains: "mock-test"
                </p>
              </Card.Body>
            )}
          </Card>
          
          <Card className="shadow-sm">
            <Card.Header>
              <h3 className="h5 mb-0">How to use the QR Scanner</h3>
            </Card.Header>
            <Card.Body className="p-3 p-md-4">
              <ol className="mb-0">
                <li className="mb-2">Click the <strong>Start Camera</strong> button to activate your device's camera</li>
                <li className="mb-2">Point your camera at a project QR code</li>
                <li className="mb-2">Hold steady until the QR code is detected</li>
                <li className="mb-2">Once detected, you'll see the project details and AR view option</li>
                <li>Use the AR view to explore the 3D model in augmented reality</li>
              </ol>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default QRScannerPage; 