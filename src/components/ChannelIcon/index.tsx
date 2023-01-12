import SVG from 'common/SVG';
import Emoji from 'components/Emoji';
import ImageHelper from 'helpers/ImageHelper';
import useCurrentCommunity from 'hook/useCurrentCommunity';
import {Channel} from 'models';
import React, {memo} from 'react';
import {StyleSheet, View} from 'react-native';
import FastImage from 'react-native-fast-image';

type ChannelIconProps = {
  channel: Channel;
  color: string;
  size?: number;
  emojiSize?: number;
  communityId?: string;
};

const ChannelIcon = ({
  channel,
  color,
  size = 20,
  emojiSize = 16,
  communityId,
}: ChannelIconProps) => {
  const currentCommunity = useCurrentCommunity();
  if (channel?.channel_image_url) {
    return (
      <FastImage
        style={[styles.channelIcon, {width: size, height: size}]}
        source={{
          uri: ImageHelper.normalizeImage(
            channel.channel_image_url,
            communityId || currentCommunity.team_id,
          ),
        }}
      />
    );
  }
  if (channel?.channel_emoji) {
    return <Emoji name={channel.channel_emoji} style={{fontSize: emojiSize}} />;
  }
  if (channel?.channel_type === 'Private') {
    return (
      <View style={[styles.channelIcon, {width: size, height: size}]}>
        <SVG.IconPrivate fill={color} />
      </View>
    );
  }
  return <SVG.IconPublicChannel width={size} height={size} fill={color} />;
};

const styles = StyleSheet.create({
  channelIcon: {
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default memo(ChannelIcon);
