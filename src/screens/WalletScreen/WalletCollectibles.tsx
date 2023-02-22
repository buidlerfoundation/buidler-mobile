import {useNavigation} from '@react-navigation/native';
import {getCollectibles} from 'actions/CollectibleActions';
import AppStyles from 'common/AppStyles';
import ScreenID from 'common/ScreenID';
import SVG from 'common/SVG';
import CollectibleLayoutProvider from 'components/CollectibleLayoutProvider';
import Touchable from 'components/Touchable';
import useAppDispatch from 'hook/useAppDispatch';
import useAppSelector from 'hook/useAppSelector';
import useThemeColor from 'hook/useThemeColor';
import React, {memo, useCallback, useEffect, useMemo, useState} from 'react';
import {View, StyleSheet, Text, useWindowDimensions} from 'react-native';
import FastImage from 'react-native-fast-image';
import {DataProvider, RecyclerListView} from 'recyclerlistview';

type CollectibleHeaderProps = {
  item: any;
  onPress: (item: any) => void;
  toggle?: boolean;
};

const CollectibleHeader = memo(
  ({item, onPress, toggle}: CollectibleHeaderProps) => {
    const {colors} = useThemeColor();
    const handlePress = useCallback(() => onPress(item), [item, onPress]);
    return (
      <Touchable
        style={[styles.collectionContainer]}
        onPress={handlePress}
        useReactNative>
        <FastImage source={{uri: item.image}} style={styles.collectionImage} />
        <Text
          style={[
            styles.collectionName,
            AppStyles.TextSemi16,
            {color: colors.text},
          ]}>
          {item.name}
        </Text>
        <View
          style={{
            marginLeft: 8,
            transform: [{rotate: toggle ? '-90deg' : '0deg'}],
          }}>
          <SVG.IconCollapse fill={colors.subtext} />
        </View>
        <View style={{flex: 1}} />
        {toggle && (
          <View
            style={[
              styles.count,
              {backgroundColor: colors.activeBackgroundLight},
            ]}>
            <Text style={[AppStyles.TextSemi15, {color: colors.subtext}]}>
              {item.count}
            </Text>
          </View>
        )}
      </Touchable>
    );
  },
);

type CollectionItemProps = {
  data: any;
  itemSize: number;
  onItemPress: (data: any) => void;
};

const CollectionItem = memo(
  ({data, itemSize, onItemPress}: CollectionItemProps) => {
    const {colors} = useThemeColor();
    const onPress = useCallback(() => onItemPress(data), [data, onItemPress]);
    return (
      <Touchable
        style={[
          styles.collectionItemContainer,
          data.index % 3 === 0 && {paddingLeft: 20},
          data.index % 3 === 2 && {paddingRight: 20},
        ]}
        onPress={onPress}>
        {data.image_url?.includes('.svg') ? (
          <View
            style={[
              styles.collectionItemImage,
              {
                backgroundColor: colors.border,
                width: itemSize,
                height: itemSize,
              },
            ]}
          />
        ) : (
          <FastImage
            source={{uri: data.background_image_url}}
            style={[
              styles.collectionItemImage,
              {
                backgroundColor: colors.border,
                width: itemSize,
                height: itemSize,
              },
            ]}
          />
        )}
      </Touchable>
    );
  },
);

const WalletCollectibles = () => {
  const navigation = useNavigation();
  const {colors} = useThemeColor();
  const dispatch = useAppDispatch();
  const {width} = useWindowDimensions();
  const collectibles = useAppSelector(state => state.collectible.data);
  const itemSize = useMemo(() => Math.floor((width - 70) / 3), [width]);
  const [collectibleToggle, setCollectibleToggle] = useState({});
  const [loading, setLoading] = useState(false);
  const fetchCollectible = useCallback(async () => {
    setLoading(true);
    await dispatch(getCollectibles());
    setLoading(false);
  }, [dispatch]);
  useEffect(() => {
    fetchCollectible();
  }, [dispatch, fetchCollectible]);
  const dataCollectibles = useMemo(() => {
    return collectibles.reduce((res, val) => {
      const nfts = val.nfts.map((el, idx) => ({
        ...el,
        key: el.token_id,
        type: 'collection-item',
        index: idx,
        toggle: collectibleToggle?.[val.contract_address],
      }));
      res.push(
        ...[
          {
            key: val.contract_address,
            image: val.image_url,
            name: val.name,
            count: val.nfts.length,
            type: 'collection',
          },
          ...nfts,
        ],
      );
      return res;
    }, []);
  }, [collectibleToggle, collectibles]);
  const dataProvider = useMemo(
    () =>
      new DataProvider((r1, r2) => {
        return r1.key !== r2.key;
      }).cloneWithRows(dataCollectibles),
    [dataCollectibles],
  );
  const layoutProvider = useCallback(() => {
    const lp = new CollectibleLayoutProvider(dataProvider);
    lp.shouldRefreshWithAnchoring = false;
    return lp;
  }, [dataProvider]);
  const onHeaderPress = useCallback(
    item =>
      setCollectibleToggle(current => ({
        ...current,
        [item.key]: !current?.[item.key],
      })),
    [],
  );
  const onItemPress = useCallback(
    (data: any) => {
      navigation.navigate(ScreenID.NFTDetailScreen, {
        contractAddress: data.contract_address,
        tokenId: data.token_id,
        network: data.network,
      });
    },
    [navigation],
  );
  const renderRow = useCallback(
    (type, data) => {
      if (type === 'error') return <View />;
      if (type === 'collection-item') {
        if (data.toggle) {
          return <View />;
        }
        return (
          <CollectionItem
            data={data}
            itemSize={itemSize}
            onItemPress={onItemPress}
          />
        );
      }
      return (
        <CollectibleHeader
          item={data}
          onPress={onHeaderPress}
          toggle={collectibleToggle?.[data.key]}
        />
      );
    },
    [collectibleToggle, itemSize, onHeaderPress, onItemPress],
  );
  const renderFooter = useCallback(() => <View style={{height: 7.5}} />, []);
  if (dataCollectibles.length === 0) {
    if (!loading)
      return (
        <Text
          style={[
            AppStyles.TextMed15,
            {color: colors.subtext, marginHorizontal: 20},
          ]}>
          No NFT in your collection yet
        </Text>
      );
    return null;
  }
  return (
    <RecyclerListView
      rowRenderer={renderRow}
      dataProvider={dataProvider}
      layoutProvider={layoutProvider()}
      renderFooter={renderFooter}
      canChangeSize
    />
  );
};

const styles = StyleSheet.create({
  collectionContainer: {
    flexDirection: 'row',
    height: 40,
    paddingHorizontal: 20,
    marginTop: 15,
    alignItems: 'center',
  },
  collectionImage: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
  },
  collectionName: {
    marginLeft: 8,
  },
  collectionItemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 15,
  },
  collectionItemImage: {
    borderRadius: 5,
    overflow: 'hidden',
  },
  count: {
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    minWidth: 30,
    borderRadius: 5,
  },
});

export default memo(WalletCollectibles);
