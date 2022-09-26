import Fonts from 'common/Fonts';
import ChannelIcon from 'components/ChannelIcon';
import useThemeColor from 'hook/useThemeColor';
import {Channel} from 'models';
import React from 'react';
import {View, StyleSheet, ViewStyle, Text} from 'react-native';

type PinChannelViewProps = {
  channels: Array<Channel>;
  style?: ViewStyle;
};

const PinChannelView = ({channels, style}: PinChannelViewProps) => {
  const {colors} = useThemeColor();
  if (!channels || channels.length === 0) return null;
  return (
    <View style={[styles.container, style]}>
      {channels.map(el => (
        <View
          style={[styles.channelItem, {borderColor: colors.border}]}
          key={el.channel_id}>
          <ChannelIcon
            emojiSize={14}
            size={15}
            channel={el}
            color={colors.lightText}
          />
          <Text style={[styles.channelName, {color: colors.lightText}]}>
            {el.channel_name}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  channelItem: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 5,
    borderWidth: 1,
    marginTop: 10,
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  channelName: {
    fontSize: 14,
    fontFamily: Fonts.SemiBold,
    lineHeight: 22,
    marginLeft: 8,
  },
});

export default PinChannelView;
