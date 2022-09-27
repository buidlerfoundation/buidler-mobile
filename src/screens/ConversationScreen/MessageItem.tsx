import {MessageData} from 'models';
import React, {useCallback, memo, useMemo} from 'react';
import {View, StyleSheet, Text, useWindowDimensions} from 'react-native';
import Fonts from 'common/Fonts';
import MessagePhoto from './MessagePhoto';
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

type MessageItemProps = {
  item: MessageData;
  teamId: string;
  onLongPress?: (message: MessageData) => void;
};

const MessageItem = ({item, teamId, onLongPress}: MessageItemProps) => {
  const {colors} = useThemeColor();
  const {width} = useWindowDimensions();
  const teamUserData = useTeamUserData();
  const reactData = useAppSelector(state => state.reactReducer.reactData);
  const replyMessage = useMemo(
    () => item.conversation_data,
    [item.conversation_data],
  );
  const sender = useMemo(
    () => teamUserData.find(el => el.user_id === item.sender_id),
    [item.sender_id, teamUserData],
  );
  const replier = useMemo(
    () => teamUserData.find(el => el.user_id === replyMessage?.sender_id),
    [replyMessage?.sender_id, teamUserData],
  );
  const showAvatar = useMemo(() => {
    return item.isHead || !!item.reply_message_id;
  }, [item.isHead, item.reply_message_id]);
  const handleLongPress = useCallback(
    () => onLongPress?.(item),
    [item, onLongPress],
  );
  const isReplyExisted = useMemo(
    () => !!replyMessage && !!replier,
    [replier, replyMessage],
  );
  const showReply = useMemo(
    () => isReplyExisted || item.reply_message_id,
    [isReplyExisted, item.reply_message_id],
  );
  if (!sender) return null;
  return (
    <View style={[styles.root, {marginTop: showAvatar ? 15 : 0}]}>
      {showReply && (
        <View style={styles.replyWrap}>
          <SVG.IconMessageReply fill={colors.lightText} />
          <View style={{width: 15}} />
          {isReplyExisted ? (
            <>
              <AvatarView user={replier} size={20} />
              <Text style={[styles.replierName, {color: colors.lightText}]}>
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
      )}
      <Touchable style={[styles.container]} onLongPress={handleLongPress}>
        {showAvatar ? (
          <AvatarView user={sender} size={35} />
        ) : (
          <View style={{width: 35}} />
        )}
        <View style={styles.bodyMessage}>
          {showAvatar && (
            <View style={styles.nameWrapper}>
              <Text style={[styles.senderName, {color: colors.text}]}>
                {normalizeUserName(sender.user_name)}
              </Text>
              <Text style={[styles.messageDate, {color: colors.secondary}]}>
                {messageFromNow(item.createdAt)}
              </Text>
            </View>
          )}
          {item.task ? (
            <PinPostItem
              pinPost={{...item.task, message_sender_id: item.sender_id}}
              embeds
              style={[styles.pinPostContainer, {borderColor: colors.border}]}
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
  avatar: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
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
    fontFamily: Fonts.Bold,
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
