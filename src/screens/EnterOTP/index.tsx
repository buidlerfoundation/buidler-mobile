import React, {useEffect, useState} from 'react';
import {View, StyleSheet, Text, TextInput} from 'react-native';
import NavigationHeader from 'components/NavigationHeader';
import {useTheme} from '@react-navigation/native';
import Fonts from 'common/Fonts';
import api from 'services/api';
import {getDeviceCode} from 'helpers/GenerateUUID';
import NavigationServices from 'services/NavigationServices';
import {useDispatch} from 'react-redux';
import {actionTypes} from 'actions/actionTypes';

const EnterOTP = () => {
  const dispatch = useDispatch();
  const {colors} = useTheme();
  const [otp, setOtp] = useState('');
  const submitOtp = async (text: string) => {
    const deviceCode = await getDeviceCode();
    const body = {
      device_code: deviceCode,
      otp_code: text,
    };
    const res = await api.verifyOtp(body);
    if (res.statusCode === 200) {
      NavigationServices.goBack();
      alert('Your account was verified.');
    } else {
      alert(res.message);
    }
  };
  useEffect(() => {
    return () => {
      dispatch({type: actionTypes.TOGGLE_OTP});
    };
  }, []);
  return (
    <View style={styles.container}>
      <NavigationHeader title="Enter OTP code" />
      <View style={styles.otpInputContainer}>
        <View style={[styles.inputItem, {backgroundColor: colors.border}]}>
          <Text style={[styles.otpItem, {color: colors.text}]}>{otp?.[0]}</Text>
        </View>
        <View style={[styles.inputItem, {backgroundColor: colors.border}]}>
          <Text style={[styles.otpItem, {color: colors.text}]}>{otp?.[1]}</Text>
        </View>
        <View style={[styles.inputItem, {backgroundColor: colors.border}]}>
          <Text style={[styles.otpItem, {color: colors.text}]}>{otp?.[2]}</Text>
        </View>
        <View style={[styles.inputItem, {backgroundColor: colors.border}]}>
          <Text style={[styles.otpItem, {color: colors.text}]}>{otp?.[3]}</Text>
        </View>
        <TextInput
          style={styles.input}
          autoFocus
          maxLength={4}
          value={otp}
          onChangeText={text => {
            if (text.length === 4) {
              submitOtp(text);
            }
            setOtp(text);
          }}
          keyboardType="number-pad"
          returnKeyType="done"
          onSubmitEditing={() => submitOtp(otp)}
          blurOnSubmit={false}
        />
      </View>
      <Text style={[styles.des, {color: colors.subtext}]}>
        A code was sent to your Buidler app in other devices.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  otpInputContainer: {
    flexDirection: 'row',
    marginTop: 65,
    height: 60,
    paddingHorizontal: 10,
  },
  inputItem: {
    marginHorizontal: 10,
    flex: 1,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpItem: {
    fontFamily: Fonts.Bold,
    fontSize: 20,
    lineHeight: 24,
  },
  input: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    opacity: 0,
  },
  des: {
    fontFamily: Fonts.SemiBold,
    fontSize: 14,
    lineHeight: 22,
    marginLeft: 20,
    marginTop: 10,
  },
});

export default EnterOTP;
