import SVG from 'common/SVG';
import Touchable from 'components/Touchable';
import useThemeColor from 'hook/useThemeColor';
import React, {memo} from 'react';
import {View, ViewStyle} from 'react-native';

type ButtonCloseProps = {
  onPress: () => void;
  style?: ViewStyle;
  padding?: number;
};

const ButtonClose = ({onPress, style, padding = 10}: ButtonCloseProps) => {
  const {colors} = useThemeColor();
  return (
    <Touchable style={{padding}} onPress={onPress}>
      <View
        style={[
          {
            width: 30,
            height: 30,
            borderRadius: 15,
            backgroundColor: colors.border,
            alignItems: 'center',
            justifyContent: 'center',
          },
          style,
        ]}>
        <SVG.IconClose fill={colors.text} />
      </View>
    </Touchable>
  );
};

export default memo(ButtonClose);
