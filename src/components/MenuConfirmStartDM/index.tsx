import AppDimension from 'common/AppDimension';
import AppStyles from 'common/AppStyles';
import Touchable from 'components/Touchable';
import useThemeColor from 'hook/useThemeColor';
import {UserData} from 'models';
import React, {memo} from 'react';
import {View, StyleSheet, Text} from 'react-native';

type MenuConfirmStartDMProps = {
  user: UserData;
  onClose: () => void;
  startDM: () => void;
  creating?: boolean;
};

const MenuConfirmStartDM = ({
  user,
  startDM,
  onClose,
  creating,
}: MenuConfirmStartDMProps) => {
  const {colors} = useThemeColor();
  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <View style={styles.header}>
        <Text
          style={[AppStyles.TextBold17, {color: colors.text}]}
          numberOfLines={1}
          ellipsizeMode="tail">
          Start DM @{user.user_name}
        </Text>
        <Text
          style={[
            AppStyles.TextMed15,
            {color: colors.subtext, marginTop: 20, textAlign: 'center'},
          ]}>
          Are you sure you want to start a secure conversation with @
          {user.user_name}?
        </Text>
      </View>
      <View style={[styles.descriptionWrap, {borderColor: colors.border}]}>
        <Text style={[AppStyles.TextSemi16, {color: colors.subtext}]}>
          Direct Messages
        </Text>
        <Text
          style={[
            AppStyles.TextMed15,
            {color: colors.subtext, marginTop: 15, lineHeight: 20},
          ]}>
          • End-to-end encryption.{'\n'}• Do not allow to forwarding.{'\n'}•
          What happen between us, stay with us.
        </Text>
      </View>
      <Touchable
        style={[
          styles.bottomButton,
          {backgroundColor: colors.border, marginTop: 25},
        ]}
        useReactNative
        onPress={onClose}>
        <Text style={[AppStyles.TextSemi16, {color: colors.text}]}>Cancel</Text>
      </Touchable>
      <Touchable
        style={[styles.bottomButton, {backgroundColor: colors.blue}]}
        useReactNative
        onPress={startDM}
        disabled={creating}>
        <Text style={[AppStyles.TextSemi16, {color: colors.text}]}>Start</Text>
      </Touchable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 24,
    paddingHorizontal: 15,
    paddingBottom: 12 + AppDimension.extraBottom,
    borderRadius: 15,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  descriptionWrap: {
    marginTop: 20,
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 15,
    borderWidth: 1,
    borderRadius: 5,
  },
  bottomButton: {
    marginTop: 15,
    height: 60,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default memo(MenuConfirmStartDM);
