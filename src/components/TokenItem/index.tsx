import Fonts from 'common/Fonts';
import {formatToken, formatUSD} from 'helpers/TokenHelper';
import useThemeColor from 'hook/useThemeColor';
import {Token} from 'models';
import React, {memo} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import FastImage from 'react-native-fast-image';

type TokenItemProps = {
  item: Token;
};

const TokenItem = ({item}: TokenItemProps) => {
  const {colors} = useThemeColor();
  return (
    <View style={styles.container}>
      <FastImage
        source={{uri: item.contract.logo}}
        style={[styles.tokenLogo, {backgroundColor: colors.border}]}
      />
      <View style={{flex: 1, marginLeft: 15}}>
        <Text style={[styles.symbol, {color: colors.text}]}>
          {item.contract.symbol}
        </Text>
        <Text style={[styles.name, {color: colors.subtext}]}>
          {item.contract.name}
        </Text>
      </View>
      <View style={{alignItems: 'flex-end'}}>
        <Text style={[styles.symbol, {color: colors.text}]}>
          {formatToken({
            value: item.balance,
            decimal: item?.contract?.decimals,
          })}
        </Text>
        <Text style={[styles.name, {color: colors.subtext}]}>
          {formatUSD({
            value: item.balance,
            price: item?.price?.current_price,
            decimal: item?.contract?.decimals,
          })}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
  tokenLogo: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
  },
  symbol: {
    fontSize: 16,
    fontFamily: Fonts.SemiBold,
    lineHeight: 26,
  },
  name: {
    fontSize: 14,
    fontFamily: Fonts.Medium,
    lineHeight: 22,
  },
});

export default memo(TokenItem);
