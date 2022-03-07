import Touchable from 'components/Touchable';
import React from 'react';
import {} from 'react-native';
import NavigationServices from 'services/NavigationServices';

type ImageLightBoxProps = {
  children: any;
  originUrl: string;
};

const ImageLightBox = ({children, originUrl}: ImageLightBoxProps) => {
  return (
    <Touchable
      onPress={() => {
        NavigationServices.showImageViewer([{url: originUrl}], 0);
      }}>
      {children}
    </Touchable>
  );
};

export default ImageLightBox;
