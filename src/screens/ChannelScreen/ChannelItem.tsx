import {setCurrentChannel} from 'actions/UserActions';
import Fonts from 'common/Fonts';
import ScreenID from 'common/ScreenID';
import ChannelIcon from 'components/ChannelIcon';
import Touchable from 'components/Touchable';
import useAppDispatch from 'hook/useAppDispatch';
import useThemeColor from 'hook/useThemeColor';
import {Channel} from 'models';
import React, {memo, useMemo} from 'react';
import {useCallback} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import NavigationServices from 'services/NavigationServices';

type ChannelItemProps = {
  c: Channel;
  isActive: boolean;
  isFirst?: boolean;
};

const ChannelItem = ({isActive, c, isFirst}: ChannelItemProps) => {
  const dispatch = useAppDispatch();
  const {colors} = useThemeColor();

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

  return (
    <View style={[styles.container]}>
      <Touchable
        style={[
          styles.channelItem,
          isActive && {
            backgroundColor: colors.activeBackground,
          },
          isFirst && {marginTop: 5},
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
