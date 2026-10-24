/**
 * Prepares images for the print kit (D118): shrinks them to print-friendly sizes so they
 * stay light enough to save on this device, and can lift a white background off a signature
 * or logo so it prints cleanly on cream or tinted paper.
 */

export interface PreparedImage {
  dataUrl: string;
  width: number;
  height: number;
}

const MAX_BYTES = 8 * 1024 * 1024;

export function readImageFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) return reject(new Error('Choose a PNG, JPG or WebP image.'));
    if (file.size > MAX_BYTES) return reject(new Error('That image is over 8 MB. Choose a smaller one.'));
    const url = URL.createObjectURL(file);
    const im = new Image();
    im.onload = () => {
      URL.revokeObjectURL(url);
      resolve(im);
    };
    im.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('We couldn’t read that image. Try a PNG or JPG.'));
    };
    im.src = url;
  });
}

/** Draws the image at most `maxPx` on its longest side. `knockout` turns near-white pixels transparent. */
export function prepareImage(source: CanvasImageSource & {width: number;height: number;}, maxPx: number, opts: {knockout?: boolean;jpeg?: boolean;} = {}): PreparedImage {
  const scale = Math.min(1, maxPx / Math.max(source.width, source.height));
  const w = Math.max(1, Math.round(source.width * scale));
  const h = Math.max(1, Math.round(source.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Your browser can’t process images here.');
  ctx.drawImage(source, 0, 0, w, h);
  if (opts.knockout) {
    const data = ctx.getImageData(0, 0, w, h);
    const px = data.data;
    for (let i = 0; i < px.length; i += 4) {
      const light = (px[i] + px[i + 1] + px[i + 2]) / 3;
      // Soft edge: fully clear above 235, partly clear 200–235 so strokes stay smooth.
      if (light > 235) px[i + 3] = 0;else
      if (light > 200) px[i + 3] = Math.round(px[i + 3] * ((235 - light) / 35));
    }
    ctx.putImageData(data, 0, 0);
  }
  return { dataUrl: opts.jpeg && !opts.knockout ? canvas.toDataURL('image/jpeg', 0.82) : canvas.toDataURL('image/png'), width: w, height: h };
}

/** Effective print resolution of an image placed `widthMm` wide. */
export function printDpi(pixelWidth: number, widthMm: number): number {
  return Math.round(pixelWidth / (widthMm / 25.4));
}