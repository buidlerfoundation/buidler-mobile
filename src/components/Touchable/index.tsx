import React from 'react';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {TouchableOpacityProps} from 'react-native';

interface TouchableProps extends TouchableOpacityProps {
  children: any;
}

const Touchable = (props: TouchableProps) => {
  return (
    <TouchableOpacity activeOpacity={0.7} delayLongPress={150} {...props}>
      {props.children}
    </TouchableOpacity>
  );
};

export default Touchable;
