import {useNavigation} from '@react-navigation/native';
import {setCurrentChannel, setCurrentTeam} from 'actions/UserActions';
import Fonts from 'common/Fonts';
import ScreenID from 'common/ScreenID';
import {buidlerURL, extractBuidlerUrl, sameDAppURL} from 'helpers/LinkHelper';
import useAppDispatch from 'hook/useAppDispatch';
import useAppSelector from 'hook/useAppSelector';
import useChannelId from 'hook/useChannelId';
import useCommunityId from 'hook/useCommunityId';
import useCurrentChannel from 'hook/useCurrentChannel';
import useThemeColor from 'hook/useThemeColor';
import React, {memo, useCallback, useMemo} from 'react';
import {useWindowDimensions, Linking, TextProps} from 'react-native';
import Html, {
  defaultSystemFonts,
  defaultHTMLElementModels,
} from 'react-native-render-html';

type RenderHTMLProps = {
  html: string;
  onLinkPress?: () => void;
  defaultTextProps?: TextProps;
  embeds?: boolean;
  onOpenBrowser?: () => void;
};

const RenderHTML = ({
  html,
  onLinkPress,
  defaultTextProps = {},
  embeds,
  onOpenBrowser,
}: RenderHTMLProps) => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const team = useAppSelector(state => state.user.team);
  const currentCommunityId = useCommunityId();
  const currentChannelId = useChannelId();
  const currentChannel = useCurrentChannel();
  const {width} = useWindowDimensions();
  const {colors} = useThemeColor();
  const handleLinkPress = useCallback(
    (e, href) => {
      e.stopPropagation();
      if (embeds) return;
      onLinkPress?.();
      if (href.includes(buidlerURL)) {
        if (href.includes('channels/user/')) {
          const userId = href.split('channels/user/')?.[1];
          if (userId) {
            navigation.navigate(ScreenID.UserScreen, {userId});
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
            channelId,
          });
        } else if (postId) {
          navigation.navigate(ScreenID.PinPostDetailScreen, {postId});
        } else if (channelId) {
          dispatch(setCurrentChannel({channel_id: channelId}));
        }
        return;
      } else if (sameDAppURL(href, currentChannel?.dapp_integration_url)) {
        onOpenBrowser?.();
        return;
      }
      Linking.openURL(href);
    },
    [
      currentChannel?.dapp_integration_url,
      currentChannelId,
      currentCommunityId,
      dispatch,
      embeds,
      navigation,
      onLinkPress,
      onOpenBrowser,
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
      h1: {
        fontSize: 26,
        lineHeight: 34,
      },
      h2: {
        fontSize: 24,
        lineHeight: 30,
      },
      h3: {
        fontSize: 22,
        lineHeight: 26,
      },
      h4: {
        fontSize: 20,
        lineHeight: 22,
      },
    }),
    [colors.mention],
  );
  const classesStyles = useMemo(
    () => ({
      'edited-string': {
        fontFamily: Fonts.Medium,
        fontSize: 11,
        lineHeight: 20,
        color: colors.subtext,
      },
      'message-text': {
        fontFamily: Fonts.Medium,
        fontSize: 15,
        lineHeight: 24,
        marginTop: 5,
        color: colors.text,
        whiteSpace: 'pre',
      },
      'message-text-sending': {
        fontFamily: Fonts.Medium,
        fontSize: 15,
        lineHeight: 24,
        marginTop: 5,
        color: colors.subtext,
        whiteSpace: 'pre',
      },
      'message-text-archived': {
        fontFamily: Fonts.Medium,
        fontSize: 15,
        lineHeight: 24,
        marginTop: 5,
        color: colors.subtext,
        whiteSpace: 'pre',
      },
      'message-text-reply': {
        marginLeft: 8,
        fontFamily: Fonts.Medium,
        fontSize: 13,
        lineHeight: 22,
        color: colors.lightText,
      },
      'mention-string': {
        color: colors.mention,
        textDecorationLine: 'none',
      },
      'task-archived': {
        color: colors.subtext,
      },
      'message-text-bot': {
        fontFamily: Fonts.Medium,
        fontSize: 15,
        lineHeight: 24,
        marginTop: 5,
        whiteSpace: 'pre',
        color: colors.mention,
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
      defaultTextProps={{...defaultTextProps, allowFontScaling: false}}
      renderersProps={renderersProps}
      classesStyles={classesStyles}
      ignoredDomTags={['t']}
      customHTMLElementModels={{
        title: defaultHTMLElementModels.span,
      }}
    />
  );
};

export default memo(RenderHTML);
