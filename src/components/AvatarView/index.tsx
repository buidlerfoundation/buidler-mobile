import ImageHelper from 'helpers/ImageHelper';
import {UserData} from 'models';
import React, {useMemo, memo} from 'react';
import {StyleSheet, View} from 'react-native';
import FastImage from 'react-native-fast-image';
import Blockies from 'components/Blockies';
import useThemeColor from 'hook/useThemeColor';

type AvatarViewProps = {
  user: UserData;
  size?: number;
};

const AvatarView = ({user, size = 25}: AvatarViewProps) => {
  const {colors} = useThemeColor();
  const data = useMemo(
    () => ImageHelper.normalizeAvatar(user?.avatar_url, user?.user_id),
    [user?.avatar_url, user?.user_id],
  );
  return (
    <View style={styles.container}>
      {typeof data === 'string' ? (
        <FastImage
          style={{width: size, height: size, borderRadius: size / 2}}
          source={{
            uri: data,
          }}
        />
      ) : (
        <Blockies
          blockies={data.address}
          size={8}
          style={{width: size, height: size, borderRadius: size / 2}}
        />
      )}
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

export default memo(AvatarView);
