import React, {useMemo} from 'react';
import {TouchableOpacity} from 'react-native';
import {TouchableOpacity as TouchableOpacity2} from 'react-native-gesture-handler';
import {TouchableOpacityProps} from 'react-native';

interface TouchableProps extends TouchableOpacityProps {
  children: any;
  useReactNative?: boolean;
}

const Touchable = (props: TouchableProps) => {
  const TouchComponent = useMemo(
    () => (props.useReactNative ? TouchableOpacity : TouchableOpacity2),
    [props.useReactNative],
  );
  return (
    <TouchComponent activeOpacity={0.7} delayLongPress={150} {...props}>
      {props.children}
    </TouchComponent>
  );
};

export default Touchable;
