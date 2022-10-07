import {useNavigation} from '@react-navigation/native';
import {setCurrentChannel, setCurrentTeam} from 'actions/UserActions';
import Fonts from 'common/Fonts';
import ScreenID from 'common/ScreenID';
import {extractBuidlerUrl} from 'helpers/LinkHelper';
import useAppDispatch from 'hook/useAppDispatch';
import useAppSelector from 'hook/useAppSelector';
import useChannelId from 'hook/useChannelId';
import useCommunityId from 'hook/useCommunityId';
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
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const team = useAppSelector(state => state.user.team);
  const currentCommunityId = useCommunityId();
  const currentChannelId = useChannelId();
  const {width} = useWindowDimensions();
  const {colors} = useThemeColor();
  const handleLinkPress = useCallback(
    (e, href) => {
      e.stopPropagation();
      onLinkPress?.();
      if (href.includes('https://community.buidler.app')) {
        if (href.includes('channels/user/')) {
          const userId = href.split('channels/user/')?.[1];
          if (userId) {
            // Direct Message
          }
          return;
        }
        const {channelId, communityId, postId, messageId} =
          extractBuidlerUrl(href);
        const community = team.find(el => el.team_id === communityId);
        if (!community) {
          // user not in community
          return;
        }
        if (messageId) {
          if (communityId !== currentCommunityId) {
            dispatch(setCurrentTeam(community));
          }
          if (channelId !== currentChannelId) {
            dispatch(setCurrentChannel({channel_id: channelId}));
          }
          navigation.navigate(ScreenID.ConversationScreen, {
            jumpMessageId: `${messageId}:${Math.random()}`,
          });
        } else if (postId) {
          navigation.navigate(ScreenID.PinPostDetailScreen, {postId});
        }
        return;
      }
      Linking.openURL(href);
    },
    [
      currentChannelId,
      currentCommunityId,
      dispatch,
      navigation,
      onLinkPress,
      team,
    ],
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
