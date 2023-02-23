import {useNavigation, useRoute} from '@react-navigation/native';
import AppDimension from 'common/AppDimension';
import AppStyles from 'common/AppStyles';
import SVG from 'common/SVG';
import Touchable from 'components/Touchable';
import useThemeColor from 'hook/useThemeColor';
import React, {memo, useCallback, useEffect, useMemo, useState} from 'react';
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
import ModalBottom from 'components/ModalBottom';
import MenuNFTDetail from 'components/MenuNFTDetail';

const NFTDetailScreen = () => {
  const route = useRoute();
  const [openMenu, setOpenMenu] = useState(false);
  const [nft, setNft] = useState<null | NFTDetailDataApi>(null);
  const {width} = useWindowDimensions();
  const imageSize = useMemo(() => width - 40, [width]);
  const propertyItemWidth = useMemo(
    () => Math.floor((width - 55) / 2),
    [width],
  );
  const navigation = useNavigation();
  const {colors} = useThemeColor();
  const toggleMenu = useCallback(() => setOpenMenu(current => !current), []);
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
        <Touchable onPress={toggleMenu}>
          <SVG.IconMore fill={colors.text} />
        </Touchable>
      </View>
      {nft && (
        <ScrollView
          style={{
            paddingHorizontal: 20,
          }}>
          <View
            style={{
              width: imageSize,
              height: imageSize,
              borderRadius: 10,
              overflow: 'hidden',
            }}>
            <FastImage
              source={{uri: nft.image_url}}
              style={{
                width: imageSize,
                height: imageSize,
                borderRadius: 10,
                marginTop: 20,
              }}
              resizeMode="contain"
            />
          </View>
          <Text
            style={[AppStyles.TextBold22, {color: colors.text, marginTop: 20}]}>
            {nft.name}
          </Text>
          <View style={styles.collectionView}>
            <FastImage
              source={{uri: nft.collection.image_url}}
              style={styles.collectionLogo}
            />
            <Text
              style={[
                AppStyles.TextMed15,
                {color: colors.text, marginLeft: 10},
              ]}>
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
                  backgroundColor: colors.activeBackgroundLight,
                  justifyContent: 'center',
                  paddingHorizontal: 10,
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
      <ModalBottom
        isVisible={openMenu}
        onSwipeComplete={toggleMenu}
        onBackdropPress={toggleMenu}>
        <MenuNFTDetail onClose={toggleMenu} nft={nft} />
      </ModalBottom>
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
  collectionView: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  collectionLogo: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
  },
  nftProperties: {
    flexWrap: 'wrap',
    marginTop: 15,
    flexDirection: 'row',
  },
});

export default memo(NFTDetailScreen);
