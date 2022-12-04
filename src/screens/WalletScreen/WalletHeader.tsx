import {useNavigation} from '@react-navigation/native';
import AppDimension from 'common/AppDimension';
import AppStyles from 'common/AppStyles';
import Fonts from 'common/Fonts';
import ScreenID from 'common/ScreenID';
import AvatarView from 'components/AvatarView';
import Touchable from 'components/Touchable';
import {utils} from 'ethers';
import {normalizeUserName} from 'helpers/MessageHelper';
import {formatNumber} from 'helpers/StringHelper';
import {totalBalanceUSD} from 'helpers/TokenHelper';
import useThemeColor from 'hook/useThemeColor';
import useUserData from 'hook/useUserData';
import useWalletBalance from 'hook/useWalletBalance';
import React, {memo, useCallback, useMemo} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import Toast from 'react-native-toast-message';

const WalletHeader = () => {
  const navigation = useNavigation();
  const userData = useUserData();
  const walletBalance = useWalletBalance();
  const {colors} = useThemeColor();
  const address = useMemo(() => {
    if (!userData?.user_id) return '';
    return utils.computeAddress(userData.user_id);
  }, [userData.user_id]);
  const onUserPress = useCallback(() => {
    navigation.navigate(ScreenID.ProfileScreen);
  }, [navigation]);
  const onSendPress = useCallback(() => {
    Toast.show({type: 'customInfo', props: {message: 'Coming soon!'}});
  }, []);
  const onReceivePress = useCallback(() => {
    Toast.show({type: 'customInfo', props: {message: 'Coming soon!'}});
  }, []);
  const onSwapPress = useCallback(() => {
    Toast.show({type: 'customInfo', props: {message: 'Coming soon!'}});
  }, []);
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Touchable onPress={onUserPress}>
          <AvatarView user={userData} size={30} />
        </Touchable>
        <View style={styles.title}>
          <View style={styles.userWrap}>
            <Text style={[AppStyles.TextBold17, {color: colors.text}]}>
              {userData.user_name}
            </Text>
          </View>
          <Text
            style={[
              styles.address,
              AppStyles.TextMed15,
              {color: colors.subtext},
            ]}>
            {normalizeUserName(address, 5)}
          </Text>
        </View>
        <View style={{width: 30}} />
      </View>
      <Text style={[styles.balance, {color: colors.text}]}>
        ${formatNumber(totalBalanceUSD(walletBalance)) || '0.00'}
      </Text>
      <View style={styles.actionWrap}>
        <Touchable
          style={[styles.actionItem, {backgroundColor: colors.border}]}
          onPress={onSendPress}>
          <Text style={[AppStyles.TextSemi16, {color: colors.text}]}>Send</Text>
        </Touchable>
        <Touchable
          style={[
            styles.actionItem,
            {backgroundColor: colors.border, marginHorizontal: 15},
          ]}
          onPress={onReceivePress}>
          <Text style={[AppStyles.TextSemi16, {color: colors.text}]}>
            Receive
          </Text>
        </Touchable>
        <Touchable
          style={[styles.actionItem, {backgroundColor: colors.border}]}
          onPress={onSwapPress}>
          <Text style={[AppStyles.TextSemi16, {color: colors.text}]}>Swap</Text>
        </Touchable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    alignItems: 'center',
    paddingTop: AppDimension.extraTop,
  },
  header: {
    flexDirection: 'row',
    paddingTop: 10,
  },
  title: {
    flex: 1,
    alignItems: 'center',
  },
  userWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  address: {
    marginTop: 2,
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
});

export default memo(WalletHeader);
