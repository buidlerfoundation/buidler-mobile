import {setCurrentDirectChannel} from 'actions/UserActions';
import AppStyles from 'common/AppStyles';
import AvatarView from 'components/AvatarView';
import Touchable from 'components/Touchable';
import useAppDispatch from 'hook/useAppDispatch';
import useDirectChannelId from 'hook/useDirectChannelId';
import useDirectUser from 'hook/useDirectUser';
import useThemeColor from 'hook/useThemeColor';
import useUserData from 'hook/useUserData';
import {Channel} from 'models';
import React, {memo, useCallback, useMemo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {runOnJS} from 'react-native-reanimated';

type DirectChannelItemProps = {
  channel: Channel;
  onPressChannel: () => void;
};

const DirectChannelItem = ({
  channel,
  onPressChannel,
}: DirectChannelItemProps) => {
  const dispatch = useAppDispatch();
  const directChannelId = useDirectChannelId();
  const {colors} = useThemeColor();
  const user = useUserData();
  const otherUserId = useMemo(
    () => channel.channel_members.find(el => el !== user.user_id),
    [channel.channel_members, user.user_id],
  );
  const otherUser = useDirectUser(otherUserId);
  const isActive = useMemo(
    () => directChannelId === channel.channel_id,
    [channel.channel_id, directChannelId],
  );
  const isUnseen = useMemo(
    () => !channel.seen && !isActive,
    [channel.seen, isActive],
  );
  const handlePress = useCallback(() => {
    runOnJS(onPressChannel)();
    dispatch(setCurrentDirectChannel(channel));
  }, [channel, dispatch, onPressChannel]);
  return (
    <Touchable
      style={[styles.container, isActive && {backgroundColor: colors.border}]}
      onPress={handlePress}>
      <AvatarView user={otherUser} size={35} />
      <Text
        style={[
          styles.channelName,
          AppStyles.TextSemi15,
          {color: isActive || isUnseen ? colors.text : colors.subtext},
        ]}
        numberOfLines={1}
        ellipsizeMode="tail">
        {otherUser?.user_name}
      </Text>
      {isUnseen && (
        <View style={[styles.unseenBadge, {backgroundColor: colors.mention}]} />
      )}
    </Touchable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 55,
    marginHorizontal: 10,
    borderRadius: 5,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  channelName: {
    flex: 1,
    marginLeft: 15,
  },
  unseenBadge: {
    marginHorizontal: 5,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});

export default memo(DirectChannelItem);
