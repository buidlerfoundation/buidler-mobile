import Fonts from 'common/Fonts';
import Emoji from 'components/Emoji';
import {spaceNameToAvatar} from 'helpers/ChannelHelper';
import ImageHelper from 'helpers/ImageHelper';
import useCurrentCommunity from 'hook/useCurrentCommunity';
import {Space} from 'models';
import React, {memo} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import FastImage from 'react-native-fast-image';

type SpaceIconProps = {
  space: Space;
  size?: number;
  borderRadius?: number;
};

const SpaceIcon = ({space, size = 30, borderRadius = 8}: SpaceIconProps) => {
  const currentCommunity = useCurrentCommunity();
  if (space.space_image_url) {
    return (
      <FastImage
        style={{
          width: size,
          height: size,
          borderRadius,
          overflow: 'hidden',
        }}
        source={{
          uri: ImageHelper.normalizeImage(
            space.space_image_url,
            currentCommunity.team_id,
          ),
        }}
      />
    );
  }
  if (space.space_emoji) {
    return <Emoji name={space.space_emoji} style={{fontSize: size - 10}} />;
  }
  return (
    <View
      style={[
        styles.spaceDefaultIcon,
        {width: size, height: size, borderRadius},
      ]}>
      <Text style={[styles.spaceDefaultIconText]}>
        {spaceNameToAvatar(space.space_name)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  spaceDefaultIcon: {
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spaceDefaultIconText: {
    color: 'white',
    fontFamily: Fonts.Helvetica,
    fontSize: 16,
    textAlign: 'center',
  },
});

export default memo(SpaceIcon);
