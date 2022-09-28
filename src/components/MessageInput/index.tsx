import AppDimension from 'common/AppDimension';
import Fonts from 'common/Fonts';
import SVG from 'common/SVG';
import Touchable from 'components/Touchable';
import {Channel, MessageData} from 'models';
import React, {useState, useEffect, useCallback, memo} from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Text,
  ViewStyle,
  FlatList,
} from 'react-native';
import SocketUtils from 'utils/SocketUtils';
import FastImage from 'react-native-fast-image';
import Spinner from 'components/Spinner';
import api from 'services/api';
import {encryptMessage} from 'helpers/ChannelHelper';
import {
  normalizeMessageText,
  normalizeMessageTextPlain,
  normalizeUserName,
} from 'helpers/MessageHelper';
import useThemeColor from 'hook/useThemeColor';
import useAppSelector from 'hook/useAppSelector';
import useTeamUserData from 'hook/useTeamUserData';
import {getUniqueId} from 'helpers/GenerateUUID';
import AvatarView from 'components/AvatarView';
import ImageHelper from 'helpers/ImageHelper';

type AttachmentItemProps = {
  attachment: any;
  onPress: (id: any) => void;
  teamId: string;
};

const AttachmentItem = ({attachment, teamId, onPress}: AttachmentItemProps) => {
  const {colors} = useThemeColor();
  const handlePress = useCallback(async () => {
    if (!attachment.id) return;
    await api.removeFile(attachment.id);
    onPress(attachment.randomId);
  }, [attachment.id, attachment.randomId, onPress]);
  return (
    <View style={styles.attachmentItem}>
      <FastImage
        source={{
          uri:
            attachment.uri ||
            ImageHelper.normalizeImage(attachment.url, teamId),
        }}
        style={{borderRadius: 5, width: 150, height: 90}}
        resizeMode="cover"
      />
      {attachment.loading && (
        <Spinner size="small" backgroundColor="#11111180" />
      )}
      {attachment.id && (
        <Touchable
          style={{
            padding: 10,
            position: 'absolute',
            top: -15,
            right: -15,
          }}
          onPress={handlePress}>
          <View style={[styles.clearButton, {backgroundColor: colors.subtext}]}>
            <SVG.IconClose fill={colors.text} />
          </View>
        </Touchable>
      )}
    </View>
  );
};

type MessageInputProps = {
  currentChannel: Channel;
  style?: ViewStyle;
  placeholder?: string;
  openGallery?: () => void;
  attachments?: Array<any>;
  onRemoveAttachment?: (randomId: number) => void;
  onClearAttachment?: () => void;
  teamId: string;
  messageReply?: MessageData;
  messageEdit?: MessageData;
  onClearReply?: () => void;
  postId?: string;
  inputStyle?: ViewStyle;
  onSent?: () => void;
  inputRef?: any;
  autoFocus?: boolean;
};

