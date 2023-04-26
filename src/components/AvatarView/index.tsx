import ImageHelper from 'helpers/ImageHelper';
import {UserData} from 'models';
import React, {memo, useCallback} from 'react';
import {StyleSheet, Text, View, ViewStyle} from 'react-native';
import FastImage from 'react-native-fast-image';
import useThemeColor from 'hook/useThemeColor';
import SvgUri from 'components/SvgUri';
import SVG from 'common/SVG';
import AppStyles from 'common/AppStyles';

type AvatarViewProps = {
  user: UserData;
  size?: number;
  withStatus?: boolean;
  style?: ViewStyle;
  bot?: boolean;
};

const AvatarView = ({
  user,
  size = 25,
  withStatus = true,
  style,
  bot,
}: AvatarViewProps) => {
  const {colors} = useThemeColor();
  const renderBody = useCallback(() => {
    if (!user?.avatar_url && !user?.user_id) {
      return (
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: colors.border,
          }}>
          <SVG.IconUser fill={colors.text} width={size} height={size} />
        </View>
      );
    }
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
  }, [colors.border, colors.text, size, user?.avatar_url, user?.user_id]);

  const renderUserStatus = useCallback(() => {
    if (bot) {
      return (
        <View
          style={[
            styles.botStatus,
            {backgroundColor: colors.blue, borderColor: colors.border},
          ]}>
          <Text style={[AppStyles.TextMed11, {color: colors.text}]}>bot</Text>
        </View>
      );
    }
    if (withStatus && user?.status === 'online') {
      return (
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
      );
    }
    return null;
  }, [
    bot,
    colors.backgroundHeader,
    colors.blue,
    colors.border,
    colors.success,
    colors.text,
    size,
    user?.status,
    withStatus,
  ]);

  return (
    <View style={[style, {width: size, height: size}]}>
      {renderBody()}
      {renderUserStatus()}
    </View>
  );
};

const styles = StyleSheet.create({
  onlineStatus: {
    position: 'absolute',
    bottom: -2,
    right: -2,
  },
  botStatus: {
    position: 'absolute',
    bottom: -6,
    right: -10,
    width: 30,
    height: 18,
    borderWidth: 2,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default memo(AvatarView);
