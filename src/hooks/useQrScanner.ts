import { useCallback, useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';

export type CameraState = 'idle' | 'starting' | 'on' | 'denied' | 'unavailable';

interface DetectedBarcode {
  rawValue: string;
}
interface BarcodeDetectorLike {
  detect: (source: HTMLVideoElement) => Promise<DetectedBarcode[]>;
}
type BarcodeDetectorCtor = new (opts: {formats: string[];}) => BarcodeDetectorLike;

/**
 * Camera QR scanning for door check-in (D74). Uses the browser's built-in BarcodeDetector where
 * it exists, and a small dependency-free decoder (jsQR) everywhere else.
 */
export function useQrScanner(onCode: (value: string) => void, paused: boolean) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const detectorRef = useRef<BarcodeDetectorLike | null>(null);
  const pausedRef = useRef(paused);
  const onCodeRef = useRef(onCode);
  const busyRef = useRef(false);
  const [state, setState] = useState<CameraState>('idle');
  pausedRef.current = paused;
  onCodeRef.current = onCode;

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setState((s) => s === 'on' || s === 'starting' ? 'idle' : s);
  }, []);

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setState('unavailable');
      return;
    }
    setState('starting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
      streamRef.current = stream;
      const Ctor = (window as unknown as {BarcodeDetector?: BarcodeDetectorCtor;}).BarcodeDetector;
      detectorRef.current = Ctor ? new Ctor({ formats: ['qr_code'] }) : null;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }
      setState('on');
    } catch (e) {
      setState(e instanceof DOMException && (e.name === 'NotAllowedError' || e.name === 'SecurityError') ? 'denied' : 'unavailable');
    }
  }, []);

  useEffect(() => {
    if (state !== 'on') return;
    const id = window.setInterval(async () => {
      const video = videoRef.current;
      if (!video || pausedRef.current || busyRef.current || video.readyState < 2) return;
      busyRef.current = true;
      try {
        let value: string | undefined;
        if (detectorRef.current) {
          value = (await detectorRef.current.detect(video))[0]?.rawValue;
        } else {
          const w = video.videoWidth;
          const h = video.videoHeight;
          if (w && h) {
            const canvas = canvasRef.current ??= document.createElement('canvas');
            const scale = Math.min(1, 640 / Math.max(w, h));
            canvas.width = Math.round(w * scale);
            canvas.height = Math.round(h * scale);
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (ctx) {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
              value = jsQR(img.data, img.width, img.height, { inversionAttempts: 'dontInvert' })?.data;
            }
          }
        }
        if (value) onCodeRef.current(value);
      } catch {

        // A frame that can't be read is simply skipped.
      } finally {busyRef.current = false;
      }
    }, 280);
    return () => window.clearInterval(id);
  }, [state]);

  useEffect(() => () => streamRef.current?.getTracks().forEach((t) => t.stop()), []);

  return { videoRef, state, start, stop };
}