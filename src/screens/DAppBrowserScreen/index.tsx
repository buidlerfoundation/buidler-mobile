import AppDimension from 'common/AppDimension';
import AppStyles from 'common/AppStyles';
import SVG from 'common/SVG';
import DAppBrowser from 'components/DAppBrowser';
import Touchable from 'components/Touchable';
import useThemeColor from 'hook/useThemeColor';
import React, {memo, useCallback, useRef} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import WebView from 'react-native-webview';

type DAppBrowserScreenProps = {
  url?: string;
  onBack: () => void;
  open?: boolean;
};

const DAppBrowserScreen = ({url, onBack, open}: DAppBrowserScreenProps) => {
  const {colors} = useThemeColor();
  const webviewRef = useRef<WebView>();
  const onReload = useCallback(() => {
    webviewRef.current?.reload();
  }, []);
  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <View style={styles.header}>
        <Touchable onPress={onBack}>
          <SVG.IconArrowBack fill={colors.text} />
        </Touchable>
        <Text
          style={[styles.title, AppStyles.TextBold17, {color: colors.text}]}
          ellipsizeMode="tail"
          numberOfLines={1}>
          {url}
        </Text>
        <Touchable onPress={onReload}>
          <SVG.IconReload fill={colors.text} />
        </Touchable>
      </View>
      <DAppBrowser url={url} focus={open} webviewRef={webviewRef} />
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
    marginRight: 10,
  },
});

export default memo(DAppBrowserScreen);
