import {useNavigation} from '@react-navigation/native';
import {markAsReadNotification} from 'actions/NotificationActions';
import {
  setCurrentChannel,
  setCurrentDirectChannel,
  setCurrentTeam,
} from 'actions/UserActions';
import AppStyles from 'common/AppStyles';
import ScreenID, {StackID} from 'common/ScreenID';
import SVG from 'common/SVG';
import AvatarView from 'components/AvatarView';
import ChannelIcon from 'components/ChannelIcon';
import CommunityLogo from 'components/CommunityLogo';
import Touchable from 'components/Touchable';
import useAppDispatch from 'hook/useAppDispatch';
import useAppSelector from 'hook/useAppSelector';
import useChannelId from 'hook/useChannelId';
import useCommunityId from 'hook/useCommunityId';
import useDirectChannelId from 'hook/useDirectChannelId';
import useThemeColor from 'hook/useThemeColor';
import {NotificationData} from 'models';
import React, {memo, useCallback, useMemo} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {notificationFromNow} from 'utils/DateUtils';
import SocketUtils from 'utils/SocketUtils';

type NotificationItemProps = {
  item: NotificationData;
  onLongPress: (item: NotificationData) => void;
};

const NotificationItem = ({item, onLongPress}: NotificationItemProps) => {
  const dispatch = useAppDispatch();
  const communityId = useCommunityId();
  const channelId = useChannelId();
  const directChannelId = useDirectChannelId();
  const navigation = useNavigation();
  const {colors} = useThemeColor();
  const communities = useAppSelector(state => state.user.team);
  const community = useMemo(
    () => communities?.find(el => el.team_id === item.team_id),
    [communities, item.team_id],
  );
  const contentAction = useMemo(() => {
    switch (item.notification_type) {
      case 'channel_mention':
      case 'post_mention':
        return 'Mentioned you';
      case 'post_reply':
        return 'Replied your post';
      case 'channel_reply':
        return 'Replied your message';
      default:
        return 'Mentioned you';
    }
  }, [item.notification_type]);
  const DestinationNotification = useCallback(() => {
    switch (item.notification_type) {
      case 'post_reply':
      case 'post_mention':
        return (
          <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
            <SVG.IconNotificationPin fill={colorByState} />
            <Text
              style={[
                AppStyles.TextMed15,
                {color: colorByState, marginLeft: 5, flex: 1},
              ]}
              numberOfLines={1}
              ellipsizeMode="tail">
              {(item.post?.content || '').replace(
                /(<@)(.*?)(-)(.*?)(>)/gim,
                '@$2',
              )}
            </Text>
          </View>
        );
      default:
        return (
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <ChannelIcon
              channel={item.channel}
              emojiSize={15}
              size={15}
              color={colorByState}
            />
            <Text
              style={[
                AppStyles.TextMed15,
                {color: colorByState, marginLeft: 5},
              ]}
              numberOfLines={1}
              ellipsizeMode="tail">
              {item.channel?.channel_name}
            </Text>
          </View>
        );
    }
  }, [colorByState, item.channel, item.notification_type, item.post?.content]);
  const onItemPress = useCallback(async () => {
    if (!item.is_read) {
      if (item.post?.task_id) {
        SocketUtils.emitSeenPost(item.post?.task_id);
      }
      dispatch(markAsReadNotification(item.notification_id));
    }
    if (communityId !== item.team_id && community) {
      await dispatch(setCurrentTeam(community, item.channel?.channel_id));
    }
    if (item.channel) {
      if (item.channel?.channel_type === 'Direct') {
        if (item.channel?.channel_id !== directChannelId) {
          await dispatch(setCurrentDirectChannel(item.channel));
        }
      } else {
        if (item.channel?.channel_id !== channelId) {
          await dispatch(setCurrentChannel(item.channel));
        }
      }
    }
    switch (item.notification_type) {
      case 'post_mention':
      case 'post_reply':
        navigation.navigate(ScreenID.PinPostDetailScreen, {
          postId: item.post?.task_id,
          messageId: item?.message_id,
        });
        break;
      case 'channel_mention':
        if (item.channel?.channel_type === 'Direct') {
          navigation.navigate(StackID.DirectMessageStack, {
            jumpMessageId: `${item?.message_id}:${Math.random()}`,
            child: ScreenID.DirectMessageScreen,
          });
        } else {
          navigation.navigate(ScreenID.ConversationScreen, {
            jumpMessageId: `${item?.message_id}:${Math.random()}`,
          });
        }
        break;
      default:
        break;
    }
  }, [
    channelId,
    community,
    communityId,
    directChannelId,
    dispatch,
    item.channel,
    item.is_read,
    item?.message_id,
    item.notification_id,
    item.notification_type,
    item.post?.task_id,
    item.team_id,
    navigation,
  ]);
  const handleLongPress = useCallback(() => {
    onLongPress(item);
  }, [item, onLongPress]);
  const colorByState = useMemo(
    () => (item.is_read ? colors.subtext : colors.text),
    [colors.subtext, colors.text, item.is_read],
  );
  const IconNotification = useCallback(() => {
    switch (item.notification_type) {
      case 'post_reply':
      case 'channel_reply':
        return <SVG.IconNotificationReply fill={colorByState} />;
      default:
        return <SVG.IconNotificationMention fill={colorByState} />;
    }
  }, [colorByState, item.notification_type]);
  return (
    <Touchable
      style={styles.container}
      useReactNative
      onPress={onItemPress}
      onLongPress={handleLongPress}>
      <View>
        <IconNotification />
        {!item.is_read && (
          <View
            style={[
              styles.unReadBadgeWrap,
              {backgroundColor: colors.background},
            ]}>
            <View
              style={[styles.unReadBadge, {backgroundColor: colors.mention}]}
            />
          </View>
        )}
      </View>
      <View style={styles.contentWrap}>
        <View style={styles.userNameWrap}>
          <AvatarView user={item.from_user} size={20} />
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[
              AppStyles.TextSemi15,
              {color: colors.text, marginLeft: 10},
            ]}>
            {item.from_user?.user_name}
          </Text>
          <Text
            style={[AppStyles.TextMed13, {color: colorByState, marginLeft: 8}]}>
            {notificationFromNow(item.createdAt)}
          </Text>
        </View>
        <View style={styles.contentActionWrap}>
          <Text
            style={[
              AppStyles.TextMed15,
              {color: colorByState, marginRight: 8},
            ]}>
            {contentAction}
          </Text>
          <View
            style={{
              alignSelf: 'flex-start',
              flexDirection: 'row',
              flex: 1,
              paddingRight: 10,
            }}>
            <Text style={[AppStyles.TextMed15, {color: colorByState}]}>"</Text>
            <Text
              style={[AppStyles.TextMed15, {color: colorByState}]}
              numberOfLines={1}
              ellipsizeMode="tail">
              {item.content.replace(/(<@)(.*?)(-)(.*?)(>)/gim, '@$2')}
            </Text>
            <Text style={[AppStyles.TextMed15, {color: colorByState}]}>"</Text>
          </View>
        </View>
        <View style={styles.contentDestinationWrap}>
          <DestinationNotification />
          {community && (
            <>
              <Text
                style={[
                  AppStyles.TextMed15,
                  {color: colorByState, marginHorizontal: 10},
                ]}>
                •
              </Text>
              <CommunityLogo community={community} size={15} borderRadius={4} />
              <Text
                style={[
                  AppStyles.TextMed15,
                  {color: colorByState, marginLeft: 8},
                ]}>
                {community.team_display_name}
              </Text>
            </>
          )}
        </View>
      </View>
    </Touchable>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
  },
  contentWrap: {
    marginLeft: 12,
    flex: 1,
  },
  userNameWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unReadBadgeWrap: {
    position: 'absolute',
    top: -1,
    right: -1,
    width: 12,
    height: 12,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unReadBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  contentActionWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  contentDestinationWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
});

export default memo(NotificationItem);
