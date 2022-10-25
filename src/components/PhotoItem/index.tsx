import Touchable from 'components/Touchable';
import React, {memo, useCallback} from 'react';
import {Image, Text, StyleSheet} from 'react-native';
import CameraRoll from '@react-native-camera-roll/camera-roll';
import {seconds2time} from 'helpers/StringHelper';
import AppStyles from 'common/AppStyles';
import useThemeColor from 'hook/useThemeColor';

type PhotoItemProps = {
  item: CameraRoll.PhotoIdentifier;
  onSelect: (item: CameraRoll.PhotoIdentifier) => void;
  index: number;
  imageSize: number;
};

const PhotoItem = ({item, onSelect, index, imageSize}: PhotoItemProps) => {
  const {colors} = useThemeColor();
  const handlePress = useCallback(() => onSelect(item), [item, onSelect]);
  return (
    <Touchable onPress={handlePress} useReactNative>
      <Image
        style={{
          width: imageSize,
          height: imageSize,
          marginHorizontal: (index - 1) % 3 === 0 ? 2 : 0,
        }}
        source={{uri: item.node.image.uri}}
      />
      {item.node.image.playableDuration && (
        <Text
          style={[styles.duration, AppStyles.TextSemi13, {color: colors.text}]}>
          {seconds2time(Math.round(item.node.image.playableDuration))}
        </Text>
      )}
    </Touchable>
  );
};

const styles = StyleSheet.create({
  duration: {
    position: 'absolute',
    bottom: 0,
    right: 4,
    textShadowColor: '#00000080',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
});

export default memo(PhotoItem);
