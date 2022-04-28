import AppDimension from 'common/AppDimension';
import Touchable from 'components/Touchable';
import {Channel, SpaceChannel, Team, ThemeType, User} from 'models';
import React from 'react';
import {View, FlatList, StyleSheet, Image, Text} from 'react-native';
import {connect} from 'react-redux';
import themes from 'themes';
import FastImage from 'react-native-fast-image';
import ImageHelper from 'helpers/ImageHelper';
import {bindActionCreators} from 'redux';
import actions from 'actions';
import SVG from 'common/SVG';
import Fonts from 'common/Fonts';
import MemberItem from './MemberItem';
import NavigationServices from 'services/NavigationServices';
import ScreenID from 'common/ScreenID';

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
        <FastImage
          style={{width: 50, height: 50, borderRadius: 12.5}}
          source={{
            uri: ImageHelper.normalizeImage(item.team_icon, item.team_id, {
              w: 50,
              h: 50,
              radius: 12.5,
            }),
          }}
        />
      </Touchable>
    );
  };
  const renderFooter = () => {
    return (
      <View style={{paddingBottom: AppDimension.extraBottom + 26}}>
        <View style={styles.groupHead}>
          <SVG.IconCollapse fill={colors.subtext} />
          <Text style={[styles.groupName, {color: colors.subtext}]}>
            MEMBER
          </Text>
        </View>
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
      </View>
    );
  };
  const renderSpaceChannelItem = ({item}: {item: SpaceChannel}) => {
    return (
      <View>
        <View style={styles.groupHead}>
          <SVG.IconCollapse fill={colors.subtext} />
          <Text style={[styles.groupName, {color: colors.subtext}]}>
            {item.space_name}
          </Text>
        </View>
        {channel
          .filter(c => c.space_id === item.space_id)
          .map(c => {
            const isActive = currentChannel.channel_id === c.channel_id;
            return (
              <Touchable
                style={[
                  styles.channelItem,
                  isActive && {backgroundColor: colors.activeBackgroundLight},
                ]}
                key={c.channel_id}
                onPress={() => {
                  setCurrentChannel(c);
                  NavigationServices.pushToScreen(ScreenID.ConversationScreen);
                }}
                onLongPress={() => {
                  setCurrentChannel(c);
                  NavigationServices.pushToScreen(ScreenID.TaskScreen);
                }}>
                <Text
                  style={[
                    styles.channelName,
                    {color: isActive || !c.seen ? colors.text : colors.subtext},
                  ]}>
                  {c.channel_type === 'Private' ? (
                    <Image
                      style={{
                        tintColor:
                          isActive || !c.seen ? colors.text : colors.subtext,
                      }}
                      source={require('assets/images/ic_private.png')}
                    />
                  ) : (
                    '#'
                  )}{' '}
                  {c.channel_name}
                </Text>
              </Touchable>
            );
          })}
      </View>
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
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, paddingTop: AppDimension.extraTop},
  mainView: {flexDirection: 'row', flex: 1},
  teamContainer: {
    width: 70,
  },
  channelContainer: {
    flex: 1,
  },
  groupHead: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    paddingHorizontal: 20,
  },
  groupName: {
    fontFamily: Fonts.Bold,
    fontSize: 16,
    lineHeight: 19,
    marginLeft: 12,
  },
  channelItem: {
    paddingLeft: 40,
    flexDirection: 'row',
    height: 40,
    alignItems: 'center',
  },
  channelName: {
    fontFamily: Fonts.SemiBold,
    fontSize: 16,
    lineHeight: 19,
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
