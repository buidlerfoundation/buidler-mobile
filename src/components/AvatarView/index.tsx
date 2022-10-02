import ImageHelper from 'helpers/ImageHelper';
import {UserData} from 'models';
import React, {useMemo, memo, useCallback} from 'react';
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
  const data = useMemo(
    () => ImageHelper.normalizeAvatar(user?.avatar_url, user?.user_id),
    [user?.avatar_url, user?.user_id],
  );
  const renderBody = useCallback(() => {
    if (typeof data === 'string') {
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
        blockies={data.address}
        size={8}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.border,
        }}
      />
    );
  }, [colors.border, data, size]);

  return (
    <View style={[style, {width: size, height: size}]}>
      {renderBody()}
      {withStatus && user.status === 'online' && (
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
