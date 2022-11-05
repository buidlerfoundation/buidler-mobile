import Touchable from 'components/Touchable';
import React, {memo, useCallback} from 'react';
import NavigationServices from 'services/NavigationServices';

type ImageLightBoxProps = {
  children: any;
  originUrl: string;
  onLongPress?: () => void;
  disabled?: boolean;
};

const ImageLightBox = ({
  children,
  originUrl,
  onLongPress,
  disabled,
}: ImageLightBoxProps) => {
  const onPress = useCallback(() => {
    NavigationServices.showImageViewer([{url: originUrl}], 0);
  }, [originUrl]);
  return (
    <Touchable
      onPress={onPress}
      useReactNative
      onLongPress={onLongPress}
      disabled={disabled}>
      {children}
    </Touchable>
  );
};

export default memo(ImageLightBox);
