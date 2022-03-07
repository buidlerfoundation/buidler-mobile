import React, {useEffect, useState} from 'react';
import {
  Animated,
  Keyboard,
  Platform,
  TouchableWithoutFeedback,
  ViewStyle,
} from 'react-native';
import {connect} from 'react-redux';

type KeyboardLayoutProps = {
  children: any;
  onKeyboardShow?: (e: any) => void;
  onKeyboardHide?: () => void;
  extraPaddingBottom?: number;
  onOutSidePress?: () => void;
  containerStyle?: ViewStyle;
  tapOutSide?: boolean;
  activeAndroid?: boolean;
  realHeight: number;
};

const KeyboardLayout = ({
  children,
  onKeyboardShow = () => {},
  onKeyboardHide = () => {},
  extraPaddingBottom = 0,
  onOutSidePress = () => {},
  containerStyle = {},
  tapOutSide = false,
  activeAndroid = false,
  realHeight,
}: KeyboardLayoutProps) => {
  const [padding, setPadding] = useState(new Animated.Value(0));
  useEffect(() => {
    const show = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hide = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const keyboardDidShowListener = Keyboard.addListener(show, e =>
      keyboardDidShow(e),
    );
    const keyboardDidHideListener = Keyboard.addListener(hide, e =>
      keyboardDidHide(),
    );
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const keyboardDidShow = (e: any) => {
    let value =
      Platform.OS === 'ios' ? e.endCoordinates.height + extraPaddingBottom : 0;
    if (Platform.OS === 'android' && activeAndroid) {
      value = realHeight - e.endCoordinates.screenY;
    }
    runAnimation(value);
    onKeyboardShow(e);
  };

  const keyboardDidHide = () => {
    runAnimation(0);
    onKeyboardHide();
  };

  const runAnimation = (value: number) => {
    Animated.spring(padding, {
      toValue: value,
      useNativeDriver: false,
    }).start();
  };

  const onPressOutSide = () => {
    Keyboard.dismiss();
    onOutSidePress?.();
  };

  const body = (
    <Animated.View style={[containerStyle, {flex: 1, marginBottom: padding}]}>
      {children}
    </Animated.View>
  );
  if (!tapOutSide) return body;
  return (
    <TouchableWithoutFeedback onPress={onPressOutSide}>
      {body}
    </TouchableWithoutFeedback>
  );
};

const mapStateToProps = (state: any) => ({
  realHeight: state.configs.realHeight,
});

export default connect(mapStateToProps)(KeyboardLayout);
