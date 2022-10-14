import Emoji from 'components/Emoji';
import Touchable from 'components/Touchable';
import useThemeColor from 'hook/useThemeColor';
import React, {useCallback} from 'react';
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
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default MenuEmojiItem;
