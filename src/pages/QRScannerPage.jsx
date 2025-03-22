import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import QRScanner from '../components/QRScanner';

const QRScannerPage = () => {
  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col lg={10} md={12}>
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-primary text-white">
              <h2 className="h4 mb-0">QR Code Scanner</h2>
            </Card.Header>
            <Card.Body className="p-0">
              <QRScanner />
            </Card.Body>
          </Card>
          
          <Card className="shadow-sm">
            <Card.Header>
              <h3 className="h5 mb-0">How to use the QR Scanner</h3>
            </Card.Header>
            <Card.Body>
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