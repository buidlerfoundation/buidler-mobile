import React from 'react';
import useAppSelector from './useAppSelector';
import useChannel from './useChannel';

function useChannelById(channelId: string, direct?: boolean) {
  const channels = useChannel();
  const directChannels = useAppSelector(state => state.user.directChannel);

  return React.useMemo(() => {
    if (direct) return directChannels.find(el => el.channel_id === channelId);
    return channels.find(el => el.channel_id === channelId);
  }, [channelId, channels, direct, directChannels]);
}

export default useChannelById;
