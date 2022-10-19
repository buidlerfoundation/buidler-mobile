import useAppSelector from 'hook/useAppSelector';
import React, {memo, useCallback, useEffect, useState} from 'react';
import {
  Animated,
  Keyboard,
  Platform,
  TouchableWithoutFeedback,
  ViewStyle,
} from 'react-native';

type KeyboardLayoutProps = {
  children: any;
  onKeyboardShow?: (e: any) => void;
  onKeyboardHide?: () => void;
  extraPaddingBottom?: number;
  onOutSidePress?: () => void;
  containerStyle?: ViewStyle;
  tapOutSide?: boolean;
  activeAndroid?: boolean;
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
}: KeyboardLayoutProps) => {
  const realHeight = useAppSelector(state => state.configs.realHeight);
  const [padding] = useState(new Animated.Value(0));
  useEffect(() => {
    const show = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hide = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const keyboardDidShowListener = Keyboard.addListener(show, e =>
      keyboardDidShow(e),
    );
    const keyboardDidHideListener = Keyboard.addListener(hide, () =>
      keyboardDidHide(),
    );
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [keyboardDidHide, keyboardDidShow]);

  const keyboardDidShow = useCallback(
    (e: any) => {
      let value =
        Platform.OS === 'ios'
          ? e.endCoordinates.height + extraPaddingBottom
          : 0;
      if (Platform.OS === 'android' && activeAndroid) {
        value = realHeight - e.endCoordinates.screenY;
      }
      runAnimation(value);
      onKeyboardShow(e);
    },
    [
      activeAndroid,
      extraPaddingBottom,
      onKeyboardShow,
      realHeight,
      runAnimation,
    ],
  );

  const keyboardDidHide = useCallback(() => {
    runAnimation(0);
    onKeyboardHide();
  }, [onKeyboardHide, runAnimation]);

  const runAnimation = useCallback(
    (value: number) => {
      Animated.spring(padding, {
        toValue: value,
        useNativeDriver: false,
      }).start();
    },
    [padding],
  );

  const onPressOutSide = useCallback(() => {
    Keyboard.dismiss();
    onOutSidePress?.();
  }, [onOutSidePress]);

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

export default memo(KeyboardLayout);
