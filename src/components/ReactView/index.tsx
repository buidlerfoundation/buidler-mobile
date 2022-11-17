import {ReactReducerData} from 'models';
import React, {memo, useCallback} from 'react';
import {View, StyleSheet, ViewStyle, Text, Image} from 'react-native';
import useThemeColor from 'hook/useThemeColor';
import AppStyles from 'common/AppStyles';
import Emoji from 'components/Emoji';
import Touchable from 'components/Touchable';
import SVG from 'common/SVG';

type ReactItemProps = {
  react: any;
  onReactPress?: (name: string) => void;
};

const ReactItem = ({react, onReactPress}: ReactItemProps) => {
  const {colors} = useThemeColor();
  const onPress = useCallback(() => {
    onReactPress?.(react.reactName);
  }, [onReactPress, react.reactName]);
  return (
    <Touchable
      style={[
        styles.reactItem,
        {
          backgroundColor: react.isReacted
            ? colors.activeBackground
            : colors.activeBackgroundLight,
        },
      ]}
      useWithoutFeedBack
      onPress={onPress}>
      <Emoji name={react.reactName} style={styles.emoji} />
      <Text
        style={[
          styles.reactCount,
          AppStyles.TextSemi13,
          {color: react.isReacted ? colors.text : colors.lightText},
        ]}>
        {react.count}
      </Text>
    </Touchable>
  );
};

type ReactViewProps = {
  style?: ViewStyle;
  reacts: Array<ReactReducerData>;
  onReactPress?: (name: string) => void;
  openReactView?: () => void;
};

const ReactView = ({
  style,
  reacts,
  onReactPress,
  openReactView,
}: ReactViewProps) => {
  if (!reacts || reacts.length === 0) return null;
  return (
    <View style={[styles.container, style]}>
      {reacts.map(react => (
        <ReactItem
          key={react.reactName}
          react={react}
          onReactPress={onReactPress}
        />
      ))}
      {openReactView && (
        <Touchable useReactNative onPress={openReactView}>
          <Image source={SVG.IconEmotion} style={{width: 22, height: 22}} />
        </Touchable>
      )}
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
    paddingVertical: 4,
    marginRight: 10,
    marginTop: 10,
    borderRadius: 5,
  },
  reactCount: {
    marginLeft: 5,
  },
  emoji: {
    fontSize: 13,
    lineHeight: 22,
  },
});

export default memo(ReactView);
