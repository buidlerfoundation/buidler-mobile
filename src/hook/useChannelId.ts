import React from 'react';
import useAppSelector from './useAppSelector';

function useChannelId() {
  const channelId = useAppSelector(state => state.user.currentChannelId);

  return React.useMemo(() => channelId, [channelId]);
}

export default useChannelId;
