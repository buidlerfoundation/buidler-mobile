import AppDimension from 'common/AppDimension';
import AppStyles from 'common/AppStyles';
import Spinner from 'components/Spinner';
import Touchable from 'components/Touchable';
import useAppSelector from 'hook/useAppSelector';
import useThemeColor from 'hook/useThemeColor';
import {WalletInfo} from 'models';
import React, {memo, useCallback, useEffect, useState} from 'react';
import {FlatList, StyleSheet, Text, View} from 'react-native';
import FastImage from 'react-native-fast-image';
import {
  fetchAllWallets,
  navigateDeepLink,
} from 'services/connectors/WalletConnect/ExplorerUtils';
import {createUniversalProviderSession} from 'services/connectors/WalletConnect/UniversalProvider';

const ITEM_HEIGHT = 80;

type WalletItemProps = {
  item: WalletInfo;
  onPress: (item: WalletInfo) => void;
};

const WalletItem = memo(({item, onPress}: WalletItemProps) => {
  const {colors} = useThemeColor();
  const handlePress = useCallback(() => {
    onPress(item);
  }, [item, onPress]);
  return (
    <Touchable
      style={styles.walletItemContainer}
      useReactNative
      onPress={handlePress}>
      <FastImage source={{uri: item.image_url.sm}} style={styles.logoWallet} />
      <Text
        style={[
          AppStyles.TextMed12,
          {color: colors.text, marginTop: 5, textAlign: 'center'},
        ]}>
        {item.name}
      </Text>
    </Touchable>
  );
});

const WalletConnectListScreen = () => {
  const {colors} = useThemeColor();
  const [allWallets, setAllWallets] = useState<WalletInfo[]>([]);
  const [isWalletListLoading, setWalletListLoading] = useState(true);
  const walletConnectURI = useAppSelector(state => state.user.walletConnectURI);
  const fetchWallets = useCallback(() => {
    fetchAllWallets().then(wallets => {
      setWalletListLoading(false);
      if (wallets) {
        setAllWallets(wallets);
      }
    });
  }, []);
  const onSessionCreated = useCallback(async () => {
    console.log('XXX: ', 'onSessionCreated');
  }, []);

  const onSessionError = useCallback(async () => {
    console.log('XXX: ', 'onSessionError');
  }, []);
  useEffect(() => {
    createUniversalProviderSession({
      onSuccess: onSessionCreated,
      onFailure: onSessionError,
    });
  }, [onSessionCreated, onSessionError]);
  useEffect(() => {
    if (!allWallets.length) {
      fetchWallets();
    }
  }, [allWallets, fetchWallets]);
  const handleWalletPress = useCallback(
    (item: WalletInfo) => {
      navigateDeepLink(
        item.mobile.universal,
        item.mobile.native,
        walletConnectURI,
      );
    },
    [walletConnectURI],
  );
  const renderWallet = useCallback(
    ({item}: {item: WalletInfo}) => {
      return <WalletItem item={item} onPress={handleWalletPress} />;
    },
    [handleWalletPress],
  );
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text
          style={[AppStyles.TextBold17, {color: colors.text}]}
          ellipsizeMode="tail"
          numberOfLines={1}>
          Wallet Connect
        </Text>
      </View>
      {(isWalletListLoading || !walletConnectURI) && <Spinner />}
      <FlatList
        data={allWallets}
        keyExtractor={item => item.id}
        renderItem={renderWallet}
        numColumns={4}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: AppDimension.extraBottom,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    height: AppDimension.headerHeight,
  },
  walletItemContainer: {
    width: '25%',
    height: 80,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginVertical: 16,
  },
  logoWallet: {
    height: 60,
    width: 60,
    borderRadius: 16,
  },
});

export default memo(WalletConnectListScreen);
