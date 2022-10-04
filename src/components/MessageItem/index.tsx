import {MessageData} from 'models';
import React, {useCallback, memo, useMemo} from 'react';
import {View, StyleSheet, Text, useWindowDimensions} from 'react-native';
import Fonts from 'common/Fonts';
import MessagePhoto from '../MessagePhoto';
import RenderHTML from 'components/RenderHTML';
import {
  normalizeMessageText,
  normalizeMessageTextPlain,
  normalizeUserName,
} from 'helpers/MessageHelper';
import {messageFromNow} from 'utils/DateUtils';
import useThemeColor from 'hook/useThemeColor';
import Touchable from 'components/Touchable';
import AvatarView from 'components/AvatarView';
import ReactView from 'components/ReactView';
import useAppSelector from 'hook/useAppSelector';
import useTeamUserData from 'hook/useTeamUserData';
import SVG from 'common/SVG';
import PinPostItem from 'components/PinPostItem';

type ReplyMessageProps = {
  replyMessage?: MessageData;
  replyMessageId?: string;
};

const ReplyMessage = ({replyMessage, replyMessageId}: ReplyMessageProps) => {
  const teamUserData = useTeamUserData();
  const {colors} = useThemeColor();
  const replier = useMemo(
    () => teamUserData.find(el => el.user_id === replyMessage?.sender_id),
    [replyMessage?.sender_id, teamUserData],
  );
  const isReplyExisted = useMemo(
    () => !!replyMessage && !!replier,
    [replier, replyMessage],
  );
  const showReply = useMemo(
    () => isReplyExisted || replyMessageId,
    [isReplyExisted, replyMessageId],
  );
  if (!showReply) return null;
  return (
    <View style={styles.replyWrap}>
      <SVG.IconMessageReply fill={colors.lightText} />
      <View style={{width: 15}} />
      {isReplyExisted ? (
        <>
          <AvatarView user={replier} size={20} />
          <Text
            style={[styles.replierName, {color: colors.lightText}]}
            numberOfLines={1}
            ellipsizeMode="middle">
            {replier.user_name}
          </Text>
          {replyMessage.message_attachments.length > 0 && (
            <View style={{marginLeft: 8}}>
              <SVG.IconReplyAttachment fill={colors.lightText} />
            </View>
          )}
          <View style={{flex: 1}}>
            <RenderHTML
              html={normalizeMessageTextPlain(
                replyMessage.content || 'View attachment',
                true,
                replyMessage.createdAt !== replyMessage.updatedAt,
              )}
              defaultTextProps={{
                ellipsizeMode: 'tail',
                numberOfLines: 1,
              }}
            />
          </View>
        </>
      ) : (
        <View style={styles.deletedReplyWrap}>
          <SVG.IconBan fill={colors.lightText} />
          <Text style={[styles.deletedText, {color: colors.lightText}]}>
            Original message was deleted.
          </Text>
        </View>
      )}
    </View>
  );
};

type MessageAvatarProps = {
  sender_id: string;
  showAvatar?: boolean;
};

const MessageAvatar = ({sender_id, showAvatar}: MessageAvatarProps) => {
  const teamUserData = useTeamUserData();
  const sender = useMemo(
    () => teamUserData.find(el => el.user_id === sender_id),
    [sender_id, teamUserData],
  );
  if (showAvatar)
    return (
      <View style={{marginTop: 5}}>
        <AvatarView user={sender} size={35} />
      </View>
    );
  return <View style={{width: 35}} />;
};

type MessageSenderProps = {
  showAvatar?: boolean;
  sender_id: string;
  createdAt: string;
};

const MessageSender = ({
  showAvatar,
  sender_id,
  createdAt,
}: MessageSenderProps) => {
  const teamUserData = useTeamUserData();
  const {colors} = useThemeColor();
  const sender = useMemo(
    () => teamUserData.find(el => el.user_id === sender_id),
    [sender_id, teamUserData],
  );
  if (!showAvatar || !sender) return null;
  return (
    <View style={styles.nameWrapper}>
      <Text style={[styles.senderName, {color: colors.text}]}>
        {normalizeUserName(sender.user_name)}
      </Text>
      <Text style={[styles.messageDate, {color: colors.secondary}]}>
        {messageFromNow(createdAt)}
      </Text>
    </View>
  );
};

type MessageItemProps = {
  item: MessageData;
  onLongPress?: (message: MessageData) => void;
};

const MessageItem = ({item, onLongPress}: MessageItemProps) => {
  const {colors} = useThemeColor();
  const {width} = useWindowDimensions();
  const teamId = useAppSelector(state => state.user.currentTeamId);
  const reactData = useAppSelector(state => state.reactReducer.reactData);
  const showAvatar = useMemo(() => {
    return item.isHead || !!item.reply_message_id;
  }, [item.isHead, item.reply_message_id]);
  const handleLongPress = useCallback(
    () => onLongPress?.(item),
    [item, onLongPress],
  );
  return (
    <View style={[styles.root, {marginTop: showAvatar ? 15 : 0}]}>
      <ReplyMessage
        replyMessage={item.conversation_data}
        replyMessageId={item.reply_message_id}
      />
      <Touchable style={[styles.container]} onLongPress={handleLongPress}>
        <MessageAvatar sender_id={item.sender_id} showAvatar={showAvatar} />
        <View style={styles.bodyMessage}>
          <MessageSender
            createdAt={item.createdAt}
            sender_id={item.sender_id}
            showAvatar={showAvatar}
          />
          {item.task ? (
            <PinPostItem
              pinPost={{...item.task, message_sender_id: item.sender_id}}
              embeds
              style={[styles.pinPostContainer, {borderColor: colors.border}]}
              onLongPress={handleLongPress}
            />
          ) : (
            <>
              {(!!item.content && (
                <RenderHTML
                  html={normalizeMessageText(
                    item.content,
                    undefined,
                    undefined,
                    !item.isSending && item.createdAt !== item.updatedAt,
                    item.isSending ? 'message-text-sending' : undefined,
                  )}
                />
              )) || <View style={{height: 8}} />}
              <MessagePhoto
                attachments={item?.message_attachments || []}
                teamId={teamId}
                imageWidth={width - 160}
                edited={
                  !item.isSending &&
                  item.createdAt !== item.updatedAt &&
                  !item.content
                }
              />
              <ReactView reacts={reactData[item.message_id]} />
            </>
          )}
        </View>
      </Touchable>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: 20,
  },
  container: {
    flexDirection: 'row',
  },
  bodyMessage: {
    marginLeft: 15,
    flex: 1,
  },
  nameWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  messageDate: {
    fontSize: 12,
    fontFamily: Fonts.Medium,
    marginLeft: 5,
    lineHeight: 22,
  },
  senderName: {
    fontSize: 16,
    lineHeight: 26,
    fontFamily: Fonts.SemiBold,
  },
  message: {
    fontFamily: Fonts.Medium,
    fontSize: 16,
    lineHeight: 26,
    marginTop: 8,
  },
  replyWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 20,
    marginBottom: 10,
    flex: 1,
  },
  replierName: {
    marginLeft: 10,
    fontFamily: Fonts.SemiBold,
    fontSize: 14,
    lineHeight: 22,
    maxWidth: 100,
  },
  deletedReplyWrap: {
    marginLeft: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  deletedText: {
    marginLeft: 5,
    fontFamily: Fonts.SemiBold,
    fontSize: 14,
    lineHeight: 22,
  },
  pinPostContainer: {
    padding: 15,
    marginTop: 20,
    borderRadius: 5,
    borderWidth: 1,
    paddingHorizontal: 15,
  },
});

export default memo(MessageItem);
