import {MessageData} from 'models';
import React, {useCallback, memo, useMemo} from 'react';
import {
  View,
  StyleSheet,
  Text,
  useWindowDimensions,
  ViewStyle,
} from 'react-native';
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
import AppStyles from 'common/AppStyles';
import useAppDispatch from 'hook/useAppDispatch';
import useUserData from 'hook/useUserData';
import {addReact, removeReact} from 'actions/ReactActions';
import {useNavigation} from '@react-navigation/native';
import ScreenID from 'common/ScreenID';
import useCommunityId from 'hook/useCommunityId';
import {DeletedUser} from 'common/AppConfig';

type ReplyMessageProps = {
  replyMessage?: MessageData;
  replyMessageId?: string;
  onPressMessageReply?: (replyMessage: MessageData) => void;
  embeds?: boolean;
  direct?: boolean;
};

const ReplyMessage = memo(
  ({
    replyMessage,
    replyMessageId,
    onPressMessageReply,
    embeds,
    direct,
  }: ReplyMessageProps) => {
    const teamUserData = useTeamUserData(direct);
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
    const onPress = useCallback(() => {
      if (replyMessage) {
        onPressMessageReply?.(replyMessage);
      }
    }, [onPressMessageReply, replyMessage]);
    if (!showReply || embeds) return null;
    return (
      <View style={styles.replyWrap}>
        <SVG.IconMessageReply fill={colors.lightText} />
        <View style={{width: 15}} />
        {isReplyExisted ? (
          <>
            <AvatarView user={replier} size={20} />
            <Text
              style={[
                styles.replierName,
                AppStyles.TextSemi13,
                {color: colors.lightText},
              ]}
              numberOfLines={1}
              ellipsizeMode="middle">
              {replier.user_name}
            </Text>
            {replyMessage.message_attachments.length > 0 && (
              <View style={{marginLeft: 8}}>
                <SVG.IconReplyAttachment fill={colors.lightText} />
              </View>
            )}
            <Touchable style={{flex: 1}} onPress={onPress} useWithoutFeedBack>
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
            </Touchable>
          </>
        ) : (
          <View style={styles.deletedReplyWrap}>
            <SVG.IconBan fill={colors.lightText} />
            <Text
              style={[
                styles.deletedText,
                AppStyles.TextSemi13,
                {color: colors.lightText},
              ]}>
              Original message was deleted.
            </Text>
          </View>
        )}
      </View>
    );
  },
);

type MessageAvatarProps = {
  sender_id: string;
  showAvatar?: boolean;
  onUserPress: () => void;
  embeds?: boolean;
  direct?: boolean;
};

const MessageAvatar = memo(
  ({
    sender_id,
    showAvatar,
    onUserPress,
    embeds,
    direct,
  }: MessageAvatarProps) => {
    const teamUserData = useTeamUserData(direct);
    const sender = useMemo(
      () => teamUserData.find(el => el.user_id === sender_id) || DeletedUser,
      [sender_id, teamUserData],
    );
    if (showAvatar || embeds)
      return (
        <Touchable
          style={{marginTop: 5}}
          onPress={onUserPress}
          disabled={embeds}>
          <AvatarView user={sender} size={35} />
        </Touchable>
      );
    return <View style={{width: 35}} />;
  },
);

type MessageSenderProps = {
  showAvatar?: boolean;
  sender_id: string;
  createdAt: string;
  onUserPress: () => void;
  embeds?: boolean;
  direct?: boolean;
};

const MessageSender = memo(
  ({
    showAvatar,
    sender_id,
    createdAt,
    onUserPress,
    embeds,
    direct,
  }: MessageSenderProps) => {
    const {colors} = useThemeColor();
    const teamUserData = useTeamUserData(direct);
    const sender = useMemo(
      () => teamUserData.find(el => el.user_id === sender_id) || DeletedUser,
      [sender_id, teamUserData],
    );
    if ((!showAvatar && !embeds) || !sender) return null;
    return (
      <View style={styles.nameWrapper}>
        <Touchable onPress={onUserPress} disabled={embeds}>
          <Text style={[AppStyles.TextSemi15, {color: colors.text}]}>
            {normalizeUserName(sender.user_name)}
          </Text>
        </Touchable>
        <Text
          style={[
            AppStyles.TextMed11,
            styles.messageDate,
            {color: colors.secondary},
          ]}>
          {messageFromNow(createdAt)}
        </Text>
      </View>
    );
  },
);

