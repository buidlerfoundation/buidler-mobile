import AppDimension from 'common/AppDimension';
import Touchable from 'components/Touchable';
import {Space} from 'models';
import React, {memo, useCallback, useMemo, useState} from 'react';
import {View, StyleSheet, Text, FlatList, Alert} from 'react-native';
import SpaceItem from './SpaceItem';
import useThemeColor from 'hook/useThemeColor';
import useCurrentCommunity from 'hook/useCurrentCommunity';
import useSpaceChannel from 'hook/useSpaceChannel';
import useTeamUserData from 'hook/useTeamUserData';
import CommunityLogo from 'components/CommunityLogo';
import ScreenID from 'common/ScreenID';
import {useNavigation} from '@react-navigation/native';
import useCommunityId from 'hook/useCommunityId';
import AppStyles from 'common/AppStyles';
import numeral from 'numeral';
import api from 'services/api';
import Clipboard from '@react-native-clipboard/clipboard';
import Toast from 'react-native-toast-message';
import SVG from 'common/SVG';

const CommunityHeader = () => {
  const {colors} = useThemeColor();
  const currentTeam = useCurrentCommunity();
  const navigation = useNavigation();
  const openDrawer = useCallback(() => {
    navigation.navigate(ScreenID.CommunityScreen);
  }, [navigation]);
  return (
    <Touchable style={styles.communityContainer} onPress={openDrawer}>
      <CommunityLogo community={currentTeam} size={40} />
      <Text
        style={[
          styles.communityTitle,
          AppStyles.TextBold20,
          {color: colors.text},
        ]}
        ellipsizeMode="tail"
        numberOfLines={1}>
        {currentTeam.team_display_name}
      </Text>
    </Touchable>
  );
};

const ChannelScreen = () => {
  const teamUserData = useTeamUserData();
  const spaceChannel = useSpaceChannel();
  const communityId = useCommunityId();
  const community = useCurrentCommunity();
  const communityVerified = useMemo(
    () => community.is_verified,
    [community.is_verified],
  );
  const isOwner = useMemo(() => community.role === 'Owner', [community.role]);
  const showBadge = useMemo(
    () => isOwner || communityVerified,
    [communityVerified, isOwner],
  );
  const showCover = useMemo(
    () => showBadge || community.team_cover,
    [community.team_cover, showBadge],
  );
  const [inviteLink, setInviteLink] = useState('');
  const {colors} = useThemeColor();
  const onInvitePress = useCallback(async () => {
    let link = '';
    if (!inviteLink) {
      const res = await api.invitation(communityId);
      link = res?.data?.invitation_url;
      setInviteLink(res?.data?.invitation_url);
    }
    Alert.alert('Invite Member', inviteLink || link, [
      {text: 'Copy link', onPress: onCopyInviteLink},
    ]);
  }, [communityId, inviteLink, onCopyInviteLink]);
  const renderHeader = useCallback(() => {
    return (
      <View
        style={[styles.communityInfo, {backgroundColor: colors.background}]}>
        {showCover && (
          <View
            style={[
              styles.communityCoverWrap,
              {backgroundColor: colors.activeBackgroundLight},
            ]}>
            {showBadge && (
              <View style={styles.badgeCommunity}>
                <Text
                  style={[
                    AppStyles.TextSemi15,
                    {
                      color: colors.text,
                      marginRight: communityVerified ? 8 : 0,
                    },
                  ]}>
                  {communityVerified
                    ? community.team_display_name
                    : 'Verify your community'}
                </Text>
                {communityVerified && (
                  <SVG.IconVerifyBadge fill={colors.text} />
                )}
              </View>
            )}
          </View>
        )}
        <View style={[styles.rowMemberWrap, {marginTop: 15}]}>
          <View style={[styles.dot, {backgroundColor: colors.lightText}]} />
          <Text style={[AppStyles.TextSemi15, {color: colors.lightText}]}>
            All members: {numeral(teamUserData.length).format('0[.][0]a')}
          </Text>
        </View>
        <View style={[styles.rowMemberWrap, {marginTop: 8}]}>
          <View style={[styles.dot, {backgroundColor: colors.success}]} />
          <Text style={[AppStyles.TextSemi15, {color: colors.lightText}]}>
            Online: {teamUserData.filter(el => el.status === 'online').length}
          </Text>
        </View>
        <Touchable
          style={[
            styles.btnInvite,
            {backgroundColor: colors.activeBackgroundLight},
          ]}
          onPress={onInvitePress}>
          <Text style={[AppStyles.TextSemi15, {color: colors.text}]}>
            Invite member
          </Text>
        </Touchable>
      </View>
    );
  }, [
    colors.activeBackgroundLight,
    colors.background,
    colors.lightText,
    colors.success,
    colors.text,
    community.team_display_name,
    communityVerified,
    onInvitePress,
    showBadge,
    showCover,
    teamUserData,
  ]);
  const onCreateSpace = useCallback(() => {}, []);
  const onCreateChannel = useCallback(() => {}, []);
  const renderFooter = useCallback(() => {
    if (isOwner) {
      return (
        <Touchable
          style={[styles.createButton, {backgroundColor: colors.background}]}
          onPress={onCreateSpace}>
          <SVG.IconPlus fill={colors.subtext} />
          <Text
            style={[
              AppStyles.TextSemi15,
              {color: colors.subtext, marginLeft: 13},
            ]}>
            New space
          </Text>
        </Touchable>
      );
    }
    return <View style={{height: 10}} />;
  }, [colors.background, colors.subtext, isOwner, onCreateSpace]);
  const renderSpace = useCallback(
    ({item}: {item: Space}) => {
      return (
        <SpaceItem
          item={item}
          isOwner={isOwner}
          onCreateChannel={onCreateChannel}
        />
      );
    },
    [isOwner, onCreateChannel],
  );

  const renderItemSeparate = useCallback(() => {
    return <View style={{height: 10}} />;
  }, []);
  const onCopyInviteLink = useCallback(async () => {
    await Clipboard.setString(inviteLink);
    Toast.show({type: 'customSuccess', props: {message: 'Copied'}});
  }, [inviteLink]);
  return (
    <View
      style={[styles.container, {backgroundColor: colors.backgroundHeader}]}>
      <View style={styles.mainView}>
        <View style={styles.channelContainer}>
          <CommunityHeader />
          <FlatList
            data={spaceChannel}
            keyExtractor={item => item.space_id}
            renderItem={renderSpace}
            ListFooterComponent={renderFooter}
            ListHeaderComponent={renderHeader}
            ItemSeparatorComponent={renderItemSeparate}
            windowSize={2}
            initialNumToRender={10}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, paddingTop: AppDimension.extraTop},
  mainView: {flexDirection: 'row', flex: 1},
  communityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingLeft: 20,
    paddingRight: 10,
  },
  communityTitle: {
    marginHorizontal: 10,
  },
  channelContainer: {
    flex: 1,
  },
  communityInfo: {
    margin: 10,
    borderRadius: 5,
  },
  communityCoverWrap: {
    height: 80,
    borderRadius: 5,
  },
  rowMemberWrap: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  btnInvite: {
    height: 40,
    marginHorizontal: 10,
    marginTop: 15,
    marginBottom: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeCommunity: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#191919B2',
    borderRadius: 5,
    paddingHorizontal: 10,
    height: 30,
  },
  modalInvite: {
    borderRadius: 15,
  },
  separate: {
    height: 1,
    marginTop: 15,
  },
  btnCopy: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 46,
  },
  createButton: {
    margin: 10,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 23,
    borderRadius: 5,
  },
});

export default memo(ChannelScreen);
