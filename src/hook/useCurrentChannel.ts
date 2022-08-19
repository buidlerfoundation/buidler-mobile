import React from 'react';
import {Channel} from 'models';
import useAppSelector from './useAppSelector';
import useChannel from './useChannel';

function useCurrentChannel() {
  const channelId = useAppSelector(state => state.user.currentChannelId);
  const channels = useChannel();

  return React.useMemo<Channel>(() => {
    const res = channels.find(el => el.channel_id === channelId) || {
      channel_id: '',
      channel_member: [],
      channel_name: '',
      channel_type: 'Public',
      notification_type: '',
      seen: true,
    };
    return res;
  }, [channelId, channels]);
}

export default useCurrentChannel;
