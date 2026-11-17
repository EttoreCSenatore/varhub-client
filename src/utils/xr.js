// Can this browser start an immersive AR session (WebXR)? Chrome on ARCore Android phones: yes.
// iOS Safari has no WebXR; 3D models still get AR there through Quick Look (handled by <model-viewer>).
export async function supportsImmersiveAr() {
  try {
    return Boolean(navigator.xr && (await navigator.xr.isSessionSupported('immersive-ar')));
  } catch {
    return false;
  }
}
