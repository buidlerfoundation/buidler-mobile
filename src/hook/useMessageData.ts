import React from 'react';
import useAppSelector from './useAppSelector';

function useMessageData() {
  const channelId = useAppSelector(state => state.user.currentChannelId);
  const messageData = useAppSelector(state => state.message.messageData);

  return React.useMemo(() => {
    return messageData[channelId];
  }, [channelId, messageData]);
}

export default useMessageData;
