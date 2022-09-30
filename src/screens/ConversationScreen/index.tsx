import {actionTypes} from 'actions/actionTypes';
import AppDimension from 'common/AppDimension';
import Fonts from 'common/Fonts';
import SVG from 'common/SVG';
import KeyboardLayout from 'components/KeyboardLayout';
import Touchable from 'components/Touchable';
import {normalizeMessage, normalizeMessages} from 'helpers/MessageHelper';
import {MessageData} from 'models';
import React, {memo, useEffect, useState, useMemo, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  SectionList,
} from 'react-native';
import {createLoadMoreSelector} from 'reducers/selectors';
import BottomSheetHandle from 'components/BottomSheetHandle';
import GalleryView from 'components/GalleryView';
import Modal from 'react-native-modal';
import api from 'services/api';
import {getUniqueId} from 'helpers/GenerateUUID';
import {resizeImage} from 'helpers/ImageHelpers';
import SocketUtils from 'utils/SocketUtils';
import {titleMessageFromNow} from 'utils/DateUtils';
import useThemeColor from 'hook/useThemeColor';
import useCurrentChannel from 'hook/useCurrentChannel';
import useTeamUserData from 'hook/useTeamUserData';
import useCurrentCommunity from 'hook/useCurrentCommunity';
import useAppSelector from 'hook/useAppSelector';
import useAppDispatch from 'hook/useAppDispatch';
import {deleteMessage, getMessages} from 'actions/MessageActions';
import useMessageData from 'hook/useMessageData';
import {createTask, updateTask, uploadToIPFS} from 'actions/TaskActions';
import ChannelIcon from 'components/ChannelIcon';
import {useNavigation} from '@react-navigation/native';
import ScreenID from 'common/ScreenID';
import useUserRole from 'hook/useUserRole';
import Clipboard from '@react-native-clipboard/clipboard';
import {buidlerURL} from 'helpers/LinkHelper';
import Toast from 'react-native-toast-message';
import MenuMessage from 'components/MenuMessage';
import MessageInput from 'components/MessageInput';
import MessageItem from 'components/MessageItem';
import MenuPinPost from 'components/MenuPinPost';
// import {useGlobalModalContext} from 'components/ModalContainer';

