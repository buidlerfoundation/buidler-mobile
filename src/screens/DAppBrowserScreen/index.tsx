import AppDimension from 'common/AppDimension';
import AppStyles from 'common/AppStyles';
import SVG from 'common/SVG';
import DAppBrowser from 'components/DAppBrowser';
import Touchable from 'components/Touchable';
import useThemeColor from 'hook/useThemeColor';
import React, {memo, useCallback, useEffect, useRef, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import WebView from 'react-native-webview';
import api from 'services/api';

type DAppBrowserScreenProps = {
  url?: string;
  onBack: () => void;
  open?: boolean;
};

const DAppBrowserScreen = ({url, onBack, open}: DAppBrowserScreenProps) => {
  const {colors} = useThemeColor();
  const webviewRef = useRef<WebView>();
  const [urlWithParams, setUrlWithParams] = useState('');
  const [key, setKey] = useState('0');
  const onReload = useCallback(() => {
    setKey(`${Math.random()}`);
  }, []);
  const initial = useCallback(async () => {
    if (url) {
      let newUrl = url;
      if (url === 'https://buidler.link/airdrop_hunter') {
        newUrl += '?embedded=true';
        const res = await api.requestOTT();
        if (res.data) {
          newUrl += `&ott=${res.data}`;
        }
      }
      setUrlWithParams(newUrl);
    }
  }, [url]);
  useEffect(() => {
    initial();
  }, [initial]);
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
      {urlWithParams && (
        <DAppBrowser
          key={key}
          url={urlWithParams}
          focus={open}
          webviewRef={webviewRef}
        />
      )}
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
