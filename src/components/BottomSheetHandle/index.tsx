import Fonts from 'common/Fonts';
import ButtonClose from 'components/ButtonClose';
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
      <ButtonClose onPress={onClosePress} />
    </View>
  );
};

export default memo(BottomSheetHandle);