type MessageItemProps = {
  item: MessageData;
  onLongPress?: (message: MessageData) => void;
  onPressMessageReply?: (replyMessage: MessageData) => void;
  style?: ViewStyle;
  embeds?: boolean;
  contentId?: string;
  openReactView?: (message: MessageData) => void;
  direct?: boolean;
};

const MessageItem = ({
  item,
  onLongPress,
  onPressMessageReply,
  style,
  embeds,
  contentId,
  direct,
  openReactView,
}: MessageItemProps) => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const {colors} = useThemeColor();
  const {width} = useWindowDimensions();
  const teamId = useCommunityId(direct);
  const reactData = useAppSelector(state => state.reactReducer.reactData);
  const userData = useUserData();
  const highlightMessageId = useAppSelector(
    state => state.message.highlightMessageId,
  );
  const showAvatar = useMemo(() => {
    return item.isHead || !!item.task || !!item.reply_message_id;
  }, [item.isHead, item.reply_message_id, item.task]);
  const handleOpenReactView = useCallback(() => {
    openReactView?.(item);
  }, [item, openReactView]);
  const handleLongPress = useCallback(
    () => onLongPress?.(item),
    [item, onLongPress],
  );
  const isHighLight = useMemo(
    () => highlightMessageId === item.message_id,
    [highlightMessageId, item.message_id],
  );
  const handleReactPress = useCallback(
    (reactName: string) => {
      const reacts = reactData[item.message_id];
      const isExisted = !!reacts?.find(
        (react: any) => react.reactName === reactName && react?.isReacted,
      );
      if (isExisted) {
        dispatch(removeReact(item?.message_id, reactName, userData?.user_id));
      } else {
        dispatch(addReact(item?.message_id, reactName, userData?.user_id));
      }
    },
    [dispatch, item.message_id, reactData, userData?.user_id],
  );
  const onUserPress = useCallback(() => {
    navigation.navigate(ScreenID.UserScreen, {userId: item.sender_id, direct});
  }, [direct, item.sender_id, navigation]);
  return (
    <View
      style={[
        styles.root,
        {marginTop: showAvatar ? 15 : 0},
        isHighLight && {backgroundColor: colors.activeBackgroundLight},
        style,
      ]}>
      <ReplyMessage
        replyMessage={item.conversation_data}
        replyMessageId={item.reply_message_id}
        onPressMessageReply={onPressMessageReply}
        embeds={embeds}
        direct={direct}
      />
      <Touchable
        style={[styles.container]}
        onLongPress={handleLongPress}
        useWithoutFeedBack
        disabled={embeds}>
        <MessageAvatar
          sender_id={item.sender_id}
          showAvatar={showAvatar}
          onUserPress={onUserPress}
          embeds={embeds}
          direct={direct}
        />
        <View style={styles.bodyMessage}>
          <MessageSender
            createdAt={item.createdAt}
            sender_id={item.sender_id}
            showAvatar={showAvatar}
            onUserPress={onUserPress}
            embeds={embeds}
            direct={direct}
          />
          {item.task ? (
            <PinPostItem
              pinPost={{...item.task, message_sender_id: item.sender_id}}
              embeds
              style={[styles.pinPostContainer, {borderColor: colors.border}]}
              onLongPress={handleLongPress}
              contentId={contentId}
              openReactView={handleOpenReactView}
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
                  embeds={embeds}
                  defaultTextProps={
                    !embeds
                      ? undefined
                      : {
                          ellipsizeMode: 'tail',
                          numberOfLines: 5,
                        }
                  }
                />
              )) || <View style={{height: 8}} />}
              <MessagePhoto
                attachments={item?.message_attachments || []}
                teamId={teamId}
                imageWidth={!embeds ? width - 160 : (width - 132) / 2}
                stack={embeds}
                edited={
                  !item.isSending &&
                  item.createdAt !== item.updatedAt &&
                  !item.content
                }
                onLongPress={handleLongPress}
                disabled={embeds}
                contentId={contentId}
              />
              {!embeds && (
                <ReactView
                  reacts={reactData[item.message_id]}
                  onReactPress={handleReactPress}
                  openReactView={handleOpenReactView}
                />
              )}
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
    alignItems: 'flex-start',
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
    marginLeft: 5,
    lineHeight: 18,
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
    maxWidth: 200,
  },
  deletedReplyWrap: {
    marginLeft: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  deletedText: {
    marginLeft: 5,
  },
  pinPostContainer: {
    padding: 15,
    marginTop: 10,
    borderRadius: 5,
    borderWidth: 1,
    paddingHorizontal: 15,
  },
});

export default memo(MessageItem);
