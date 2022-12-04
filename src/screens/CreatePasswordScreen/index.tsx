import NavigationHeader from 'components/NavigationHeader';
import React, {memo, useCallback, useMemo, useRef, useState} from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Text,
  ActivityIndicator,
} from 'react-native';
import Fonts from 'common/Fonts';
import Touchable from 'components/Touchable';
import {passwordRules} from 'helpers/PasswordHelper';
import PasswordLevel from 'components/PasswordLevel';
import AppDevice from 'common/AppDevice';
import KeyboardLayout from 'components/KeyboardLayout';
import NavigationServices from 'services/NavigationServices';
import ScreenID from 'common/ScreenID';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AuthStackParamsList} from 'navigation/AuthStack';
import useThemeColor from 'hook/useThemeColor';
import useAppDispatch from 'hook/useAppDispatch';
import {accessApp} from 'actions/UserActions';
import {useFocusEffect} from '@react-navigation/native';
import useAccessingApp from 'hook/useAccessingApp';

type Props = NativeStackScreenProps<
  AuthStackParamsList,
  'CreatePasswordScreen'
>;

const CreatePasswordScreen = ({route}: Props) => {
  const dispatch = useAppDispatch();
  const inputRef = useRef<TextInput>();
  const seed = useMemo(() => route.params?.seed || '', [route.params?.seed]);
  const {colors, dark} = useThemeColor();
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const togglePassword = () => setShowPassword(!showPassword);
  const accessingApp = useAccessingApp();
  const passwordLevel = useMemo(() => {
    const requiredPassRules = passwordRules().filter(el => el.isRequired);
    const passRequired = requiredPassRules.filter(el =>
      el.regex.test(password),
    );
    if (
      requiredPassRules.length > 0 &&
      passRequired.length < requiredPassRules.length
    )
      return 0;
    return passwordRules().filter(el => el.regex.test(password)).length;
  }, [password]);
  const onNextPress = useCallback(() => {
    if (seed) {
      // logged on
      dispatch(accessApp(seed, password));
    } else {
      NavigationServices.pushToScreen(ScreenID.StoreSeedPhraseScreen, {
        password,
      });
    }
  }, [dispatch, password, seed]);
  const onChangePassword = useCallback(text => setPassword(text), []);
  useFocusEffect(
    useCallback(() => {
      inputRef.current?.focus();
    }, []),
  );
  return (
    <KeyboardLayout>
      <View style={styles.container}>
        <NavigationHeader title="Create password" />
        <View style={styles.body}>
          <View
            style={[
              styles.passwordView,
              {
                backgroundColor: colors.activeBackgroundLight,
                borderColor: colors.border,
              },
            ]}>
            <TextInput
              ref={inputRef}
              style={[styles.input, {color: colors.text}]}
              placeholder="Your wallet password"
              placeholderTextColor={colors.subtext}
              secureTextEntry={!showPassword}
              keyboardAppearance={dark ? 'dark' : 'light'}
              autoCorrect={false}
              value={password}
              onChangeText={onChangePassword}
              textContentType="oneTimeCode"
            />
            <Touchable style={styles.buttonSecure} onPress={togglePassword}>
              <Text style={[styles.secureText, {color: colors.subtext}]}>
                {showPassword ? 'Hide' : 'Show'}
              </Text>
            </Touchable>
          </View>
          <PasswordLevel level={passwordLevel} />
          <View style={styles.recommendView}>
            <Text style={[styles.recommendText, {color: colors.subtext}]}>
              Recommendation
            </Text>
            {passwordRules().map(el => {
              const match = el.regex.test(password);
              const suffix = el.isRequired ? ' *' : '';
              return (
                <Text
                  key={el.label}
                  style={[
                    styles.recommendText,
                    {color: match ? colors.text : colors.subtext},
                  ]}>
                  {' '}
                  • {el.label}
                  {suffix}
                </Text>
              );
            })}
          </View>
        </View>
        <View style={styles.bottom}>
          {/* <Touchable style={styles.buttonSecureDes}>
            <Text style={[styles.secureDes, {color: colors.subtext}]}>
              How does Notable store your password?
            </Text>
          </Touchable> */}
          <Touchable
            style={[styles.buttonNext, {backgroundColor: colors.blue}]}
            onPress={onNextPress}
            disabled={accessingApp}>
            {accessingApp ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <Text style={[styles.textNext, {color: colors.text}]}>Next</Text>
            )}
          </Touchable>
        </View>
      </View>
    </KeyboardLayout>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  body: {
    flex: 1,
    marginTop: AppDevice.isIphoneX ? 57 : 20,
  },
  passwordView: {
    marginHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 5,
    borderWidth: 1,
    height: 60,
    padding: 10,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    fontFamily: Fonts.SemiBold,
    fontSize: 16,
  },
  buttonSecure: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  secureText: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Fonts.SemiBold,
  },
  recommendView: {
    marginTop: 10,
    marginLeft: 40,
  },
  recommendText: {
    fontSize: 14,
    lineHeight: 24,
    fontFamily: Fonts.SemiBold,
  },
  bottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  buttonNext: {
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textNext: {
    fontSize: 16,
    lineHeight: 19,
    fontFamily: Fonts.SemiBold,
  },
  secureDes: {
    textDecorationLine: 'underline',
    fontFamily: Fonts.SemiBold,
    fontSize: 14,
    lineHeight: 24,
    marginBottom: AppDevice.isIphoneX ? 30 : 10,
  },
  buttonSecureDes: {
    alignSelf: 'center',
  },
});

export default memo(CreatePasswordScreen);