const MessageInput = ({
  currentChannel,
  style,
  placeholder,
  openGallery,
  attachments = [],
  teamId,
  onRemoveAttachment,
  onClearAttachment,
  messageEdit,
  messageReply,
  onClearReply,
  postId,
  inputStyle,
  onSent,
  inputRef,
  autoFocus,
}: MessageInputProps) => {
  const [val, setVal] = useState('');
  const teamUserData = useTeamUserData();
  const channelPrivateKey = useAppSelector(
    state => state.configs.channelPrivateKey,
  );
  const {colors} = useThemeColor();
  useEffect(() => {
    if (messageEdit) {
      setVal(normalizeMessageText(messageEdit.content, undefined, true));
    }
  }, [messageEdit]);

  const handleChangeText = useCallback(text => setVal(text), []);

  const submitMessage = useCallback(async () => {
    if (attachments.find(el => el.loading)) {
      alert('Attachment is uploading');
      return;
    }
    const message: any = {
      content: val,
      plain_text: val,
      text: val,
      entity_type: postId ? 'post' : 'channel',
    };
    if (
      (currentChannel.channel_type === 'Private' ||
        currentChannel.channel_type === 'Direct') &&
      currentChannel.channel_id
    ) {
      const {key} =
        channelPrivateKey[currentChannel.channel_id][
          channelPrivateKey[currentChannel.channel_id].length - 1
        ];
      const content = await encryptMessage(message.content, key);
      const plain_text = await encryptMessage(message.plain_text, key);
      message.content = content;
      message.plain_text = plain_text;
    }
    if (postId) {
      message.entity_id = postId;
    } else if (currentChannel.channel_id) {
      message.entity_id = currentChannel.channel_id;
    } else if (currentChannel.user) {
      message.other_user_id = currentChannel?.user?.user_id;
      message.team_id = teamId;
    }
    if (messageReply) {
      message.reply_message_id = messageReply.message_id;
    }
    if (attachments.length > 0) {
      message.message_id = SocketUtils.generateId;
    } else {
      message.message_id = getUniqueId();
    }
    SocketUtils.sendMessage(message);
    SocketUtils.generateId = null;
    setVal('');
    onClearAttachment?.();
  }, [
    attachments,
    channelPrivateKey,
    currentChannel.channel_id,
    currentChannel.channel_type,
    currentChannel.user,
    messageReply,
    onClearAttachment,
    teamId,
    val,
    postId,
  ]);
  const editMessage = useCallback(async () => {
    if (attachments.find(el => el.loading)) {
      alert('Attachment is uploading');
      return;
    }
    if (!val && attachments.length === 0) return;
    let content = val.trim();
    let plain_text = val.trim();
    if (currentChannel.channel_type === 'Private') {
      const {key} =
        channelPrivateKey[currentChannel.channel_id][
          channelPrivateKey[currentChannel.channel_id].length - 1
        ];
      content = await encryptMessage(content, key);
      plain_text = await encryptMessage(plain_text, key);
    }
    await api.editMessage(messageEdit.message_id, content, plain_text);
    setVal('');
    onClearReply?.();
    onClearAttachment?.();
  }, [
    attachments,
    channelPrivateKey,
    currentChannel.channel_id,
    currentChannel.channel_type,
    messageEdit?.message_id,
    onClearAttachment,
    onClearReply,
    val,
  ]);
  const onSend = useCallback(async () => {
    if (messageEdit) {
      await editMessage();
    } else {
      await submitMessage();
    }
    onSent?.();
  }, [editMessage, messageEdit, onSent, submitMessage]);
  const onClearReplyPress = useCallback(() => {
    onClearReply?.();
    setVal('');
  }, [onClearReply]);
  const renderReply = useCallback(() => {
    if (messageReply) {
      const sender = teamUserData?.find?.(
        u => u.user_id === messageReply?.sender_id,
      );
      return (
        <View style={[styles.replyContainer, {borderColor: colors.border}]}>
          <View
            style={[styles.replyIndicator, {backgroundColor: colors.subtext}]}
          />
          <View style={{marginLeft: 20}}>
            <AvatarView user={sender} size={20} />
          </View>
          <Text style={[styles.replyName, {color: colors.lightText}]}>
            {sender.user_name}
          </Text>
          {messageReply.message_attachments.length > 0 && (
            <View style={{marginLeft: 8}}>
              <SVG.IconReplyAttachment fill={colors.lightText} />
            </View>
          )}
          <Text
            style={[styles.replyContent, {color: colors.lightText}]}
            ellipsizeMode="tail"
            numberOfLines={1}>
            {normalizeMessageTextPlain(
              messageReply.content || 'Attachment',
              undefined,
              undefined,
              true,
            )}
          </Text>
          <Touchable
            style={{padding: 10, margin: 10}}
            onPress={onClearReplyPress}>
            <SVG.IconCircleClose fill={colors.subtext} />
          </Touchable>
        </View>
      );
    }
    if (messageEdit) {
      return (
        <View style={[styles.replyContainer, {borderColor: colors.border}]}>
          <View
            style={[styles.replyIndicator, {backgroundColor: colors.subtext}]}
          />
          <Text style={[styles.replyContent, {color: colors.lightText}]}>
            Edit message
          </Text>
          <Touchable
            style={{padding: 10, margin: 10}}
            onPress={onClearReplyPress}>
            <SVG.IconCircleClose fill={colors.subtext} />
          </Touchable>
        </View>
      );
    }
    return null;
  }, [
    colors.border,
    colors.lightText,
    colors.subtext,
    messageEdit,
    messageReply,
    onClearReplyPress,
    teamUserData,
  ]);
  return (
    <View style={[{backgroundColor: colors.activeBackgroundLight}, style]}>
      {renderReply()}
      <View style={[styles.container, inputStyle]}>
        {attachments.length > 0 && (
          <FlatList
            style={styles.attachmentView}
            data={attachments}
            keyExtractor={attachment => attachment.id || attachment.randomId}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({item}) => (
              <AttachmentItem
                attachment={item}
                onPress={onRemoveAttachment}
                teamId={teamId}
              />
            )}
          />
        )}
        <View style={styles.inputContainer}>
          <Touchable style={{padding: 5}} onPress={openGallery}>
            <SVG.IconPlusCircle />
          </Touchable>
          <TextInput
            style={[styles.input, {color: colors.text}]}
            placeholder={
              placeholder ||
              `message to ${
                currentChannel?.user?.user_name
                  ? normalizeUserName(currentChannel?.user?.user_name)
                  : `# ${currentChannel?.channel_name}`
              }`
            }
            multiline
            placeholderTextColor={colors.subtext}
            value={val}
            onChangeText={handleChangeText}
            keyboardAppearance="dark"
            ref={inputRef}
            autoFocus={autoFocus}
          />
          {(!!val || attachments.length > 0) && (
            <Touchable style={{padding: 5}} onPress={onSend}>
              <SVG.IconArrowSend />
            </Touchable>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    paddingBottom: AppDimension.extraBottom + 10,
  },
  replyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderTopWidth: 1,
  },
  replyIndicator: {
    width: 4,
    height: '100%',
    borderRadius: 5,
  },
  replyName: {
    fontFamily: Fonts.SemiBold,
    fontSize: 14,
    lineHeight: 22,
    marginLeft: 10,
  },
  replyContent: {
    fontFamily: Fonts.Medium,
    fontSize: 14,
    lineHeight: 22,
    flex: 1,
    marginLeft: 8,
  },
  inputContainer: {
    flexDirection: 'row',
  },
  input: {
    fontFamily: Fonts.Medium,
    fontSize: 16,
    lineHeight: 20,
    maxHeight: 100,
    flex: 1,
    marginHorizontal: 10,
    paddingTop: 10,
  },
  attachmentView: {
    marginBottom: 10,
  },
  attachmentItem: {
    marginTop: 10,
    marginRight: 10,
  },
  clearButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default memo(MessageInput);
