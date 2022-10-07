import React, {useMemo} from 'react';
import {TouchableOpacity, TouchableWithoutFeedback} from 'react-native';
import {TouchableOpacity as TouchableOpacity2} from 'react-native-gesture-handler';
import {TouchableOpacityProps, View} from 'react-native';

interface TouchableProps extends TouchableOpacityProps {
  children: any;
  useReactNative?: boolean;
  useWithoutFeedBack?: boolean;
}

const Touchable = (props: TouchableProps) => {
  const TouchComponent = useMemo(
    () => (props.useReactNative ? TouchableOpacity : TouchableOpacity2),
    [props.useReactNative],
  );
  if (props.useWithoutFeedBack) {
    return (
      <TouchableWithoutFeedback
        delayLongPress={150}
        {...props}
        style={undefined}>
        <View style={props.style}>{props.children}</View>
      </TouchableWithoutFeedback>
    );
  }
  return (
    <TouchComponent activeOpacity={0.7} delayLongPress={150} {...props}>
      {props.children}
    </TouchComponent>
  );
};

export default Touchable;
