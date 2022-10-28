import Touchable from 'components/Touchable';
import React, {memo, useCallback} from 'react';
import NavigationServices from 'services/NavigationServices';

type ImageLightBoxProps = {
  children: any;
  originUrl: string;
  onLongPress?: () => void;
};

const ImageLightBox = ({
  children,
  originUrl,
  onLongPress,
}: ImageLightBoxProps) => {
  const onPress = useCallback(() => {
    NavigationServices.showImageViewer([{url: originUrl}], 0);
  }, [originUrl]);
  return (
    <Touchable onPress={onPress} useReactNative onLongPress={onLongPress}>
      {children}
    </Touchable>
  );
};

export default memo(ImageLightBox);
