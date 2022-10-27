import SVG from 'common/SVG';
import Touchable from 'components/Touchable';
import {MessageData, UserData} from 'models';
import React, {useState, useEffect, useCallback, memo, useMemo} from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Text,
  ViewStyle,
  FlatList,
  NativeSyntheticEvent,
  TextInputSelectionChangeEventData,
} from 'react-native';
import SocketUtils from 'utils/SocketUtils';
import FastImage from 'react-native-fast-image';
import Spinner from 'components/Spinner';
import api from 'services/api';
import {
  normalizeMessageTextPlain,
  normalizeUserName,
} from 'helpers/MessageHelper';
import useThemeColor from 'hook/useThemeColor';
import useTeamUserData from 'hook/useTeamUserData';
import {getUniqueId} from 'helpers/GenerateUUID';
import AvatarView from 'components/AvatarView';
import ImageHelper from 'helpers/ImageHelper';
import MentionItem from 'components/MentionItem';
import useCurrentChannel from 'hook/useCurrentChannel';
import useCommunityId from 'hook/useCommunityId';
import AppStyles from 'common/AppStyles';
import PermissionHelper from 'helpers/PermissionHelper';
import Video from 'react-native-video';

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
      {attachment.type.includes('video') ? (
        <Video
          source={{
            uri:
              attachment.uri ||
              ImageHelper.normalizeImage(attachment.url, teamId),
          }}
          style={{borderRadius: 5, width: 150, height: 90}}
          paused
          resizeMode="contain"
        />
      ) : (
        <FastImage
          source={{
            uri:
              attachment.uri ||
              ImageHelper.normalizeImage(attachment.url, teamId),
          }}
          style={{borderRadius: 5, width: 150, height: 90}}
          resizeMode="cover"
        />
      )}
      {attachment.loading && (
        <Spinner size="small" backgroundColor="#11111180" />
      )}
      {attachment.id && (
        <View
          style={{
            position: 'absolute',
            top: -15,
            right: -15,
          }}>
          <Touchable onPress={handlePress} style={{padding: 10}}>
            <View
              style={[styles.clearButton, {backgroundColor: colors.subtext}]}>
              <SVG.IconClose fill={colors.text} width={15} height={15} />
            </View>
          </Touchable>
        </View>
      )}
    </View>
  );
};

type MessageInputProps = {
  style?: ViewStyle;
  placeholder?: string;
  openGallery?: () => void;
  attachments?: Array<any>;
  onRemoveAttachment?: (randomId: number) => void;
  onClearAttachment?: () => void;
  messageReply?: MessageData;
  messageEdit?: MessageData;
  onClearReply?: () => void;
  postId?: string;
  inputStyle?: ViewStyle;
  onSent?: () => void;
  inputRef?: React.MutableRefObject<TextInput>;
  autoFocus?: boolean;
  onFocusChanged?: (isFocus: boolean) => void;
};

