import AppStyles from 'common/AppStyles';
import Fonts from 'common/Fonts';
import AvatarView from 'components/AvatarView';
import Touchable from 'components/Touchable';
import useThemeColor from 'hook/useThemeColor';
import {UserData} from 'models';
import React, {memo, useCallback, useState} from 'react';
import {View, StyleSheet, Text, TextInput} from 'react-native';

type MenuConfirmDeleteAccountProps = {
  user: UserData;
  onClose: () => void;
  onConfirm: () => void;
};

const MenuConfirmDeleteAccount = ({
  user,
  onClose,
  onConfirm,
}: MenuConfirmDeleteAccountProps) => {
  const {colors} = useThemeColor();
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const onDeletePress = useCallback(() => {
    if (input === user.user_name) {
      onConfirm();
    } else {
      setError('Invalid user name');
    }
  }, [input, onConfirm, user.user_name]);
  const onChangeText = useCallback(text => {
    setInput(text.replace(/…/g, '...'));
    setError('');
  }, []);
  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <View style={styles.header}>
        <AvatarView user={user} withStatus={false} />
        <Text
          style={[AppStyles.TextBold17, {marginLeft: 12, color: colors.text}]}>
          {user.user_name}
        </Text>
      </View>
      <Text
        style={[
          styles.message,
          AppStyles.TextMed15,
          {
            color: colors.subtext,
          },
        ]}>
        Are you sure you want to delete this account? Once you confirm, you will
        lose all of your account data. This action can not be undone.
      </Text>
      <View>
        <TextInput
          style={[
            styles.inputContainer,
            {
              color: colors.text,
              borderColor: colors.border,
              backgroundColor: colors.activeBackgroundLight,
            },
          ]}
          placeholder="Type the account's username to confirm"
          autoFocus
          placeholderTextColor={colors.subtext}
          value={input}
          onChangeText={onChangeText}
          autoCorrect={false}
          autoComplete={false}
        />
        {!!error && (
          <Text
            style={[styles.error, AppStyles.TextMed13, {color: colors.urgent}]}>
            {error}
          </Text>
        )}
      </View>
      <Touchable
        style={[styles.bottomButton, {marginTop: 75}]}
        onPress={onClose}>
        <Text style={[AppStyles.TextSemi16, {color: colors.subtext}]}>
          Cancel
        </Text>
      </Touchable>
      <Touchable
        style={[styles.bottomButton, {backgroundColor: colors.border}]}
        onPress={onDeletePress}>
        <Text style={[AppStyles.TextSemi16, {color: colors.urgent}]}>
          Delete Account
        </Text>
      </Touchable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 22.5,
    borderRadius: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
  },
  bottomButton: {
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    marginTop: 22.5,
    marginHorizontal: 15,
    alignSelf: 'center',
    textAlign: 'center',
  },
  inputContainer: {
    marginHorizontal: 15,
    marginTop: 30,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontFamily: Fonts.Medium,
    fontSize: 15,
    borderRadius: 5,
    borderWidth: 1,
  },
  error: {
    marginHorizontal: 15,
    position: 'absolute',
    bottom: -24,
  },
});

export default memo(MenuConfirmDeleteAccount);
