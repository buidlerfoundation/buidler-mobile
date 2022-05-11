import AppDimension from 'common/AppDimension';
import Touchable from 'components/Touchable';
import {Channel, SpaceChannel, Team, ThemeType, User} from 'models';
import React, {useState} from 'react';
import {View, FlatList, StyleSheet, Text} from 'react-native';
import {connect} from 'react-redux';
import themes from 'themes';
import FastImage from 'react-native-fast-image';
import ImageHelper from 'helpers/ImageHelper';
import {bindActionCreators} from 'redux';
import actions from 'actions';
import Collapsible from 'react-native-collapsible';
import Fonts from 'common/Fonts';
import MemberItem from './MemberItem';
import NavigationServices from 'services/NavigationServices';
import ScreenID from 'common/ScreenID';
import SpaceItem from './SpaceItem';
import SVG from 'common/SVG';

type ChannelScreenProps = {
  themeType: ThemeType;
  team: Array<Team>;
  currentTeam: Team;
  setCurrentTeam: (team: Team) => any;
  spaceChannel: Array<SpaceChannel>;
  channel: Array<Channel>;
  currentChannel: Channel;
  setCurrentChannel: (channel: Channel) => any;
  userData: User;
  teamUserData: Array<User>;
};

const ChannelScreen = ({
  themeType,
  team,
  currentTeam,
  setCurrentTeam,
  channel,
  currentChannel,
  spaceChannel,
  setCurrentChannel,
  userData,
  teamUserData,
}: ChannelScreenProps) => {
  const [isCollapsed, setCollapsed] = useState(false);
  const toggleCollapsed = () => setCollapsed(!isCollapsed);
  const {colors} = themes[themeType];
  const user = teamUserData?.find?.(u => u.user_id === userData.user_id);
  const renderTeamItem = ({item}: {item: Team; index: number}) => {
    const isActive = currentTeam.team_id === item.team_id;
    return (
      <Touchable
        style={[
          {padding: 10},
          isActive && {backgroundColor: colors.backgroundHeader},
        ]}
        onPress={() => {
          setCurrentTeam(item);
          NavigationServices.pushToScreen(ScreenID.ConversationScreen);
        }}>
        {item.team_icon ? (
          <FastImage
            style={styles.logoTeam}
            source={{
              uri: ImageHelper.normalizeImage(item.team_icon, item.team_id, {
                w: 50,
                h: 50,
                radius: 12.5,
              }),
            }}
          />
        ) : (
          <View style={styles.logoTeam}>
            <SVG.LogoDarkSquare width={50} height={50} />
          </View>
        )}
      </Touchable>
    );
  };
  const renderFooter = () => {
    return (
      <View
        style={[
          styles.space,
          {
            backgroundColor: colors.background,
            marginTop: 10,
            marginBottom: 10 + AppDimension.extraBottom,
          },
        ]}>
        <Touchable style={styles.groupHead} onPress={toggleCollapsed}>
          <View style={styles.logoSpaceWrapper}>
            <SVG.LogoLightSquare width={30} height={30} />
          </View>
          <Text style={[styles.groupName, {color: colors.text}]}>MEMBER</Text>
        </Touchable>
        <Collapsible collapsed={isCollapsed} duration={400} easing="linear">
          {user && (
            <Touchable
              onPress={() => {
                setCurrentChannel({
                  channel_id: user.direct_channel || '',
                  channel_name: '',
                  channel_type: 'Direct',
                  user,
                  seen: true,
                });
                NavigationServices.pushToScreen(ScreenID.ConversationScreen);
              }}>
              <MemberItem
                item={user}
                themeType={themeType}
                isUnSeen={
                  channel.find((c: any) => c.channel_id === user.direct_channel)
                    ?.seen === false
                }
                isSelected={
                  currentChannel.channel_id === user.direct_channel ||
                  currentChannel?.user?.user_id === user.user_id
                }
              />
            </Touchable>
          )}
          {teamUserData
            ?.filter?.(u => u.user_id !== userData.user_id)
            ?.map(u => (
              <Touchable
                key={u.user_id}
                onPress={() => {
                  setCurrentChannel({
                    channel_id: u.direct_channel || '',
                    channel_name: '',
                    channel_type: 'Direct',
                    user: u,
                    seen: true,
                  });
                  NavigationServices.pushToScreen(ScreenID.ConversationScreen);
                }}>
                <MemberItem
                  item={u}
                  themeType={themeType}
                  isUnSeen={
                    channel.find((c: any) => c.channel_id === u.direct_channel)
                      ?.seen === false
                  }
                  isSelected={
                    currentChannel.channel_id === u.direct_channel ||
                    currentChannel?.user?.user_id === u.user_id
                  }
                />
              </Touchable>
            ))}
        </Collapsible>
      </View>
    );
  };
  const renderSpaceChannelItem = ({item}: {item: SpaceChannel}) => {
    return (
      <SpaceItem
        item={item}
        channel={channel}
        currentChannel={currentChannel}
        setCurrentChannel={setCurrentChannel}
        teamId={currentTeam.team_id}
      />
    );
  };
  return (
    <View
      style={[styles.container, {backgroundColor: colors.backgroundHeader}]}>
      <View style={styles.mainView}>
        <View
          style={[styles.teamContainer, {backgroundColor: colors.background}]}>
          <FlatList
            data={team}
            keyExtractor={item => item.team_id}
            renderItem={renderTeamItem}
          />
        </View>
        <View style={styles.channelContainer}>
          <FlatList
            data={spaceChannel}
            keyExtractor={item => item.space_id}
            renderItem={renderSpaceChannelItem}
            ListFooterComponent={renderFooter}
            ListHeaderComponent={<View style={{height: 10}} />}
            ItemSeparatorComponent={() => <View style={{height: 10}} />}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, paddingTop: AppDimension.extraTop},
  logoTeam: {
    width: 50,
    height: 50,
    borderRadius: 12.5,
    overflow: 'hidden',
  },
  mainView: {flexDirection: 'row', flex: 1},
  teamContainer: {
    width: 70,
  },
  channelContainer: {
    flex: 1,
  },
  space: {
    marginHorizontal: 10,
    padding: 10,
    borderRadius: 5,
  },
  groupHead: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  groupName: {
    fontFamily: Fonts.Bold,
    fontSize: 16,
    lineHeight: 19,
  },
  channelItem: {
    paddingHorizontal: 10,
    flexDirection: 'row',
    height: 40,
    alignItems: 'center',
    borderRadius: 5,
  },
  channelName: {
    fontFamily: Fonts.SemiBold,
    fontSize: 16,
    lineHeight: 19,
  },
  logoSpaceWrapper: {
    width: 30,
    height: 30,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 15,
  },
});

const mapPropsToState = (state: any) => {
  return {
    themeType: state.configs.theme,
    team: state.user.team,
    currentTeam: state.user.currentTeam,
    spaceChannel: state.user.spaceChannel,
    channel: state.user.channel,
    currentChannel: state.user.currentChannel,
    userData: state.user.userData,
    teamUserData: state.user.teamUserData,
  };
};

const mapActionsToProps = (dispatch: any) =>
  bindActionCreators(actions, dispatch);

export default connect(mapPropsToState, mapActionsToProps)(ChannelScreen);
