import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Button } from 'react-bootstrap';
import { Fullscreen, PauseFill, PlayFill, PhoneFill } from 'react-bootstrap-icons';

const zee = new THREE.Vector3(0, 0, 1);
const euler = new THREE.Euler();
const q0 = new THREE.Quaternion();
const q1 = new THREE.Quaternion(-Math.SQRT1_2, 0, 0, Math.SQRT1_2); // camera looks out the back of the phone

// Device orientation -> camera quaternion (same maths as three's old DeviceOrientationControls).
function applyOrientation(quaternion, e, screenAngle) {
  euler.set(THREE.MathUtils.degToRad(e.beta), THREE.MathUtils.degToRad(e.alpha), -THREE.MathUtils.degToRad(e.gamma), 'YXZ');
  quaternion.setFromEuler(euler);
  quaternion.multiply(q1);
  quaternion.multiply(q0.setFromAxisAngle(zee, -THREE.MathUtils.degToRad(screenAngle)));
}

// Equirectangular 360° video on the inside of a sphere. Drag to look around; optional phone-motion mode.
export default function Video360({ src, poster, onPlay }) {
  const hostRef = useRef(null);
  const videoRef = useRef(null);
  const gyroRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [gyro, setGyro] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const host = hostRef.current;
    const video = videoRef.current;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true });
    } catch {
      setError('Your browser cannot show 360° video (WebGL is unavailable).');
      return undefined;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1100);
    const texture = new THREE.VideoTexture(video);
    texture.colorSpace = THREE.SRGBColorSpace;
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(500, 60, 40).scale(-1, 1, 1),
      new THREE.MeshBasicMaterial({ map: texture })
    );
    scene.add(sphere);

    let lon = 0;
    let lat = 0;
    let dragging = false;
    let last = null;
    const orientation = { alpha: 0, beta: 0, gamma: 0 };

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = host;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();

    const down = (e) => { dragging = true; last = { x: e.clientX, y: e.clientY }; host.setPointerCapture(e.pointerId); };
    const up = () => { dragging = false; };
    const move = (e) => {
      if (!dragging || gyroRef.current) return;
      lon -= (e.clientX - last.x) * 0.2;
      lat = Math.max(-85, Math.min(85, lat + (e.clientY - last.y) * 0.2));
      last = { x: e.clientX, y: e.clientY };
    };
    const wheel = (e) => {
      e.preventDefault();
      camera.fov = Math.max(30, Math.min(100, camera.fov + e.deltaY * 0.05));
      camera.updateProjectionMatrix();
    };
    const orient = (e) => { Object.assign(orientation, { alpha: e.alpha || 0, beta: e.beta || 0, gamma: e.gamma || 0 }); };
    host.addEventListener('pointerdown', down);
    host.addEventListener('pointerup', up);
    host.addEventListener('pointercancel', up);
    host.addEventListener('pointermove', move);
    host.addEventListener('wheel', wheel, { passive: false });
    window.addEventListener('deviceorientation', orient);

    renderer.setAnimationLoop(() => {
      if (gyroRef.current) {
        applyOrientation(camera.quaternion, orientation, (screen.orientation && screen.orientation.angle) || 0);
      } else {
        const phi = THREE.MathUtils.degToRad(90 - lat);
        const theta = THREE.MathUtils.degToRad(lon);
        camera.lookAt(Math.sin(phi) * Math.cos(theta), Math.cos(phi), Math.sin(phi) * Math.sin(theta));
      }
      renderer.render(scene, camera);
    });

    return () => {
      renderer.setAnimationLoop(null);
      observer.disconnect();
      host.removeEventListener('pointerdown', down);
      host.removeEventListener('pointerup', up);
      host.removeEventListener('pointercancel', up);
      host.removeEventListener('pointermove', move);
      host.removeEventListener('wheel', wheel);
      window.removeEventListener('deviceorientation', orient);
      texture.dispose();
      sphere.geometry.dispose();
      sphere.material.dispose();
      renderer.dispose();
      host.removeChild(renderer.domElement);
      video.pause();
    };
  }, [src]);

  const toggle = useCallback(async () => {
    const video = videoRef.current;
    if (video.paused) {
      try {
        await video.play();
        setPlaying(true);
        onPlay?.();
      } catch {
        setError('The video could not be played. The file may be unavailable or blocked by its host.');
      }
    } else {
      video.pause();
      setPlaying(false);
    }
  }, [onPlay]);

  const toggleGyro = async () => {
    if (gyro) { gyroRef.current = false; setGyro(false); return; }
    // iOS asks for permission, and only from a tap.
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      const answer = await DeviceOrientationEvent.requestPermission().catch(() => 'denied');
      if (answer !== 'granted') { setError('Motion access was denied, so drag to look around instead.'); return; }
    }
    gyroRef.current = true;
    setGyro(true);
  };

  return (
    <div className="vh-360">
      <div ref={hostRef} className="vh-360-stage" aria-label="360 degree video. Drag to look around." />
      <video ref={videoRef} src={src} poster={poster || undefined} crossOrigin="anonymous" playsInline loop preload="metadata" hidden onError={() => setError('This video could not be loaded.')} />
      {error && <div className="alert alert-warning mt-2 mb-0" role="alert">{error}</div>}
      <div className="d-flex flex-wrap gap-2 mt-2">
        <Button onClick={toggle} variant="primary">
          {playing ? <><PauseFill aria-hidden /> Pause</> : <><PlayFill aria-hidden /> Play</>}
        </Button>
        <Button variant={gyro ? 'secondary' : 'outline-secondary'} onClick={toggleGyro} className="d-md-none">
          <PhoneFill aria-hidden /> {gyro ? 'Motion on' : 'Use phone motion'}
        </Button>
        <Button variant="outline-secondary" onClick={() => hostRef.current.requestFullscreen?.()}>
          <Fullscreen aria-hidden /> Fullscreen
        </Button>
      </div>
    </div>
  );
}
