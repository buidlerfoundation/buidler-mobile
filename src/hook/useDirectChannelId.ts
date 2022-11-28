import React from 'react';
import useAppSelector from './useAppSelector';

function useDirectChannelId() {
  const channelId = useAppSelector(state => state.user.currentDirectChannelId);

  return React.useMemo(() => channelId, [channelId]);
}

export default useDirectChannelId;
