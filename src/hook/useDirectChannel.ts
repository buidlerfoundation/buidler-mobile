import {useMemo} from 'react';
import useAppSelector from './useAppSelector';
import useDirectChannelId from './useDirectChannelId';

const useDirectChannel = () => {
  const directChannels = useAppSelector(state => state.user.directChannel);
  const directChannelId = useDirectChannelId();
  return useMemo(
    () => directChannels.find(el => el.channel_id === directChannelId),
    [directChannelId, directChannels],
  );
};

export default useDirectChannel;
