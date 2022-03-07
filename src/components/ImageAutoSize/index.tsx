import React, {useState, useEffect} from 'react';
import {Image} from 'react-native';
import FastImage, {ResizeMode, ImageStyle} from 'react-native-fast-image';

type ImageAutoSizeProps = {
  url: string;
  maxWidth?: number;
  maxHeight?: number;
  resizeMode?: ResizeMode;
  style?: ImageStyle;
};

const ImageAutoSize = ({
  url,
  maxWidth,
  maxHeight,
  resizeMode,
  style,
}: ImageAutoSizeProps) => {
  const [size, setSize] = useState({width: maxWidth, height: maxHeight});
  useEffect(() => {
    Image.getSize(url, (w, h) => {
      if (w > 0 && h > 0) {
        let finalW = w;
        let finalH = h;
        const ratio = w / h;
        if (maxWidth && w > maxWidth) {
          finalW = maxWidth;
          finalH = maxWidth / ratio;
        } else if (maxHeight && h > maxHeight) {
          finalH = maxHeight;
          finalW = maxHeight * ratio;
        }
        setSize({width: finalW, height: finalH});
      }
    });
  }, [url]);
  return (
    <FastImage
      resizeMode={resizeMode}
      source={{uri: url}}
      style={[{width: size.width, height: size.height}, style]}
    />
  );
};

export default ImageAutoSize;
