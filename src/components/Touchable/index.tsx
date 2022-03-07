import React from 'react';
import {TouchableOpacity, TouchableOpacityProps} from 'react-native';

interface TouchableProps extends TouchableOpacityProps {
  children: any;
}

const Touchable = (props: TouchableProps) => {
  return (
    <TouchableOpacity activeOpacity={0.7} {...props}>
      {props.children}
    </TouchableOpacity>
  );
};

export default Touchable;
