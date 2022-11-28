import AppStyles from 'common/AppStyles';
import AvatarView from 'components/AvatarView';
import useDirectChannelUser from 'hook/useDirectChannelUser';
import useThemeColor from 'hook/useThemeColor';
import React, {memo} from 'react';
import {StyleSheet, Text, View} from 'react-native';

const DirectChannelTitle = () => {
  const {colors} = useThemeColor();
  const otherUser = useDirectChannelUser();
  return (
    <View style={styles.titleWrap}>
      <AvatarView user={otherUser} />
      <Text
        style={[styles.title, AppStyles.TextBold17, {color: colors.text}]}
        ellipsizeMode="tail"
        numberOfLines={1}>
        {otherUser.user_name}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  titleWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
  title: {
    marginHorizontal: 5,
    flex: 1,
  },
});

export default memo(DirectChannelTitle);
