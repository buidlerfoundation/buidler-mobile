import {useNavigation} from '@react-navigation/native';
import {actionTypes} from 'actions/actionTypes';
import {
  deleteTask,
  getTasks,
  updateTask,
  uploadToIPFS,
} from 'actions/TaskActions';
import AppDimension from 'common/AppDimension';
import Fonts from 'common/Fonts';
import SVG from 'common/SVG';
import ChannelIcon from 'components/ChannelIcon';
import PinPostItem from 'components/PinPostItem';
import Touchable from 'components/Touchable';
import useAppDispatch from 'hook/useAppDispatch';
import useAppSelector from 'hook/useAppSelector';
import useCurrentChannel from 'hook/useCurrentChannel';
import usePinPostData from 'hook/usePinPostData';
import usePinPosts from 'hook/usePinPosts';
import useThemeColor from 'hook/useThemeColor';
import {TaskData} from 'models';
import React, {memo, useCallback, useEffect, useState} from 'react';
import {FlatList, StyleSheet, Text, View} from 'react-native';
import {createLoadMoreSelector} from 'reducers/selectors';
import Modal from 'react-native-modal';
import MenuPinPost from 'components/MenuPinPost';
import useUserRole from 'hook/useUserRole';
import Clipboard from '@react-native-clipboard/clipboard';
import {buidlerURL} from 'helpers/LinkHelper';
import Toast from 'react-native-toast-message';
import useCurrentCommunity from 'hook/useCurrentCommunity';
import ScreenID from 'common/ScreenID';
import HapticUtils from 'utils/HapticUtils';

const taskMoreSelector = createLoadMoreSelector([actionTypes.TASK_PREFIX]);

const PinPostScreen = () => {
  const dispatch = useAppDispatch();
  const pinPosts = usePinPosts();
  const navigation = useNavigation();
  const currentChannel = useCurrentChannel();
  const community = useCurrentCommunity();
  const {colors} = useThemeColor();
  const loadMoreTask = useAppSelector(state => taskMoreSelector(state));
  const {canMoreTask} = usePinPostData();
  const [isOpenMenuPinPost, setOpenMenuPinPost] = useState(false);
  const userData = useAppSelector(state => state.user.userData);
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
    dispatch(getTasks(currentChannel.channel_id));
  }, [currentChannel.channel_id, dispatch]);
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
    dispatch(getTasks(currentChannel.channel_id, last.message_created_at));
  }, [
    canMoreTask,
    currentChannel.channel_id,
    dispatch,
    loadMoreTask,
    pinPosts,
  ]);
  const onMoveShouldSetResponderCapture = useCallback(() => false, []);
  const onDeletePost = useCallback(async () => {
    await dispatch(
      deleteTask(selectedPinPost?.task_id, currentChannel?.channel_id),
    );
  }, [currentChannel?.channel_id, dispatch, selectedPinPost?.task_id]);
  const onMenuDelete = useCallback(() => {
    onCloseMenuPinPost();
    onDeletePost();
  }, [onCloseMenuPinPost, onDeletePost]);
  const onMenuCopyPinPost = useCallback(async () => {
    await Clipboard.setString(
      `${buidlerURL}/channels/${community.team_id}/${currentChannel.channel_id}/post/${selectedPinPost?.task_id}`,
    );
    onCloseMenuPinPost();
    Toast.show({type: 'customSuccess', props: {message: 'Copied'}});
  }, [
    community.team_id,
    currentChannel.channel_id,
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
  const onArchive = useCallback(() => {
    dispatch(
      updateTask(selectedPinPost?.task_id, currentChannel.channel_id, {
        status: 'archived',
      }),
    );
    onCloseMenuPinPost();
  }, [
    currentChannel.channel_id,
    dispatch,
    onCloseMenuPinPost,
    selectedPinPost?.task_id,
  ]);
  const onUnarchive = useCallback(() => {
    dispatch(
      updateTask(selectedPinPost?.task_id, currentChannel.channel_id, {
        status: 'pinned',
      }),
    );
    onCloseMenuPinPost();
  }, [
    currentChannel.channel_id,
    dispatch,
    onCloseMenuPinPost,
    selectedPinPost?.task_id,
  ]);
  const onUploadToIPFS = useCallback(() => {
    dispatch(uploadToIPFS(selectedPinPost?.task_id, currentChannel.channel_id));
    onCloseMenuPinPost();
  }, [
    currentChannel.channel_id,
    dispatch,
    onCloseMenuPinPost,
    selectedPinPost?.task_id,
  ]);
  const onMenuCopyMessage = useCallback(async () => {
    await Clipboard.setString(
      `${buidlerURL}/channels/${community.team_id}/${currentChannel.channel_id}/message/${selectedPinPost?.task_id}`,
    );
    onCloseMenuPinPost();
    Toast.show({type: 'customSuccess', props: {message: 'Copied'}});
  }, [
    community.team_id,
    currentChannel.channel_id,
    onCloseMenuPinPost,
    selectedPinPost?.task_id,
  ]);
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Touchable onPress={onBack}>
          <SVG.IconArrowBack fill={colors.text} />
        </Touchable>
        <View style={styles.titleWrap}>
          <ChannelIcon channel={currentChannel} color={colors.text} />
          <Text
            style={[styles.title, {color: colors.text}]}
            ellipsizeMode="tail"
            numberOfLines={1}>
            {currentChannel.channel_name}
          </Text>
        </View>
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
      <Modal
        isVisible={isOpenMenuPinPost}
        style={styles.modalMenuMessage}
        avoidKeyboard
        onMoveShouldSetResponderCapture={onMoveShouldSetResponderCapture}
        backdropColor={colors.backdrop}
        backdropOpacity={0.9}
        swipeDirection={['down']}
        onSwipeComplete={onCloseMenuPinPost}
        onBackdropPress={onCloseMenuPinPost}
        backdropTransitionOutTiming={0}
        hideModalContentWhileAnimating>
        <MenuPinPost
          onReply={onReplyPinPost}
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
        />
      </Modal>
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
  titleWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
  title: {
    fontFamily: Fonts.Bold,
    fontSize: 16,
    lineHeight: 19,
    marginLeft: 10,
  },
  body: {
    flex: 1,
  },
  ppSeparate: {
    height: 1,
    marginVertical: 30,
  },
  modalMenuMessage: {
    justifyContent: 'flex-end',
    margin: 0,
  },
});
export default memo(PinPostScreen);
