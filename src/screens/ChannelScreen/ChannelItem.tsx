import {setCurrentChannel} from 'actions/UserActions';
import Fonts from 'common/Fonts';
import ScreenID from 'common/ScreenID';
import ChannelIcon from 'components/ChannelIcon';
import Touchable from 'components/Touchable';
import useAppDispatch from 'hook/useAppDispatch';
import useChannel from 'hook/useChannel';
import useThemeColor from 'hook/useThemeColor';
import React, {memo, useMemo} from 'react';
import {useCallback} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import NavigationServices from 'services/NavigationServices';

type ChannelItemProps = {
  channelId: string;
  isActive: boolean;
  isLast: boolean;
  isCollapsed?: boolean;
};

const ChannelItem = ({
  channelId,
  isActive,
  isLast,
  isCollapsed,
}: ChannelItemProps) => {
  const dispatch = useAppDispatch();
  const {colors} = useThemeColor();
  const channel = useChannel();
  const c = useMemo(
    () => channel.find(el => el.channel_id === channelId),
    [channel, channelId],
  );

  const handlePress = useCallback(() => {
    dispatch(setCurrentChannel(c));
    NavigationServices.pushToScreen(ScreenID.ConversationScreen);
  }, [c, dispatch]);
  const isUnSeen = useMemo(() => !c?.seen, [c?.seen]);
  const isMuted = useMemo(
    () => c?.notification_type === 'Muted',
    [c?.notification_type],
  );
  const titleColor = useMemo(() => {
    if (isActive) return colors.text;
    if (isMuted) return colors.activeBackground;
    if (isUnSeen) return colors.text;
    return colors.subtext;
  }, [
    colors.activeBackground,
    colors.subtext,
    colors.text,
    isActive,
    isMuted,
    isUnSeen,
  ]);
  const hide = useMemo(
    () => isCollapsed && !isActive && !isUnSeen,
    [isActive, isCollapsed, isUnSeen],
  );

  if (hide) {
    return (
      <View
        style={[
          styles.container,
          {backgroundColor: colors.background},
          isLast && {
            borderBottomLeftRadius: 5,
            borderBottomRightRadius: 5,
            height: 10,
          },
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.container,
        {backgroundColor: colors.background},
        isLast && {
          borderBottomLeftRadius: 5,
          borderBottomRightRadius: 5,
          paddingBottom: 10,
        },
      ]}>
      <Touchable
        style={[
          styles.channelItem,
          isActive && {
            backgroundColor: colors.activeBackground,
          },
        ]}
        onPress={handlePress}>
        <ChannelIcon channel={c} color={titleColor} />
        <Text
          style={[
            styles.channelName,
            {
              color: titleColor,
            },
          ]}
          ellipsizeMode="tail"
          numberOfLines={1}>
          {c.channel_name}
        </Text>
      </Touchable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    marginHorizontal: 10,
  },
  channelItem: {
    paddingHorizontal: 10,
    flexDirection: 'row',
    height: 40,
    alignItems: 'center',
    borderRadius: 5,
  },
  channelName: {
    fontFamily: Fonts.SemiBold,
    fontSize: 16,
    lineHeight: 20,
    marginHorizontal: 10,
  },
});

export default memo(ChannelItem);
