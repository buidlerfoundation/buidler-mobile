import {useNavigation, useRoute} from '@react-navigation/native';
import AppDimension from 'common/AppDimension';
import AppStyles from 'common/AppStyles';
import SVG from 'common/SVG';
import Touchable from 'components/Touchable';
import {isValidPrivateKey} from 'helpers/SeedHelper';
import useThemeColor from 'hook/useThemeColor';
import React, {memo, useCallback, useMemo, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import Clipboard from '@react-native-clipboard/clipboard';
import {Toast} from 'react-native-toast-message/lib/src/Toast';

const BackupDataScreen = () => {
  const navigation = useNavigation();
  const {colors} = useThemeColor();
  const onBack = useCallback(() => navigation.goBack(), [navigation]);
  const [blur, setBlur] = useState(true);
  const route = useRoute();
  const backupSeed = useMemo(
    () => route.params.backupSeed,
    [route.params.backupSeed],
  );
  const isPrivateKey = useMemo(
    () => isValidPrivateKey(backupSeed),
    [backupSeed],
  );
  const toggleBlur = useCallback(() => setBlur(current => !current), []);
  const onCopyBackup = useCallback(async () => {
    await Clipboard.setString(backupSeed);
    Toast.show({type: 'customSuccess', props: {message: 'Copied'}});
  }, [backupSeed]);
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Touchable onPress={onBack}>
          <SVG.IconArrowBack fill={colors.text} />
        </Touchable>
        <Text
          style={[styles.title, AppStyles.TextBold17, {color: colors.text}]}>
          {isPrivateKey ? 'Backup Private Key' : 'Backup Seed Phrase'}
        </Text>
      </View>
      <View style={{flex: 1}}>
        <Text
          style={[
            AppStyles.TextSemi16,
            {color: colors.subtext, marginTop: 20, marginHorizontal: 20},
          ]}>
          The only way to import or recover your wallet. Note down in safe place
          and never share it to anyone.
        </Text>
        <Touchable
          style={[styles.secureView, {backgroundColor: colors.border}]}
          onPress={toggleBlur}>
          <Text style={[AppStyles.TextSemi16, {color: colors.subtext}]}>
            {backupSeed}
          </Text>
          {blur && (
            <BlurView
              style={styles.blurView}
              blurRadius={5}
              overlayColor="white"
              blurAmount={3}>
              <SVG.IconEye fill={colors.text} />
              <Text
                style={[
                  AppStyles.TextSemi16,
                  {color: colors.text, marginLeft: 10},
                ]}>
                Reveal the secret
              </Text>
            </BlurView>
          )}
        </Touchable>
        <Touchable style={styles.btnCopy} useReactNative onPress={onCopyBackup}>
          <SVG.IconCopy fill={colors.text} width={26} height={26} />
          <Text
            style={[AppStyles.TextSemi16, {color: colors.text, marginLeft: 6}]}>
            Copy to clipboard
          </Text>
        </Touchable>
      </View>
      <Touchable
        style={[styles.btnBottom, {backgroundColor: colors.border}]}
        onPress={onBack}>
        <Text style={[AppStyles.TextSemi16, {color: colors.text}]}>Done</Text>
      </Touchable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: AppDimension.extraTop,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: AppDimension.headerHeight,
  },
  title: {
    marginLeft: 20,
    flex: 1,
  },
  secureView: {
    marginHorizontal: 20,
    marginTop: 30,
    padding: 20,
    borderRadius: 5,
  },
  blurView: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    top: 0,
    right: 0,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCopy: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 25,
    padding: 3,
  },
  btnBottom: {
    height: 60,
    borderRadius: 5,
    marginBottom: 64 + AppDimension.extraBottom,
    marginHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default memo(BackupDataScreen);
