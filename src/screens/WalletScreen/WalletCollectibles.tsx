import {getCollectibles} from 'actions/CollectibleActions';
import AppStyles from 'common/AppStyles';
import CollectibleLayoutProvider from 'components/CollectibleLayoutProvider';
import useAppDispatch from 'hook/useAppDispatch';
import useAppSelector from 'hook/useAppSelector';
import useThemeColor from 'hook/useThemeColor';
import React, {memo, useCallback, useEffect, useMemo} from 'react';
import {View, StyleSheet, Text, useWindowDimensions} from 'react-native';
import FastImage from 'react-native-fast-image';
import {DataProvider, RecyclerListView} from 'recyclerlistview';

const WalletCollectibles = () => {
  const {colors} = useThemeColor();
  const dispatch = useAppDispatch();
  const {width} = useWindowDimensions();
  const collectibles = useAppSelector(state => state.collectible.data);
  const itemSize = useMemo(() => Math.floor((width - 70) / 3), [width]);
  useEffect(() => {
    dispatch(getCollectibles());
  }, [dispatch]);
  const dataCollectibles = useMemo(() => {
    return collectibles.reduce((res, val) => {
      res.push(
        ...[
          {
            key: val.contract_address,
            image: val.image_url,
            name: val.name,
            count: val.nft.length,
            type: 'collection',
          },
          ...val.nft.map((el, idx) => ({
            ...el,
            key: el.token_id,
            type: 'collection-item',
            isFirst: idx % 3 === 0,
          })),
        ],
      );
      return res;
    }, []);
  }, [collectibles]);
  const dataProvider = useMemo(
    () =>
      new DataProvider((r1, r2) => {
        return r1.unified !== r2.unified;
      }).cloneWithRows(dataCollectibles),
    [dataCollectibles],
  );
  const layoutProvider = useMemo(
    () => new CollectibleLayoutProvider(dataProvider),
    [dataProvider],
  );
  const renderRow = useCallback(
    (type, data) => {
      if (type === 'error') return <View />;
      if (type === 'collection-item') {
        return (
          <View
            style={[
              styles.collectionItemContainer,
              data.isFirst && {paddingLeft: 20},
            ]}>
            <FastImage
              source={{uri: data.image_url}}
              style={[
                styles.collectionItemImage,
                {
                  backgroundColor: colors.border,
                  width: itemSize,
                  height: itemSize,
                },
              ]}
            />
          </View>
        );
      }
      return (
        <View style={[styles.collectionContainer]}>
          <FastImage
            source={{uri: data.image}}
            style={styles.collectionImage}
          />
          <Text
            style={[
              styles.collectionName,
              AppStyles.TextSemi16,
              {color: colors.text},
            ]}>
            {data.name}
          </Text>
        </View>
      );
    },
    [colors.border, colors.text, itemSize],
  );
  const renderFooter = useCallback(() => <View style={{height: 7.5}} />, []);
  if (dataCollectibles.length === 0) return null;
  return (
    <RecyclerListView
      rowRenderer={renderRow}
      dataProvider={dataProvider}
      layoutProvider={layoutProvider}
      renderFooter={renderFooter}
    />
  );
};

const styles = StyleSheet.create({
  collectionContainer: {
    flexDirection: 'row',
    height: 55,
    paddingHorizontal: 20,
    paddingTop: 15,
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
    paddingHorizontal: 7.5,
    paddingTop: 15,
  },
  collectionItemImage: {
    borderRadius: 5,
  },
});

export default memo(WalletCollectibles);
