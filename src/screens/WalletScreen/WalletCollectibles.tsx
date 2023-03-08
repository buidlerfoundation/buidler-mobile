import {useNavigation, useRoute} from '@react-navigation/native';
import {getCollectibles} from 'actions/CollectibleActions';
import AppStyles from 'common/AppStyles';
import ScreenID from 'common/ScreenID';
import SVG from 'common/SVG';
import CollectibleLayoutProvider from 'components/CollectibleLayoutProvider';
import TokenItem from 'components/TokenItem';
import Touchable from 'components/Touchable';
import useAppDispatch from 'hook/useAppDispatch';
import useAppSelector from 'hook/useAppSelector';
import useThemeColor from 'hook/useThemeColor';
import useWalletBalance from 'hook/useWalletBalance';
import {Token} from 'models';
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
        {item.image ? (
          <FastImage
            source={{uri: item.image}}
            style={styles.collectionImage}
          />
        ) : (
          <View style={styles.collectionImage}>
            <SVG.IconImageDefault
              width={25}
              height={25}
              fill={colors.subtext}
            />
          </View>
        )}
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
        {data?.media?.[0]?.thumbnail ? (
          <FastImage
            source={{uri: data?.media?.[0]?.thumbnail}}
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
          <View
            style={[
              styles.collectionItemImage,
              {width: itemSize, height: itemSize},
            ]}>
            <SVG.IconImageDefault
              width={itemSize}
              height={itemSize}
              fill={colors.subtext}
            />
          </View>
        )}
      </Touchable>
    );
  },
);

const WalletCollectibles = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {colors} = useThemeColor();
  const dispatch = useAppDispatch();
  const {width} = useWindowDimensions();
  const collectibles = useAppSelector(state => state.collectible.data);
  const token = useMemo<Token>(
    () => route.params?.token,
    [route.params?.token],
  );
  const walletBalance = useWalletBalance();
  const itemSize = useMemo(() => Math.floor((width - 70) / 3), [width]);
  const [collectibleToggle, setCollectibleToggle] = useState({});
  const [loading, setLoading] = useState(false);
  const fetchCollectible = useCallback(async () => {
    setLoading(true);
    await dispatch(getCollectibles());
    setTimeout(() => setLoading(false), 150);
  }, [dispatch]);
  useEffect(() => {
    fetchCollectible();
  }, [dispatch, fetchCollectible]);
  const dataToken = useMemo(() => {
    if (!token) return [];
    return walletBalance
      ? [
          token,
          ...walletBalance.tokens.filter(
            el => el.contract.network === token.contract.network,
          ),
        ].map(el => ({
          ...el,
          type: 'token-item',
          key: `${el.contract.contract_address}-${el.contract.network}`,
        }))
      : [];
  }, [token, walletBalance]);
  const dataCollectibles = useMemo(() => {
    return collectibles
      .filter(el => el.network === token.contract.network)
      .reduce((res, val) => {
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
  }, [collectibleToggle, collectibles, token.contract.network]);
  const list = useMemo(
    () => [...dataToken, ...dataCollectibles],
    [dataCollectibles, dataToken],
  );
  const dataProvider = useMemo(
    () =>
      new DataProvider((r1, r2) => {
        return r1.key !== r2.key;
      }).cloneWithRows(list),
    [list],
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
      if (type === 'token-item') {
        return <TokenItem item={data} />;
      }
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
  const renderFooter = useCallback(() => {
    if (dataCollectibles.length === 0 && !loading) {
      return (
        <Text
          style={[
            AppStyles.TextMed15,
            {color: colors.subtext, marginHorizontal: 20},
          ]}>
          No NFT in your collection yet
        </Text>
      );
    }
    return <View style={{height: 7.5}} />;
  }, [colors.subtext, dataCollectibles.length, loading]);
  if (loading) return null;
  return (
    <RecyclerListView
      rowRenderer={renderRow}
      dataProvider={dataProvider}
      layoutProvider={layoutProvider()}
      renderFooter={renderFooter}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  collectionContainer: {
    flexDirection: 'row',
    height: 40,
    paddingHorizontal: 20,
    marginTop: 5,
    alignItems: 'center',
  },
  collectionImage: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    overflow: 'hidden',
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
