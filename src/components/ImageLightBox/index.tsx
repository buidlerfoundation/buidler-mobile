import Touchable from 'components/Touchable';
import React, {memo, useCallback} from 'react';
import NavigationServices from 'services/NavigationServices';

type ImageLightBoxProps = {
  children: any;
  originUrl: string;
};

const ImageLightBox = ({children, originUrl}: ImageLightBoxProps) => {
  const onPress = useCallback(() => {
    NavigationServices.showImageViewer([{url: originUrl}], 0);
  }, [originUrl]);
  return <Touchable onPress={onPress}>{children}</Touchable>;
};

export default memo(ImageLightBox);
