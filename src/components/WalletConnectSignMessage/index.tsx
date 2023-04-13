import {useWalletConnect} from '@walletconnect/react-native-dapp';
import AppDimension from 'common/AppDimension';
import AppStyles from 'common/AppStyles';
import SVG from 'common/SVG';
import AnimatedDot from 'components/AnimatedDot';
import Touchable from 'components/Touchable';
import useThemeColor from 'hook/useThemeColor';
import React, {memo} from 'react';
import {View, StyleSheet, Text} from 'react-native';

type WalletConnectSignMessageProps = {
  onConfirmAction: () => void;
  onCancelAction: () => void;
};

const WalletConnectSignMessage = ({
  onConfirmAction,
  onCancelAction,
}: WalletConnectSignMessageProps) => {
  const {colors} = useThemeColor();
  const connector = useWalletConnect();
  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <Text
        style={[
          AppStyles.TextBold20,
          {color: colors.text, alignSelf: 'center'},
        ]}>
        Waiting for confirmation
      </Text>
      <View style={{alignSelf: 'center', marginVertical: 40}}>
        <AnimatedDot />
      </View>
      <View style={{alignSelf: 'center', alignItems: 'center'}}>
        <SVG.LogoWC />
        <Text
          style={[AppStyles.TextSemi16, {color: colors.text, marginTop: 5}]}>
          with {connector.peerMeta?.name}
        </Text>
      </View>
      <Touchable
        style={[styles.button, {backgroundColor: colors.blue, marginTop: 40}]}
        onPress={onConfirmAction}>
        <Text style={[AppStyles.TextSemi16, {color: colors.text}]}>
          Open {connector.peerMeta?.name}
        </Text>
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
  container: {
    borderRadius: 5,
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: AppDimension.extraBottom + 20,
    minHeight: 350,
  },
  button: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
  },
});

export default memo(WalletConnectSignMessage);