const MessageInput = ({
  style,
  placeholder,
  openGallery,
  attachments = [],
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
  onFocusChanged,
}: MessageInputProps) => {
  const [val, setVal] = useState('');
  const [isFocus, setFocus] = useState(true);
  const [cursorPos, setCursorPos] = useState(0);
  const [mentionStr, setMentionStr] = useState('');
  const [mentions, setMentions] = useState([]);
  const [isOpenPopupMention, setOpenPopupMention] = useState(false);
  const currentChannel = useCurrentChannel();
  const teamId = useCommunityId();
  const teamUserData = useTeamUserData();
  const {colors} = useThemeColor();
  useEffect(() => {
    const startMention = val.substring(0, cursorPos).lastIndexOf('@');
    const beforeMention = val?.[startMention - 1];
    if (
      (beforeMention === '\n' || beforeMention === ' ' || startMention === 0) &&
      startMention < cursorPos
    ) {
      if (!isOpenPopupMention) {
        setOpenPopupMention(true);
      }
      const str = val.substring(startMention + 1, cursorPos);
      setMentionStr(str);
    } else {
      setOpenPopupMention(false);
    }
  }, [cursorPos, isOpenPopupMention, val]);
  const dataMention = useMemo(() => {
    return teamUserData.filter(
      el =>
        !el.is_deleted &&
        el?.user_name
          ?.toLowerCase?.()
          ?.includes?.(mentionStr?.toLowerCase?.() || ''),
    );
  }, [mentionStr, teamUserData]);
  const normalizeMessageEdit = useCallback(
    (content: string) => {
      let res = content;
      const matchRegex = /(<@)(.*?)(-)(.*?)(>)/gim;
      const matchMentions = content.match(matchRegex);
      matchMentions?.forEach?.(element => {
        const mentionMatch = /(<@)(.*?)(-)(.*?)(>)/.exec(element);
        if (mentionMatch.length > 0) {
          res = res.replace(mentionMatch[0], `@${mentionMatch[2]}`);
          setMentions(current => {
            if (current.includes(mentionMatch[2])) {
              return current;
            }
            return [...current, mentionMatch[2]];
          });
        }
      });
      setVal(res);
      setTimeout(() => {
        inputRef?.current?.focus();
      }, 400);
    },
    [inputRef],
  );
  useEffect(() => {
    if (messageEdit) {
      normalizeMessageEdit(messageEdit.content);
    }
  }, [messageEdit, normalizeMessageEdit]);

  useEffect(() => {
    if (currentChannel.channel_id) {
      setVal('');
      onClearAttachment?.();
      setMentions([]);
    }
  }, [currentChannel.channel_id, onClearAttachment]);

  useEffect(() => {
    if (postId) {
      setVal('');
      onClearAttachment?.();
      setMentions([]);
    }
  }, [onClearAttachment, postId]);

  const handleFocus = useCallback(() => {
    onFocusChanged?.(true);
    setFocus(true);
  }, [onFocusChanged]);

  const handleBlur = useCallback(() => {
    onFocusChanged?.(false);
    setFocus(false);
  }, [onFocusChanged]);

  const onPlusPress = useCallback(async () => {
    const grand = await PermissionHelper.checkPermissionPhoto();
    if (grand) {
      // navigation.navigate(ScreenID.AllPhotoScreen);
      openGallery();
    } else {
      PermissionHelper.requestSettingPhoto();
    }
  }, [openGallery]);

  const handleChangeText = useCallback(text => {
    setVal(text);
  }, []);

  const normalizeContentMessageSubmit = useCallback(
    (text: string) => {
      let res = text;
      mentions.forEach(el => {
        const user = teamUserData.find(u => u.user_name === el);
        if (user) {
          res = res.replace(
            new RegExp(`@${el}`, 'g'),
            `<@${user.user_name}-${user.user_id}>`,
          );
        }
      });
      return res;
    },
    [mentions, teamUserData],
  );

  const submitMessage = useCallback(async () => {
    if (attachments.find(el => el.loading)) {
      alert('Attachment is uploading');
      return;
    }
    const text = normalizeContentMessageSubmit(val);
    const message: any = {
      content: text,
      plain_text: val,
      text,
      entity_type: postId ? 'post' : 'channel',
    };
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
    val,
    normalizeContentMessageSubmit,
    postId,
    currentChannel.channel_id,
    currentChannel.user,
    messageReply,
    onClearAttachment,
    teamId,
  ]);
  const editMessage = useCallback(async () => {
    if (attachments.find(el => el.loading)) {
      alert('Attachment is uploading');
      return;
    }
    if (!val && attachments.length === 0) return;
    let content = normalizeContentMessageSubmit(val.trim());
    let plain_text = val.trim();
    await api.editMessage(messageEdit?.message_id, content, plain_text);
    setVal('');
    onClearReply?.();
    onClearAttachment?.();
  }, [
    attachments,
    messageEdit?.message_id,
    normalizeContentMessageSubmit,
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
          <Text
            style={[
              styles.replyName,
              AppStyles.TextSemi13,
              {color: colors.lightText},
            ]}>
            {sender.user_name}
          </Text>
          {messageReply.message_attachments.length > 0 && (
            <View style={{marginLeft: 8}}>
              <SVG.IconReplyAttachment fill={colors.lightText} />
            </View>
          )}
          <Text
            style={[
              styles.replyContent,
              AppStyles.TextMed13,
              {color: colors.lightText},
            ]}
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
  const onSelectionChange = useCallback(
    (e: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
      const {end, start} = e.nativeEvent.selection;
      if (end === start) {
        setCursorPos(start);
      } else {
        setCursorPos(0);
      }
    },
    [],
  );
  const handlePressMention = useCallback(
    (user: UserData) => {
      setMentions(current => {
        if (current.includes(user.user_name)) {
          return current;
        }
        return [...current, user.user_name];
      });
      setOpenPopupMention(false);
      setVal(
        current =>
          `${current.substring(0, cursorPos - mentionStr.length - 1)}@${
            user.user_name
          } ${current.substring(cursorPos)}`,
      );
    },
    [cursorPos, mentionStr],
  );
  const parsedText = useMemo(() => {
    return val.split(/(\s)/g).map((el, index) => {
      if (/@[a-zA-Z0-9]+/.test(el) && mentions.includes(el.substring(1))) {
        return (
          <Text style={[{color: colors.mention}]} key={`${el}-${index}`}>
            {el}
          </Text>
        );
      }
      return <Text key={`${el}-${index}`}>{el}</Text>;
    });
  }, [colors.mention, mentions, val]);
  const renderMentionItem = useCallback(
    ({item}: {item: UserData}) => (
      <MentionItem user={item} onPress={handlePressMention} />
    ),
    [handlePressMention],
  );
  return (
    <View>
      <View>
        {isOpenPopupMention && isFocus && dataMention.length > 0 && (
          <FlatList
            style={[
              styles.mentionView,
              {
                backgroundColor: colors.background,
                borderTopColor: colors.border,
              },
            ]}
            data={dataMention}
            keyExtractor={el => el.user_id}
            renderItem={renderMentionItem}
            ListHeaderComponent={<View style={{height: 10}} />}
            ListFooterComponent={<View style={{height: 10}} />}
          />
        )}
      </View>
      <View
        style={[
          {
            backgroundColor: colors.background,
            borderTopWidth: 1,
            borderColor: colors.border,
          },
          style,
        ]}>
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
            <Touchable style={{padding: 5}} onPress={onPlusPress}>
              <SVG.IconPlusCircle />
            </Touchable>
            <TextInput
              style={[styles.input, AppStyles.TextSemi15, {color: colors.text}]}
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
              onChangeText={handleChangeText}
              keyboardAppearance="dark"
              ref={inputRef}
              autoFocus={autoFocus}
              onFocus={handleFocus}
              onBlur={handleBlur}
              value=""
              onSelectionChange={onSelectionChange}>
              <Text>{parsedText}</Text>
            </TextInput>
            {(!!val?.trim() || attachments.length > 0) && (
              <Touchable style={{padding: 5}} onPress={onSend}>
                <SVG.IconArrowSend />
              </Touchable>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  replyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  replyIndicator: {
    width: 4,
    height: '100%',
    borderRadius: 5,
  },
  replyName: {
    marginLeft: 10,
  },
  replyContent: {
    flex: 1,
    marginLeft: 8,
  },
  inputContainer: {
    flexDirection: 'row',
  },
  input: {
    maxHeight: 100,
    flex: 1,
    marginHorizontal: 10,
    paddingTop: 7,
  },
  mentionView: {
    maxHeight: 150,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingHorizontal: 10,
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
