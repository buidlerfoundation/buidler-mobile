import {useCallback, useEffect, useMemo, useState} from 'react';
import {getPinPostDetail} from 'actions/TaskActions';
import {TaskData} from 'models';
import useAppDispatch from './useAppDispatch';

const usePostData = (postId: string) => {
  const [data, setData] = useState<{
    data?: TaskData | null;
    fetchingPost: boolean;
    errorPost?: string;
  }>({data: null, fetchingPost: false, errorPost: ''});
  const dispatch = useAppDispatch();
  const fetchPost = useCallback(async () => {
    if (!postId) return;
    setData({data: null, fetchingPost: true, errorPost: ''});
    const postRes: any = await dispatch(getPinPostDetail(postId));
    if (postRes.success) {
      setData({data: postRes.data, fetchingPost: false, errorPost: ''});
    } else {
      setData({data: null, fetchingPost: false, errorPost: postRes.message});
    }
  }, [dispatch, postId]);
  useEffect(() => {
    if (!postId) return;
    fetchPost();
  }, [fetchPost, postId]);
  return useMemo(() => data, [data]);
};

export default usePostData;
