export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
/** Longest edge after processing — keeps pages fast on slow connections. */
const MAX_EDGE = 1280;
const QUALITY = 0.84;

export type AspectRatio = '1:1' | '4:5' | '16:9';
export const aspectValue: Record<AspectRatio, number> = { '1:1': 1, '4:5': 4 / 5, '16:9': 16 / 9 };

export class ImageProblem extends Error {}

export function checkImageFile(file: File): void {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) throw new ImageProblem('Use a JPG, PNG or WebP photo.');
  if (file.size > MAX_UPLOAD_BYTES) throw new ImageProblem('That photo is over 10 MB. Try a smaller one.');
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new ImageProblem('We couldn’t read that image. Try another file.'));
    img.src = src;
  });
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new ImageProblem('We couldn’t read that file.'));
    reader.readAsDataURL(file);
  });
}

/** Reads, validates and downsizes an uploaded photo to a compressed JPEG data URL. */
export async function processUpload(file: File): Promise<string> {
  checkImageFile(file);
  const img = await loadImage(await readAsDataUrl(file));
  const scale = Math.min(1, MAX_EDGE / Math.max(img.naturalWidth, img.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.naturalWidth * scale);
  canvas.height = Math.round(img.naturalHeight * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new ImageProblem('Your browser couldn’t process the photo.');
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', QUALITY);
}

export interface CropBox {
  /** Zoom ≥ 1 relative to "cover" fit. */
  zoom: number;
  /** Pan offset as a fraction of available slack, -1…1 on each axis. */
  x: number;
  y: number;
}

/** Source rectangle for a cover-fit crop at the given aspect, zoom and pan. */
export function cropRect(width: number, height: number, aspect: number, box: CropBox) {
  const coverW = width / height > aspect ? height * aspect : width;
  const coverH = coverW / aspect;
  const w = coverW / box.zoom;
  const h = coverH / box.zoom;
  const sx = (width - w) / 2 + box.x * (width - w) / 2;
  const sy = (height - h) / 2 + box.y * (height - h) / 2;
  return { sx, sy, w, h };
}

/** Renders the crop to a new JPEG data URL. Only works for same-origin/data images. */
export async function cropImage(src: string, aspect: number, box: CropBox): Promise<string> {
  const img = await loadImage(src);
  const { sx, sy, w, h } = cropRect(img.naturalWidth, img.naturalHeight, aspect, box);
  const outW = Math.round(Math.min(w, MAX_EDGE));
  const outH = Math.round(outW / aspect);
  const canvas = document.createElement('canvas');
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new ImageProblem('Your browser couldn’t crop the photo.');
  ctx.drawImage(img, sx, sy, w, h, 0, 0, outW, outH);
  return canvas.toDataURL('image/jpeg', QUALITY);
}

/** An uploaded photo: embedded in the page, or held in the media library. */
export function isUploadedImage(src: string): boolean {
  return src.startsWith('data:image/') || src.startsWith('kmedia:');
}

export async function imageSize(src: string): Promise<{width: number;height: number;}> {
  try {
    const img = await loadImage(src);
    return { width: img.naturalWidth, height: img.naturalHeight };
  } catch {
    return { width: 0, height: 0 };
  }
}