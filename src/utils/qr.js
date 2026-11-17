// Decides what a scanned QR code means. Pure, so it is easy to test.

const PROJECT_PATH = /^\/projects\/(\d+)\/?$/;

/**
 * @param {string} text   raw QR content
 * @param {string} origin this app's origin (window.location.origin)
 * @returns {{kind:'project', id:number} | {kind:'external', url:string} | {kind:'text', text:string}}
 */
export function parseScan(text, origin) {
  const value = String(text || '').trim();
  let url;
  try {
    url = new URL(value);
  } catch {
    return { kind: 'text', text: value };
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return { kind: 'text', text: value };

  if (url.origin === origin) {
    const match = PROJECT_PATH.exec(url.pathname);
    if (match) return { kind: 'project', id: Number(match[1]) };
  }
  return { kind: 'external', url: url.href };
}

// The URL printed in a project's QR code. ?src=qr lets the project page count it as a scan.
export const projectQrUrl = (origin, id) => `${origin}/projects/${id}?src=qr`;
