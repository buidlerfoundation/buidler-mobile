import Fonts from 'common/Fonts';
import SVG from 'common/SVG';
import AvatarView from 'components/AvatarView';
import PinChannelView from 'components/PinChannelView';
import ReactView from 'components/ReactView';
import RenderHTML from 'components/RenderHTML';
import Touchable from 'components/Touchable';
import {normalizeMessageTextPlain} from 'helpers/MessageHelper';
import useAppSelector from 'hook/useAppSelector';
import useCurrentCommunity from 'hook/useCurrentCommunity';
import useTeamUserData from 'hook/useTeamUserData';
import useThemeColor from 'hook/useThemeColor';
import {TaskData, UserData} from 'models';
import numeral from 'numeral';
import React, {memo, useCallback, useMemo, useRef, useState} from 'react';
import {StyleSheet, View, Text} from 'react-native';
import MessagePhoto from 'screens/ConversationScreen/MessagePhoto';
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

type PinPostItemProps = {pinPost: TaskData};

const PinPostItem = ({pinPost}: PinPostItemProps) => {
  const contentRef = useRef();
  const [isMore, setIsMore] = useState(false);
  const community = useCurrentCommunity();
  const teamUserData = useTeamUserData();
  const reactData = useAppSelector(state => state.reactReducer.reactData);
  // const userData = useAppSelector(
  //   state =>
  //     teamUserData.find(el => el.user_id === state.user.userData.user_id) ||
  //     state.user.userData,
  // );
  const reacts = useMemo(
    () => reactData[pinPost.task_id] || [],
    [pinPost.task_id, reactData],
  );
  const {colors} = useThemeColor();
  const creator = useMemo(
    () => teamUserData.find(el => el.user_id === pinPost.message_sender_id),
    [pinPost.message_sender_id, teamUserData],
  );
  const isIPFS = useMemo(() => !!pinPost.cid, [pinPost.cid]);
  const onContentLayout = useCallback(() => {
    contentRef.current.measure((ox, oy, w, h) => {
      setIsMore(h > 130);
    });
  }, []);
  const onPinPostPress = useCallback(() => {}, []);
  if (!creator) return null;
  return (
    <Touchable style={styles.container} onPress={onPinPostPress}>
      <View style={styles.header}>
        <AvatarView user={creator} size={20} />
        <View style={styles.userNameWrap}>
          <Text
            style={[styles.userName, {color: colors.text}]}
            ellipsizeMode="tail"
            numberOfLines={1}>
            {creator.user_name}
          </Text>
          <Text style={[styles.createdAt, {color: colors.subtext}]}>
            {messageFromNow(pinPost.message_created_at)}
          </Text>
        </View>
        {isIPFS && <SVG.IconIPFSLock fill={colors.mention} />}
      </View>
      {!!pinPost.content && (
        <View
          ref={contentRef}
          style={styles.content}
          onLayout={onContentLayout}>
          <RenderHTML
            html={normalizeMessageTextPlain(pinPost.content)}
            pinPostItem
          />
          {isMore && (
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
      />
      <PinChannelView
        channels={pinPost.channels}
        style={styles.attachmentWrap}
      />
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
  },
  userName: {
    marginRight: 8,
    fontFamily: Fonts.Bold,
    fontSize: 16,
    lineHeight: 26,
  },
  createdAt: {
    fontSize: 12,
    lineHeight: 20,
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
});

export default memo(PinPostItem);
