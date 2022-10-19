import Emoji from 'components/Emoji';
import Touchable from 'components/Touchable';
import useThemeColor from 'hook/useThemeColor';
import React, {memo, useCallback} from 'react';
import {StyleSheet} from 'react-native';

type MenuEmojiItemProps = {
  item: any;
  onEmojiSelected?: (item: any) => void;
};

const MenuEmojiItem = ({item, onEmojiSelected}: EmojiItemProps) => {
  const {colors} = useThemeColor();
  const onPress = useCallback(() => {
    onEmojiSelected?.(item.emoji);
  }, [item, onEmojiSelected]);
  return (
    <Touchable
      useReactNative
      style={[styles.emojiWrap, {backgroundColor: colors.border}]}
      disabled={!item.emoji}
      onPress={onPress}>
      {item.emoji && <Emoji name={item?.emoji?.short_name} />}
    </Touchable>
  );
};

const styles = StyleSheet.create({
  emojiWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default memo(MenuEmojiItem);
