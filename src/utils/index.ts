interface IBaseConfig {
  [key: string]: any;
}

export enum EImageType {
  'PNG' = 'image/png',
  'JPEG' = 'image/jpeg',
  'GIF' = 'image/gif'
}

export function checkImageType(type: EImageType) {
  return ['image/png', 'image/jpeg', 'image/gif'].some(i => i === type);
}

export interface Image2CanvasConfig extends IBaseConfig {
  width?: number,
  height?: number,
  scale?: number,
  orientation?: number,
}

export function dataURLtoImage(dataURL: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('dataURLtoImage(): dataURL is illegal'));
    img.src = dataURL;
  });
};

export async function imagetoCanvas(image: HTMLImageElement, config: Image2CanvasConfig = {}): Promise<HTMLCanvasElement> {
  const myConfig = { ...config };
  const cvs = document.createElement('canvas');
  const ctx = cvs.getContext('2d');
  let height;
  let width;
  for (const i in myConfig) {
    if (Object.prototype.hasOwnProperty.call(myConfig, i)) {
      myConfig[i] = Number(myConfig[i]);
    }
  }
  // 设置宽高
  if (!myConfig.scale) {
    width = myConfig.width || myConfig.height * image.width / image.height || image.width;
    height = myConfig.height || myConfig.width * image.height / image.width || image.height;
  } else {
    // 缩放比例0-10，不在此范围则保持原来图像大小
    const scale = myConfig.scale > 0 && myConfig.scale < 10 ? myConfig.scale : 1;
    width = image.width * scale;
    height = image.height * scale;
  }
  // 当顺时针或者逆时针旋转90时，需要交换canvas的宽高
  if ([5, 6, 7, 8].some(i => i === myConfig.orientation)) {
    cvs.height = width;
    cvs.width = height;
  } else {
    cvs.height = height;
    cvs.width = width;
  }
  // 设置方向
  switch (myConfig.orientation) {
    case 3:
      ctx.rotate(180 * Math.PI / 180);
      ctx.drawImage(image, -cvs.width, -cvs.height, cvs.width, cvs.height);
      break;
    case 6:
      ctx.rotate(90 * Math.PI / 180);
      ctx.drawImage(image, 0, -cvs.width, cvs.height, cvs.width);
      break;
    case 8:
      ctx.rotate(270 * Math.PI / 180);
      ctx.drawImage(image, -cvs.height, 0, cvs.height, cvs.width);
      break;
    case 2:
      ctx.translate(cvs.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(image, 0, 0, cvs.width, cvs.height);
      break;
    case 4:
      ctx.translate(cvs.width, 0);
      ctx.scale(-1, 1);
      ctx.rotate(180 * Math.PI / 180);
      ctx.drawImage(image, -cvs.width, -cvs.height, cvs.width, cvs.height);
      break;
    case 5:
      ctx.translate(cvs.width, 0);
      ctx.scale(-1, 1);
      ctx.rotate(90 * Math.PI / 180);
      ctx.drawImage(image, 0, -cvs.width, cvs.height, cvs.width);
      break;
    case 7:
      ctx.translate(cvs.width, 0);
      ctx.scale(-1, 1);
      ctx.rotate(270 * Math.PI / 180);
      ctx.drawImage(image, -cvs.height, 0, cvs.height, cvs.width);
      break;
    default:
      ctx.drawImage(image, 0, 0, cvs.width, cvs.height);
  }
  return cvs;
};

export async function canvastoDataURL(canvas: HTMLCanvasElement, quality: number = 0.92, type: EImageType = EImageType.PNG): Promise<string> {
  if (!checkImageType(type)) {
    type = EImageType.JPEG;
  }
  return canvas.toDataURL(type, quality);
};
