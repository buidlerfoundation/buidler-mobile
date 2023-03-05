import {useRoute} from '@react-navigation/native';
import TokenItem from 'components/TokenItem';
import useWalletBalance from 'hook/useWalletBalance';
import {Token} from 'models';
import React, {memo, useCallback, useMemo} from 'react';
import {View, FlatList} from 'react-native';

const WalletTokens = () => {
  const route = useRoute();
  const token = useMemo<Token>(
    () => route.params?.token,
    [route.params?.token],
  );
  const walletBalance = useWalletBalance();
  const renderSeparate = useCallback(() => <View style={{height: 5}} />, []);
  if (!token) return null;
  return (
    <FlatList
      data={
        walletBalance
          ? [
              token,
              ...walletBalance.tokens.filter(
                el => el.contract.network === token.contract.network,
              ),
            ]
          : []
      }
      keyExtractor={item =>
        `${item.contract.contract_address}-${item.contract.name}`
      }
      renderItem={({item}) => <TokenItem item={item} />}
      ItemSeparatorComponent={renderSeparate}
      ListHeaderComponent={<View style={{height: 14}} />}
    />
  );
};

export default memo(WalletTokens);
