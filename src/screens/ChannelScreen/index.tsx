import AppDimension from 'common/AppDimension';
import Touchable from 'components/Touchable';
import {Community, Space} from 'models';
import React, {memo, useCallback, useState} from 'react';
import {View, FlatList, StyleSheet, Text, SectionList} from 'react-native';
import Collapsible from 'react-native-collapsible';
import Fonts from 'common/Fonts';
import MemberItem from './MemberItem';
import SpaceItem from './SpaceItem';
import SVG from 'common/SVG';
import useThemeColor from 'hook/useThemeColor';
import useCurrentCommunity from 'hook/useCurrentCommunity';
import useSpaceChannel from 'hook/useSpaceChannel';
import useAppSelector from 'hook/useAppSelector';
import useCurrentChannel from 'hook/useCurrentChannel';
import useTeamUserData from 'hook/useTeamUserData';
import TeamItem from './TeamItem';
import {useMemo} from 'react';
import ChannelItem from './ChannelItem';

const ChannelScreen = () => {
  const team = useAppSelector(state => state.user.team || []);
  const userData = useAppSelector(state => state.user.userData);
  const teamUserData = useTeamUserData();
  const spaceChannel = useSpaceChannel();
  const currentTeam = useCurrentCommunity();
  const currentChannel = useCurrentChannel();
  const [isCollapsed, setCollapsed] = useState(false);
  const toggleCollapsed = useCallback(
    () => setCollapsed(current => !current),
    [],
  );
  const {colors} = useThemeColor();
  const user = useMemo(
    () => teamUserData?.find?.(u => u.user_id === userData.user_id),
    [teamUserData, userData.user_id],
  );
  const renderTeamItem = useCallback(
    ({item}: {item: Community; index: number}) => {
      const isActive = currentTeam.team_id === item.team_id;
      return <TeamItem item={item} isActive={isActive} />;
    },
    [currentTeam.team_id],
  );
  const renderFooter = useCallback(() => {
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
          {user && <MemberItem item={user} />}
          {teamUserData
            ?.filter?.(u => u.user_id !== userData.user_id)
            ?.map(u => (
              <MemberItem item={u} key={u.user_id} />
            ))}
        </Collapsible>
      </View>
    );
  }, [
    colors.background,
    colors.text,
    isCollapsed,
    teamUserData,
    toggleCollapsed,
    user,
    userData.user_id,
  ]);
  const renderSectionHeader = useCallback(
    (e: {section: {title: Space; data: Array<string>}}) => {
      return (
        <SpaceItem
          isEmpty={e.section.data.length === 0}
          item={e.section.title}
          teamId={currentTeam.team_id}
        />
      );
    },
    [currentTeam.team_id],
  );

  const renderItemSeparate = useCallback(e => {
    return <View style={{height: e.leadingItem ? 10 : 0}} />;
  }, []);
  const renderItem = useCallback(
    ({
      item,
      index,
      section,
    }: {
      item: string;
      index: number;
      section: {data: Array<string>};
    }) => {
      const isActive = currentChannel.channel_id === item;
      return (
        <ChannelItem
          channelId={item}
          isActive={isActive}
          isLast={index === section.data.length - 1}
        />
      );
    },
    [currentChannel.channel_id],
  );
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
          <SectionList
            sections={spaceChannel.map(el => ({
              data: el.channel_ids,
              title: el,
            }))}
            renderSectionHeader={renderSectionHeader}
            stickySectionHeadersEnabled={false}
            keyExtractor={item => item}
            ListFooterComponent={renderFooter}
            ListHeaderComponent={<View style={{height: 10}} />}
            SectionSeparatorComponent={renderItemSeparate}
            renderItem={renderItem}
            initialNumToRender={20}
            windowSize={2}
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

export default memo(ChannelScreen);
