import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Container } from 'react-bootstrap';
import { BoxArrowUpRight } from 'react-bootstrap-icons';
import QRScanner from '../components/QRScanner';
import { track } from '../utils/api';
import { parseScan } from '../utils/qr';

export default function ScanPage() {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);

  const onResult = useCallback((text) => {
    const parsed = parseScan(text, window.location.origin);
    if (parsed.kind === 'project') {
      track('qr_scan', parsed.id);
      navigate(`/projects/${parsed.id}`);
    } else {
      setResult(parsed);
    }
  }, [navigate]);

  return (
    <Container className="py-4 vh-narrow">
      <h1 className="h3">Scan a QR code</h1>
      <p className="text-muted">Point the camera at a VARLab QR code. Project codes open right here.</p>

      {result ? (
        <Card body>
          {result.kind === 'external' ? (
            <>
              <p className="mb-1">This QR code points to another website:</p>
              <p className="fw-semibold text-break">{result.url}</p>
              <Alert variant="secondary" className="small">VARHub did not create this link. Only open it if you trust where you found the code.</Alert>
              <div className="d-flex gap-2">
                <Button as="a" href={result.url} target="_blank" rel="noopener noreferrer"><BoxArrowUpRight className="me-1" aria-hidden />Open link</Button>
                <Button variant="outline-secondary" onClick={() => setResult(null)}>Scan again</Button>
              </div>
            </>
          ) : (
            <>
              <p className="mb-1">This QR code contains text:</p>
              <p className="fw-semibold text-break">{result.text}</p>
              <Button variant="outline-secondary" onClick={() => setResult(null)}>Scan again</Button>
            </>
          )}
        </Card>
      ) : (
        <QRScanner onResult={onResult} />
      )}
    </Container>
  );
}
