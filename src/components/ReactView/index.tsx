import {ReactReducerData} from 'models';
import React, {memo} from 'react';
import {View, StyleSheet, ViewStyle, Text} from 'react-native';
import Emoji from 'react-native-emoji';
import Fonts from 'common/Fonts';
import useThemeColor from 'hook/useThemeColor';

type ReactViewProps = {
  style?: ViewStyle;
  reacts: Array<ReactReducerData>;
};

const ReactView = ({style, reacts}: ReactViewProps) => {
  const {colors} = useThemeColor();
  return (
    <View style={[styles.container, style]}>
      {reacts.map(react => (
        <View
          key={react.reactName}
          style={[
            styles.reactItem,
            {
              backgroundColor: react.isReacted
                ? colors.activeBackground
                : colors.activeBackgroundLight,
            },
          ]}>
          <Emoji name={react.reactName} />
          <Text
            style={[
              styles.reactCount,
              {color: react.isReacted ? colors.text : colors.subtext},
            ]}>
            {react.count}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  reactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  reactCount: {
    fontSize: 16,
    fontFamily: Fonts.Medium,
    lineHeight: 19,
  },
});

export default memo(ReactView);
