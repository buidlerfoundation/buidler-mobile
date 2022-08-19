import AppDimension from 'common/AppDimension';
import Fonts from 'common/Fonts';
import SVG from 'common/SVG';
import Touchable from 'components/Touchable';
import {Channel, MessageData} from 'models';
import React, {useState, useEffect, useCallback, memo} from 'react';
import {View, StyleSheet, TextInput, Text, ViewStyle} from 'react-native';
import SocketUtils from 'utils/SocketUtils';
import FastImage from 'react-native-fast-image';
import Spinner from 'components/Spinner';
import api from 'services/api';
import ImageHelper from 'helpers/ImageHelper';
import Blockies from 'components/Blockies';
import {encryptMessage} from 'helpers/ChannelHelper';
import {normalizeUserName} from 'helpers/MessageHelper';
import useThemeColor from 'hook/useThemeColor';
import useAppSelector from 'hook/useAppSelector';
import useTeamUserData from 'hook/useTeamUserData';

type AttachmentItemProps = {
  attachment: any;
  onPress: (id: any) => void;
};

const AttachmentItem = ({attachment, onPress}: AttachmentItemProps) => {
  const {colors} = useThemeColor();
  const handlePress = useCallback(
    () => onPress(attachment.randomId),
    [attachment.randomId, onPress],
  );
  return (
    <View style={styles.attachmentItem}>
      <FastImage
        source={{uri: attachment.uri}}
        style={{borderRadius: 5, width: 150, height: 90}}
        resizeMode="cover"
      />
      {attachment.loading && (
        <Spinner size="small" backgroundColor="#11111180" />
      )}
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
    </View>
  );
};

type MessageInputProps = {
  currentChannel: Channel;
  style?: ViewStyle;
  parentId?: string;
  placeholder?: string;
  openGallery?: () => void;
  attachments?: Array<any>;
  onRemoveAttachment?: (randomId: number) => void;
  onClearAttachment?: () => void;
  teamId: string;
  messageReply?: MessageData;
  messageEdit?: MessageData;
  onClearReply?: () => void;
};

const MessageInput = ({
  currentChannel,
  style,
  parentId,
  placeholder,
  openGallery,
  attachments = [],
  teamId,
  onRemoveAttachment,
  onClearAttachment,
  messageEdit,
  messageReply,
  onClearReply,
}: MessageInputProps) => {
  const [val, setVal] = useState('');
  const teamUserData = useTeamUserData();
  const channelPrivateKey = useAppSelector(
    state => state.configs.channelPrivateKey,
  );
  const {colors} = useThemeColor();
  useEffect(() => {
    if (messageEdit) {
      setVal(messageEdit.plain_text);
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
    };
    if (
      currentChannel.channel_type === 'Private' ||
      (currentChannel.channel_type === 'Direct' && currentChannel.channel_id)
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
    if (currentChannel.channel_id) {
      message.channel_id = currentChannel.channel_id;
    } else if (currentChannel.user) {
      message.other_user_id = currentChannel?.user?.user_id;
      message.team_id = teamId;
    }
    if (messageReply) {
      message.parent_id = messageReply.parent_id || messageReply.message_id;
    } else if (parentId) {
      message.parent_id = parentId;
    }
    if (attachments.length > 0) {
      message.message_id = SocketUtils.generateId;
    }
    SocketUtils.sendMessage(message);
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
    parentId,
    teamId,
    val,
  ]);
  const editMessage = useCallback(async () => {
    if (attachments.find(el => el.loading)) {
      alert('Attachment is uploading');
      return;
    }
    if (!val) return;
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
    api.editMessage(messageEdit.message_id, content, plain_text);
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
  const onSend = useCallback(() => {
    if (messageEdit) {
      editMessage();
    } else {
      submitMessage();
    }
  }, [editMessage, messageEdit, submitMessage]);
  const onClearReplyPress = useCallback(() => {
    onClearReply?.();
    setVal('');
  }, [onClearReply]);
  const renderReply = useCallback(() => {
    if (messageReply) {
      const sender = teamUserData?.find?.(
        u => u.user_id === messageReply?.sender_id,
      );
      const data = ImageHelper.normalizeAvatar(
        sender?.avatar_url,
        sender?.user_id,
      );
      return (
        <View style={[styles.replyContainer, {borderColor: colors.border}]}>
          <View
            style={[styles.replyIndicator, {backgroundColor: colors.subtext}]}
          />
          {typeof data === 'string' ? (
            <FastImage
              source={{
                uri: data,
              }}
              style={{
                width: 25,
                height: 25,
                borderRadius: 12.5,
                marginLeft: 18,
              }}
            />
          ) : (
            <Blockies
              blockies={data.address}
              size={8}
              style={{
                width: 25,
                height: 25,
                borderRadius: 12.5,
                marginLeft: 18,
              }}
            />
          )}
          <Text style={[styles.replyContent, {color: colors.text}]}>
            {messageReply.plain_text}
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
          <View style={{marginLeft: 18}}>
            <SVG.IconEdit />
          </View>
          <Text style={[styles.replyContent, {color: colors.text}]}>
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
    colors.subtext,
    colors.text,
    messageEdit,
    messageReply,
    onClearReplyPress,
    teamUserData,
  ]);
  return (
    <View style={[{backgroundColor: colors.activeBackgroundLight}, style]}>
      {renderReply()}
      <View style={styles.container}>
        {attachments.length > 0 && (
          <View style={styles.attachmentView}>
            {attachments.map(attachment => (
              <AttachmentItem
                attachment={attachment}
                key={attachment.id || attachment.randomId}
                onPress={onRemoveAttachment}
              />
            ))}
          </View>
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
          />
          {!!val && (
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
  replyContent: {
    fontFamily: Fonts.Medium,
    fontSize: 16,
    lineHeight: 19,
    marginLeft: 16,
    flex: 1,
    paddingVertical: 20,
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
    flexDirection: 'row',
    alignItems: 'center',
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
