import AppStyles from 'common/AppStyles';
import SVG from 'common/SVG';
import Touchable from 'components/Touchable';
import useThemeColor from 'hook/useThemeColor';
import React, {memo} from 'react';
import {View, StyleSheet, Text} from 'react-native';

type MenuLoginSocialProps = {
  onLoginGoogle: () => void;
  onLoginApple: () => void;
  onLoginFacebook: () => void;
  onLoginTwitter: () => void;
  onLoginDiscord: () => void;
  onLoginGithub: () => void;
};

const MenuLoginSocial = ({
  onLoginGoogle,
  onLoginApple,
  onLoginDiscord,
  onLoginFacebook,
  onLoginTwitter,
  onLoginGithub,
}: MenuLoginSocialProps) => {
  const {colors} = useThemeColor();
  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <Text
        style={[
          AppStyles.TextBold20,
          {color: colors.text, alignSelf: 'center'},
        ]}>
        Social Connect
      </Text>
      <View style={[styles.buttonWrap, {marginTop: 40}]}>
        <Touchable
          style={[styles.button, {backgroundColor: colors.border}]}
          onPress={onLoginGoogle}
          useReactNative>
          <View
            style={{
              width: 26,
              height: 26,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <SVG.IconLogoGoogle />
          </View>
          <Text
            style={[
              AppStyles.TextSemi16,
              {color: colors.text, marginLeft: 12},
            ]}>
            Google
          </Text>
        </Touchable>
        <Touchable
          style={[
            styles.button,
            {backgroundColor: colors.border, marginLeft: 15},
          ]}
          onPress={onLoginApple}
          useReactNative>
          <SVG.IconLogoApple />
          <Text
            style={[
              AppStyles.TextSemi16,
              {color: colors.text, marginLeft: 12},
            ]}>
            Apple
          </Text>
        </Touchable>
      </View>
      <View style={[styles.buttonWrap, {marginTop: 15}]}>
        <Touchable
          style={[styles.button, {backgroundColor: colors.border}]}
          onPress={onLoginFacebook}
          useReactNative>
          <SVG.IconLogoFacebook />
          <Text
            style={[
              AppStyles.TextSemi16,
              {color: colors.text, marginLeft: 12},
            ]}>
            Facebook
          </Text>
        </Touchable>
        <Touchable
          style={[
            styles.button,
            {backgroundColor: colors.border, marginLeft: 15},
          ]}
          onPress={onLoginTwitter}
          useReactNative>
          <SVG.IconLogoTwitter />
          <Text
            style={[
              AppStyles.TextSemi16,
              {color: colors.text, marginLeft: 12},
            ]}>
            Twitter
          </Text>
        </Touchable>
      </View>
      <View style={[styles.buttonWrap, {marginTop: 15}]}>
        <Touchable
          style={[styles.button, {backgroundColor: colors.border}]}
          onPress={onLoginGithub}
          useReactNative>
          <SVG.IconLogoGithub />
          <Text
            style={[
              AppStyles.TextSemi16,
              {color: colors.text, marginLeft: 12},
            ]}>
            Github
          </Text>
        </Touchable>
        <Touchable
          style={[
            styles.button,
            {backgroundColor: colors.border, marginLeft: 15},
          ]}
          onPress={onLoginDiscord}
          useReactNative>
          <SVG.IconLogoDiscord />
          <Text
            style={[
              AppStyles.TextSemi16,
              {color: colors.text, marginLeft: 12},
            ]}>
            Discord
          </Text>
        </Touchable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 5,
    paddingHorizontal: 30,
    paddingTop: 30,
    minHeight: 350,
  },
  button: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 5,
    paddingHorizontal: 20,
    flex: 1,
  },
  buttonWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default memo(MenuLoginSocial);
