import AppDimension from 'common/AppDimension';
import AppStyles from 'common/AppStyles';
import SVG from 'common/SVG';
import AvatarView from 'components/AvatarView';
import Touchable from 'components/Touchable';
import {normalizeUserName} from 'helpers/MessageHelper';
import {formatTokenFormHex} from 'helpers/TokenHelper';
import useThemeColor from 'hook/useThemeColor';
import useUserAddress from 'hook/useUserAddress';
import useUserData from 'hook/useUserData';
import {DAppChain} from 'models';
import React, {memo, useCallback, useMemo} from 'react';
import {View, StyleSheet, Text, Linking, ActivityIndicator} from 'react-native';
import FastImage from 'react-native-fast-image';
import makeBlockie from 'ethereum-blockies-base64';

type ConfirmViewProps = {
  confirmData: {
    title: string;
    message?: string;
    data: any;
  } | null;
  dappMetadata: {
    title: string;
    type: string;
    url: string;
    imageURL: string;
    description: string;
  } | null;
  url: string;
  onConfirmAction: () => void;
  actionLoading: boolean;
  onCancelAction: () => void;
  currentChain: DAppChain | null;
  gasPrice: number;
};

const ConfirmView = ({
  confirmData,
  dappMetadata,
  url,
  onConfirmAction,
  actionLoading,
  onCancelAction,
  currentChain,
  gasPrice,
}: ConfirmViewProps) => {
  const {colors} = useThemeColor();
  const user = useUserData();
  const address = useUserAddress();
  const nwFee = useMemo(() => {
    const price = confirmData?.data?.object?.gasPrice
      ? parseInt(confirmData?.data?.object?.gasPrice)
      : gasPrice;
    return parseInt(confirmData?.data?.object?.gas || 0) * price;
  }, [
    confirmData?.data?.object?.gas,
    confirmData?.data?.object?.gasPrice,
    gasPrice,
  ]);
  const total = useMemo(() => {
    return nwFee + parseInt(confirmData?.data?.object?.value || 0);
  }, [confirmData?.data?.object?.value, nwFee]);
  const onDAppLinkPress = useCallback(() => {
    const link = dappMetadata?.url || url;
    if (link) {
      Linking.openURL(link);
    }
  }, [dappMetadata?.url, url]);
  const renderHead = useCallback(() => {
    if (confirmData?.data?.name === 'signTransaction') {
      return null;
    }
    return (
      <View style={[styles.accountInfo, {borderColor: colors.border}]}>
        <FastImage
          source={{
            uri: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
          }}
          style={styles.networkLogo}
        />
        <View style={{flex: 1, marginLeft: 15}}>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[AppStyles.TextSemi16, {color: colors.text}]}>
            {user.user_name}
          </Text>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[
              AppStyles.TextMed14,
              {marginTop: 5, color: colors.subtext},
            ]}>
            {address}
          </Text>
        </View>
      </View>
    );
  }, [
    address,
    colors.border,
    colors.subtext,
    colors.text,
    confirmData?.data?.name,
    user.user_name,
  ]);
  const renderBody = useCallback(() => {
    if (confirmData?.data?.name === 'signTransaction') {
      return (
        <>
          <Text
            style={[
              AppStyles.TextMed15,
              {color: colors.subtext, marginTop: 20},
            ]}>
            Value
          </Text>
          <View
            style={[
              styles.valueWrap,
              {backgroundColor: colors.activeBackgroundLight},
            ]}>
            <FastImage
              style={styles.logoChain}
              source={{
                uri:
                  currentChain?.logo ||
                  'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
              }}
            />
            <Text
              style={[
                AppStyles.TextBold20,
                {color: colors.text, marginLeft: 15},
              ]}>
              {formatTokenFormHex({
                value: confirmData?.data?.object?.value,
                decimal: currentChain?.decimal || 18,
                symbol: currentChain?.symbol || 'ETH',
              })}
            </Text>
          </View>
          <Text
            style={[
              AppStyles.TextMed15,
              {color: colors.subtext, marginTop: 20},
            ]}>
            From
          </Text>
          <View style={styles.userWrap}>
            <AvatarView user={user} withStatus={false} size={25} />
            <Text
              style={[
                AppStyles.TextSemi14,
                {color: colors.text, marginLeft: 10},
              ]}>
              {user.user_name}
            </Text>
            <Text
              style={[
                AppStyles.TextMed14,
                {color: colors.subtext, marginLeft: 10},
              ]}>
              ({normalizeUserName(confirmData?.data?.object?.from || address)})
            </Text>
          </View>
          <Text
            style={[
              AppStyles.TextMed15,
              {color: colors.subtext, marginTop: 20},
            ]}>
            To
          </Text>
          <View style={styles.userWrap}>
            <FastImage
              style={{width: 25, height: 25, borderRadius: 12.5}}
              source={{uri: makeBlockie(confirmData?.data?.object?.to || '')}}
            />
            <Text
              style={[
                AppStyles.TextSemi14,
                {color: colors.text, marginLeft: 10},
              ]}>
              {normalizeUserName(confirmData?.data?.object?.to || '', 8)}
            </Text>
          </View>
          <Text
            style={[
              AppStyles.TextMed15,
              {color: colors.subtext, marginTop: 20},
            ]}>
            Network fee
          </Text>
          <Text
            style={[AppStyles.TextSemi14, {color: colors.text, marginTop: 10}]}>
            {formatTokenFormHex({
              value: nwFee,
              decimal: currentChain?.decimal || 18,
              symbol: currentChain?.symbol || 'ETH',
            })}
          </Text>
          <Text
            style={[
              AppStyles.TextMed15,
              {color: colors.subtext, marginTop: 20},
            ]}>
            Total
          </Text>
          <Text
            style={[AppStyles.TextSemi14, {color: colors.text, marginTop: 10}]}>
            {formatTokenFormHex({
              value: total,
              decimal: currentChain?.decimal || 18,
              symbol: currentChain?.symbol || 'ETH',
            })}
          </Text>
        </>
      );
    }
    if (confirmData?.message) {
      return (
        <>
          <Text
            style={[
              AppStyles.TextMed15,
              {color: colors.subtext, marginTop: 20},
            ]}>
            Message
          </Text>
          <View
            style={[
              styles.messageWrap,
              {
                backgroundColor: colors.activeBackgroundLight,
                borderColor: colors.border,
              },
            ]}>
            <Text style={[AppStyles.TextMed12, {color: colors.subtext}]}>
              {confirmData?.message || ''}
            </Text>
          </View>
        </>
      );
    }
    return null;
  }, [
    address,
    colors.activeBackgroundLight,
    colors.border,
    colors.subtext,
    colors.text,
    confirmData?.data?.name,
    confirmData?.data?.object?.from,
    confirmData?.data?.object?.to,
    confirmData?.data?.object?.value,
    confirmData?.message,
    currentChain?.decimal,
    currentChain?.logo,
    currentChain?.symbol,
    nwFee,
    total,
    user,
  ]);
  return (
    <View style={[styles.modalConfirm, {backgroundColor: colors.background}]}>
      <Text
        style={[
          AppStyles.TextBold20,
          {color: colors.text, alignSelf: 'center'},
        ]}>
        {confirmData?.title || ''}
      </Text>
      {renderHead()}
      <Text
        style={[AppStyles.TextMed15, {color: colors.subtext, marginTop: 20}]}>
        DApp
      </Text>
      <View style={styles.dAppInfo}>
        {dappMetadata?.imageURL ? (
          <FastImage
            style={styles.dAppLogo}
            source={{uri: dappMetadata.imageURL}}
          />
        ) : (
          <View style={styles.dAppLogo}>
            <SVG.IconImageDefault
              width={50}
              height={50}
              fill={colors.subtext}
            />
          </View>
        )}
        <View style={{flex: 1, marginLeft: 15}}>
          <Text
            style={[AppStyles.TextBold20, {color: colors.text}]}
            ellipsizeMode="tail"
            numberOfLines={1}>
            {dappMetadata?.title || ''}
          </Text>
          <Touchable style={{marginTop: 5}} onPress={onDAppLinkPress}>
            <Text
              style={[AppStyles.TextMed15, {color: colors.mention}]}
              ellipsizeMode="tail"
              numberOfLines={1}>
              {dappMetadata?.url || url}
            </Text>
          </Touchable>
        </View>
      </View>
      {renderBody()}
      <Touchable
        style={[styles.button, {backgroundColor: colors.blue, marginTop: 40}]}
        onPress={onConfirmAction}
        disabled={actionLoading}>
        {actionLoading ? (
          <ActivityIndicator color={colors.text} />
        ) : (
          <Text style={[AppStyles.TextSemi16, {color: colors.text}]}>
            Confirm
          </Text>
        )}
      </Touchable>
      <Touchable
        style={[styles.button, {backgroundColor: colors.border, marginTop: 20}]}
        onPress={onCancelAction}>
        <Text style={[AppStyles.TextSemi16, {color: colors.subtext}]}>
          Cancel
        </Text>
      </Touchable>
    </View>
  );
};

const styles = StyleSheet.create({
  modalConfirm: {
    borderRadius: 5,
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: AppDimension.extraBottom + 20,
    minHeight: 350,
  },
  networkLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 5,
    borderWidth: 1,
    marginTop: 30,
  },
  dAppInfo: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dAppLogo: {
    width: 50,
    height: 50,
    borderRadius: 5,
    overflow: 'hidden',
  },
  messageWrap: {
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 5,
  },
  button: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
  },
  valueWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
  },
  logoChain: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
});

export default memo(ConfirmView);
