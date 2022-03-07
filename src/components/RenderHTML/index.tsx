import actions from 'actions';
import Fonts from 'common/Fonts';
import ScreenID from 'common/ScreenID';
import {Channel, ThemeType, User} from 'models';
import React from 'react';
import {useWindowDimensions, Linking} from 'react-native';
import Html, {defaultSystemFonts} from 'react-native-render-html';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import NavigationServices from 'services/NavigationServices';
import themes from 'themes';

type RenderHTMLProps = {
  html: string;
  themeType: ThemeType;
  teamUserData: Array<User>;
  setCurrentChannel?: (channel: Channel) => any;
  onLinkPress?: () => void;
};

const RenderHTML = ({
  html,
  themeType,
  teamUserData,
  setCurrentChannel,
  onLinkPress,
}: RenderHTMLProps) => {
  const {width} = useWindowDimensions();
  const {colors} = themes[themeType];
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
              const user = teamUserData.find(el => el.user_id === userId);
              if (user) {
                setCurrentChannel({
                  channel_id: user.direct_channel || '',
                  channel_name: '',
                  channel_type: 'Direct',
                  user,
                  seen: true,
                });
                NavigationServices.pushToScreen(ScreenID.ConversationScreen);
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

const mapPropsToState = (state: any) => {
  return {
    themeType: state.configs.theme,
    teamUserData: state.user.teamUserData,
  };
};

export default connect(mapPropsToState)(RenderHTML);
