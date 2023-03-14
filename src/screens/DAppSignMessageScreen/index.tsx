import {useRoute} from '@react-navigation/native';
import {utils} from 'ethers';
import useUserData from 'hook/useUserData';
import React, {memo, useEffect, useMemo, useState} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import LinkPreview from '@lowkey/react-native-link-preview';
import useThemeColor from 'hook/useThemeColor';
import AppStyles from 'common/AppStyles';
import FastImage from 'react-native-fast-image';

const DAppSignMessageScreen = () => {
  const route = useRoute();
  const user = useUserData();
  const {colors} = useThemeColor();
  const address = useMemo(
    () => utils.computeAddress(user.user_id),
    [user.user_id],
  );
  const [dappMetadata, setDAppMetadata] = useState();
  useEffect(() => {
    if (route.params?.url) {
      LinkPreview.generate(route.params?.url).then(res => setDAppMetadata(res));
    }
  }, [route.params?.url]);
  return (
    <View style={styles.container}>
      <Text style={[AppStyles.TextBold20, {color: colors.text}]}>
        Message Signing Request
      </Text>
      <View style={[styles.accountInfo, {borderColor: colors.border}]}>
        <FastImage
          source={{
            uri: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
          }}
          style={styles.networkLogo}
        />
        <View style={{flex: 1, marginLeft: 15}}>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[AppStyles.TextSemi16, {color: colors.text}]}>
            {user.user_name}
          </Text>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[
              AppStyles.TextMed14,
              {marginTop: 5, color: colors.subtext},
            ]}>
            {address}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  networkLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 5,
    borderWidth: 1,
  },
});

export default memo(DAppSignMessageScreen);
