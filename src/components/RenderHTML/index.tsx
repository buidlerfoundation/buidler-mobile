import Fonts from 'common/Fonts';
import useThemeColor from 'hook/useThemeColor';
import React, {memo} from 'react';
import {useWindowDimensions, Linking} from 'react-native';
import Html, {defaultSystemFonts} from 'react-native-render-html';

type RenderHTMLProps = {
  html: string;
  onLinkPress?: () => void;
};

const RenderHTML = ({html, onLinkPress}: RenderHTMLProps) => {
  const {width} = useWindowDimensions();
  const {colors} = useThemeColor();
  return (
    <Html
      systemFonts={[
        ...defaultSystemFonts,
        'SFUIText-Bold',
        'SFUIText-Semibold',
        'SFUIText-Medium',
        'SFUIText-Regular',
      ]}
      contentWidth={width}
      source={{html}}
      tagsStyles={{
        a: {
          color: colors.mention,
          textDecorationLine: 'none',
        },
      }}
      renderersProps={{
        a: {
          onPress: (_, href) => {
            onLinkPress?.();
            if (href.includes('?user_id=')) {
              const userId = href.split('?user_id=')?.[1];
              if (userId) {
                // Direct Message
              }
              return;
            }
            Linking.openURL(href);
          },
        },
      }}
      classesStyles={{
        'task-text': {
          fontFamily: Fonts.Medium,
          fontSize: 16,
          lineHeight: 26,
          color: colors.text,
        },
        'message-text': {
          fontFamily: Fonts.Medium,
          fontSize: 16,
          lineHeight: 26,
          marginTop: 8,
          color: colors.text,
        },
        'message-reply-text': {
          marginHorizontal: 10,
          fontSize: 16,
          fontFamily: Fonts.Medium,
          lineHeight: 26,
          color: colors.text,
        },
        'mention-string': {
          color: colors.mention,
          textDecorationLine: 'none',
        },
        'task-archived': {
          color: colors.subtext,
        },
      }}
    />
  );
};

export default memo(RenderHTML);
