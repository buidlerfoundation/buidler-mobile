import Fonts from 'common/Fonts';
import useThemeColor from 'hook/useThemeColor';
import React, {memo, useCallback, useMemo} from 'react';
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
  const handleLinkPress = useCallback(
    (e, href) => {
      e.stopPropagation();
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
    [onLinkPress],
  );
  const renderersProps = useMemo(
    () => ({
      a: {
        onPress: handleLinkPress,
      },
    }),
    [handleLinkPress],
  );
  const tagsStyles = useMemo(
    () => ({
      a: {
        color: colors.mention,
        textDecorationLine: 'none',
      },
    }),
    [colors.mention],
  );
  const classesStyles = useMemo(
    () => ({
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
      'message-text-sending': {
        fontFamily: Fonts.Medium,
        fontSize: 16,
        lineHeight: 26,
        marginTop: 5,
        color: colors.subtext,
        whiteSpace: 'pre',
      },
      'message-text-archived': {
        fontFamily: Fonts.Medium,
        fontSize: 16,
        lineHeight: 26,
        marginTop: 5,
        color: colors.subtext,
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
    }),
    [colors.lightText, colors.mention, colors.subtext, colors.text],
  );
  const systemFonts = useMemo(
    () => [
      ...defaultSystemFonts,
      'SFUIText-Bold',
      'SFUIText-Semibold',
      'SFUIText-Medium',
      'SFUIText-Regular',
    ],
    [],
  );
  return (
    <Html
      systemFonts={systemFonts}
      contentWidth={width}
      source={{html}}
      tagsStyles={tagsStyles}
      defaultTextProps={defaultTextProps}
      renderersProps={renderersProps}
      classesStyles={classesStyles}
    />
  );
};

export default memo(RenderHTML);
