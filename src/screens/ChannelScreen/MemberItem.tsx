import Fonts from 'common/Fonts';
import AvatarView from 'components/AvatarView';
import {normalizeUserName} from 'helpers/MessageHelper';
import useThemeColor from 'hook/useThemeColor';
import {UserData} from 'models';
import React, {memo} from 'react';
import {View, StyleSheet, Text} from 'react-native';

type MemberItemProps = {
  item: UserData;
};

const MemberItem = ({item}: MemberItemProps) => {
  const {colors} = useThemeColor();
  return (
    <View style={[styles.container]}>
      <View style={styles.avatarWrapper}>
        <AvatarView user={item} />
      </View>
      <Text style={[styles.userName, {color: colors.subtext}]}>
        {normalizeUserName(item.user_name)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    borderRadius: 5,
  },
  avatarWrapper: {
    marginLeft: 10,
  },
  avatar: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
  },
  userName: {
    marginLeft: 15,
    fontSize: 16,
    fontFamily: Fonts.SemiBold,
    lineHeight: 19,
  },
});

export default memo(MemberItem);
