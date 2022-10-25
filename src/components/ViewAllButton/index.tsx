import AppStyles from 'common/AppStyles';
import Touchable from 'components/Touchable';
import useThemeColor from 'hook/useThemeColor';
import React, {memo} from 'react';
import {Text} from 'react-native';

type ViewAllButtonProps = {
  onPress: () => void;
};

const ViewAllButton = ({onPress}: ViewAllButtonProps) => {
  const {colors} = useThemeColor();
  return (
    <Touchable onPress={onPress} style={{padding: 10}} useReactNative>
      <Text style={[AppStyles.TextSemi16, {color: colors.mention}]}>
        View all
      </Text>
    </Touchable>
  );
};

export default memo(ViewAllButton);
