import {useNavigation, useRoute} from '@react-navigation/native';
import {deleteMessage, getPinPostMessages} from 'actions/MessageActions';
import AppDimension from 'common/AppDimension';
import SVG from 'common/SVG';
import PinPostItem from 'components/PinPostItem';
import Touchable from 'components/Touchable';
import useAppDispatch from 'hook/useAppDispatch';
import useAppSelector from 'hook/useAppSelector';
import useCurrentChannel from 'hook/useCurrentChannel';
import useCurrentCommunity from 'hook/useCurrentCommunity';
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
import {StyleSheet, View, Text, FlatList, TextInput} from 'react-native';
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

const PinPostDetailScreen = () => {
  const dispatch = useAppDispatch();
  const listRef = useRef<FlatList>();
  const inputRef = useRef<TextInput>();
  const [isOpenMenuReport, setOpenMenuReport] = useState(false);
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
  const community = useCurrentCommunity();
  const currentChannel = useCurrentChannel();
  const navigation = useNavigation();
  const route = useRoute();
  const postId = useMemo(() => route.params?.postId, [route.params?.postId]);
  const isReply = useMemo(() => route.params?.reply, [route.params?.reply]);
  const pinPost = usePostData(postId);
  const onBack = useCallback(() => navigation.goBack(), [navigation]);
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
  useEffect(() => {
    if (postId) {
      dispatch(getPinPostMessages(postId));
    }
  }, [dispatch, postId]);
  const openMenuMessage = useCallback((message: MessageData) => {
    setSelectedMessage(message);
    setOpenMenuMessage(true);
  }, []);
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
    dispatch(getPinPostMessages(postId, createdAt));
  }, [dispatch, messages, postId]);
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
            community.team_id,
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
    [community.team_id, toggleGallery],
  );
  const onKeyboardShow = useCallback(() => {
    setTimeout(() => {
      if (messages?.length > 0) listRef.current.scrollToIndex({index: 0});
    }, 300);
  }, [messages?.length]);
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
  const onMenuDelete = useCallback(() => {
    onCloseMenuMessage();
    onDeleteMessage();
  }, [onCloseMenuMessage, onDeleteMessage]);
  const onMenuCopyMessage = useCallback(async () => {
    await Clipboard.setString(
      `${buidlerURL}/channels/${community.team_id}/${currentChannel.channel_id}/message/${selectedMessage.message_id}`,
    );
    onCloseMenuMessage();
    Toast.show({type: 'customSuccess', props: {message: 'Copied'}});
  }, [
    currentChannel.channel_id,
    community.team_id,
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
          ListHeaderComponent={<View style={{height: 20}} />}
          ListFooterComponent={
            <View>
              <PinPostItem pinPost={pinPost.data} detail />
              {messages?.length > 0 && (
                <View
                  style={[styles.separate, {backgroundColor: colors.border}]}
                />
              )}
              {messages &&
                (messages?.length || 0) <
                  parseInt(pinPost.data?.total_messages || '0') && (
                  <Touchable onPress={onMorePPMessage}>
                    <Text
                      style={[
                        styles.textMore,
                        AppStyles.TextSemi15,
                        {color: colors.mention},
                      ]}>
                      View previous replies
                    </Text>
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
            />
          )}
        />
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
          />
        </View>
        <ModalBottom
          isVisible={isOpenMenuMessage}
          onSwipeComplete={onCloseMenuMessage}
          onBackdropPress={onCloseMenuMessage}>
          <MenuMessage
            onReply={onReplyMessage}
            onEdit={onEditMessage}
            onCopyMessage={onMenuCopyMessage}
            onDelete={onMenuDelete}
            canEdit={selectedMessage?.sender_id === userData.user_id}
            canDelete={selectedMessage?.sender_id === userData.user_id}
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
});

export default memo(PinPostDetailScreen);
