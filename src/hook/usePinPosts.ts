import {useMemo} from 'react';
import useAppSelector from './useAppSelector';
import useCurrentChannel from './useCurrentChannel';

const usePinPosts = () => {
  const channelId = useCurrentChannel().channel_id;
  const pinPostData = useAppSelector(state => state.task.taskData);
  return useMemo(
    () => pinPostData[channelId]?.tasks || [],
    [pinPostData, channelId],
  );
};

export default usePinPosts;
