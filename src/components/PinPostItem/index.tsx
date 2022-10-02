import {useNavigation} from '@react-navigation/native';
import Fonts from 'common/Fonts';
import ScreenID from 'common/ScreenID';
import SVG from 'common/SVG';
import AvatarView from 'components/AvatarView';
import MessagePhoto from 'components/MessagePhoto';
import PinChannelView from 'components/PinChannelView';
import ReactView from 'components/ReactView';
import RenderHTML from 'components/RenderHTML';
import Touchable from 'components/Touchable';
import {
  normalizeMessageText,
  normalizeMessageTextPlain,
  normalizeUserName,
} from 'helpers/MessageHelper';
import useAppSelector from 'hook/useAppSelector';
import useCurrentCommunity from 'hook/useCurrentCommunity';
import useTeamUserData from 'hook/useTeamUserData';
import useThemeColor from 'hook/useThemeColor';
import {TaskData, UserData} from 'models';
import numeral from 'numeral';
import React, {memo, useCallback, useMemo, useRef, useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  ViewStyle,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import {lastReplyFromNow, messageFromNow} from 'utils/DateUtils';

type UserReplyProps = {
  data?: Array<UserData | undefined>;
  totalSender?: string;
};

const UserReply = ({data, totalSender}: UserReplyProps) => {
  const {colors} = useThemeColor();
  const moreCount = useMemo(
    () => (totalSender ? parseInt(totalSender || '') - (data?.length || 0) : 0),
    [data?.length, totalSender],
  );
  return (
    <View style={styles.rowReply}>
      {data
        ?.filter(el => !!el)
        ?.map((el, index) => {
          return (
            <View
              style={[
                styles.avatarWrap,
                {
                  borderColor: colors.backgroundLight,
                  marginLeft: index === 0 ? 0 : -8,
                },
              ]}
              key={el.user_id}>
              <AvatarView user={el} size={20} withStatus={false} />
            </View>
          );
        })}
      {moreCount > 0 && (
        <View
          style={[
            styles.moreCountWrap,
            {
              backgroundColor: colors.activeBackgroundLight,
              borderColor: colors.backgroundLight,
            },
          ]}>
          <Text style={[styles.moreText, {color: colors.lightText}]}>
            +{numeral(moreCount).format('0,0')}
          </Text>
        </View>
      )}
    </View>
  );
};

type PinPostItemProps = {
  pinPost: TaskData;
  embeds?: boolean;
  style?: ViewStyle;
  detail?: boolean;
  onLongPress?: () => void;
};

const PinPostItem = ({
  pinPost,
  embeds,
  detail,
  style,
  onLongPress,
}: PinPostItemProps) => {
  const contentRef = useRef();
  const navigation = useNavigation();
  const {width} = useWindowDimensions();
  const [isMore, setIsMore] = useState(false);
  const community = useCurrentCommunity();
  const teamUserData = useTeamUserData();
  const reactData = useAppSelector(state => state.reactReducer.reactData);
  const reacts = useMemo(
    () => reactData[pinPost.task_id] || [],
    [pinPost.task_id, reactData],
  );
  const {colors} = useThemeColor();
  const isArchived = useMemo(
    () => pinPost.status === 'archived',
    [pinPost.status],
  );
  const creator = useMemo(
    () => teamUserData.find(el => el.user_id === pinPost.message_sender_id),
    [pinPost.message_sender_id, teamUserData],
  );
  const isIPFS = useMemo(() => !!pinPost.cid, [pinPost.cid]);
  const isUploadingToIPFS = useMemo(
    () => !!pinPost.uploadingIPFS,
    [pinPost.uploadingIPFS],
  );
  const onContentLayout = useCallback(() => {
    contentRef.current.measure((ox, oy, w, h) => {
      setIsMore(h > 130);
    });
  }, []);
  const onPinPostPress = useCallback(() => {
    navigation.navigate(ScreenID.PinPostDetailScreen, {
      postId: pinPost.task_id,
    });
  }, [navigation, pinPost.task_id]);
  const handleLongPress = useCallback(
    () => onLongPress?.(pinPost),
    [onLongPress, pinPost],
  );
  if (!creator) return null;
  return (
    <Touchable
      style={[styles.container, style]}
      onPress={onPinPostPress}
      disabled={detail}
      onLongPress={handleLongPress}>
      <View style={[styles.header, embeds && {alignItems: 'flex-start'}]}>
        <AvatarView
          user={creator}
          size={detail ? 35 : embeds ? 25 : 20}
          style={{marginTop: embeds ? 4 : 0}}
        />
        <View
          style={[
            styles.userNameWrap,
            (detail || embeds) && styles.userNameDetailWrap,
          ]}>
          <Text
            style={[styles.userName, {color: colors.text}]}
            ellipsizeMode="tail"
            numberOfLines={1}>
            {creator.user_name}
          </Text>
          {embeds && (
            <Text style={[styles.createdAt, {color: colors.subtext}]}>
              {messageFromNow(pinPost.message_created_at)}
            </Text>
          )}
          {!embeds && (
            <View style={styles.createdAtWrap}>
              <Text style={[styles.createdAt, {color: colors.subtext}]}>
                {messageFromNow(pinPost.message_created_at)}
              </Text>
              {isIPFS && detail && (
                <View style={styles.ipfsWrap}>
                  <SVG.IconIPFSLock fill={colors.mention} />
                  <Text style={[styles.cidText, {color: colors.mention}]}>
                    {normalizeUserName(pinPost.cid, 4)}
                  </Text>
                </View>
              )}
              {isUploadingToIPFS && detail && (
                <View style={styles.ipfsWrap}>
                  <ActivityIndicator size="small" color={colors.mention} />
                </View>
              )}
            </View>
          )}
        </View>
        {isIPFS && !detail && (
          <View style={{marginTop: embeds ? 4 : 0}}>
            <SVG.IconIPFSLock fill={colors.mention} />
          </View>
        )}
        {isUploadingToIPFS && !detail && (
          <ActivityIndicator size="small" color={colors.mention} />
        )}
      </View>
      {!!pinPost.content && (
        <View
          ref={contentRef}
          style={styles.content}
          onLayout={onContentLayout}>
          <RenderHTML
            html={
              detail
                ? normalizeMessageText(
                    pinPost.content,
                    undefined,
                    undefined,
                    undefined,
                    isArchived ? 'message-text-archived' : undefined,
                  )
                : normalizeMessageTextPlain(
                    pinPost.content,
                    undefined,
                    undefined,
                    undefined,
                    isArchived,
                  )
            }
            defaultTextProps={
              detail
                ? undefined
                : {
                    ellipsizeMode: 'tail',
                    numberOfLines: 5,
                  }
            }
          />
          {isMore && !detail && (
            <Text style={[styles.viewMore, {color: colors.subtext}]}>
              View more
            </Text>
          )}
        </View>
      )}
      <MessagePhoto
        style={styles.attachmentWrap}
        attachments={pinPost.task_attachments}
        teamId={community.team_id}
        imageWidth={embeds ? (width - 132) / 2 : (width - 50) / 2}
        stack={!detail}
      />
      {!embeds && (
        <PinChannelView
          channels={pinPost.channels}
          style={styles.attachmentWrap}
        />
      )}
      <ReactView style={styles.attachmentWrap} reacts={reacts} />
      {pinPost.total_messages > 0 && (
        <View style={styles.replyWrap}>
          <View style={styles.rowReply}>
            <SVG.IconPinReply fill={colors.lightText} />
            <Text style={[styles.totalMessage, {color: colors.lightText}]}>
              {numeral(pinPost.total_messages).format('0,0')}
            </Text>
          </View>
          <UserReply
            data={pinPost.latest_reply_senders?.map(el =>
              teamUserData.find(u => u.user_id === el),
            )}
            totalSender={pinPost.total_reply_sender}
          />
          <View style={styles.rowReply}>
            <Text style={[styles.lastReply, {color: colors.subtext}]}>
              Last reply{' '}
              {lastReplyFromNow(pinPost.latest_reply_message_at).toLowerCase()}
            </Text>
          </View>
        </View>
      )}
      {embeds && (
        <Text style={[styles.viewPost, {color: colors.mention}]}>
          View post
        </Text>
      )}
    </Touchable>
  );
};

const styles = StyleSheet.create({
  container: {paddingHorizontal: 20},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userNameWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginHorizontal: 10,
    flex: 1,
  },
  userNameDetailWrap: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  userName: {
    marginRight: 8,
    fontFamily: Fonts.Bold,
    fontSize: 16,
    lineHeight: 26,
  },
  createdAt: {
    fontSize: 12,
    lineHeight: 22,
    fontFamily: Fonts.Medium,
  },
  content: {
    marginTop: 8,
  },
  attachmentWrap: {
    marginTop: 5,
  },
  viewMore: {
    fontSize: 16,
    lineHeight: 26,
    fontFamily: Fonts.SemiBold,
  },
  replyWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  rowReply: {
    marginTop: 15,
    alignItems: 'center',
    flexDirection: 'row',
    marginRight: 15,
  },
  totalMessage: {
    marginLeft: 2,
    fontFamily: Fonts.SemiBold,
    fontSize: 14,
    lineHeight: 22,
  },
  lastReply: {
    fontFamily: Fonts.Medium,
    fontSize: 14,
    lineHeight: 22,
  },
  moreCountWrap: {
    paddingHorizontal: 5,
    height: 22,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 11,
    borderWidth: 1,
    marginLeft: -8,
  },
  moreText: {
    fontFamily: Fonts.Medium,
    fontSize: 14,
  },
  avatarWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
  },
  viewPost: {
    fontFamily: Fonts.SemiBold,
    fontSize: 16,
    lineHeight: 26,
    marginTop: 15,
  },
  createdAtWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ipfsWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  cidText: {
    textDecorationLine: 'underline',
    marginLeft: 5,
    fontFamily: Fonts.Medium,
    fontSize: 14,
    lineHeight: 22,
  },
});

export default memo(PinPostItem);
