import ImageHelper from 'helpers/ImageHelper';
import {useMemo} from 'react';
import useAppSelector from './useAppSelector';
import useCommunityId from './useCommunityId';

const useAttachments = (contentId?: string) => {
  const communityId = useCommunityId();
  const messageData = useAppSelector(state => state.message.messageData);
  const messages = useMemo(
    () => messageData?.[contentId]?.data || [],
    [contentId, messageData],
  );
  return useMemo(() => {
    const res = [];
    for (let index = messages.length - 1; index >= 0; index--) {
      const message = messages[index];
      res.push(
        ...(message.message_attachments
          ?.filter(
            el =>
              el.mimetype?.includes('image') || el.mimetype?.includes('video'),
          )
          ?.map(el => ({
            url: ImageHelper.normalizeImage(el.file_url, communityId),
          })) || []),
      );
    }
    return res;
  }, [communityId, messages]);
};

export default useAttachments;
