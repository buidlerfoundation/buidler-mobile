import ImageResizer from 'react-native-image-resizer';
import RNConvertPhAsset from 'react-native-convert-ph-asset';

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

export const convertPHAssetVideo = (image: any) => {
  return RNConvertPhAsset.convertVideoFromUrl({
    url: image.uri,
    convertTo: 'mov',
    quality: 'original',
  });
};

export const convertLocalIdentifierToAssetLibrary = (
  uri: string,
  ext: string,
) => {
  if (uri.includes('ph://')) {
    const localIdentifier = uri.replace('ph://', '');
    const hash = localIdentifier.split('/')[0];
    return `assets-library://asset/asset.${ext}?id=${hash}&ext=${ext}`;
  }
  return uri;
};
