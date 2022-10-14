import {useNavigation} from '@react-navigation/native';
import {addReact, removeReact} from 'actions/ReactActions';
import AppStyles from 'common/AppStyles';
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
import useAppDispatch from 'hook/useAppDispatch';
import useAppSelector from 'hook/useAppSelector';
import useCurrentCommunity from 'hook/useCurrentCommunity';
import useTeamUserData from 'hook/useTeamUserData';
import useThemeColor from 'hook/useThemeColor';
import useUserData from 'hook/useUserData';
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
          <Text style={[AppStyles.TextSemi13, {color: colors.lightText}]}>
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
  const dispatch = useAppDispatch();
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
  const userData = useUserData();
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
  const handleReactPress = useCallback(
    (reactName: string) => {
      const isExisted = !!reacts?.find(
        (react: any) => react.reactName === reactName && react?.isReacted,
      );
      if (isExisted) {
        dispatch(removeReact(pinPost.task_id, reactName, userData?.user_id));
      } else {
        dispatch(addReact(pinPost.task_id, reactName, userData?.user_id));
      }
    },
    [dispatch, pinPost.task_id, reacts, userData?.user_id],
  );
  if (!creator) return null;
  return (
    <Touchable
      style={[styles.container, style]}
      onPress={onPinPostPress}
      disabled={detail}
      onLongPress={handleLongPress}
      useWithoutFeedBack>
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
            style={[
              styles.userName,
              AppStyles.TextSemi15,
              {color: colors.text},
            ]}
            ellipsizeMode="tail"
            numberOfLines={1}>
            {creator.user_name}
          </Text>
          {embeds && (
            <Text style={[AppStyles.TextMed11, {color: colors.subtext}]}>
              {messageFromNow(pinPost.message_created_at)}
            </Text>
          )}
          {!embeds && (
            <View style={styles.createdAtWrap}>
              <Text
                style={[
                  AppStyles.TextMed11,
                  {color: colors.subtext, lineHeight: 18},
                ]}>
                {messageFromNow(pinPost.message_created_at)}
              </Text>
              {isIPFS && detail && (
                <View style={styles.ipfsWrap}>
                  <SVG.IconIPFSLock fill={colors.mention} />
                  <Text style={[AppStyles.TextMed15, {color: colors.mention}]}>
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
            <Text style={[AppStyles.TextMed15, {color: colors.subtext}]}>
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
      <ReactView
        style={styles.attachmentWrap}
        reacts={reacts}
        onReactPress={handleReactPress}
      />
      {pinPost.total_messages > 0 && (
        <View style={styles.replyWrap}>
          <View style={styles.rowReply}>
            <SVG.IconPinReply fill={colors.lightText} />
            <Text
              style={[
                styles.totalMessage,
                AppStyles.TextSemi13,
                {color: colors.lightText},
              ]}>
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
            <Text style={[AppStyles.TextSemi13, {color: colors.subtext}]}>
              Last reply{' '}
              {lastReplyFromNow(pinPost.latest_reply_message_at).toLowerCase()}
            </Text>
          </View>
        </View>
      )}
      {embeds && (
        <Text
          style={[
            styles.viewPost,
            AppStyles.TextSemi15,
            {color: colors.mention},
          ]}>
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
  },
  content: {
    marginTop: 8,
  },
  attachmentWrap: {
    marginTop: 5,
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
  avatarWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
  },
  viewPost: {
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
  },
});

export default memo(PinPostItem);
