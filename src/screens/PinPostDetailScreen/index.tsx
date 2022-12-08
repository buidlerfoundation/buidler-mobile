import {useNavigation, useRoute} from '@react-navigation/native';
import {deleteMessage, getPinPostMessages} from 'actions/MessageActions';
import AppDimension from 'common/AppDimension';
import SVG from 'common/SVG';
import PinPostItem from 'components/PinPostItem';
import Touchable from 'components/Touchable';
import useAppDispatch from 'hook/useAppDispatch';
import useAppSelector from 'hook/useAppSelector';
import usePostData from 'hook/usePostData';
import useThemeColor from 'hook/useThemeColor';
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import BottomSheetHandle from 'components/BottomSheetHandle';
import GalleryView from 'components/GalleryView';
import SocketUtils from 'utils/SocketUtils';
import {getUniqueId} from 'helpers/GenerateUUID';
import {convertPHAssetVideo, resizeImage} from 'helpers/ImageHelpers';
import api from 'services/api';
import KeyboardLayout from 'components/KeyboardLayout';
import Clipboard from '@react-native-clipboard/clipboard';
import {buidlerURL} from 'helpers/LinkHelper';
import Toast from 'react-native-toast-message';
import MenuMessage from 'components/MenuMessage';
import MessageInput from 'components/MessageInput';
import MessageItem from 'components/MessageItem';
import AppStyles from 'common/AppStyles';
import EmojiPicker from 'components/EmojiPicker';
import {addReact, removeReact} from 'actions/ReactActions';
import MenuReport from 'components/MenuReport';
import ModalBottom from 'components/ModalBottom';
import AppConfig from 'common/AppConfig';
import ViewAllButton from 'components/ViewAllButton';
import {launchImageLibrary} from 'react-native-image-picker';
import {updateTask} from 'actions/TaskActions';
import useChannelId from 'hook/useChannelId';
import useCommunityId from 'hook/useCommunityId';
import {actionTypes} from 'actions/actionTypes';
import MenuConfirmDeleteMessage from 'components/MenuConfirmDeleteMessage';
import useUserRole from 'hook/useUserRole';
import useLoadMoreBeforePinPostMessage from 'hook/useLoadMoreBeforePinPostMessage';

