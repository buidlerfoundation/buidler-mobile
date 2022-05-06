import React from 'react';
import {ViewStyle, Image} from 'react-native';
import makeBlockie from 'ethereum-blockies-base64';

type BlockieProps = {
  blockies: string;
  size: number;
  style?: ViewStyle;
};

const RNBlockies = ({style, blockies}: BlockieProps) => {
  return <Image style={style} source={{uri: makeBlockie(blockies)}} />;
};

export default RNBlockies;
