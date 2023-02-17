import {useNavigation, useRoute} from '@react-navigation/native';
import AppDimension from 'common/AppDimension';
import AppStyles from 'common/AppStyles';
import SVG from 'common/SVG';
import Touchable from 'components/Touchable';
import useThemeColor from 'hook/useThemeColor';
import React, {memo, useCallback, useEffect, useState} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {NFTDetailDataApi} from 'models';
import api from 'services/api';

const NFTDetailScreen = () => {
  const route = useRoute();
  const [nft, setNft] = useState<null | NFTDetailDataApi>(null);
  const navigation = useNavigation();
  const {colors} = useThemeColor();
  const onBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);
  useEffect(() => {
    if (
      route.params?.contractAddress &&
      route.params?.tokenId &&
      route.params?.network
    ) {
      api
        .getNFTsDetails(
          [route.params?.contractAddress],
          [route.params?.tokenId],
          [route.params?.network],
        )
        .then(res => {
          if (res.success) {
            setNft(res.data?.[0]);
          }
        });
    }
  }, [
    route.params?.contractAddress,
    route.params?.network,
    route.params?.tokenId,
  ]);
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Touchable onPress={onBack}>
          <SVG.IconArrowBack fill={colors.text} />
        </Touchable>
        <Text
          style={[styles.title, AppStyles.TextBold17, {color: colors.text}]}>
          {!nft ? 'Loading...' : nft.name}
        </Text>
      </View>
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
});

export default memo(NFTDetailScreen);
