import { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { Alert, Button } from 'react-bootstrap';
import { Image } from 'react-bootstrap-icons';

const MAX_WIDTH = 640; // scanning a downscaled frame is faster and just as reliable

function decode(source, width, height, canvas) {
  const scale = Math.min(1, MAX_WIDTH / width);
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return jsQR(data.data, data.width, data.height, { inversionAttempts: 'dontInvert' })?.data || null;
}

// Live camera scanning, with "pick a photo" as a fallback when the camera is unavailable or denied.
export default function QRScanner({ onResult }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [error, setError] = useState(null);
  const [starting, setStarting] = useState(true);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let stream;
    let raf;
    let stopped = false;
    let lastScan = 0;

    const tick = (time) => {
      if (stopped) return;
      const video = videoRef.current;
      if (video && video.readyState === video.HAVE_ENOUGH_DATA && time - lastScan > 120) {
        lastScan = time;
        const text = decode(video, video.videoWidth, video.videoHeight, canvasRef.current);
        if (text) {
          stopped = true;
          onResult(text);
          return;
        }
      }
      raf = requestAnimationFrame(tick);
    };

    (async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('This browser cannot open the camera here. Camera access needs a secure (https) page. You can choose a photo of the QR code instead.');
        setStarting(false);
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
        if (stopped) { stream.getTracks().forEach((t) => t.stop()); return; }
        const video = videoRef.current;
        video.srcObject = stream;
        await video.play();
        setStarting(false);
        raf = requestAnimationFrame(tick);
      } catch (e) {
        setStarting(false);
        setError(
          e.name === 'NotAllowedError'
            ? 'Camera permission was denied. Allow it in your browser settings, or choose a photo of the QR code instead.'
            : 'The camera could not be started. You can choose a photo of the QR code instead.'
        );
      }
    })();

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [onResult, attempt]);

  const fromPhoto = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const text = decode(img, img.naturalWidth, img.naturalHeight, canvasRef.current);
      URL.revokeObjectURL(url);
      if (text) onResult(text);
      else setError('No QR code found in that photo. Try a sharper, closer picture.');
    };
    img.onerror = () => { URL.revokeObjectURL(url); setError('That file could not be read as an image.'); };
    img.src = url;
    event.target.value = '';
  };

  return (
    <div>
      <div className="vh-scanner">
        <video ref={videoRef} playsInline muted aria-label="Camera preview" />
        <div className="vh-scanner-frame" aria-hidden />
        {starting && <div className="vh-scanner-msg">Starting camera…</div>}
      </div>
      <canvas ref={canvasRef} hidden />
      {error && <Alert variant="warning" className="mt-3" role="alert">{error}</Alert>}
      <div className="d-flex flex-wrap gap-2 mt-3">
        {error && <Button variant="outline-primary" onClick={() => { setError(null); setStarting(true); setAttempt((n) => n + 1); }}>Try the camera again</Button>}
        <label className="btn btn-outline-secondary mb-0">
          <Image className="me-1" aria-hidden /> Choose a photo
          <input type="file" accept="image/*" capture="environment" hidden onChange={fromPhoto} />
        </label>
      </div>
    </div>
  );
}
