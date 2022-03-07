import Fonts from 'common/Fonts';
import AvatarView from 'components/AvatarView';
import {ThemeType, User} from 'models';
import React from 'react';
import {View, StyleSheet, Text} from 'react-native';
import FastImage from 'react-native-fast-image';
import themes from 'themes';

type MemberItemProps = {
  item: User;
  themeType: ThemeType;
  isUnSeen?: boolean;
  isSelected?: boolean;
};

const MemberItem = ({
  item,
  themeType,
  isUnSeen,
  isSelected,
}: MemberItemProps) => {
  const {colors} = themes[themeType];
  return (
    <View
      style={[
        styles.container,
        isSelected && {backgroundColor: colors.activeBackgroundLight},
      ]}>
      <View style={styles.avatarWrapper}>
        <AvatarView user={item} themeType={themeType} />
      </View>
      <Text
        style={[
          styles.userName,
          {color: isUnSeen || isSelected ? colors.text : colors.subtext},
        ]}>
        {item.full_name}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
  },
  avatarWrapper: {
    marginLeft: 30,
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

export default MemberItem;
