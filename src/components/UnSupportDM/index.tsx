import {useNavigation} from '@react-navigation/native';
import AppDimension from 'common/AppDimension';
import AppStyles from 'common/AppStyles';
import ScreenID from 'common/ScreenID';
import SVG from 'common/SVG';
import Touchable from 'components/Touchable';
import useThemeColor from 'hook/useThemeColor';
import React, {memo, useCallback} from 'react';
import {StyleSheet, Text, View} from 'react-native';

const UnSupportDM = () => {
  const navigation = useNavigation();
  const {colors} = useThemeColor();
  const onImportPress = useCallback(() => {
    navigation.navigate(ScreenID.ImportSeedPhraseScreen);
  }, [navigation]);
  return (
    <View style={styles.container}>
      <View style={{flex: 1, justifyContent: 'center'}}>
        <Text style={[AppStyles.TextBold20, {color: colors.lightText}]}>
          Encrypted Message
        </Text>
        <Text
          style={[
            AppStyles.TextSemi14,
            {color: colors.lightText, marginTop: 20},
          ]}>
          This conversation has been secured with End-to-end encryption.
        </Text>
        <Text
          style={[
            AppStyles.TextSemi14,
            {color: colors.lightText, marginTop: 5},
          ]}>
          You need to import your seed phrase to use this feature
        </Text>
      </View>
      <Touchable
        style={[styles.createButton, {backgroundColor: colors.border}]}
        onPress={onImportPress}
        useReactNative>
        <Text style={[AppStyles.TextSemi16, {color: colors.text}]}>
          Import wallet
        </Text>
        <SVG.IconArrowImport fill={colors.text} />
      </Touchable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: AppDimension.extraTop,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flex: 1,
  },
  createButton: {
    borderRadius: 5,
    height: 60,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingLeft: 20,
    paddingRight: 15,
  },
});

export default memo(UnSupportDM);
