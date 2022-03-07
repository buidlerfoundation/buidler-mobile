import ImageResizer from 'react-native-image-resizer';

export const imageNewSize = (width: number, height: number) => {
  const minSize = 2048;
  const res = {
    width,
    height,
  };
  if (width <= minSize && height <= minSize) return res;
  const ratio = width / height;
  const isPortrait = width <= height;
  if (isPortrait) {
    res.height = minSize;
    res.width = minSize * ratio;
  } else {
    res.width = minSize;
    res.height = Math.round(minSize / ratio);
  }
  return res;
};

export const resizeImage = (image: any) => {
  const newSize = imageNewSize(image.width, image.height);
  return ImageResizer.createResizedImage(
    image.path || image.uri,
    newSize.width,
    newSize.height,
    'JPEG',
    100,
  );
};
