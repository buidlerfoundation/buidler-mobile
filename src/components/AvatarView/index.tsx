import ImageHelper from 'helpers/ImageHelper';
import {UserData} from 'models';
import React, {memo, useCallback} from 'react';
import {StyleSheet, View, ViewStyle} from 'react-native';
import FastImage from 'react-native-fast-image';
import Blockies from 'components/Blockies';
import useThemeColor from 'hook/useThemeColor';
import SvgUri from 'components/SvgUri';

type AvatarViewProps = {
  user: UserData;
  size?: number;
  withStatus?: boolean;
  style?: ViewStyle;
};

const AvatarView = ({
  user,
  size = 25,
  withStatus = true,
  style,
}: AvatarViewProps) => {
  const {colors} = useThemeColor();
  const renderBody = useCallback(() => {
    if (user?.avatar_url) {
      const data = ImageHelper.normalizeAvatar(user?.avatar_url, user?.user_id);
      if (data.includes('.svg')) {
        return (
          <View
            style={{
              width: size,
              height: size,
              borderRadius: size / 2,
              overflow: 'hidden',
              backgroundColor: colors.border,
            }}>
            <SvgUri uri={data} width={size} height={size} />
          </View>
        );
      }
      return (
        <FastImage
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: colors.border,
          }}
          source={{
            uri: data,
          }}
        />
      );
    }
    return (
      <Blockies
        blockies={user?.addressAvatar}
        size={8}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.border,
        }}
      />
    );
  }, [
    colors.border,
    size,
    user?.addressAvatar,
    user?.avatar_url,
    user?.user_id,
  ]);

  return (
    <View style={[style, {width: size, height: size}]}>
      {renderBody()}
      {withStatus && user?.status === 'online' && (
        <View
          style={[
            styles.onlineStatus,
            {
              backgroundColor: colors.success,
              borderColor: colors.backgroundHeader,
              width: size > 25 ? 14 : 10,
              height: size > 25 ? 14 : 10,
              borderRadius: size > 25 ? 7 : 5,
              borderWidth: 2,
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  onlineStatus: {
    position: 'absolute',
    bottom: -2,
    right: -2,
  },
});

export default memo(AvatarView);
