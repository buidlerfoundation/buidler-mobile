import AppDimension from 'common/AppDimension';
import AppStyles from 'common/AppStyles';
import AvatarView from 'components/AvatarView';
import Touchable from 'components/Touchable';
import useThemeColor from 'hook/useThemeColor';
import {UserData} from 'models';
import React, {memo} from 'react';
import {View, StyleSheet, Text} from 'react-native';

type ConfirmBlockUserProps = {
  user: UserData;
  onClose: () => void;
  onBlock: () => void;
};

const ConfirmBlockUser = ({user, onClose, onBlock}: ConfirmBlockUserProps) => {
  const {colors} = useThemeColor();
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
          AppStyles.TextMed15,
          {marginTop: 22.5, color: colors.subtext, alignSelf: 'center'},
        ]}>
        Are you sure you want to block this user?
      </Text>
      <Touchable
        style={[
          styles.bottomButton,
          {backgroundColor: colors.border, marginTop: 25},
        ]}
        onPress={onClose}>
        <Text style={[AppStyles.TextSemi16, {color: colors.text}]}>Cancel</Text>
      </Touchable>
      <Touchable
        style={[
          styles.bottomButton,
          {backgroundColor: colors.border, marginTop: 10},
        ]}
        onPress={onBlock}>
        <Text style={[AppStyles.TextSemi16, {color: colors.urgent}]}>
          Block
        </Text>
      </Touchable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 22.5,
    paddingHorizontal: 15,
    paddingBottom: 12 + AppDimension.extraBottom,
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
    borderRadius: 5,
  },
});

export default memo(ConfirmBlockUser);
