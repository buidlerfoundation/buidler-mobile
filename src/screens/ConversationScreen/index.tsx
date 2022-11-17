import {actionTypes} from 'actions/actionTypes';
import {uniqBy} from 'lodash';
import AppDimension from 'common/AppDimension';
import SVG from 'common/SVG';
import KeyboardLayout from 'components/KeyboardLayout';
import Touchable from 'components/Touchable';
import {normalizeMessages} from 'helpers/MessageHelper';
import {MessageData} from 'models';
import React, {
  memo,
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  NativeSyntheticEvent,
  NativeScrollEvent,
  FlatList,
} from 'react-native';
import {createLoadMoreSelector} from 'reducers/selectors';
import BottomSheetHandle from 'components/BottomSheetHandle';
import GalleryView from 'components/GalleryView';
import api from 'services/api';
import {getUniqueId} from 'helpers/GenerateUUID';
import {convertPHAssetVideo, resizeImage} from 'helpers/ImageHelpers';
import SocketUtils from 'utils/SocketUtils';
import {titleMessageFromNow} from 'utils/DateUtils';
import useThemeColor from 'hook/useThemeColor';
import useAppSelector from 'hook/useAppSelector';
import useAppDispatch from 'hook/useAppDispatch';
import {
  deleteMessage,
  getAroundMessage,
  getMessages,
  setScrollData,
} from 'actions/MessageActions';
import useMessageData from 'hook/useMessageData';
import {createTask, updateTask, uploadToIPFS} from 'actions/TaskActions';
import {useNavigation, useRoute} from '@react-navigation/native';
import ScreenID from 'common/ScreenID';
import useUserRole from 'hook/useUserRole';
import Clipboard from '@react-native-clipboard/clipboard';
import {buidlerURL} from 'helpers/LinkHelper';
import Toast from 'react-native-toast-message';
import MenuMessage from 'components/MenuMessage';
import MessageInput from 'components/MessageInput';
import MessageItem from 'components/MessageItem';
import MenuPinPost from 'components/MenuPinPost';
import HapticUtils from 'utils/HapticUtils';
import useCommunityId from 'hook/useCommunityId';
import useChannelId from 'hook/useChannelId';
import {useDrawerStatus} from '@react-navigation/drawer';
import AppConfig from 'common/AppConfig';
import ChannelTitle from 'components/ChannelTitle';
import AppStyles from 'common/AppStyles';
import EmojiPicker from 'components/EmojiPicker';
import {addReact, removeReact} from 'actions/ReactActions';
import MenuReport from 'components/MenuReport';
import ModalBottom from 'components/ModalBottom';
import ViewAllButton from 'components/ViewAllButton';
import {launchImageLibrary} from 'react-native-image-picker';
import MenuConfirmPin from 'components/MenuConfirmPin';

