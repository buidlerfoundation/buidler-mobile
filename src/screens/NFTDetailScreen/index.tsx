import {useRoute} from '@react-navigation/native';
import AppDimension from 'common/AppDimension';
import AppStyles from 'common/AppStyles';
import SVG from 'common/SVG';
import useThemeColor from 'hook/useThemeColor';
import React, {memo, useEffect, useMemo, useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import {NFTDetailDataApi} from 'models';
import api from 'services/api';
import FastImage from 'react-native-fast-image';
import WebView from 'react-native-webview';
import {PROFILE_BASE_URL} from 'react-native-dotenv';

const NFTDetailScreen = () => {
  const route = useRoute();
  const [nft, setNft] = useState<null | NFTDetailDataApi>(null);
  const {width} = useWindowDimensions();
  const imageSize = useMemo(() => width - 40, [width]);
  const propertyItemWidth = useMemo(
    () => Math.floor((width - 55) / 2),
    [width],
  );
  const {colors} = useThemeColor();
  const nftMedia = useMemo(() => {
    return nft?.media?.[0];
  }, [nft?.media]);
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
      {nft && (
        <ScrollView
          style={{
            paddingHorizontal: 20,
            paddingTop: 20,
          }}>
          <View
            style={{
              width: imageSize,
              height: imageSize,
              borderRadius: 10,
              overflow: 'hidden',
              backgroundColor: colors.border,
            }}>
            {nftMedia?.format?.includes('svg') ? (
              <WebView
                source={{
                  uri: `${PROFILE_BASE_URL}/img?source=${nftMedia?.gateway}&width=${imageSize}&height=${imageSize}`,
                }}
                style={{width: imageSize, height: imageSize}}
              />
            ) : (
              <FastImage
                source={{uri: nftMedia?.gateway}}
                style={{
                  width: imageSize,
                  height: imageSize,
                  borderRadius: 10,
                }}
                resizeMode="contain"
              />
            )}
          </View>
          <Text
            style={[AppStyles.TextBold22, {color: colors.text, marginTop: 20}]}>
            {nft.name}
          </Text>
          <View style={styles.collectionView}>
            {nft.collection.image_url ? (
              <FastImage
                source={{uri: nft.collection.image_url}}
                style={styles.collectionLogo}
              />
            ) : (
              <View style={styles.collectionLogo}>
                <SVG.IconImageDefault
                  width={25}
                  height={25}
                  fill={colors.subtext}
                />
              </View>
            )}
            <Text
              style={[
                AppStyles.TextMed15,
                {color: colors.text, marginLeft: 10, flex: 1},
              ]}
              numberOfLines={1}
              ellipsizeMode="tail">
              {nft.collection.name}
            </Text>
          </View>
          {!!nft.collection.description && (
            <Text
              style={[
                AppStyles.TextMed15,
                {color: colors.lightText, marginTop: 30},
              ]}>
              {nft.collection.description}
            </Text>
          )}
          <Text
            style={[
              AppStyles.TextMed15,
              {color: colors.subtext, marginTop: 30},
            ]}>
            Properties
          </Text>
          <View style={styles.nftProperties}>
            {nft.attributes.map((el, index) => (
              <View
                key={el._id}
                style={{
                  width: propertyItemWidth,
                  height: 60,
                  marginLeft: index % 2 === 0 ? 0 : 15,
                  borderRadius: 5,
                  borderWidth: 1,
                  borderColor: colors.border,
                  justifyContent: 'center',
                  paddingHorizontal: 10,
                  marginBottom: 15,
                }}>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={[AppStyles.TextMed11, {color: colors.subtext}]}>
                  {el.trait_type}
                </Text>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={[
                    AppStyles.TextMed15,
                    {color: colors.text, marginTop: 5},
                  ]}>
                  {el.value}
                </Text>
              </View>
            ))}
          </View>
          <View style={{height: AppDimension.extraBottom + 20}} />
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  collectionView: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  collectionLogo: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    overflow: 'hidden',
  },
  nftProperties: {
    flexWrap: 'wrap',
    marginTop: 15,
    flexDirection: 'row',
  },
});

export default memo(NFTDetailScreen);
