import { useEffect, useRef, useState } from 'react';
import Loading from './Loading';

// Google's <model-viewer> web component: orbit controls everywhere, and an AR button that uses
// WebXR / Scene Viewer on Android and Quick Look on iOS. Loaded on demand (it is large).
export default function ModelViewer({ src, iosSrc, poster, alt, onArLaunch }) {
  const ref = useRef(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    import('@google/model-viewer').then(() => { if (!cancelled) setReady(true); }).catch(() => setFailed(true));
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const onStatus = (event) => { if (event.detail.status === 'session-started') onArLaunch?.(); };
    const onError = () => setFailed(true);
    el.addEventListener('ar-status', onStatus);
    el.addEventListener('error', onError);
    return () => {
      el.removeEventListener('ar-status', onStatus);
      el.removeEventListener('error', onError);
    };
  }, [ready, onArLaunch]);

  if (failed) {
    return <div className="alert alert-warning">This 3D model could not be loaded. Check your connection and try again.</div>;
  }
  if (!ready) return <Loading label="Loading 3D viewer…" />;

  return (
    <model-viewer
      ref={ref}
      src={src}
      ios-src={iosSrc || undefined}
      poster={poster || undefined}
      alt={alt}
      ar
      ar-modes="webxr scene-viewer quick-look"
      camera-controls
      auto-rotate
      touch-action="pan-y"
      shadow-intensity="1"
      loading="eager"
      class="vh-model"
    >
      <button slot="ar-button" type="button" className="btn btn-primary vh-ar-button">
        View in your space (AR)
      </button>
    </model-viewer>
  );
}
