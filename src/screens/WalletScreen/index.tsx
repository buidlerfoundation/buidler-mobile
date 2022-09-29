import React, {memo} from 'react';
import {View, StyleSheet, Text} from 'react-native';

const WalletScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Wallet Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
});

export default memo(WalletScreen);
