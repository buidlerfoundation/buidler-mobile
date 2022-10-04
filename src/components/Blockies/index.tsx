import React from 'react';
import {ViewStyle, View} from 'react-native';
import FastImage from 'react-native-fast-image';

type BlockieProps = {
  blockies?: string;
  size: number;
  style?: ViewStyle;
};

const RNBlockies = ({style, blockies}: BlockieProps) => {
  if (!blockies) return <View style={[style]} />;
  return <FastImage style={style} source={{uri: blockies}} />;
};

export default RNBlockies;
