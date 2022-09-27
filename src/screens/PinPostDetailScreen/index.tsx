import {useNavigation, useRoute} from '@react-navigation/native';
import {getPinPostMessages} from 'actions/MessageActions';
import AppDimension from 'common/AppDimension';
import Fonts from 'common/Fonts';
import SVG from 'common/SVG';
import PinPostItem from 'components/PinPostItem';
import Touchable from 'components/Touchable';
import useAppDispatch from 'hook/useAppDispatch';
import useAppSelector from 'hook/useAppSelector';
import useCurrentChannel from 'hook/useCurrentChannel';
import useCurrentCommunity from 'hook/useCurrentCommunity';
import usePostData from 'hook/usePostData';
import useTeamUserData from 'hook/useTeamUserData';
import useThemeColor from 'hook/useThemeColor';
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {StyleSheet, View, Text, FlatList} from 'react-native';
import MessageInput from 'screens/ConversationScreen/MessageInput';
import MessageItem from 'screens/ConversationScreen/MessageItem';
import Modal from 'react-native-modal';
import BottomSheetHandle from 'components/BottomSheetHandle';
import GalleryView from 'components/GalleryView';
import SocketUtils from 'utils/SocketUtils';
import {getUniqueId} from 'helpers/GenerateUUID';
import {resizeImage} from 'helpers/ImageHelpers';
import api from 'services/api';
import KeyboardLayout from 'components/KeyboardLayout';

const PinPostDetailScreen = () => {
  const dispatch = useAppDispatch();
  const listRef = useRef<FlatList>();
  const [isOpenGallery, setOpenGallery] = useState(false);
  const [messageReply, setMessageReply] = useState<MessageData>(null);
  const [messageEdit, setMessageEdit] = useState<MessageData>(null);
  const [attachments, setAttachments] = useState([]);
  const toggleGallery = useCallback(
    () => setOpenGallery(current => !current),
    [],
  );
  const {colors} = useThemeColor();
  const teamUserData = useTeamUserData();
  const community = useCurrentCommunity();
  const currentChannel = useCurrentChannel();
  const navigation = useNavigation();
  const route = useRoute();
  const postId = useMemo(() => route.params?.postId, [route.params?.postId]);
  const pinPost = usePostData(postId);
  const onBack = useCallback(() => navigation.goBack(), [navigation]);
  const {messageData} = useAppSelector(state => state.message);
  const messages = useMemo(
    () => messageData[postId]?.data,
    [messageData, postId],
  );
  useEffect(() => {
    if (postId) {
      dispatch(getPinPostMessages(postId));
    }
  }, [dispatch, postId]);
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
        current.filter(attachment => attachment.randomId !== id),
      ),
    [],
  );
  const onClearAttachment = useCallback(() => setAttachments([]), []);
  const onMoveShouldSetResponderCapture = useCallback(() => false, []);
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
          .uploadFile(community.team_id, SocketUtils.generateId, {
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
    [community.team_id, toggleGallery],
  );
  const onKeyboardShow = useCallback(() => {
    setTimeout(() => {
      listRef.current.scrollToIndex({index: 0});
    }, 300);
  }, []);
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
          <Text style={[styles.title, {color: colors.text}]}>Pin Post</Text>
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
              <View
                style={[styles.separate, {backgroundColor: colors.border}]}
              />
              {(messages?.length || 0) <
                parseInt(pinPost.data?.total_messages || '0') && (
                <Touchable onPress={onMorePPMessage}>
                  <Text style={[styles.textMore, {color: colors.mention}]}>
                    View previous replies
                  </Text>
                </Touchable>
              )}
            </View>
          }
          keyExtractor={item => item.message_id}
          renderItem={({item}) => (
            <MessageItem item={item} teamId={community.team_id} />
          )}
        />
        <View>
          <MessageInput
            currentChannel={currentChannel}
            openGallery={toggleGallery}
            onRemoveAttachment={onRemoveAttachment}
            attachments={attachments}
            onClearAttachment={onClearAttachment}
            teamId={community.team_id}
            messageReply={messageReply}
            messageEdit={messageEdit}
            onClearReply={onClearReply}
            teamUserData={teamUserData}
            postId={postId}
            onSent={onKeyboardShow}
          />
        </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: AppDimension.headerHeight,
  },
  title: {
    fontFamily: Fonts.Bold,
    fontSize: 16,
    lineHeight: 26,
    marginLeft: 20,
    flex: 1,
  },
  separate: {
    marginHorizontal: 20,
    marginVertical: 24,
    height: 1,
  },
  textMore: {
    fontFamily: Fonts.SemiBold,
    fontSize: 16,
    lineHeight: 26,
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
  modalGallery: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  galleryView: {
    height: '90%',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
});

export default memo(PinPostDetailScreen);
