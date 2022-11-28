import AppDimension from 'common/AppDimension';
import AppStyles from 'common/AppStyles';
import useThemeColor from 'hook/useThemeColor';
import React, {memo} from 'react';
import {View, StyleSheet, Text} from 'react-native';

const DirectEmpty = () => {
  const {colors} = useThemeColor();
  return (
    <View style={styles.container}>
      <Text
        style={[
          AppStyles.TextBold17,
          {color: colors.lightText, marginTop: 120},
        ]}>
        Direct Message
      </Text>
      <Text
        style={[
          AppStyles.TextMed15,
          {color: colors.lightText, marginTop: 20, lineHeight: 24},
        ]}>
        • End-to-end encryption.{'\n'}• Do not allow to forwarding.{'\n'}• What
        happen between us, stay with us.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: AppDimension.extraTop,
    paddingHorizontal: 20,
  },
});

export default memo(DirectEmpty);