const ConversationScreen = () => {
  const listRef = useRef<FlatList>();
  const navigation = useNavigation();
  const route = useRoute();
  const messageData = useMessageData();
  const [loadMoreAfterMessage, setLoadMoreAfterMessage] = useState(false);
  const loadMoreMessage = useAppSelector(state =>
    loadMoreMessageSelector(state),
  );
  const [isOpenModalEmoji, setOpenModalEmoji] = useState(false);
  const inputRef = useRef<TextInput>();
  const messages = useMemo(() => messageData?.data, [messageData?.data]);
  const scrollData = useMemo(
    () => messageData?.scrollData,
    [messageData?.scrollData],
  );
  const messageCanMore = useMemo(
    () => messageData?.canMore,
    [messageData?.canMore],
  );
  const reactData = useAppSelector(state => state.reactReducer.reactData);
  const updateFromSocket = useAppSelector(
    state => state.message.updateFromSocket,
  );
  const userData = useAppSelector(state => state.user.userData);
  const userRole = useUserRole();
  const currentTeamId = useCommunityId();
  const currentChannelId = useChannelId();
  const [isFocus, setFocus] = useState(false);
  const [messageReply, setMessageReply] = useState<MessageData>(null);
  const [messageEdit, setMessageEdit] = useState<MessageData>(null);
  const [selectedMessage, setSelectedMessage] = useState<MessageData>(null);
  const [isOpenMenuConfirmPin, setOpenMenuConfirmPin] = useState(false);
  const [isOpenMenuReport, setOpenMenuReport] = useState(false);
  const [isOpenMenuMessage, setOpenMenuMessage] = useState(false);
  const [isOpenMenuPinPost, setOpenMenuPinPost] = useState(false);
  const [isOpenGallery, setOpenGallery] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const drawerStatus = useDrawerStatus();
  const dispatch = useAppDispatch();
  const toggleGallery = useCallback(
    () => setOpenGallery(current => !current),
    [],
  );
  useEffect(() => {
    if (route.params?.fromNotification) {
      navigation.closeDrawer();
    }
  }, [navigation, route.params?.fromNotification]);
  useEffect(() => {
    navigation.setParams({drawerStatus});
  }, [drawerStatus, navigation]);
  useEffect(() => {
    if (currentTeamId) {
      navigation?.openDrawer?.();
    }
  }, [currentTeamId, navigation]);
  const handleGetLatestMessage = useCallback(async () => {
    if (currentChannelId) {
      await dispatch(
        getMessages(currentChannelId, 'Public', undefined, undefined, true),
      );
    }
  }, [currentChannelId, dispatch]);
  const findMessageById = useCallback((messageId: string) => {
    return listRef.current.props.data?.find(el => el.message_id === messageId);
  }, []);
  const scrollToMessageId = useCallback(
    (jumpMessageId: string) => {
      const message = findMessageById(jumpMessageId);
      if (message) {
        setTimeout(() => {
          onScrollToMessage(message);
        }, 200);
      }
    },
    [findMessageById, onScrollToMessage],
  );
  const handleAroundMessage = useCallback(
    async (jumpMessageId: string) => {
      const messageId = jumpMessageId.split(':')[0];
      if (findMessageById(messageId)) {
        scrollToMessageId(messageId);
      } else {
        await dispatch(getAroundMessage(messageId, currentChannelId));
        scrollToMessageId(messageId);
      }
    },
    [currentChannelId, dispatch, findMessageById, scrollToMessageId],
  );
  useEffect(() => {
    if (route.params?.jumpMessageId) {
      handleAroundMessage(route.params?.jumpMessageId);
    } else if (!route.params?.fromNotification) {
      handleGetLatestMessage();
    }
  }, [
    handleAroundMessage,
    handleGetLatestMessage,
    route.params?.fromNotification,
    route.params?.jumpMessageId,
  ]);
  const scrollDown = useCallback(() => {
    try {
      if (currentChannelId) {
        listRef.current?.scrollToIndex({
          index: 0,
        });
      }
    } catch (error) {
      console.log(error);
    }
  }, [currentChannelId]);
  useEffect(() => {
    scrollDown();
  }, [scrollDown]);
  useEffect(() => {
    if (currentChannelId) {
      setMessageReply(null);
      setMessageEdit(null);
      setAttachments([]);
      SocketUtils.generateId = null;
    }
  }, [currentChannelId]);
  const {colors} = useThemeColor();
  const uniqMessages = useMemo(
    () => normalizeMessages(uniqBy(messages, 'message_id')),
    [messages],
  );
  const onRemoveAttachment = useCallback(
    id =>
      setAttachments(current =>
        current.filter(attachment => attachment.id !== id),
      ),
    [],
  );
  const onClearAttachment = useCallback(() => setAttachments([]), []);
  const onScrollToMessage = useCallback(
    (replyMessage: MessageData) => {
      const messageList = listRef.current?.props?.data;
      const itemIndex = messageList?.findIndex(
        el => el.message_id === replyMessage.message_id,
      );
      dispatch({
        type: actionTypes.UPDATE_HIGHLIGHT_MESSAGE,
        payload: replyMessage.message_id,
      });
      if (itemIndex >= 0) {
        listRef.current.scrollToIndex({
          index: itemIndex,
          viewPosition: 0.5,
        });
      }
      setTimeout(() => {
        dispatch({
          type: actionTypes.UPDATE_HIGHLIGHT_MESSAGE,
          payload: null,
        });
      }, 1500);
    },
    [dispatch],
  );
  const onPressMessageReply = useCallback(
    async (replyMessage: MessageData) => {
      const message = messages.find(
        el => el.message_id === replyMessage.message_id,
      );
      if (message) {
        onScrollToMessage(replyMessage);
      } else {
        const res: Array<MessageData> = await dispatch(
          getAroundMessage(replyMessage.message_id, currentChannelId),
        );
        if (res.length > 0) {
          setTimeout(() => {
            onScrollToMessage(replyMessage);
          }, 200);
        }
      }
    },
    [messages, onScrollToMessage, dispatch, currentChannelId],
  );
  const renderItem = useCallback(
    ({item}: {item: MessageData}) => {
      if (item.entity_type === 'date-title') {
        return (
          <View style={styles.dateHeader}>
            <View style={[styles.line, {backgroundColor: colors.separator}]} />
            <Text style={[AppStyles.TextMed11, {color: colors.secondary}]}>
              {titleMessageFromNow(item.message_id)}
            </Text>
            <View style={[styles.line, {backgroundColor: colors.separator}]} />
          </View>
        );
      }
      return (
        <MessageItem
          item={item}
          onLongPress={openMenuMessage}
          onPressMessageReply={onPressMessageReply}
          contentId={currentChannelId}
        />
      );
    },
    [
      colors.secondary,
      colors.separator,
      currentChannelId,
      onPressMessageReply,
      openMenuMessage,
    ],
  );
  const onMoreAfterMessage = useCallback(
    async (message: MessageData) => {
      if (!message.createdAt) return;
      await dispatch(
        getMessages(currentChannelId, 'Public', undefined, message.createdAt),
      );
    },
    [currentChannelId, dispatch],
  );
  const onListScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const {y} = e.nativeEvent.contentOffset;
      if (y >= AppConfig.showScrollMoreOffset && !scrollData?.showScrollDown) {
        dispatch(
          setScrollData(currentChannelId, {
            showScrollDown: true,
          }),
        );
      } else if (
        y < AppConfig.showScrollMoreOffset &&
        scrollData?.showScrollDown
      ) {
        dispatch(
          setScrollData(currentChannelId, {
            showScrollDown: false,
          }),
        );
      }
      if (y <= 0 && messageData?.canMoreAfter && !loadMoreAfterMessage) {
        setLoadMoreAfterMessage(true);
      }
    },
    [
      currentChannelId,
      dispatch,
      loadMoreAfterMessage,
      messageData?.canMoreAfter,
      scrollData?.showScrollDown,
    ],
  );
  const onScrollToIndexFailed = useCallback(
    (e: {
      index: number;
      highestMeasuredFrameIndex: number;
      averageItemLength: number;
    }) => {
      console.log(e);
    },
    [],
  );
  const onMomentumScrollEnd = useCallback(async () => {
    if (loadMoreAfterMessage) {
      await onMoreAfterMessage(messages?.[0]);
      setLoadMoreAfterMessage(false);
    }
  }, [loadMoreAfterMessage, messages, onMoreAfterMessage]);
  const onScrollDownPress = useCallback(async () => {
    if (messageData?.canMoreAfter) {
      await handleGetLatestMessage();
    }
    scrollDown();
  }, [handleGetLatestMessage, messageData?.canMoreAfter, scrollDown]);
  const openMenuMessage = useCallback((message: MessageData) => {
    HapticUtils.trigger();
    setSelectedMessage(message);
    inputRef.current?.blur();
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
    dispatch(getMessages(currentChannelId, 'Public', lastMsg.createdAt));
  }, [currentChannelId, dispatch, loadMoreMessage, messageCanMore, messages]);
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
          if (image.playableDuration) return convertPHAssetVideo(image);
          if (image.type?.includes('video')) {
            return image;
          }
          return resizeImage(image);
        }),
      );
      imagesResized.forEach(img => {
        const randomId = getUniqueId();
        setAttachments(current => [
          ...current,
          {
            uri: img.uri || img.path,
            randomId,
            loading: true,
            type: img.type || 'image',
          },
        ]);
        const body = {
          uri: img.uri || img.path,
          name: img.name || img.filename || img.fileName,
          type: 'multipart/form-data',
        };
        api
          .uploadFile(
            currentTeamId,
            SocketUtils.generateId,
            body,
            'channel',
            randomId,
          )
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
    [currentTeamId, messageEdit, toggleGallery],
  );
  const onCloseMenuPinPost = useCallback(() => {
    setOpenMenuPinPost(false);
  }, []);
  const onCloseMenuMessage = useCallback(() => {
    setOpenMenuMessage(false);
  }, []);
  const onCreatePinPost = useCallback(
    async (isLock: boolean) => {
      const body: any = {
        content: selectedMessage?.content,
        status: 'pinned',
        channel_ids: [currentChannelId],
        task_id: selectedMessage?.message_id,
        team_id: currentTeamId,
      };
      await dispatch(createTask(currentChannelId, body));
      if (isLock) {
        dispatch(uploadToIPFS(body.task_id, currentChannelId));
      }
      closeMenuConfirmPin();
    },
    [
      closeMenuConfirmPin,
      currentChannelId,
      currentTeamId,
      dispatch,
      selectedMessage?.content,
      selectedMessage?.message_id,
    ],
  );
  const onDeleteMessage = useCallback(() => {
    if (!selectedMessage) return;
    dispatch(
      deleteMessage(
        selectedMessage?.message_id,
        selectedMessage?.reply_message_id,
        currentChannelId,
      ),
    );
  }, [currentChannelId, dispatch, selectedMessage]);
  const onMenuPin = useCallback(() => {
    onCloseMenuMessage();
    setTimeout(() => {
      setOpenMenuConfirmPin(true);
    }, AppConfig.timeoutCloseBottomSheet);
  }, [onCloseMenuMessage]);
  const onMenuDelete = useCallback(() => {
    onCloseMenuMessage();
    onCloseMenuPinPost();
    onDeleteMessage();
  }, [onCloseMenuMessage, onCloseMenuPinPost, onDeleteMessage]);
  const onMenuCopyPinPost = useCallback(async () => {
    await Clipboard.setString(
      `${buidlerURL}/channels/${currentTeamId}/${currentChannelId}/post/${selectedMessage?.task?.task_id}`,
    );
    onCloseMenuPinPost();
    Toast.show({type: 'customSuccess', props: {message: 'Copied'}});
  }, [
    currentChannelId,
    currentTeamId,
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
      updateTask(selectedMessage?.message_id, currentChannelId, {
        status: 'archived',
      }),
    );
    onCloseMenuPinPost();
  }, [
    currentChannelId,
    dispatch,
    onCloseMenuPinPost,
    selectedMessage?.message_id,
  ]);
  const onUnarchive = useCallback(() => {
    dispatch(
      updateTask(selectedMessage?.message_id, currentChannelId, {
        status: 'pinned',
      }),
    );
    onCloseMenuPinPost();
  }, [
    currentChannelId,
    dispatch,
    onCloseMenuPinPost,
    selectedMessage?.message_id,
  ]);
  const onUploadToIPFS = useCallback(() => {
    dispatch(uploadToIPFS(selectedMessage?.task?.task_id, currentChannelId));
    onCloseMenuPinPost();
  }, [
    currentChannelId,
    dispatch,
    onCloseMenuPinPost,
    selectedMessage?.task?.task_id,
  ]);
  const onMenuCopyMessage = useCallback(async () => {
    await Clipboard.setString(
      `${buidlerURL}/channels/${currentTeamId}/${currentChannelId}/message/${selectedMessage?.message_id}`,
    );
    onCloseMenuMessage();
    onCloseMenuPinPost();
    Toast.show({type: 'customSuccess', props: {message: 'Copied'}});
  }, [
    currentChannelId,
    currentTeamId,
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
    setTimeout(() => {
      inputRef.current?.focus();
    }, AppConfig.timeoutCloseBottomSheet);
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
    setTimeout(() => {
      inputRef.current?.focus();
    }, AppConfig.timeoutCloseBottomSheet);
  }, [onCloseMenuMessage, selectedMessage]);
  const openSideMenu = useCallback(() => {
    navigation.openDrawer();
  }, [navigation]);
  const onPinPress = useCallback(() => {
    navigation.navigate(ScreenID.PinPostScreen);
  }, [navigation]);
  const openMenuReport = useCallback(() => {
    onCloseMenuMessage();
    onCloseMenuPinPost();
    setTimeout(() => {
      setOpenMenuReport(true);
    }, AppConfig.timeoutCloseBottomSheet);
  }, [onCloseMenuMessage, onCloseMenuPinPost]);
  const closeMenuConfirmPin = useCallback(() => {
    setOpenMenuConfirmPin(false);
  }, []);
  const closeMenuReport = useCallback(() => {
    setOpenMenuReport(false);
  }, []);
  const openModalEmoji = useCallback(() => {
    onCloseMenuMessage();
    onCloseMenuPinPost();
    setTimeout(() => {
      setOpenModalEmoji(true);
    }, AppConfig.timeoutCloseBottomSheet);
  }, [onCloseMenuMessage, onCloseMenuPinPost]);
  const closeModalEmoji = useCallback(() => {
    setOpenModalEmoji(false);
  }, []);
  const openGallery = useCallback(async () => {
    const result = await launchImageLibrary({
      selectionLimit: 10,
      mediaType: 'mixed',
    });
    if (result.assets) {
      onSelectPhoto(result.assets);
    }
  }, [onSelectPhoto]);
  const onReactPress = useCallback(
    (name: string) => {
      const reacts = reactData[selectedMessage?.message_id];
      const isExisted = !!reacts?.find(
        (react: any) => react.reactName === name && react?.isReacted,
      );
      if (isExisted) {
        dispatch(
          removeReact(selectedMessage?.message_id, name, userData?.user_id),
        );
      } else {
        dispatch(
          addReact(selectedMessage?.message_id, name, userData?.user_id),
        );
      }
    },
    [dispatch, reactData, selectedMessage?.message_id, userData?.user_id],
  );
  const onEmojiSelected = useCallback(
    emoji => {
      onReactPress(emoji.short_name);
      closeModalEmoji();
      onCloseMenuMessage();
      onCloseMenuPinPost();
    },
    [closeModalEmoji, onCloseMenuMessage, onCloseMenuPinPost, onReactPress],
  );
  return (
    <KeyboardLayout extraPaddingBottom={-AppDimension.extraBottom - 45}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Touchable onPress={openSideMenu}>
            <SVG.IconSideMenu fill={colors.text} />
          </Touchable>
          <ChannelTitle />
          <Touchable onPress={onPinPress}>
            <SVG.IconPin fill={colors.text} />
          </Touchable>
        </View>
        <FlatList
          data={uniqMessages}
          ref={listRef}
          inverted
          keyExtractor={item => item.message_id}
          renderItem={renderItem}
          initialNumToRender={20}
          ListHeaderComponent={
            loadMoreAfterMessage || updateFromSocket ? (
              <View style={styles.footerMessage}>
                <ActivityIndicator />
              </View>
            ) : (
              <View style={{height: 15}} />
            )
          }
          onEndReached={onEndReached}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          onScroll={onListScroll}
          onScrollToIndexFailed={onScrollToIndexFailed}
          onMomentumScrollEnd={onMomentumScrollEnd}
          maintainVisibleContentPosition={
            messageData?.canMoreAfter
              ? {
                  minIndexForVisible: 1,
                }
              : undefined
          }
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
        {((!isFocus && scrollData?.showScrollDown) ||
          messageData?.canMoreAfter) && (
          <View style={styles.scrollDownWrap}>
            <View style={styles.scrollDownAbs}>
              <Touchable
                style={[
                  styles.iconScrollDown,
                  {backgroundColor: colors.activeBackgroundLight},
                ]}
                onPress={onScrollDownPress}>
                <SVG.IconScrollDown fill={colors.text} />
              </Touchable>
            </View>
          </View>
        )}
        <View style={styles.bottomView}>
          <MessageInput
            openGallery={toggleGallery}
            onRemoveAttachment={onRemoveAttachment}
            attachments={attachments}
            onClearAttachment={onClearAttachment}
            messageReply={messageReply}
            messageEdit={messageEdit}
            onClearReply={onClearReply}
            inputRef={inputRef}
            onFocusChanged={setFocus}
            canMoreAfter={messageData?.canMoreAfter}
            scrollDown={scrollDown}
          />
        </View>
        <ModalBottom
          isVisible={isOpenMenuMessage}
          onSwipeComplete={onCloseMenuMessage}
          onBackdropPress={onCloseMenuMessage}>
          <MenuMessage
            onPin={onMenuPin}
            onReply={onReplyMessage}
            onEdit={onEditMessage}
            onCopyMessage={onMenuCopyMessage}
            onDelete={onMenuDelete}
            canEdit={selectedMessage?.sender_id === userData.user_id}
            canDelete={selectedMessage?.sender_id === userData.user_id}
            canReport={selectedMessage?.sender_id !== userData.user_id}
            canPin={userRole === 'Admin' || userRole === 'Owner'}
            openModalEmoji={openModalEmoji}
            onEmojiSelected={onEmojiSelected}
            onReport={openMenuReport}
          />
        </ModalBottom>
        <ModalBottom
          isVisible={isOpenMenuPinPost}
          onSwipeComplete={onCloseMenuPinPost}
          onBackdropPress={onCloseMenuPinPost}>
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
            openModalEmoji={openModalEmoji}
            onEmojiSelected={onEmojiSelected}
            canReport={selectedMessage?.sender_id !== userData.user_id}
            onReport={openMenuReport}
          />
        </ModalBottom>
        <ModalBottom
          isVisible={isOpenGallery}
          onSwipeComplete={toggleGallery}
          onBackdropPress={toggleGallery}>
          <View
            style={[styles.galleryView, {backgroundColor: colors.background}]}>
            <BottomSheetHandle
              title="Photos"
              onClosePress={toggleGallery}
              renderRight={<ViewAllButton onPress={openGallery} />}
            />
            <GalleryView useFlatList onSelectPhoto={onSelectPhoto} />
          </View>
        </ModalBottom>
        <ModalBottom
          isVisible={isOpenModalEmoji}
          onSwipeComplete={closeModalEmoji}>
          <View
            style={[styles.emojiView, {backgroundColor: colors.background}]}>
            <BottomSheetHandle
              title="Reaction"
              onClosePress={closeModalEmoji}
            />
            <EmojiPicker onEmojiSelected={onEmojiSelected} />
          </View>
        </ModalBottom>
        <ModalBottom
          isVisible={isOpenMenuReport}
          onSwipeComplete={closeMenuReport}
          onBackdropPress={closeMenuReport}>
          <MenuReport
            onClose={closeMenuReport}
            selectedMessage={selectedMessage}
          />
        </ModalBottom>
        <ModalBottom
          isVisible={isOpenMenuConfirmPin}
          onSwipeComplete={closeMenuConfirmPin}
          onBackdropPress={closeMenuConfirmPin}>
          <MenuConfirmPin
            message={selectedMessage}
            onClose={closeMenuConfirmPin}
            onPin={onCreatePinPost}
          />
        </ModalBottom>
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
  body: {
    flex: 1,
  },
  scrollDownWrap: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  iconScrollDown: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  scrollDownAbs: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  bottomView: {},
  footerMessage: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  galleryView: {
    height: '50%',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  emojiView: {
    height: '90%',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
});

const loadMoreMessageSelector = createLoadMoreSelector([
  actionTypes.MESSAGE_PREFIX,
]);

export default memo(ConversationScreen);