const PinPostDetailScreen = () => {
  const dispatch = useAppDispatch();
  const listRef = useRef<FlatList>();
  const inputRef = useRef<TextInput>();
  const loadMoreBefore = useLoadMoreBeforePinPostMessage();
  const [loadMoreAfterMessage, setLoadMoreAfterMessage] = useState(false);
  const [isOpenMenuReport, setOpenMenuReport] = useState(false);
  const [isOpenMenuDelete, setOpenMenuDelete] = useState(false);
  const [isOpenMenuMessage, setOpenMenuMessage] = useState(false);
  const [isOpenModalEmoji, setOpenModalEmoji] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<MessageData>(null);
  const [isOpenGallery, setOpenGallery] = useState(false);
  const [messageReply, setMessageReply] = useState<MessageData>(null);
  const [messageEdit, setMessageEdit] = useState<MessageData>(null);
  const [attachments, setAttachments] = useState([]);
  const toggleGallery = useCallback(
    () => setOpenGallery(current => !current),
    [],
  );
  const {colors} = useThemeColor();
  const reactData = useAppSelector(state => state.reactReducer.reactData);
  const userData = useAppSelector(state => state.user.userData);
  const userRole = useUserRole();
  const communityId = useCommunityId();
  const currentChannelId = useChannelId();
  const navigation = useNavigation();
  const route = useRoute();
  const postId = useMemo(() => route.params?.postId, [route.params?.postId]);
  const messageId = useMemo(
    () => route.params?.messageId,
    [route.params?.messageId],
  );
  const isReply = useMemo(() => route.params?.reply, [route.params?.reply]);
  const pinPost = usePostData(postId);
  const onBack = useCallback(() => navigation.goBack(), [navigation]);
  const isArchived = useMemo(
    () => pinPost?.data?.status === 'archived',
    [pinPost?.data?.status],
  );
  const {messageData} = useAppSelector(state => state.message);
  const messages = useMemo(
    () => messageData[postId]?.data,
    [messageData, postId],
  );
  useEffect(() => {
    if (isReply) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 400);
    }
  }, [isReply]);
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
  const handleAroundMessage = useCallback(async () => {
    await dispatch(getPinPostMessages(postId, messageId));
    scrollToMessageId(messageId);
  }, [dispatch, messageId, postId, scrollToMessageId]);
  useEffect(() => {
    if (postId) {
      if (messageId) {
        handleAroundMessage();
      } else {
        dispatch(getPinPostMessages(postId));
      }
      setMessageReply(null);
      setMessageEdit(null);
      setAttachments([]);
      SocketUtils.generateId = null;
    }
  }, [dispatch, handleAroundMessage, messageId, postId]);
  const openMenuMessage = useCallback(
    (message: MessageData) => {
      if (isArchived) return;
      setSelectedMessage(message);
      setOpenMenuMessage(true);
    },
    [isArchived],
  );
  const onCloseMenuMessage = useCallback(() => {
    setOpenMenuMessage(false);
  }, []);
  const onClearReply = useCallback(() => {
    setMessageEdit(null);
    setMessageReply(null);
  }, []);
  const onMorePPMessage = useCallback(() => {
    const createdAt = messages?.[messages?.length - 1].createdAt;
    if (!createdAt) return;
    dispatch(getPinPostMessages(postId, undefined, createdAt));
  }, [dispatch, messages, postId]);
  const onMoreAfterMessage = useCallback(
    async (message: MessageData) => {
      if (!message.createdAt) return;
      await dispatch(
        getPinPostMessages(postId, undefined, undefined, message.createdAt),
      );
    },
    [dispatch, postId],
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
  const openReactView = useCallback((message: MessageData) => {
    setSelectedMessage(message);
    setOpenModalEmoji(true);
  }, []);
  const onEndReached = useCallback(async () => {
    if (!loadMoreAfterMessage && messageData?.[postId]?.canMoreAfter) {
      setLoadMoreAfterMessage(true);
      await onMoreAfterMessage(messages?.[0]);
      setLoadMoreAfterMessage(false);
    }
  }, [loadMoreAfterMessage, messageData, messages, onMoreAfterMessage, postId]);
  const onRemoveAttachment = useCallback(
    id =>
      setAttachments(current =>
        current.filter(attachment => attachment.id !== id),
      ),
    [],
  );
  const onClearAttachment = useCallback(() => setAttachments([]), []);
  const onSelectPhoto = useCallback(
    async (items: Array<any>) => {
      if (!SocketUtils.generateId) {
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
            communityId,
            SocketUtils.generateId,
            body,
            'post',
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
    [communityId, toggleGallery],
  );
  const onKeyboardShow = useCallback(() => {
    setTimeout(() => {
      listRef.current.scrollToIndex({index: 0});
    }, 300);
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
  const onMenuDelete = useCallback(() => {
    closeMenuDelete();
    onDeleteMessage();
  }, [closeMenuDelete, onDeleteMessage]);
  const onMenuCopyMessage = useCallback(async () => {
    await Clipboard.setString(
      `${buidlerURL}/channels/${communityId}/${currentChannelId}/message/${selectedMessage.message_id}`,
    );
    onCloseMenuMessage();
    Toast.show({type: 'customSuccess', props: {message: 'Copied'}});
  }, [
    currentChannelId,
    communityId,
    onCloseMenuMessage,
    selectedMessage?.message_id,
  ]);
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
  const openMenuReport = useCallback(() => {
    onCloseMenuMessage();
    setTimeout(() => {
      setOpenMenuReport(true);
    }, AppConfig.timeoutCloseBottomSheet);
  }, [onCloseMenuMessage]);
  const closeMenuReport = useCallback(() => {
    setOpenMenuReport(false);
  }, []);
  const openMenuDelete = useCallback(() => {
    onCloseMenuMessage();
    setTimeout(() => {
      setOpenMenuDelete(true);
    }, AppConfig.timeoutCloseBottomSheet);
  }, [onCloseMenuMessage]);
  const closeMenuDelete = useCallback(() => {
    setOpenMenuDelete(false);
  }, []);
  const openModalEmoji = useCallback(() => {
    onCloseMenuMessage();
    setTimeout(() => {
      setOpenModalEmoji(true);
    }, AppConfig.timeoutCloseBottomSheet);
  }, [onCloseMenuMessage]);
  const closeModalEmoji = useCallback(() => {
    setOpenModalEmoji(false);
  }, []);
  const onEmojiSelected = useCallback(
    emoji => {
      onReactPress(emoji.short_name);
      closeModalEmoji();
      onCloseMenuMessage();
    },
    [closeModalEmoji, onCloseMenuMessage, onReactPress],
  );
  const handleUnarchive = useCallback(() => {
    if (!pinPost?.data?.task_id) return;
    dispatch(
      updateTask(pinPost?.data?.task_id, currentChannelId, {
        status: 'pinned',
        team_id: communityId,
      }),
    );
  }, [communityId, currentChannelId, dispatch, pinPost?.data?.task_id]);
  if (!pinPost.data) return null;
  return (
    <KeyboardLayout
      extraPaddingBottom={-AppDimension.extraBottom}
      onKeyboardShow={onKeyboardShow}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Touchable onPress={onBack}>
            <SVG.IconArrowBack fill={colors.text} />
          </Touchable>
          <Text
            style={[styles.title, AppStyles.TextBold17, {color: colors.text}]}>
            Pin Post
          </Text>
        </View>
        <FlatList
          style={{flex: 1}}
          ref={listRef}
          contentContainerStyle={{flexDirection: 'column-reverse'}}
          data={messages}
          onEndReached={onEndReached}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          ListHeaderComponent={<View style={{height: 20}} />}
          ListFooterComponent={
            <View>
              <PinPostItem pinPost={pinPost.data} detail />
              {messages?.length > 0 && (
                <View
                  style={[styles.separate, {backgroundColor: colors.border}]}
                />
              )}
              {messageData?.[postId]?.canMore && (
                <Touchable
                  onPress={onMorePPMessage}
                  disabled={loadMoreBefore}
                  useReactNative
                  style={styles.textMore}>
                  {loadMoreBefore ? (
                    <ActivityIndicator
                      color={colors.mention}
                      style={{height: 22}}
                    />
                  ) : (
                    <Text
                      style={[AppStyles.TextSemi15, {color: colors.mention}]}>
                      View previous replies
                    </Text>
                  )}
                </Touchable>
              )}
            </View>
          }
          keyExtractor={item => item.message_id}
          renderItem={({item}) => (
            <MessageItem
              item={item}
              onLongPress={openMenuMessage}
              contentId={postId}
              openReactView={openReactView}
            />
          )}
          onScrollToIndexFailed={onScrollToIndexFailed}
        />
        {!isArchived && (
          <View>
            <MessageInput
              openGallery={toggleGallery}
              onRemoveAttachment={onRemoveAttachment}
              attachments={attachments}
              onClearAttachment={onClearAttachment}
              messageReply={messageReply}
              messageEdit={messageEdit}
              onClearReply={onClearReply}
              postId={postId}
              onSent={onKeyboardShow}
              inputRef={inputRef}
              inputStyle={styles.inputContainer}
              canMoreAfter={messageData?.[postId]?.canMoreAfter}
            />
          </View>
        )}
        {isArchived && (
          <View style={styles.archivedWrap}>
            <Text style={[AppStyles.TextMed15, {color: colors.text}]}>
              This post has been archived!
            </Text>
            <Touchable
              style={[styles.btnUnarchive, {backgroundColor: colors.blue}]}
              useReactNative
              onPress={handleUnarchive}>
              <Text style={[AppStyles.TextMed15, {color: colors.text}]}>
                Unarchive
              </Text>
            </Touchable>
          </View>
        )}
        <ModalBottom
          isVisible={isOpenMenuMessage}
          onSwipeComplete={onCloseMenuMessage}
          onBackdropPress={onCloseMenuMessage}>
          <MenuMessage
            onReply={onReplyMessage}
            onEdit={onEditMessage}
            onCopyMessage={onMenuCopyMessage}
            onDelete={openMenuDelete}
            canEdit={selectedMessage?.sender_id === userData.user_id}
            canDelete={
              selectedMessage?.sender_id === userData.user_id ||
              userRole === 'Admin' ||
              userRole === 'Owner'
            }
            canPin={false}
            openModalEmoji={openModalEmoji}
            onEmojiSelected={onEmojiSelected}
            canReport={selectedMessage?.sender_id !== userData.user_id}
            onReport={openMenuReport}
          />
        </ModalBottom>
        <ModalBottom isVisible={isOpenGallery} onSwipeComplete={toggleGallery}>
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
          isVisible={isOpenMenuDelete}
          onSwipeComplete={closeMenuDelete}
          onBackdropPress={closeMenuDelete}>
          <MenuConfirmDeleteMessage
            onClose={closeMenuDelete}
            selectedMessage={selectedMessage}
            handleDelete={onMenuDelete}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: AppDimension.headerHeight,
  },
  title: {
    marginLeft: 20,
    flex: 1,
  },
  separate: {
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 9,
    height: 1,
  },
  textMore: {
    marginHorizontal: 20,
    alignItems: 'flex-start',
  },
  messageInputContainer: {
    marginTop: 20,
    marginHorizontal: 20,
    marginBottom: 20 + AppDimension.extraBottom,
    borderRadius: 5,
    borderWidth: 1,
  },
  messageInput: {
    paddingBottom: 8,
    padding: 8,
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
  inputContainer: {
    paddingBottom: AppDimension.extraBottom + 10,
  },
  archivedWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    bottom: AppDimension.extraBottom + 10,
    left: 10,
    right: 10,
    borderRadius: 5,
    height: 50,
    backgroundColor: '#1E1E1EF7',
    paddingHorizontal: 10,
    justifyContent: 'space-between',
  },
  btnUnarchive: {
    height: 30,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 5,
  },
});

export default memo(PinPostDetailScreen);
