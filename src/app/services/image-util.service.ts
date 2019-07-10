import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImageUtilService {
  static readonly SHARPEN = [
    0, -1, 0,
    -1, 5, -1,
    0, -1, 0
  ];
  static readonly VERTICAL_EDGE = [
    -1, 0, 1,
    -2, 0, 2,
    -1, 0, 1
  ];
  static readonly HORIZONTAL_EDGE = [
    -1, -2, -1,
    0, 0, 0,
    1, 2, 1
  ];
  static readonly VERTICAL_HORIZONTAL_EDGE = [
    -2, -2, 0,
    -2, 0, 2,
    0, 1, 2
  ];
  static readonly EDGE = [
    1, 0, -1,
    0, 0, 0,
    -1, 0, 1
  ];
  static readonly LAPLACE = [
    0, 1, 0,
    1, -4, 1,
    0, 1, 0
  ];
  static readonly BOX_BLUR = [
    1/9, 1/9, 1/9,
    1/9, 1/9, 1/9,
    1/9, 1/9, 1/9
  ];
  static readonly GAUSSIAN_3 = [
    1/16, 2/16, 1/16,
    2/16, 4/16, 2/16,
    1/16, 2/16, 1/16
  ];
  static readonly UNSHARP_MASK = [
    1/-256,  4/-256,    6/-256,  4/-256, 1/-256,
    4/-256, 16/-256,   24/-256, 16/-256, 4/-256,
    6/-256, 24/-256, -476/-256, 24/-256, 6/-256,
    4/-256, 16/-256,   24/-256, 16/-256, 4/-256,
    1/-256,  4/-256,    6/-256,  4/-256, 1/-256
  ];

  constructor() { }

  private static truncate(value: number): number {
    if( value < 0) {
      return 0;
    }
    if( value > 255) {
      return 255;
    }
    return value;
  }

  static createTempCanvasData(width: number, height: number): [HTMLCanvasElement, CanvasRenderingContext2D, ImageData, Uint8ClampedArray] {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const pixels = context.createImageData(width, height);
    const pixelData = pixels.data;
    return [canvas, context, pixels, pixelData];
  }

  static getImageCanvasData(image: HTMLImageElement): [HTMLCanvasElement, CanvasRenderingContext2D, ImageData, Uint8ClampedArray] {
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext("2d");
    context.drawImage(image, 0, 0);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
    const pixelData = pixels.data;
    return [canvas, context, pixels, pixelData];
  }
  static getCanvasData(canvas: HTMLCanvasElement): [HTMLCanvasElement, CanvasRenderingContext2D, ImageData, Uint8ClampedArray] {
    const context = canvas.getContext("2d");
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
    const pixelData = pixels.data;
    return [canvas, context, pixels, pixelData];
  }
  static getDestructuredData(image: (HTMLImageElement|HTMLCanvasElement)) {
    let canvas, context, pixels, pixelData;
    if(image instanceof HTMLImageElement) {
      [canvas, context, pixels, pixelData] = ImageUtilService.getImageCanvasData(image)
    } else {
      [canvas, context, pixels, pixelData] = ImageUtilService.getCanvasData(image);
    }
    return [canvas, context, pixels, pixelData];
  }

  static grayscale(image: (HTMLImageElement|HTMLCanvasElement)): HTMLCanvasElement {
    const [canvas, context, pixels, pixelData] = ImageUtilService.getDestructuredData(image);
    for(let i = 0; i < pixelData.length; i += 4) {
      const r = pixelData[i];
      const g = pixelData[i + 1];
      const b = pixelData[i + 2];

      const v = 0.2126*r + 0.7152*g + 0.0722*b;
      pixelData[i] = pixelData[i + 1] = pixelData[i + 2] = v;
    }
    context.putImageData(pixels,0, 0);
    return canvas;
  }

  static invert(image: (HTMLImageElement|HTMLCanvasElement)): HTMLCanvasElement {
    const [canvas, context, pixels, pixelData] = ImageUtilService.getDestructuredData(image);
    for(let i = 0; i < pixelData.length; i += 4) {
      pixelData[i]     = pixelData[i] ^ 255;
      pixelData[i + 1] = pixelData[i + 1] ^ 255;
      pixelData[i + 2] = pixelData[i + 2] ^ 255;
    }
    context.putImageData(pixels, 0, 0);
    return canvas;
  }

  static brightness(image: (HTMLImageElement|HTMLCanvasElement), brightness): HTMLCanvasElement {
    if(brightness < -100) { brightness = -100 }
    if(brightness > 100) { brightness = 100 }
    const [canvas, context, pixels, pixelData] = ImageUtilService.getDestructuredData(image);
    for(let i = 0; i < pixelData.length; i += 4) {
      pixelData[i]     += 255 * (brightness / 100);
      pixelData[i + 1] += 255 * (brightness / 100);
      pixelData[i + 2] += 255 * (brightness / 100);
    }
    context.putImageData(pixels, 0, 0);
    return canvas;
  }

  static contrast(image: (HTMLImageElement|HTMLCanvasElement), contrast): HTMLCanvasElement {
    if(contrast < -100) { contrast = -100 }
    if(contrast > 100) { contrast = 100 }
    const [canvas, context, pixels, pixelData] = ImageUtilService.getDestructuredData(image);

    const factor = (259.0 * (contrast + 255.0)) / (255.0 * (259.0 - contrast));
    for(let i = 0; i < pixelData.length; i += 4) {
      pixelData[i]     = ImageUtilService.truncate(factor * (pixelData[i]     - 128.0) + 128.0);
      pixelData[i + 1] = ImageUtilService.truncate(factor * (pixelData[i + 1] - 128.0) + 128.0);
      pixelData[i + 2] = ImageUtilService.truncate(factor * (pixelData[i + 2] - 128.0) + 128.0);
    }
    context.putImageData(pixels, 0, 0);
    return canvas;
  }

  static convolute(image: (HTMLImageElement|HTMLCanvasElement), weights, opaque = false): HTMLCanvasElement {
    const [canvas, context, pixels, pixelData] = ImageUtilService.getDestructuredData(image);

    const side = Math.round(Math.sqrt(weights.length));
    const halfSide = Math.floor(side/2);
    const sourceWidth = pixels.width;
    const sourceHeight = pixels.height;

    // pad output by the convolution matrix
    const w = sourceWidth;
    const h = sourceHeight;
    const [,,tempPixels, tempPixelData] = ImageUtilService.createTempCanvasData(w, h);
    // go through the destination image pixels
    const alphaFac = opaque ? 1 : 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const sy = y;
        const sx = x;
        const dstOff = (y * w + x) * 4;
        // calculate the weighed sum of the source image pixels that
        // fall under the convolution matrix
        let r = 0, g = 0, b = 0, a = 0;
        for (let cy = 0; cy < side; cy++) {
          for (let cx = 0; cx < side; cx++) {
            const scy = sy + cy - halfSide;
            const scx = sx + cx - halfSide;
            if (scy >= 0 && scy < sourceHeight && scx >= 0 && scx < sourceWidth) {
              const srcOff = (scy * sourceWidth + scx) * 4;
              const wt = weights[cy * side + cx];
              r += pixelData[srcOff] * wt;
              g += pixelData[srcOff + 1] * wt;
              b += pixelData[srcOff + 2] * wt;
              a += pixelData[srcOff + 3] * wt;
            }
          }
        }
        tempPixelData[dstOff] = r;
        tempPixelData[dstOff + 1] = g;
        tempPixelData[dstOff + 2] = b;
        tempPixelData[dstOff + 3] = a + alphaFac * (255 - a);
      }
    }

    context.putImageData(tempPixels, 0, 0);
    return canvas;
  }
}
