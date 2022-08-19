import {setCurrentChannel} from 'actions/UserActions';
import Fonts from 'common/Fonts';
import ScreenID from 'common/ScreenID';
import SVG from 'common/SVG';
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
};

const ChannelItem = ({channelId, isActive, isLast}: ChannelItemProps) => {
  const dispatch = useAppDispatch();
  const {colors} = useThemeColor();
  const channel = useChannel();
  const c = useMemo(
    () => channel.find(el => el.channel_id === channelId),
    [channel, channelId],
  );
  const handlePress = useCallback(() => {
    NavigationServices.pushToScreen(ScreenID.ConversationScreen);
    dispatch(setCurrentChannel(c));
  }, [c, dispatch]);
  const handleLongPress = useCallback(() => {
    dispatch(setCurrentChannel(c));
    NavigationServices.pushToScreen(ScreenID.TaskScreen);
  }, [c, dispatch]);
  return (
    <View
      style={[
        styles.container,
        {backgroundColor: colors.background},
        isLast && {borderBottomLeftRadius: 5, borderBottomRightRadius: 5},
      ]}>
      <Touchable
        style={[
          styles.channelItem,
          isActive && {
            backgroundColor: colors.activeBackground,
          },
        ]}
        onPress={handlePress}
        onLongPress={handleLongPress}>
        <Text
          style={[
            styles.channelName,
            {
              color: isActive || !c.seen ? colors.text : colors.subtext,
            },
          ]}>
          {c.channel_type === 'Private' ? (
            <SVG.IconPrivate
              fill={isActive || !c.seen ? colors.text : colors.subtext}
            />
          ) : (
            '#'
          )}{' '}
          {c.channel_name}
        </Text>
      </Touchable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingBottom: 10,
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
    lineHeight: 19,
  },
});

export default memo(ChannelItem);
