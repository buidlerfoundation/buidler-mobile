import Touchable from 'components/Touchable';
import useThemeColor from 'hook/useThemeColor';
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {Animated, StyleSheet} from 'react-native';

type SwitchButtonProps = {
  toggleOn?: boolean;
  onChange: (isActive: boolean) => void;
};

const SwitchButton = ({toggleOn, onChange}: SwitchButtonProps) => {
  const animatedValue = useRef(new Animated.Value(0));
  const {colors} = useThemeColor();
  const [isActive, setActive] = useState(false);
  const toggle = useCallback(() => {
    onChange(!isActive);
  }, [isActive, onChange]);
  const switchOn = useCallback(() => {
    Animated.spring(animatedValue.current, {
      toValue: 1,
    }).start();
  }, []);
  const switchOff = useCallback(() => {
    Animated.spring(animatedValue.current, {
      toValue: 0,
    }).start();
  }, []);
  useEffect(() => {
    console.log(toggleOn);
    setActive(toggleOn);
    if (toggleOn) {
      switchOn();
    } else {
      switchOff();
    }
  }, [switchOff, switchOn, toggleOn]);
  const backgroundColor = useMemo(
    () =>
      animatedValue.current.interpolate({
        inputRange: [0, 1],
        outputRange: [colors.activeBackground, colors.blue],
      }),
    [colors.activeBackground, colors.blue],
  );
  const thumbColor = useMemo(
    () =>
      animatedValue.current.interpolate({
        inputRange: [0, 1],
        outputRange: [colors.subtext, colors.text],
      }),
    [colors.subtext, colors.text],
  );
  const translateX = useMemo(
    () =>
      animatedValue.current.interpolate({
        inputRange: [0, 1],
        outputRange: [2, 22],
      }),
    [],
  );
  return (
    <Touchable onPress={toggle} useWithoutFeedBack>
      <Animated.View style={[styles.container, {backgroundColor}]}>
        <Animated.View
          style={[
            styles.thumb,
            {left: translateX, backgroundColor: thumbColor},
          ]}
        />
      </Animated.View>
    </Touchable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 50,
    height: 30,
    borderRadius: 15,
  },
  thumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    marginTop: 2,
    position: 'absolute',
  },
});

export default memo(SwitchButton);
