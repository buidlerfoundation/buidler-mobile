import AppDimension from 'common/AppDimension';
import Fonts from 'common/Fonts';
import AvatarView from 'components/AvatarView';
import TokenItem from 'components/TokenItem';
import Touchable from 'components/Touchable';
import {utils} from 'ethers';
import {normalizeUserName} from 'helpers/MessageHelper';
import {formatNumber} from 'helpers/StringHelper';
import {totalBalanceUSD} from 'helpers/TokenHelper';
import useThemeColor from 'hook/useThemeColor';
import useUserData from 'hook/useUserData';
import useWalletBalance from 'hook/useWalletBalance';
import React, {memo, useCallback, useMemo} from 'react';
import {View, StyleSheet, Text, FlatList} from 'react-native';
import Toast from 'react-native-toast-message';

const WalletScreen = () => {
  const userData = useUserData();
  const walletBalance = useWalletBalance();
  const {colors} = useThemeColor();
  const address = useMemo(() => {
    if (!userData?.user_id) return '';
    return utils.computeAddress(userData.user_id);
  }, [userData.user_id]);
  const onSendPress = useCallback(() => {
    Toast.show({type: 'customInfo', props: {message: 'Coming soon!'}});
  }, []);
  const onReceivePress = useCallback(() => {
    Toast.show({type: 'customInfo', props: {message: 'Coming soon!'}});
  }, []);
  const onSwapPress = useCallback(() => {
    Toast.show({type: 'customInfo', props: {message: 'Coming soon!'}});
  }, []);
  const renderSeparate = useCallback(() => <View style={{height: 5}} />, []);
  return (
    <View style={styles.container}>
      <FlatList
        ListHeaderComponent={
          <View style={styles.balanceWrap}>
            <View style={styles.userWrap}>
              <AvatarView user={userData} withStatus={false} size={20} />
              <Text style={[styles.userName, {color: colors.text}]}>
                {userData.user_name}
              </Text>
            </View>
            <Text style={[styles.address, {color: colors.subtext}]}>
              {normalizeUserName(address, 5)}
            </Text>
            <Text style={[styles.balance, {color: colors.text}]}>
              ${formatNumber(totalBalanceUSD(walletBalance)) || '0.00'}
            </Text>
            <View style={styles.actionWrap}>
              <Touchable
                style={[styles.actionItem, {backgroundColor: colors.border}]}
                onPress={onSendPress}>
                <Text style={[styles.actionLabel, {color: colors.text}]}>
                  Send
                </Text>
              </Touchable>
              <Touchable
                style={[
                  styles.actionItem,
                  {backgroundColor: colors.border, marginHorizontal: 15},
                ]}
                onPress={onReceivePress}>
                <Text style={[styles.actionLabel, {color: colors.text}]}>
                  Receive
                </Text>
              </Touchable>
              <Touchable
                style={[styles.actionItem, {backgroundColor: colors.border}]}
                onPress={onSwapPress}>
                <Text style={[styles.actionLabel, {color: colors.text}]}>
                  Swap
                </Text>
              </Touchable>
            </View>
            <Text style={[styles.tokenLabel, {color: colors.subtext}]}>
              Token
            </Text>
            <View style={{height: 15}} />
          </View>
        }
        data={[walletBalance?.ETH, ...walletBalance?.tokens]}
        keyExtractor={item => item.contract.contract_address}
        renderItem={({item}) => <TokenItem item={item} />}
        ItemSeparatorComponent={renderSeparate}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, paddingTop: AppDimension.extraTop},
  balanceWrap: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  userWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  userName: {
    fontFamily: Fonts.SemiBold,
    fontSize: 16,
    lineHeight: 26,
    marginLeft: 8,
  },
  address: {
    fontFamily: Fonts.Medium,
    fontSize: 14,
    lineHeight: 22,
  },
  balance: {
    marginTop: 26,
    fontSize: 34,
    fontFamily: Fonts.Bold,
    lineHeight: 40,
  },
  actionWrap: {
    flexDirection: 'row',
    marginTop: 35,
    width: '100%',
    justifyContent: 'center',
  },
  actionItem: {
    height: 45,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
  },
  actionLabel: {
    fontSize: 16,
    lineHeight: 26,
    fontFamily: Fonts.SemiBold,
  },
  tokenLabel: {
    fontFamily: Fonts.Bold,
    fontSize: 16,
    lineHeight: 26,
    marginTop: 35,
    alignSelf: 'flex-start',
  },
});

export default memo(WalletScreen);
