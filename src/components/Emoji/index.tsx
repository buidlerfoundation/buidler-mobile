import {charFromEmojiObject} from 'components/EmojiPicker';
import React, {useMemo} from 'react';
import {Text, TextStyle} from 'react-native';
import emoji from 'emoji-datasource';

type EmojiProps = {
  name: string;
  style?: TextStyle;
};

const Emoji = ({name, style}: EmojiProps) => {
  const symbol = useMemo(() => {
    const obj = emoji.find(el => el.short_names.includes(name));
    return charFromEmojiObject(obj);
  }, [name]);
  return (
    <Text style={[{color: '#FFFFFF', fontSize: 20}, style]}>{symbol}</Text>
  );
};

export default Emoji;
