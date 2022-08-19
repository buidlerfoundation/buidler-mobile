import {useMemo} from 'react';
import useAppSelector from './useAppSelector';

function useTaskData() {
  const channelId = useAppSelector(state => state.user.currentChannelId);
  const taskData = useAppSelector(state => state.task.taskData);
  return useMemo(() => taskData[channelId], [channelId, taskData]);
}

export default useTaskData;
