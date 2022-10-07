import Fonts from 'common/Fonts';
import ChannelIcon from 'components/ChannelIcon';
import useCurrentChannel from 'hook/useCurrentChannel';
import useThemeColor from 'hook/useThemeColor';
import React, {memo} from 'react';
import {StyleSheet, Text, View} from 'react-native';

const ChannelTitle = () => {
  const {colors} = useThemeColor();
  const currentChannel = useCurrentChannel();
  return (
    <View style={styles.titleWrap}>
      <ChannelIcon channel={currentChannel} color={colors.text} />
      <Text
        style={[styles.title, {color: colors.text}]}
        ellipsizeMode="tail"
        numberOfLines={1}>
        {currentChannel.channel_name}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  titleWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
  title: {
    fontFamily: Fonts.Bold,
    fontSize: 17,
    lineHeight: 26,
    marginHorizontal: 5,
    flex: 1,
  },
});

export default memo(ChannelTitle);