const ConversationScreen = () => {
  const navigation = useNavigation();
  const messageData = useMessageData();
  // const {showModal} = useGlobalModalContext();
  const loadMoreMessage = useAppSelector(state =>
    loadMoreMessageSelector(state),
  );
  const messages = useMemo(() => messageData?.data || [], [messageData?.data]);
  const messageCanMore = useMemo(
    () => messageData?.canMore,
    [messageData?.canMore],
  );
  const userData = useAppSelector(state => state.user.userData);
  const userRole = useUserRole();
  const currentTeam = useCurrentCommunity();
  const currentChannel = useCurrentChannel();
  const teamUserData = useTeamUserData();
  const [messageReply, setMessageReply] = useState<MessageData>(null);
  const [messageEdit, setMessageEdit] = useState<MessageData>(null);
  const [selectedMessage, setSelectedMessage] = useState<MessageData>(null);
  const [isOpenMenuMessage, setOpenMenuMessage] = useState(false);
  const [isOpenMenuPinPost, setOpenMenuPinPost] = useState(false);
  const [isOpenGallery, setOpenGallery] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const dispatch = useAppDispatch();
  const toggleGallery = useCallback(
    () => setOpenGallery(current => !current),
    [],
  );
  useEffect(() => {
    if (currentChannel.channel_id) {
      dispatch(
        getMessages(
          currentChannel.channel_id,
          'Public',
          undefined,
          undefined,
          true,
        ),
      );
    }
  }, [currentChannel.channel_id, dispatch]);
  const {colors} = useThemeColor();
  const onRemoveAttachment = useCallback(
    id =>
      setAttachments(current =>
        current.filter(attachment => attachment.randomId !== id),
      ),
    [],
  );
  const onClearAttachment = useCallback(() => setAttachments([]), []);
  const onMoveShouldSetResponderCapture = useCallback(() => false, []);
  const renderItem = useCallback(
    ({item}: {item: MessageData}) => {
      return (
        <MessageItem
          item={item}
          teamId={currentTeam.team_id}
          onLongPress={openMenuMessage}
        />
      );
    },
    [currentTeam.team_id, openMenuMessage],
  );
  const renderFooter = useCallback(
    ({section: {title}}) => (
      <View style={styles.dateHeader}>
        <View style={[styles.line, {backgroundColor: colors.separator}]} />
        <Text style={[styles.dateText, {color: colors.secondary}]}>
          {titleMessageFromNow(title)}
        </Text>
        <View style={[styles.line, {backgroundColor: colors.separator}]} />
      </View>
    ),
    [colors.secondary, colors.separator],
  );
  const openMenuMessage = useCallback((message: MessageData) => {
    setSelectedMessage(message);
    if (message.task) {
      setOpenMenuPinPost(true);
    } else {
      setOpenMenuMessage(true);
    }
  }, []);
  const onEndReached = useCallback(() => {
    if (!messageCanMore || loadMoreMessage) return;
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    dispatch(
      getMessages(currentChannel.channel_id, 'Public', lastMsg.createdAt),
    );
  }, [
    currentChannel.channel_id,
    dispatch,
    loadMoreMessage,
    messageCanMore,
    messages,
  ]);
  const onSelectPhoto = useCallback(
    async (items: Array<any>) => {
      if (messageEdit) {
        SocketUtils.generateId = messageEdit.message_id;
      } else if (!SocketUtils.generateId) {
        SocketUtils.generateId = getUniqueId();
      }
      toggleGallery();
      const imagesResized = await Promise.all(
        items.map(image => {
          return resizeImage(image);
        }),
      );
      imagesResized.forEach(img => {
        const randomId = Math.random();
        setAttachments(current => [
          ...current,
          {uri: img.uri, randomId, loading: true},
        ]);
        api
          .uploadFile(currentTeam.team_id, SocketUtils.generateId, {
            uri: img.uri,
            name: img.name,
            type: 'multipart/form-data',
          })
          .then(res => {
            if (res.statusCode === 200) {
              setAttachments(current =>
                current.map(el => {
                  if (el.randomId === randomId) {
                    el.url = res.data.file_url;
                    el.loading = false;
                    el.id = res.data?.file?.file_id;
                  }
                  return el;
                }),
              );
            } else {
              setAttachments(current =>
                current.filter(el => el.randomId !== randomId),
              );
            }
          });
      });
    },
    [currentTeam.team_id, messageEdit, toggleGallery],
  );
  const onCloseMenuPinPost = useCallback(() => {
    setOpenMenuPinPost(false);
  }, []);
  const onCloseMenuMessage = useCallback(() => {
    setOpenMenuMessage(false);
  }, []);
  const onCreatePinPost = useCallback(() => {
    const body: any = {
      content: selectedMessage?.content,
      status: 'pinned',
      channel_ids: [currentChannel?.channel_id],
      task_id: selectedMessage?.message_id,
      team_id: currentTeam.team_id,
    };
    dispatch(createTask(currentChannel?.channel_id, body));
    onCloseMenuMessage();
  }, [
    currentChannel?.channel_id,
    currentTeam.team_id,
    dispatch,
    onCloseMenuMessage,
    selectedMessage?.content,
    selectedMessage?.message_id,
  ]);
  const onDeleteMessage = useCallback(() => {
    if (!selectedMessage) return;
    dispatch(
      deleteMessage(
        selectedMessage?.message_id,
        selectedMessage?.reply_message_id,
        currentChannel.channel_id,
      ),
    );
  }, [currentChannel.channel_id, dispatch, selectedMessage]);
  const onMenuPin = useCallback(() => {
    onCreatePinPost();
    onCloseMenuMessage();
  }, [onCloseMenuMessage, onCreatePinPost]);
  const onMenuDelete = useCallback(() => {
    onCloseMenuMessage();
    onCloseMenuPinPost();
    onDeleteMessage();
  }, [onCloseMenuMessage, onCloseMenuPinPost, onDeleteMessage]);
  const onMenuCopyPinPost = useCallback(async () => {
    await Clipboard.setString(
      `${buidlerURL}/channels/${currentTeam.team_id}/${currentChannel.channel_id}/post/${selectedMessage?.task?.task_id}`,
    );
    onCloseMenuPinPost();
    Toast.show({type: 'customSuccess', props: {message: 'Copied'}});
  }, [
    currentChannel.channel_id,
    currentTeam.team_id,
    onCloseMenuPinPost,
    selectedMessage?.task?.task_id,
  ]);
  const onReplyPinPost = useCallback(() => {
    navigation.navigate(ScreenID.PinPostDetailScreen, {
      postId: selectedMessage?.task?.task_id,
      reply: true,
    });
    onCloseMenuPinPost();
  }, [navigation, onCloseMenuPinPost, selectedMessage?.task?.task_id]);
  const onArchive = useCallback(() => {
    dispatch(
      updateTask(selectedMessage?.message_id, currentChannel.channel_id, {
        status: 'archived',
      }),
    );
    onCloseMenuPinPost();
  }, [
    currentChannel.channel_id,
    dispatch,
    onCloseMenuPinPost,
    selectedMessage?.message_id,
  ]);
  const onUnarchive = useCallback(() => {
    dispatch(
      updateTask(selectedMessage?.message_id, currentChannel.channel_id, {
        status: 'pinned',
      }),
    );
    onCloseMenuPinPost();
  }, [
    currentChannel.channel_id,
    dispatch,
    onCloseMenuPinPost,
    selectedMessage?.message_id,
  ]);
  const onUploadToIPFS = useCallback(() => {
    dispatch(
      uploadToIPFS(selectedMessage?.task?.task_id, currentChannel.channel_id),
    );
    onCloseMenuPinPost();
  }, [
    currentChannel.channel_id,
    dispatch,
    onCloseMenuPinPost,
    selectedMessage?.task?.task_id,
  ]);
  const onMenuCopyMessage = useCallback(async () => {
    await Clipboard.setString(
      `${buidlerURL}/channels/${currentTeam.team_id}/${currentChannel.channel_id}/message/${selectedMessage?.message_id}`,
    );
    onCloseMenuMessage();
    onCloseMenuPinPost();
    Toast.show({type: 'customSuccess', props: {message: 'Copied'}});
  }, [
    currentChannel.channel_id,
    currentTeam.team_id,
    onCloseMenuMessage,
    onCloseMenuPinPost,
    selectedMessage?.message_id,
  ]);
  const onClearReply = useCallback(() => {
    setMessageEdit(null);
    setMessageReply(null);
    setAttachments([]);
  }, []);
  const onReplyMessage = useCallback(() => {
    setMessageEdit(null);
    setMessageReply(selectedMessage);
    onCloseMenuMessage();
  }, [onCloseMenuMessage, selectedMessage]);
  const onEditMessage = useCallback(() => {
    setMessageReply(null);
    setMessageEdit(selectedMessage);
    onCloseMenuMessage();
    setAttachments(
      selectedMessage?.message_attachments?.map?.(el => ({
        ...el,
        type: el.mimetype,
        id: el.file_id,
        fileName: el.original_name,
        url: el.file_url,
      })),
    );
  }, [onCloseMenuMessage, selectedMessage]);
  const openSideMenu = useCallback(() => {
    navigation.openDrawer();
  }, [navigation]);
  const onPinPress = useCallback(() => {
    navigation.navigate(ScreenID.PinPostScreen);
  }, [navigation]);
  return (
    <KeyboardLayout extraPaddingBottom={-AppDimension.extraBottom - 45}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Touchable onPress={openSideMenu}>
            <SVG.IconSideMenu fill={colors.text} />
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
          <Touchable onPress={onPinPress}>
            <SVG.IconPin fill={colors.text} />
          </Touchable>
        </View>
        <SectionList
          style={{flex: 1}}
          sections={normalizeMessages(messages).map(el => ({
            data: normalizeMessage(el.data),
            title: el.title,
          }))}
          inverted
          keyExtractor={item => item.message_id}
          renderItem={renderItem}
          initialNumToRender={20}
          ListHeaderComponent={<View style={{height: 15}} />}
          onEndReached={onEndReached}
          renderSectionFooter={renderFooter}
          ListFooterComponent={
            loadMoreMessage ? (
              <View style={styles.footerMessage}>
                <ActivityIndicator />
              </View>
            ) : (
              <View />
            )
          }
        />
        <View style={styles.bottomView}>
          <MessageInput
            currentChannel={currentChannel}
            openGallery={toggleGallery}
            onRemoveAttachment={onRemoveAttachment}
            attachments={attachments}
            onClearAttachment={onClearAttachment}
            teamId={currentTeam.team_id}
            messageReply={messageReply}
            messageEdit={messageEdit}
            onClearReply={onClearReply}
            teamUserData={teamUserData}
          />
        </View>
        <Modal
          isVisible={isOpenMenuMessage}
          style={styles.modalMenuMessage}
          avoidKeyboard
          onMoveShouldSetResponderCapture={onMoveShouldSetResponderCapture}
          backdropColor={colors.backdrop}
          backdropOpacity={0.9}
          swipeDirection={['down']}
          onSwipeComplete={onCloseMenuMessage}
          onBackdropPress={onCloseMenuMessage}
          backdropTransitionOutTiming={0}
          hideModalContentWhileAnimating>
          <MenuMessage
            onPin={onMenuPin}
            onReply={onReplyMessage}
            onEdit={onEditMessage}
            onCopyMessage={onMenuCopyMessage}
            onDelete={onMenuDelete}
            canEdit={selectedMessage?.sender_id === userData.user_id}
            canDelete={selectedMessage?.sender_id === userData.user_id}
            canPin={userRole === 'Admin' || userRole === 'Owner'}
          />
        </Modal>
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
            canDelete={selectedMessage?.sender_id === userData.user_id}
            onArchive={onArchive}
            onUnarchive={onUnarchive}
            onUploadToIPFS={onUploadToIPFS}
            canUploadToIPFS={
              selectedMessage?.sender_id === userData.user_id &&
              !selectedMessage?.task?.cid
            }
            canUnarchive={
              (userRole === 'Admin' ||
                userRole === 'Owner' ||
                selectedMessage?.sender_id === userData.user_id) &&
              selectedMessage?.task?.status === 'archived'
            }
            canArchive={
              (userRole === 'Admin' ||
                userRole === 'Owner' ||
                selectedMessage?.sender_id === userData.user_id) &&
              selectedMessage?.task?.status !== 'archived'
            }
          />
        </Modal>
        <Modal
          isVisible={isOpenGallery}
          style={styles.modalGallery}
          avoidKeyboard
          onMoveShouldSetResponderCapture={onMoveShouldSetResponderCapture}
          backdropColor={colors.backdrop}
          backdropOpacity={0.9}
          onSwipeComplete={toggleGallery}
          swipeDirection={['down']}
          backdropTransitionOutTiming={0}
          hideModalContentWhileAnimating>
          <View
            style={[styles.galleryView, {backgroundColor: colors.background}]}>
            <BottomSheetHandle title="Photos" onClosePress={toggleGallery} />
            <GalleryView useFlatList onSelectPhoto={onSelectPhoto} />
          </View>
        </Modal>
      </View>
    </KeyboardLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: AppDimension.extraTop,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 10,
  },
  dateText: {
    fontSize: 12,
    lineHeight: 14,
    fontFamily: Fonts.Medium,
  },
  line: {
    flex: 1,
    marginHorizontal: 10,
    height: 1,
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
    marginHorizontal: 5,
    flex: 1,
  },
  body: {
    flex: 1,
  },
  bottomView: {},
  footerMessage: {
    height: 20,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalGallery: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  galleryView: {
    height: '90%',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  modalMenuMessage: {
    justifyContent: 'flex-end',
    margin: 0,
  },
});

const loadMoreMessageSelector = createLoadMoreSelector([
  actionTypes.MESSAGE_PREFIX,
]);

export default memo(ConversationScreen);
