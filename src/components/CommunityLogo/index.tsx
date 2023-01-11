import Fonts from 'common/Fonts';
import ImageHelper from 'helpers/ImageHelper';
import {Community} from 'models';
import React, {memo} from 'react';
import {Text, View} from 'react-native';
import FastImage from 'react-native-fast-image';

type CommunityLogoProps = {
  community: Community;
  size?: number;
  borderRadius?: number;
};

const CommunityLogo = ({
  community,
  size = 40,
  borderRadius = 10,
}: CommunityLogoProps) => {
  return community.team_icon ? (
    <FastImage
      style={{
        width: size,
        height: size,
        borderRadius: borderRadius,
        overflow: 'hidden',
      }}
      source={{
        uri: ImageHelper.normalizeImage(
          community.team_icon,
          community.team_id,
          {
            w: size,
            h: size,
          },
        ),
      }}
    />
  ) : (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: borderRadius,
        overflow: 'hidden',
        backgroundColor: 'black',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Text
        style={{
          color: 'white',
          fontFamily: Fonts.Helvetica,
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: size / 2,
          textTransform: 'uppercase',
        }}>
        {community.team_display_name.charAt(0)}
      </Text>
    </View>
  );
};

export default memo(CommunityLogo);
