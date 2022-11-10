import Touchable from 'components/Touchable';
import useAttachments from 'hook/useAttachments';
import React, {memo, useCallback, useMemo} from 'react';
import NavigationServices from 'services/NavigationServices';

type ImageLightBoxProps = {
  children: any;
  originUrl: string;
  onLongPress?: () => void;
  disabled?: boolean;
  contentId?: string;
  allAttachments?: any[];
};

const ImageLightBox = ({
  children,
  originUrl,
  onLongPress,
  disabled,
  contentId,
  allAttachments,
}: ImageLightBoxProps) => {
  const attachments = useAttachments(contentId);
  const attachmentFull = useMemo(
    () => allAttachments || attachments,
    [allAttachments, attachments],
  );
  const onPress = useCallback(() => {
    const index = attachmentFull.findIndex(el => el.url === originUrl);
    if (index >= 0) {
      NavigationServices.showImageViewer(attachmentFull, index);
    } else {
      NavigationServices.showImageViewer([{url: originUrl}], 0);
    }
  }, [attachmentFull, originUrl]);
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
