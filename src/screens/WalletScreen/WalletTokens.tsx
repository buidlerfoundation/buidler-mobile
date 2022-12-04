import TokenItem from 'components/TokenItem';
import useWalletBalance from 'hook/useWalletBalance';
import React, {memo, useCallback} from 'react';
import {View, FlatList} from 'react-native';

const WalletTokens = () => {
  const walletBalance = useWalletBalance();
  const renderSeparate = useCallback(() => <View style={{height: 5}} />, []);
  return (
    <FlatList
      data={walletBalance ? [walletBalance.ETH, ...walletBalance.tokens] : []}
      keyExtractor={item => item.contract.contract_address}
      renderItem={({item}) => <TokenItem item={item} />}
      ItemSeparatorComponent={renderSeparate}
      ListHeaderComponent={<View style={{height: 14}} />}
    />
  );
};

export default memo(WalletTokens);
