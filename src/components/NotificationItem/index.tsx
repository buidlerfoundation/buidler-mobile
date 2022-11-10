import {useNavigation} from '@react-navigation/native';
import {markAsReadNotification} from 'actions/NotificationActions';
import {setCurrentChannel, setCurrentTeam} from 'actions/UserActions';
import AppStyles from 'common/AppStyles';
import ScreenID from 'common/ScreenID';
import AvatarView from 'components/AvatarView';
import ChannelIcon from 'components/ChannelIcon';
import RenderHTML from 'components/RenderHTML';
import Touchable from 'components/Touchable';
import {normalizeMessageTextPlain} from 'helpers/MessageHelper';
import useAppDispatch from 'hook/useAppDispatch';
import useAppSelector from 'hook/useAppSelector';
import useChannelId from 'hook/useChannelId';
import useCommunityId from 'hook/useCommunityId';
import useThemeColor from 'hook/useThemeColor';
import {NotificationData} from 'models';
import React, {memo, useCallback, useMemo} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {notificationFromNow} from 'utils/DateUtils';

type NotificationItemProps = {
  item: NotificationData;
  onLongPress: (item: NotificationData) => void;
};

const NotificationItem = ({item, onLongPress}: NotificationItemProps) => {
  const dispatch = useAppDispatch();
  const communityId = useCommunityId();
  const channelId = useChannelId();
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
        return 'mentioned you in';
      default:
        return 'replied you in';
    }
  }, [item.notification_type]);
  const DestinationNotification = useCallback(() => {
    switch (item.notification_type) {
      case 'post_reply':
      case 'post_mention':
        return (
          <Text
            style={[AppStyles.TextMed15, {color: colors.text, flex: 1}]}
            numberOfLines={1}
            ellipsizeMode="tail">
            [Post]{' '}
            {(item.post?.content || '').replace(
              /(<@)(.*?)(-)(.*?)(>)/gim,
              '@$2',
            )}
          </Text>
        );
      default:
        return (
          <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
            <ChannelIcon
              channel={item.channel}
              emojiSize={15}
              size={15}
              color={colors.text}
            />
            <Text
              style={[AppStyles.TextMed15, {color: colors.text, marginLeft: 5}]}
              numberOfLines={1}
              ellipsizeMode="tail">
              {item.channel?.channel_name}
            </Text>
          </View>
        );
    }
  }, [colors.text, item.channel, item.notification_type, item.post?.content]);
  const onItemPress = useCallback(async () => {
    if (!item.is_read) {
      dispatch(markAsReadNotification(item.notification_id));
    }
    if (communityId !== item.team_id && community) {
      await dispatch(setCurrentTeam(community, item.channel?.channel_id));
    }
    if (item.channel && channelId !== item.channel?.channel_id) {
      await dispatch(setCurrentChannel(item.channel));
    }
    switch (item.notification_type) {
      case 'post_mention':
      case 'post_reply':
        navigation.navigate(ScreenID.PinPostDetailScreen, {
          postId: item.post?.task_id,
        });
        break;
      case 'channel_mention':
        navigation.navigate(ScreenID.ConversationScreen, {
          jumpMessageId: `${item?.message_id}:${Math.random()}`,
        });
        break;
      default:
        break;
    }
  }, [
    channelId,
    community,
    communityId,
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
  return (
    <Touchable
      style={styles.container}
      useReactNative
      onPress={onItemPress}
      onLongPress={handleLongPress}>
      <AvatarView user={item.from_user} style={{marginTop: 3}} size={35} />
      <View style={styles.contentWrap}>
        <View style={styles.userNameWrap}>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[AppStyles.TextSemi15, {color: colors.text, flex: 1}]}>
            {item.from_user?.user_name}
          </Text>
          {!item.is_read && (
            <View
              style={[styles.unReadBadge, {backgroundColor: colors.mention}]}
            />
          )}
        </View>
        <View style={styles.contentActionWrap}>
          <Text
            style={[
              AppStyles.TextMed15,
              {color: colors.subtext, marginRight: 8},
            ]}>
            {contentAction}
          </Text>
          <DestinationNotification />
        </View>
        <RenderHTML
          html={normalizeMessageTextPlain(
            item.content.replace(/(<@)(.*?)(-)(.*?)(>)/gim, '@$2'),
            undefined,
            undefined,
            undefined,
          )}
        />
        {community && (
          <Text
            style={[AppStyles.TextMed13, {color: colors.subtext, marginTop: 5}]}
            numberOfLines={1}
            ellipsizeMode="middle">
            {community.team_display_name} •{' '}
            {notificationFromNow(item.createdAt)}
          </Text>
        )}
      </View>
    </Touchable>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 15,
    paddingBottom: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
  },
  contentWrap: {
    marginLeft: 10,
    flex: 1,
  },
  userNameWrap: {
    flexDirection: 'row',
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
});

export default memo(NotificationItem);
