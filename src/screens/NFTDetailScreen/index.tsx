import {useRoute} from '@react-navigation/native';
import useThemeColor from 'hook/useThemeColor';
import React, {memo, useCallback, useState} from 'react';
import WebView from 'react-native-webview';
import {PROFILE_BASE_URL} from 'react-native-dotenv';
import {Linking, StyleSheet, View} from 'react-native';
import Spinner from 'components/Spinner';

const NFTDetailScreen = () => {
  const route = useRoute();
  const {colors} = useThemeColor();
  const [loaded, setLoaded] = useState(false);
  const onWVLoadEnd = useCallback(() => {
    setTimeout(() => {
      setLoaded(true);
    }, 200);
  }, []);
  const onShouldStartLoadWithRequest = useCallback(
    (evt: ShouldStartLoadRequest) => {
      if (evt.url.includes(PROFILE_BASE_URL)) return true;
      Linking.openURL(evt.url);
      return false;
    },
    [],
  );
  return (
    <>
      <WebView
        source={{
          uri: `${PROFILE_BASE_URL}/nft/detail?contract_address=${route.params?.contractAddress}&token_id=${route.params?.tokenId}&network=${route.params?.network}`,
        }}
        style={{backgroundColor: colors.background}}
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
        onLoadEnd={onWVLoadEnd}
        showsVerticalScrollIndicator={false}
        decelerationRate={1}
      />
      {!loaded && (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: colors.background,
            },
          ]}>
          <Spinner />
        </View>
      )}
    </>
  );
};

export default memo(NFTDetailScreen);
