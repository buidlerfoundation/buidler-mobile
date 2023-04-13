import React, {memo, useEffect} from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import {View, StyleSheet} from 'react-native';

type DotProps = {
  delay: number;
};

const Dot = ({delay}: DotProps) => {
  const dot = useSharedValue(0);

  const dotStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(dot.value, [0, 0.4, 0.725, 1], [0.5, 1, 0.5, 0.5]),
      transform: [
        {
          scale: interpolate(dot.value, [0, 0.4, 0.725, 1], [1, 1.2, 1, 1]),
        },
      ],
    };
  });
  useEffect(() => {
    dot.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, {
          duration: 1250,
        }),
        -1,
        false,
      ),
    );
  }, [delay, dot]);
  return <Animated.View style={[styles.dot, dotStyle]} />;
};

const AnimatedDot = () => {
  return (
    <View style={styles.container}>
      <Dot delay={0} />
      <Dot delay={125} />
      <Dot delay={250} />
      <Dot delay={375} />
      <Dot delay={500} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 5,
    backgroundColor: '#D9D9D9',
  },
});

export default memo(AnimatedDot);
