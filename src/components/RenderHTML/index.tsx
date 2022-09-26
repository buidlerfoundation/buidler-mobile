import Fonts from 'common/Fonts';
import useThemeColor from 'hook/useThemeColor';
import React, {memo} from 'react';
import {useWindowDimensions, Linking, TextProps} from 'react-native';
import Html, {defaultSystemFonts} from 'react-native-render-html';

type RenderHTMLProps = {
  html: string;
  onLinkPress?: () => void;
  defaultTextProps?: TextProps;
};

const RenderHTML = ({html, onLinkPress, defaultTextProps}: RenderHTMLProps) => {
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
      defaultTextProps={defaultTextProps}
      renderersProps={{
        a: {
          onPress: (_, href) => {
            onLinkPress?.();
            if (href.includes('channels/user/')) {
              const userId = href.split('channels/user/')?.[1];
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
        'edited-string': {
          fontFamily: Fonts.Medium,
          fontSize: 12,
          lineHeight: 20,
          color: colors.subtext,
        },
        'message-text': {
          fontFamily: Fonts.Medium,
          fontSize: 16,
          lineHeight: 26,
          marginTop: 5,
          color: colors.text,
          whiteSpace: 'pre',
        },
        'message-text-reply': {
          marginLeft: 8,
          fontFamily: Fonts.Medium,
          fontSize: 14,
          lineHeight: 22,
          color: colors.lightText,
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
