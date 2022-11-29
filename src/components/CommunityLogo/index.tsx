import SVG from 'common/SVG';
import ImageHelper from 'helpers/ImageHelper';
import {Community} from 'models';
import React, {memo} from 'react';
import {View} from 'react-native';
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
      }}>
      <SVG.LogoDarkSquare width={size} height={size} />
    </View>
  );
};

export default memo(CommunityLogo);
