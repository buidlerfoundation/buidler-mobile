import SVG from 'common/SVG';
import ImageHelper from 'helpers/ImageHelper';
import useCurrentCommunity from 'hook/useCurrentCommunity';
import {Channel} from 'models';
import React, {memo} from 'react';
import {StyleSheet, View} from 'react-native';
import Emoji from 'react-native-emoji';
import FastImage from 'react-native-fast-image';

type ChannelIconProps = {
  channel: Channel;
  color: string;
};

const ChannelIcon = ({channel, color}: ChannelIconProps) => {
  const currentCommunity = useCurrentCommunity();
  if (channel?.channel_image_url) {
    return (
      <FastImage
        style={styles.channelIcon}
        source={{
          uri: ImageHelper.normalizeImage(
            channel.channel_image_url,
            currentCommunity.team_id,
          ),
        }}
      />
    );
  }
  if (channel?.channel_emoji) {
    return <Emoji name={channel.channel_emoji} style={{fontSize: 16}} />;
  }
  if (channel.channel_type === 'Private') {
    return (
      <View style={styles.channelIcon}>
        <SVG.IconPrivate fill={color} />
      </View>
    );
  }
  return <SVG.IconPublicChannel fill={color} />;
};

const styles = StyleSheet.create({
  channelIcon: {
    width: 20,
    height: 20,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default memo(ChannelIcon);
