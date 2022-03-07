import AppDimension from 'common/AppDimension';
import Fonts from 'common/Fonts';
import SVG from 'common/SVG';
import Touchable from 'components/Touchable';
import {Channel, Message, ThemeType, User} from 'models';
import React, {useState, useEffect} from 'react';
import {View, StyleSheet, TextInput, Text, ViewStyle} from 'react-native';
import themes from 'themes';
import SocketUtils from 'utils/SocketUtils';
import FastImage from 'react-native-fast-image';
import Spinner from 'components/Spinner';
import api from 'services/api';

type MessageInputProps = {
  themeType: ThemeType;
  currentChannel: Channel;
  style?: ViewStyle;
  parentId?: string;
  placeholder?: string;
  openGallery?: () => void;
  attachments?: Array<any>;
  onRemoveAttachment?: (randomId: number) => void;
  onClearAttachment?: () => void;
  teamId: string;
  messageReply?: Message;
  messageEdit?: Message;
  onClearReply?: () => void;
  teamUserData?: Array<User>;
};

const MessageInput = ({
  themeType,
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
  teamUserData,
}: MessageInputProps) => {
  const [val, setVal] = useState('');
  const {colors} = themes[themeType];
  useEffect(() => {
    if (messageEdit) {
      setVal(messageEdit.plain_text);
    }
  }, [messageEdit]);
  const onSend = () => {
    if (messageEdit) {
      editMessage();
    } else {
      submitMessage();
    }
  };
  const submitMessage = () => {
    if (!!attachments.find(el => el.loading)) {
      alert('Attachment is uploading');
      return;
    }
    const message: any = {
      content: val,
      plain_text: val,
    };
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
  };
  const editMessage = () => {
    if (!!attachments.find(el => el.loading)) {
      alert('Attachment is uploading');
      return;
    }
    if (!val) return;
    api.editMessage(messageEdit.message_id, val, val);
    setVal('');
    onClearReply?.();
    onClearAttachment?.();
  };
  const renderReply = () => {
    if (messageReply) {
      const sender = teamUserData?.find?.(
        u => u.user_id === messageReply?.sender_id,
      );
      return (
        <View style={[styles.replyContainer, {borderColor: colors.border}]}>
          <View
            style={[styles.replyIndicator, {backgroundColor: colors.subtext}]}
          />
          <FastImage
            source={{uri: sender?.avatar_url}}
            style={{width: 25, height: 25, borderRadius: 12.5, marginLeft: 18}}
          />
          <Text style={[styles.replyContent, {color: colors.text}]}>
            {messageReply.plain_text}
          </Text>
          <Touchable
            style={{padding: 10, margin: 10}}
            onPress={() => {
              onClearReply?.();
              setVal('');
            }}>
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
            onPress={() => {
              onClearReply?.();
              setVal('');
            }}>
            <SVG.IconCircleClose fill={colors.subtext} />
          </Touchable>
        </View>
      );
    }
    return null;
  };
  return (
    <View style={[{backgroundColor: colors.activeBackgroundLight}, style]}>
      {renderReply()}
      <View style={styles.container}>
        {attachments.length > 0 && (
          <View style={styles.attachmentView}>
            {attachments.map(attachment => (
              <View
                style={styles.attachmentItem}
                key={attachment.id || attachment.randomId}>
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
                  onPress={() => onRemoveAttachment(attachment.randomId)}>
                  <View
                    style={[
                      styles.clearButton,
                      {backgroundColor: colors.subtext},
                    ]}>
                    <SVG.IconClose fill={colors.text} />
                  </View>
                </Touchable>
              </View>
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
              placeholder || `message to ${currentChannel.channel_name}`
            }
            multiline
            placeholderTextColor={colors.subtext}
            value={val}
            onChangeText={text => setVal(text)}
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

export default MessageInput;
