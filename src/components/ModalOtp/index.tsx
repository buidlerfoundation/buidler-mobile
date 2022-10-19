import React, {memo} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import Modal from 'react-native-modal';
import {useTheme} from '@react-navigation/native';
import Fonts from 'common/Fonts';
import Touchable from 'components/Touchable';
import {useDispatch} from 'react-redux';
import {actionTypes} from 'actions/actionTypes';

type ModalOtpProps = {
  isOpen: boolean;
  otp: string;
};

const ModalOtp = ({isOpen, otp}: ModalOtpProps) => {
  const {colors} = useTheme();
  const dispatch = useDispatch();
  return (
    <Modal
      isVisible={isOpen}
      style={styles.container}
      avoidKeyboard
      onMoveShouldSetResponderCapture={() => false}
      backdropColor={colors.black}
      backdropOpacity={0.75}>
      <View
        style={[
          styles.bodyContainer,
          {backgroundColor: colors.background, borderColor: colors.border},
        ]}>
        <Text style={[styles.title, {color: colors.text}]}>OTP code</Text>
        <View style={styles.otpWrapper}>
          <View style={[styles.otpItem, {backgroundColor: colors.border}]}>
            <Text style={[styles.otpText, {color: colors.text}]}>
              {otp?.[0]}
            </Text>
          </View>
          <View style={[styles.otpItem, {backgroundColor: colors.border}]}>
            <Text style={[styles.otpText, {color: colors.text}]}>
              {otp?.[1]}
            </Text>
          </View>
          <View style={[styles.otpItem, {backgroundColor: colors.border}]}>
            <Text style={[styles.otpText, {color: colors.text}]}>
              {otp?.[2]}
            </Text>
          </View>
          <View style={[styles.otpItem, {backgroundColor: colors.border}]}>
            <Text style={[styles.otpText, {color: colors.text}]}>
              {otp?.[3]}
            </Text>
          </View>
        </View>
        <Text style={[styles.des, {color: colors.subtext}]}>
          Verification code to log in your new device.
        </Text>
        <Touchable
          style={[styles.btnDismiss, {backgroundColor: colors.border}]}
          onPress={() => {
            dispatch({type: actionTypes.TOGGLE_OTP});
          }}>
          <Text style={[styles.dismiss, {color: colors.text}]}>Dismiss</Text>
        </Touchable>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {},
  bodyContainer: {
    paddingBottom: 20,
    paddingTop: 30,
    alignItems: 'center',
    borderRadius: 5,
    borderWidth: 1,
  },
  title: {
    fontSize: 20,
    lineHeight: 24,
    fontFamily: Fonts.Bold,
  },
  otpWrapper: {
    marginTop: 30,
    flexDirection: 'row',
    paddingHorizontal: 10,
  },
  otpItem: {
    marginHorizontal: 10,
    borderRadius: 5,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  otpText: {
    fontSize: 20,
    lineHeight: 24,
    fontFamily: Fonts.Bold,
  },
  des: {
    marginTop: 10,
    fontSize: 14,
    fontFamily: Fonts.SemiBold,
    lineHeight: 22,
  },
  btnDismiss: {
    height: 60,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    width: '80%',
  },
  dismiss: {
    fontSize: 16,
    lineHeight: 26,
    fontFamily: Fonts.SemiBold,
  },
});

export default memo(ModalOtp);
