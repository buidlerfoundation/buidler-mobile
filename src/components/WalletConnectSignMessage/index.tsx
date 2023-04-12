import AppDimension from 'common/AppDimension';
import AppStyles from 'common/AppStyles';
import Touchable from 'components/Touchable';
import useThemeColor from 'hook/useThemeColor';
import React, {memo} from 'react';
import {View, StyleSheet, Text} from 'react-native';

type WalletConnectSignMessageProps = {
  message: string;
  onConfirmAction: () => void;
  onCancelAction: () => void;
};

const WalletConnectSignMessage = ({
  message,
  onConfirmAction,
  onCancelAction,
}: WalletConnectSignMessageProps) => {
  const {colors} = useThemeColor();
  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <Text
        style={[
          AppStyles.TextBold20,
          {color: colors.text, alignSelf: 'center'},
        ]}>
        Message Signing Request
      </Text>
      <Text
        style={[AppStyles.TextMed15, {color: colors.subtext, marginTop: 20}]}>
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
          {message}
        </Text>
      </View>
      <Touchable
        style={[styles.button, {backgroundColor: colors.blue, marginTop: 40}]}
        onPress={onConfirmAction}>
        <Text style={[AppStyles.TextSemi16, {color: colors.text}]}>
          Confirm
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
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: AppDimension.extraBottom + 12,
    minHeight: 350,
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
});

export default memo(WalletConnectSignMessage);
