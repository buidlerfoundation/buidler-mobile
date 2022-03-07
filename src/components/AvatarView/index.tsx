import {ThemeType, User} from 'models';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import FastImage from 'react-native-fast-image';
import themes from 'themes';

type AvatarViewProps = {
  themeType: ThemeType;
  user: User;
  size?: number;
};

const AvatarView = ({themeType, user, size = 25}: AvatarViewProps) => {
  const {colors} = themes[themeType];
  return (
    <View style={styles.container}>
      <FastImage
        style={{width: size, height: size, borderRadius: size / 2}}
        source={{uri: user.avatar_url}}
      />
      {user.status === 'online' && (
        <View
          style={[
            styles.onlineStatus,
            {
              backgroundColor: colors.success,
              borderColor: colors.backgroundHeader,
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  onlineStatus: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    position: 'absolute',
    bottom: -2,
    right: -2,
  },
});

export default AvatarView;
