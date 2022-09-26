import {useMemo} from 'react';
import useAppSelector from './useAppSelector';
import useCurrentChannel from './useCurrentChannel';

const usePinPostData = () => {
  const channelId = useCurrentChannel().channel_id;
  const pinPostData = useAppSelector(state => state.task.taskData);
  return useMemo(() => pinPostData[channelId] || {}, [pinPostData, channelId]);
};

export default usePinPostData;
