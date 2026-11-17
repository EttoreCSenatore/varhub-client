import { describe, expect, it } from 'vitest';
import { parseScan, projectQrUrl } from './qr';

const ORIGIN = 'https://varhub.example';

describe('parseScan', () => {
  it('opens project links from this app', () => {
    expect(parseScan('https://varhub.example/projects/12', ORIGIN)).toEqual({ kind: 'project', id: 12 });
    expect(parseScan('https://varhub.example/projects/12?src=qr', ORIGIN)).toEqual({ kind: 'project', id: 12 });
    expect(parseScan(' https://varhub.example/projects/3/ ', ORIGIN)).toEqual({ kind: 'project', id: 3 });
  });
  it('treats other pages of this app and other sites as external links', () => {
    expect(parseScan('https://varhub.example/admin', ORIGIN).kind).toBe('external');
    expect(parseScan('https://evil.example/projects/12', ORIGIN)).toEqual({ kind: 'external', url: 'https://evil.example/projects/12' });
    expect(parseScan('https://varhub.example.evil.test/projects/1', ORIGIN).kind).toBe('external');
  });
  it('never turns non-web schemes into links', () => {
    expect(parseScan('javascript:alert(1)', ORIGIN).kind).toBe('text');
    expect(parseScan('tel:+15195551234', ORIGIN).kind).toBe('text');
  });
  it('returns plain text for everything else', () => {
    expect(parseScan('hello', ORIGIN)).toEqual({ kind: 'text', text: 'hello' });
    expect(parseScan('', ORIGIN)).toEqual({ kind: 'text', text: '' });
  });
  it('round-trips the URL printed in a project QR code', () => {
    expect(parseScan(projectQrUrl(ORIGIN, 7), ORIGIN)).toEqual({ kind: 'project', id: 7 });
  });
});

describe('QR round trip', () => {
  it('the code staff print is decoded by the scanner library', async () => {
    const { default: QRCode } = await import('qrcode');
    const { default: jsQR } = await import('jsqr');
    const text = projectQrUrl(ORIGIN, 42);
    const { modules } = QRCode.create(text, { errorCorrectionLevel: 'M' });
    const scale = 6;
    const quiet = 4;
    const size = (modules.size + quiet * 2) * scale;
    const pixels = new Uint8ClampedArray(size * size * 4).fill(255);
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const mx = Math.floor(x / scale) - quiet;
        const my = Math.floor(y / scale) - quiet;
        if (mx >= 0 && my >= 0 && mx < modules.size && my < modules.size && modules.get(my, mx)) {
          const i = (y * size + x) * 4;
          pixels[i] = pixels[i + 1] = pixels[i + 2] = 0;
        }
      }
    }
    expect(jsQR(pixels, size, size)?.data).toBe(text);
  });
});
