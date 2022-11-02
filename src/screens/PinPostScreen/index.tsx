import {useNavigation} from '@react-navigation/native';
import {actionTypes} from 'actions/actionTypes';
import {
  deleteTask,
  getTasks,
  updateTask,
  uploadToIPFS,
} from 'actions/TaskActions';
import AppDimension from 'common/AppDimension';
import SVG from 'common/SVG';
import PinPostItem from 'components/PinPostItem';
import Touchable from 'components/Touchable';
import useAppDispatch from 'hook/useAppDispatch';
import useAppSelector from 'hook/useAppSelector';
import usePinPostData from 'hook/usePinPostData';
import usePinPosts from 'hook/usePinPosts';
import useThemeColor from 'hook/useThemeColor';
import {TaskData} from 'models';
import React, {memo, useCallback, useEffect, useState} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {createLoadMoreSelector} from 'reducers/selectors';
import MenuPinPost from 'components/MenuPinPost';
import useUserRole from 'hook/useUserRole';
import Clipboard from '@react-native-clipboard/clipboard';
import {buidlerURL} from 'helpers/LinkHelper';
import Toast from 'react-native-toast-message';
import ScreenID from 'common/ScreenID';
import HapticUtils from 'utils/HapticUtils';
import ChannelTitle from 'components/ChannelTitle';
import useChannelId from 'hook/useChannelId';
import useCommunityId from 'hook/useCommunityId';
import {setCurrentChannel} from 'actions/UserActions';
import BottomSheetHandle from 'components/BottomSheetHandle';
import EmojiPicker from 'components/EmojiPicker';
import {addReact, removeReact} from 'actions/ReactActions';
import MenuReport from 'components/MenuReport';
import ModalBottom from 'components/ModalBottom';
import AppConfig from 'common/AppConfig';

const taskMoreSelector = createLoadMoreSelector([actionTypes.TASK_PREFIX]);

