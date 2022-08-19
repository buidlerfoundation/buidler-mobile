import Fonts from 'common/Fonts';
import SVG from 'common/SVG';
import Touchable from 'components/Touchable';
import useThemeColor from 'hook/useThemeColor';
import React, {memo} from 'react';
import {View, Text} from 'react-native';

type BottomSheetHandleProps = {
  title?: string;
  titleComponent?: any;
  onClosePress: () => void;
};

const BottomSheetHandle = ({
  title,
  titleComponent,
  onClosePress,
}: BottomSheetHandleProps) => {
  const {colors} = useThemeColor();
  return (
    <View
      style={{
        backgroundColor: colors.background,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        padding: 10,
      }}>
      {titleComponent ? (
        titleComponent
      ) : (
        <Text
          style={{
            fontSize: 20,
            fontFamily: Fonts.Bold,
            lineHeight: 24,
            color: colors.text,
            marginLeft: 10,
          }}>
          {title}
        </Text>
      )}
      <Touchable style={{padding: 10}} onPress={onClosePress}>
        <View
          style={{
            width: 30,
            height: 30,
            borderRadius: 15,
            backgroundColor: colors.border,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <SVG.IconClose fill={colors.text} />
        </View>
      </Touchable>
    </View>
  );
};

export default memo(BottomSheetHandle);
