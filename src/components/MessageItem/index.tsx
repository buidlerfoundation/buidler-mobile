import {MessageData, UserData} from 'models';
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
  normalizeMessageTextDisable,
  normalizeMessageTextPlain,
  normalizeUserName,
} from 'helpers/MessageHelper';
import {messageFromNow} from 'utils/DateUtils';
import useThemeColor from 'hook/useThemeColor';
import Touchable from 'components/Touchable';
import AvatarView from 'components/AvatarView';
import ReactView from 'components/ReactView';
import useAppSelector from 'hook/useAppSelector';
import SVG from 'common/SVG';
import PinPostItem from 'components/PinPostItem';
import AppStyles from 'common/AppStyles';
import useAppDispatch from 'hook/useAppDispatch';
import useUserData from 'hook/useUserData';
import {addReact, removeReact} from 'actions/ReactActions';
import {useNavigation} from '@react-navigation/native';
import ScreenID from 'common/ScreenID';
import useCommunityId from 'hook/useCommunityId';
import useUserById from 'hook/useUserById';
import ScamVoting from 'components/ScamVoting';
import MixpanelAnalytics from 'services/analytics/MixpanelAnalytics';

type ReplyMessageProps = {
  replyMessage?: MessageData;
  replyMessageId?: string;
  onPressMessageReply?: (replyMessage: MessageData) => void;
  embeds?: boolean;
  replier?: UserData;
};

const ReplyMessage = memo(
  ({
    replyMessage,
    replyMessageId,
    onPressMessageReply,
    embeds,
    replier,
  }: ReplyMessageProps) => {
    const {colors} = useThemeColor();
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
    if (!showReply || embeds || !replier) return null;
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
  sender: UserData;
  showAvatar?: boolean;
  onUserPress: () => void;
  embeds?: boolean;
  bot?: boolean;
};

const MessageAvatar = memo(
  ({sender, showAvatar, onUserPress, embeds, bot}: MessageAvatarProps) => {
    if (showAvatar || embeds)
      return (
        <Touchable
          style={{marginTop: 5}}
          onPress={onUserPress}
          disabled={embeds || bot}>
          <AvatarView user={sender} size={35} bot={bot} />
        </Touchable>
      );
    return <View style={{width: 35}} />;
  },
);

type MessageSenderProps = {
  showAvatar?: boolean;
  sender: UserData;
  createdAt: string;
  onUserPress: () => void;
  embeds?: boolean;
  bot?: boolean;
};

const MessageSender = memo(
  ({
    showAvatar,
    sender,
    createdAt,
    onUserPress,
    embeds,
    bot,
  }: MessageSenderProps) => {
    const {colors} = useThemeColor();
    if ((!showAvatar && !embeds) || !sender) return null;
    return (
      <View style={styles.nameWrapper}>
        <Touchable onPress={onUserPress} disabled={embeds || bot}>
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
  onOpenBrowser?: () => void;
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
  onOpenBrowser,
}: MessageItemProps) => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const {colors} = useThemeColor();
  const {width} = useWindowDimensions();
  const teamId = useCommunityId(direct);
  const reactData = useAppSelector(state => state.reactReducer.reactData);
  const userData = useUserData();
  const sender = useUserById(item.sender_id, direct);
  const replier = useUserById(item?.conversation_data?.sender_id, direct);
  const highlightMessageId = useAppSelector(
    state => state.message.highlightMessageId,
  );
  const isBot = useMemo(() => !!item.metadata, [item.metadata]);
  const showAvatar = useMemo(() => {
    return item.isHead || !!item.task || !!item.reply_message_id;
  }, [item.isHead, item.reply_message_id, item.task]);
  const handleOpenReactView = useCallback(() => {
    openReactView?.(item);
  }, [item, openReactView]);
  const handleLongPress = useCallback(() => {
    if (isBot) return;
    onLongPress?.(item);
  }, [isBot, item, onLongPress]);
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
        MixpanelAnalytics.tracking('Message Reacted', {
          category: direct ? 'Direct Message' : 'Channel Message',
        });
      }
    },
    [direct, dispatch, item.message_id, reactData, userData?.user_id],
  );
  const onUserPress = useCallback(() => {
    if (!sender?.user_id) return;
    navigation.navigate(ScreenID.UserScreen, {userId: sender?.user_id, direct});
  }, [direct, navigation, sender?.user_id]);
  const renderMessageContentType = useCallback(() => {
    if (item.metadata?.type === 'scam_alert' && item.metadata?.data?.content) {
      return (
        <Text
          style={[
            AppStyles.TextMed15,
            {color: colors.subtext, marginTop: 4, lineHeight: 20},
          ]}>
          {item.metadata?.data?.content}
        </Text>
      );
    }
    return null;
  }, [colors.subtext, item.metadata?.data?.content, item.metadata?.type]);
  if (!sender) return null;
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
        replier={replier}
      />
      <Touchable
        style={[styles.container]}
        onLongPress={handleLongPress}
        useWithoutFeedBack
        disabled={embeds}>
        <MessageAvatar
          sender={sender}
          showAvatar={showAvatar}
          onUserPress={onUserPress}
          embeds={embeds}
          bot={isBot}
        />
        <View style={styles.bodyMessage}>
          <MessageSender
            createdAt={item.createdAt}
            sender={sender}
            showAvatar={showAvatar}
            onUserPress={onUserPress}
            embeds={embeds}
            bot={isBot}
          />
          {renderMessageContentType()}
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
                  html={
                    item?.is_scam_detected
                      ? normalizeMessageTextDisable(item.content)
                      : normalizeMessageText(
                          item.content,
                          undefined,
                          undefined,
                          !item.isSending && item.createdAt !== item.updatedAt,
                          isBot
                            ? 'message-text-bot'
                            : item.isSending
                            ? 'message-text-sending'
                            : undefined,
                        )
                  }
                  embeds={embeds}
                  defaultTextProps={
                    !embeds
                      ? undefined
                      : {
                          ellipsizeMode: 'tail',
                          numberOfLines: 5,
                        }
                  }
                  onOpenBrowser={onOpenBrowser}
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
                  parentId={item.message_id}
                />
              )}
              {item?.metadata?.type === 'scam_alert' && (
                <ScamVoting id={item?.metadata?.data?.id} />
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
