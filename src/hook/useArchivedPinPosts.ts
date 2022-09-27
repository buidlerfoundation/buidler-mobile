import {useMemo} from 'react';
import useAppSelector from './useAppSelector';
import useCurrentChannel from './useCurrentChannel';

const useArchivedPinPosts = () => {
  const channelId = useCurrentChannel().channel_id;
  const pinPostData = useAppSelector(state => state.task.taskData);
  return useMemo(
    () => pinPostData[channelId]?.archivedTasks || [],
    [pinPostData, channelId],
  );
};

export default useArchivedPinPosts;
