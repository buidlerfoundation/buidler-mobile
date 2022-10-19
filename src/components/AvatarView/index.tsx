import ImageHelper from 'helpers/ImageHelper';
import {UserData} from 'models';
import React, {memo, useCallback} from 'react';
import {StyleSheet, View, ViewStyle} from 'react-native';
import FastImage from 'react-native-fast-image';
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
  }, [colors.border, size, user?.avatar_url, user?.user_id]);

  return (
    <View style={[style, {width: size, height: size}]}>
      {renderBody()}
      {withStatus && user?.status === 'online' && (
        <View
          style={[
            styles.onlineStatus,
            {
              backgroundColor: colors.backgroundHeader,
              alignItems: 'center',
              justifyContent: 'center',
              width: size > 25 ? 14 : 10,
              height: size > 25 ? 14 : 10,
              borderRadius: size > 25 ? 7 : 5,
              overflow: 'hidden',
            },
          ]}>
          <View
            style={[
              {
                backgroundColor: colors.success,
                width: size > 25 ? 10 : 6,
                height: size > 25 ? 10 : 6,
                borderRadius: size > 25 ? 5 : 3,
              },
            ]}
          />
        </View>
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