const PinPostScreen = () => {
  const dispatch = useAppDispatch();
  const pinPosts = usePinPosts();
  const navigation = useNavigation();
  const currentChannelId = useChannelId();
  const communityId = useCommunityId();
  const {colors} = useThemeColor();
  const loadMoreTask = useAppSelector(state => taskMoreSelector(state));
  const {canMoreTask} = usePinPostData();
  const [isOpenMenuReport, setOpenMenuReport] = useState(false);
  const [isOpenMenuPinPost, setOpenMenuPinPost] = useState(false);
  const [isOpenModalEmoji, setOpenModalEmoji] = useState(false);
  const userData = useAppSelector(state => state.user.userData);
  const reactData = useAppSelector(state => state.reactReducer.reactData);
  const userRole = useUserRole();
  const [selectedPinPost, setSelectedPinPost] = useState<TaskData>(null);
  const openMenuPinPost = useCallback((pinPost: TaskData) => {
    HapticUtils.trigger();
    setSelectedPinPost(pinPost);
    setOpenMenuPinPost(true);
  }, []);
  const onCloseMenuPinPost = useCallback(() => {
    setOpenMenuPinPost(false);
  }, []);
  const onBack = useCallback(() => navigation.goBack(), [navigation]);
  useEffect(() => {
    if (currentChannelId) {
      dispatch(getTasks(currentChannelId));
    }
  }, [currentChannelId, dispatch]);
  const renderPinPost = useCallback(
    ({item}: {item: TaskData}) => {
      return <PinPostItem pinPost={item} onLongPress={openMenuPinPost} />;
    },
    [openMenuPinPost],
  );
  const renderSeparator = useCallback(
    () => (
      <View style={[styles.ppSeparate, {backgroundColor: colors.border}]} />
    ),
    [colors.border],
  );
  const onEndReached = useCallback(() => {
    if (loadMoreTask || !canMoreTask) return;
    const last = pinPosts[pinPosts.length - 1];
    dispatch(getTasks(currentChannelId, last.task_id));
  }, [canMoreTask, currentChannelId, dispatch, loadMoreTask, pinPosts]);
  const onDeletePost = useCallback(async () => {
    await dispatch(deleteTask(selectedPinPost?.task_id, currentChannelId));
  }, [currentChannelId, dispatch, selectedPinPost?.task_id]);
  const onMenuDelete = useCallback(() => {
    onCloseMenuPinPost();
    onDeletePost();
  }, [onCloseMenuPinPost, onDeletePost]);
  const onMenuCopyPinPost = useCallback(async () => {
    await Clipboard.setString(
      `${buidlerURL}/channels/${communityId}/${currentChannelId}/post/${selectedPinPost?.task_id}`,
    );
    onCloseMenuPinPost();
    Toast.show({type: 'customSuccess', props: {message: 'Copied'}});
  }, [
    communityId,
    currentChannelId,
    onCloseMenuPinPost,
    selectedPinPost?.task_id,
  ]);
  const onReplyPinPost = useCallback(() => {
    navigation.navigate(ScreenID.PinPostDetailScreen, {
      postId: selectedPinPost?.task_id,
      reply: true,
    });
    onCloseMenuPinPost();
  }, [navigation, onCloseMenuPinPost, selectedPinPost?.task_id]);
  const onJumpToMessage = useCallback(async () => {
    navigation.navigate(ScreenID.ConversationScreen, {
      jumpMessageId: `${selectedPinPost?.task_id}:${Math.random()}`,
    });
    if (currentChannelId !== selectedPinPost?.root_message_channel_id) {
      dispatch(
        setCurrentChannel({
          channel_id: selectedPinPost?.root_message_channel_id,
        }),
      );
    }
  }, [
    currentChannelId,
    dispatch,
    navigation,
    selectedPinPost?.root_message_channel_id,
    selectedPinPost?.task_id,
  ]);
  const onArchive = useCallback(() => {
    dispatch(
      updateTask(selectedPinPost?.task_id, currentChannelId, {
        status: 'archived',
      }),
    );
    onCloseMenuPinPost();
  }, [
    currentChannelId,
    dispatch,
    onCloseMenuPinPost,
    selectedPinPost?.task_id,
  ]);
  const onUnarchive = useCallback(() => {
    dispatch(
      updateTask(selectedPinPost?.task_id, currentChannelId, {
        status: 'pinned',
      }),
    );
    onCloseMenuPinPost();
  }, [
    currentChannelId,
    dispatch,
    onCloseMenuPinPost,
    selectedPinPost?.task_id,
  ]);
  const onUploadToIPFS = useCallback(() => {
    dispatch(uploadToIPFS(selectedPinPost?.task_id, currentChannelId));
    onCloseMenuPinPost();
  }, [
    currentChannelId,
    dispatch,
    onCloseMenuPinPost,
    selectedPinPost?.task_id,
  ]);
  const onMenuCopyMessage = useCallback(async () => {
    await Clipboard.setString(
      `${buidlerURL}/channels/${communityId}/${currentChannelId}/message/${selectedPinPost?.task_id}`,
    );
    onCloseMenuPinPost();
    Toast.show({type: 'customSuccess', props: {message: 'Copied'}});
  }, [
    communityId,
    currentChannelId,
    onCloseMenuPinPost,
    selectedPinPost?.task_id,
  ]);
  const openMenuReport = useCallback(() => {
    onCloseMenuPinPost();
    setTimeout(() => {
      setOpenMenuReport(true);
    }, AppConfig.timeoutCloseBottomSheet);
  }, [onCloseMenuPinPost]);
  const closeMenuReport = useCallback(() => {
    setOpenMenuReport(false);
  }, []);
  const openModalEmoji = useCallback(() => {
    onCloseMenuPinPost();
    setTimeout(() => {
      setOpenModalEmoji(true);
    }, AppConfig.timeoutCloseBottomSheet);
  }, [onCloseMenuPinPost]);
  const closeModalEmoji = useCallback(() => {
    setOpenModalEmoji(false);
  }, []);
  const onReactPress = useCallback(
    (name: string) => {
      const reacts = reactData[selectedPinPost?.task_id];
      const isExisted = !!reacts?.find(
        (react: any) => react.reactName === name && react?.isReacted,
      );
      if (isExisted) {
        dispatch(
          removeReact(selectedPinPost?.task_id, name, userData?.user_id),
        );
      } else {
        dispatch(addReact(selectedPinPost?.task_id, name, userData?.user_id));
      }
    },
    [dispatch, reactData, selectedPinPost?.task_id, userData?.user_id],
  );
  const onEmojiSelected = useCallback(
    emoji => {
      onReactPress(emoji.short_name);
      closeModalEmoji();
      onCloseMenuPinPost();
    },
    [closeModalEmoji, onCloseMenuPinPost, onReactPress],
  );
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Touchable onPress={onBack}>
          <SVG.IconArrowBack fill={colors.text} />
        </Touchable>
        <ChannelTitle />
      </View>
      <View style={styles.body}>
        <FlatList
          data={pinPosts}
          keyExtractor={item => item.task_id}
          renderItem={renderPinPost}
          ItemSeparatorComponent={renderSeparator}
          ListHeaderComponent={<View style={{height: 20}} />}
          ListFooterComponent={
            <View style={{height: 30 + AppDimension.extraBottom}} />
          }
          onEndReachedThreshold={0.5}
          onEndReached={onEndReached}
        />
      </View>
      <ModalBottom
        isVisible={isOpenMenuPinPost}
        onSwipeComplete={onCloseMenuPinPost}
        onBackdropPress={onCloseMenuPinPost}>
        <MenuPinPost
          onReply={onReplyPinPost}
          onJumpToMessage={onJumpToMessage}
          onCopyMessage={onMenuCopyMessage}
          onCopyPostLink={onMenuCopyPinPost}
          onDelete={onMenuDelete}
          canDelete={selectedPinPost?.message_sender_id === userData.user_id}
          onArchive={onArchive}
          onUnarchive={onUnarchive}
          onUploadToIPFS={onUploadToIPFS}
          canUploadToIPFS={
            selectedPinPost?.message_sender_id === userData.user_id &&
            !selectedPinPost?.cid
          }
          canUnarchive={
            (userRole === 'Admin' ||
              userRole === 'Owner' ||
              selectedPinPost?.message_sender_id === userData.user_id) &&
            selectedPinPost?.status === 'archived'
          }
          canArchive={
            (userRole === 'Admin' ||
              userRole === 'Owner' ||
              selectedPinPost?.message_sender_id === userData.user_id) &&
            selectedPinPost?.status !== 'archived'
          }
          canJumpMessage
          openModalEmoji={openModalEmoji}
          onEmojiSelected={onEmojiSelected}
          onReport={openMenuReport}
          canReport={selectedPinPost?.message_sender_id !== userData.user_id}
        />
      </ModalBottom>
      <ModalBottom
        isVisible={isOpenModalEmoji}
        onSwipeComplete={closeModalEmoji}>
        <View style={[styles.emojiView, {backgroundColor: colors.background}]}>
          <BottomSheetHandle title="Reaction" onClosePress={closeModalEmoji} />
          <EmojiPicker onEmojiSelected={onEmojiSelected} />
        </View>
      </ModalBottom>
      <ModalBottom
        isVisible={isOpenMenuReport}
        onSwipeComplete={closeMenuReport}
        onBackdropPress={closeMenuReport}>
        <MenuReport
          onClose={closeMenuReport}
          selectedPinPost={selectedPinPost}
        />
      </ModalBottom>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: AppDimension.extraTop,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: AppDimension.headerHeight,
  },
  body: {
    flex: 1,
  },
  ppSeparate: {
    height: 1,
    marginVertical: 30,
  },
  emojiView: {
    height: '90%',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
});
export default memo(PinPostScreen);
