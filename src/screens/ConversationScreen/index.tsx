import {actionTypes} from 'actions/actionTypes';
import AppDimension from 'common/AppDimension';
import Fonts from 'common/Fonts';
import SVG from 'common/SVG';
import KeyboardLayout from 'components/KeyboardLayout';
import Touchable from 'components/Touchable';
import {
  normalizeMessage,
  normalizeMessages,
  normalizeUserName,
} from 'helpers/MessageHelper';
import {MessageData} from 'models';
import React, {memo, useEffect, useState, useMemo, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  SectionList,
  Image,
} from 'react-native';
import {createLoadMoreSelector} from 'reducers/selectors';
import MessageInput from './MessageInput';
import MessageItem from './MessageItem';
import BottomSheetHandle from 'components/BottomSheetHandle';
import GalleryView from 'components/GalleryView';
import Modal from 'react-native-modal';
import api from 'services/api';
import {getUniqueId} from 'helpers/GenerateUUID';
import {resizeImage} from 'helpers/ImageHelpers';
import SocketUtils from 'utils/SocketUtils';
import MenuMessage from './MenuMessage';
import AvatarView from 'components/AvatarView';
import {titleMessageFromNow} from 'utils/DateUtils';
import useThemeColor from 'hook/useThemeColor';
import useCurrentChannel from 'hook/useCurrentChannel';
import useTeamUserData from 'hook/useTeamUserData';
import useCurrentCommunity from 'hook/useCurrentCommunity';
import useAppSelector from 'hook/useAppSelector';
import useAppDispatch from 'hook/useAppDispatch';
import {getMessages} from 'actions/MessageActions';
import useMessageData from 'hook/useMessageData';
import {createTask} from 'actions/TaskActions';

const ConversationScreen = () => {
  const messageData = useMessageData();
  const loadMoreMessage = useAppSelector(state =>
    loadMoreMessageSelector(state),
  );
  const messages = useMemo(() => messageData?.data || [], [messageData?.data]);
  const messageCanMore = useMemo(
    () => messageData?.canMore,
    [messageData?.canMore],
  );
  const userData = useAppSelector(state => state.user.userData);
  const currentTeam = useCurrentCommunity();
  const currentChannel = useCurrentChannel();
  const teamUserData = useTeamUserData();
  const [messageReply, setMessageReply] = useState<MessageData>(null);
  const [messageEdit, setMessageEdit] = useState<MessageData>(null);
  const [selectedMessage, setSelectedMessage] = useState<MessageData>(null);
  const [isOpenGallery, setOpenGallery] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const dispatch = useAppDispatch();
  const toggleGallery = useCallback(
    () => setOpenGallery(current => !current),
    [],
  );
  useEffect(() => {
    dispatch(getMessages(currentChannel.channel_id, 'Public', undefined, true));
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
          sender={teamUserData.find(el => el.user_id === item.sender_id)}
          teamId={currentTeam.team_id}
          onLongPress={openMenuMessage}
        />
      );
    },
    [currentTeam.team_id, openMenuMessage, teamUserData],
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
      if (!SocketUtils.generateId) {
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
                    el.url = res.file_url;
                    el.loading = false;
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
    [currentTeam.team_id, toggleGallery],
  );
  const onCloseMenuMessage = useCallback(() => {
    setSelectedMessage(null);
  }, []);
  const onCreateTask = useCallback(() => {
    const body: any = {
      title: selectedMessage?.plain_text,
      status: 'pinned',
      channel_ids: [currentChannel?.channel_id],
      file_ids: selectedMessage?.message_attachment?.map?.(
        (a: any) => a.file_id,
      ),
      task_id: selectedMessage.message_id,
      team_id: currentTeam.team_id,
    };
    dispatch(createTask(currentChannel?.channel_id, body));
    setSelectedMessage(null);
  }, [
    currentChannel?.channel_id,
    currentTeam.team_id,
    dispatch,
    selectedMessage?.message_attachment,
    selectedMessage?.message_id,
    selectedMessage?.plain_text,
  ]);
  const onClearReply = useCallback(() => {
    setMessageEdit(null);
    setMessageReply(null);
  }, []);
  const onReplyMessage = useCallback(() => {
    setMessageEdit(null);
    setMessageReply(selectedMessage);
    setSelectedMessage(null);
  }, [selectedMessage]);
  const onEditMessage = useCallback(() => {
    setMessageReply(null);
    setMessageEdit(selectedMessage);
    setSelectedMessage(null);
  }, [selectedMessage]);
  return (
    <KeyboardLayout extraPaddingBottom={-AppDimension.extraBottom}>
      <View style={styles.container}>
        <View style={styles.header}>
          {currentChannel.user ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginLeft: 5,
              }}>
              <AvatarView
                user={teamUserData.find(
                  u => u.user_id === currentChannel.user?.user_id,
                )}
                size={32}
              />
              <Text style={[styles.title, {color: colors.text}]}>
                {normalizeUserName(currentChannel.user?.user_name)}
              </Text>
            </View>
          ) : (
            <Text style={[styles.title, {color: colors.text}]}>
              {currentChannel.channel_type === 'Private' ? (
                <Image source={require('assets/images/ic_private.png')} />
              ) : (
                '#'
              )}{' '}
              {currentChannel.channel_name}
            </Text>
          )}
          <Touchable
            style={{
              padding: 10,
              height: 40,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <SVG.IconMore fill={colors.text} />
          </Touchable>
        </View>
        <View style={styles.body}>
          <SectionList
            sections={normalizeMessages(messages).map(el => ({
              data: normalizeMessage(el.data),
              title: el.title,
            }))}
            inverted
            keyExtractor={item => item.message_id}
            renderItem={renderItem}
            initialNumToRender={10}
            windowSize={2}
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
        </View>
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
          isVisible={!!selectedMessage}
          style={styles.modalMenuMessage}
          avoidKeyboard
          onMoveShouldSetResponderCapture={onMoveShouldSetResponderCapture}
          backdropColor={colors.backdrop}
          backdropOpacity={0.9}
          swipeDirection={['down']}
          onSwipeComplete={onCloseMenuMessage}
          onBackdropPress={onCloseMenuMessage}>
          <MenuMessage
            onCreateTask={onCreateTask}
            onReply={onReplyMessage}
            onEdit={onEditMessage}
            canEdit={selectedMessage?.sender_id === userData.user_id}
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
          swipeDirection={['down']}>
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
    paddingHorizontal: 10,
    paddingVertical: 14,
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
