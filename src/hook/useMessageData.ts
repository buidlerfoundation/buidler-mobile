import React from 'react';
import useAppSelector from './useAppSelector';
import useChannelId from './useChannelId';
import useDirectChannelId from './useDirectChannelId';

function useMessageData(direct?: boolean) {
  const publicChannelId = useChannelId();
  const directChannelId = useDirectChannelId();
  const channelId = React.useMemo(
    () => (direct ? directChannelId : publicChannelId),
    [direct, directChannelId, publicChannelId],
  );
  const messageData = useAppSelector(state => state.message.messageData);

  return React.useMemo(() => {
    return messageData[channelId];
  }, [channelId, messageData]);
}

export default useMessageData;
