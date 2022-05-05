import actions from 'actions';
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
import {Channel, Message, Team, ThemeType, User} from 'models';
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  SectionList,
  Image,
} from 'react-native';
import {connect} from 'react-redux';
import {createLoadMoreSelector} from 'reducers/selectors';
import {bindActionCreators} from 'redux';
import themes from 'themes';
import MessageInput from './MessageInput';
import MessageItem from './MessageItem';
import MessageReplyItem from './MessageReplyItem';
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

type ConversationScreenProps = {
  themeType: ThemeType;
  currentChannel: Channel;
  getMessages: (
    channelId: string,
    channelType: string,
    before?: string,
    isFresh?: boolean,
  ) => any;
  messages: Array<Message>;
  teamUserData: Array<User>;
  currentTeam: Team;
  messageCanMore: boolean;
  loadMoreMessage: boolean;
  userData: User;
  createTask: (channelId: string, body: any) => any;
  setCurrentChannel?: (channel: Channel) => any;
};

const ConversationScreen = ({
  themeType,
  currentChannel,
  getMessages,
  messages,
  teamUserData,
  currentTeam,
  messageCanMore,
  loadMoreMessage,
  userData,
  createTask,
  setCurrentChannel,
}: ConversationScreenProps) => {
  const [messageReply, setMessageReply] = useState<Message>(null);
  const [messageEdit, setMessageEdit] = useState<Message>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message>(null);
  const [isOpenGallery, setOpenGallery] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const toggleGallery = () => setOpenGallery(!isOpenGallery);
  useEffect(() => {
    getMessages(
      currentChannel.channel_id,
      currentChannel.channel_type,
      undefined,
      true,
    );
  }, [currentChannel, getMessages]);
  const {colors} = themes[themeType];
  const renderItem = ({item}: {item: Message}) => {
    if (item.conversation_data.length > 0) {
      return (
        <Touchable onLongPress={openMenuMessage(item)}>
          <MessageReplyItem
            item={item}
            themeType={themeType}
            teamUserData={teamUserData}
            teamId={currentTeam.team_id}
            setCurrentChannel={setCurrentChannel}
          />
        </Touchable>
      );
    }
    return (
      <Touchable onLongPress={openMenuMessage(item)}>
        <MessageItem
          item={item}
          themeType={themeType}
          teamUserData={teamUserData}
          teamId={currentTeam.team_id}
          setCurrentChannel={setCurrentChannel}
        />
      </Touchable>
    );
  };
  const openMenuMessage = (message: Message) => () => {
    setSelectedMessage(message);
  };
  const onEndReached = () => {
    if (!messageCanMore || loadMoreMessage) return;
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    getMessages(
      currentChannel.channel_id,
      currentChannel.channel_type,
      lastMsg.createdAt,
    );
  };
  const onSelectPhoto = async (items: Array<any>) => {
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
  };
  const onCloseMenuMessage = () => {
    setSelectedMessage(null);
  };
  const onCreateTask = () => {
    const body: any = {
      title: selectedMessage?.plain_text,
      status: 'todo',
      channel_ids: [currentChannel?.channel_id],
      file_ids: selectedMessage?.message_attachment?.map?.(
        (a: any) => a.file_id,
      ),
      task_id: selectedMessage.message_id,
      team_id: currentTeam.team_id,
    };
    createTask(currentChannel?.channel_id, body);
    setSelectedMessage(null);
  };
  const onClearReply = () => {
    setMessageEdit(null);
    setMessageReply(null);
  };
  const onReplyMessage = () => {
    setMessageEdit(null);
    setMessageReply(selectedMessage);
    setSelectedMessage(null);
  };
  const onEditMessage = () => {
    setMessageReply(null);
    setMessageEdit(selectedMessage);
    setSelectedMessage(null);
  };
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
                themeType={themeType}
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
            initialNumToRender={20}
            ListHeaderComponent={<View style={{height: 15}} />}
            onEndReached={onEndReached}
            renderSectionFooter={({section: {title}}) => (
              <View style={styles.dateHeader}>
                <View
                  style={[styles.line, {backgroundColor: colors.separator}]}
                />
                <Text style={[styles.dateText, {color: colors.secondary}]}>
                  {titleMessageFromNow(title)}
                </Text>
                <View
                  style={[styles.line, {backgroundColor: colors.separator}]}
                />
              </View>
            )}
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
          {/* <FlatList
            data={normalizeMessage(messages)}
            keyExtractor={item => item.message_id}
            renderItem={renderItem}
            inverted
            initialNumToRender={20}
            ListHeaderComponent={<View style={{height: 15}} />}
            onEndReached={onEndReached}
            ListFooterComponent={
              loadMoreMessage ? (
                <View style={styles.footerMessage}>
                  <ActivityIndicator />
                </View>
              ) : (
                <View />
              )
            }
          /> */}
        </View>
        <View style={styles.bottomView}>
          <MessageInput
            themeType={themeType}
            currentChannel={currentChannel}
            openGallery={toggleGallery}
            onRemoveAttachment={id =>
              setAttachments(current =>
                current.filter(attachment => attachment.randomId !== id),
              )
            }
            attachments={attachments}
            onClearAttachment={() => setAttachments([])}
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
          onMoveShouldSetResponderCapture={() => false}
          backdropColor={colors.backdrop}
          backdropOpacity={0.9}
          swipeDirection={['down']}
          onSwipeComplete={onCloseMenuMessage}
          onBackdropPress={onCloseMenuMessage}>
          <MenuMessage
            themeType={themeType}
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
          onMoveShouldSetResponderCapture={() => false}
          backdropColor={colors.backdrop}
          backdropOpacity={0.9}
          onSwipeComplete={toggleGallery}
          swipeDirection={['down']}>
          <View
            style={[styles.galleryView, {backgroundColor: colors.background}]}>
            <BottomSheetHandle
              title="Photos"
              themeType={themeType}
              onClosePress={toggleGallery}
            />
            <GalleryView
              themeType={themeType}
              useFlatList
              onSelectPhoto={onSelectPhoto}
            />
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

const mapPropsToState = (state: any) => {
  const channelId = state.user?.currentChannel?.channel_id;
  return {
    themeType: state.configs.theme,
    userData: state.user.userData,
    currentChannel: state.user.currentChannel,
    teamUserData: state.user.teamUserData,
    currentTeam: state.user.currentTeam,
    messages: channelId
      ? state.message.messageData?.[channelId]?.data || []
      : [],
    loadMoreMessage: loadMoreMessageSelector(state),
    messageCanMore: channelId
      ? state.message.messageData?.[channelId]?.canMore || false
      : false,
  };
};

const mapActionsToProps = (dispatch: any) =>
  bindActionCreators(actions, dispatch);

export default connect(mapPropsToState, mapActionsToProps)(ConversationScreen);
