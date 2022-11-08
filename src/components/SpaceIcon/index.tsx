import Fonts from 'common/Fonts';
import Emoji from 'components/Emoji';
import {spaceNameToAvatar} from 'helpers/ChannelHelper';
import ImageHelper from 'helpers/ImageHelper';
import useCurrentCommunity from 'hook/useCurrentCommunity';
import {Space} from 'models';
import React, {memo} from 'react';
import {View, StyleSheet, Text, ViewStyle} from 'react-native';
import FastImage from 'react-native-fast-image';

type SpaceIconProps = {
  space: Space;
  size?: number;
  borderRadius?: number;
  fontSize?: number;
  style?: ViewStyle;
};

const SpaceIcon = ({
  space,
  size = 30,
  borderRadius = 8,
  fontSize = 16,
  style,
}: SpaceIconProps) => {
  const currentCommunity = useCurrentCommunity();
  if (space.space_image_url) {
    return (
      <FastImage
        style={[
          {
            width: size,
            height: size,
            borderRadius,
            overflow: 'hidden',
          },
          style,
        ]}
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
    return (
      <Emoji name={space.space_emoji} style={[{fontSize: size - 10}, style]} />
    );
  }
  return (
    <View
      style={[
        styles.spaceDefaultIcon,
        {width: size, height: size, borderRadius},
        style,
      ]}>
      <Text style={[styles.spaceDefaultIconText, {fontSize}]}>
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
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default memo(SpaceIcon);
