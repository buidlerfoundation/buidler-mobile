import AppDimension from 'common/AppDimension';
import Fonts from 'common/Fonts';
import useCurrentChannel from 'hook/useCurrentChannel';
import useThemeColor from 'hook/useThemeColor';
import React, {memo} from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';

const PinPostScreen = () => {
  const currentChannel = useCurrentChannel();
  const {colors} = useThemeColor();
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, {color: colors.text}]}>
          {currentChannel.channel_type === 'Private' ? (
            <Image source={require('assets/images/ic_private.png')} />
          ) : (
            '#'
          )}{' '}
          {currentChannel.channel_name}
        </Text>
      </View>
      <View style={styles.body}>
        <Text>Body</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: AppDimension.extraTop,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 14,
  },
  title: {
    fontFamily: Fonts.Bold,
    fontSize: 16,
    lineHeight: 19,
    marginLeft: 10,
  },
  body: {
    flex: 1,
  },
});
export default memo(PinPostScreen);
