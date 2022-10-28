import {UserRole} from 'common/AppConfig';
import AppStyles from 'common/AppStyles';
import SVG from 'common/SVG';
import CommunityLogo from 'components/CommunityLogo';
import Touchable from 'components/Touchable';
import useCurrentCommunity from 'hook/useCurrentCommunity';
import useTeamUserData from 'hook/useTeamUserData';
import useThemeColor from 'hook/useThemeColor';
import {UserRoleType} from 'models';
import numeral from 'numeral';
import React, {memo, useCallback, useMemo} from 'react';
import {View, StyleSheet, Text} from 'react-native';

type TabItemProps = {
  activeRole: UserRoleType;
  role: UserRoleType;
  onPress: (role: UserRoleType) => void;
};

const TabItem = memo(({onPress, role, activeRole}: TabItemProps) => {
  const {colors} = useThemeColor();
  const isActive = useMemo(() => role === activeRole, [activeRole, role]);
  const handlePress = useCallback(() => {
    onPress(role);
  }, [onPress, role]);
  const Icon = useCallback(() => {
    if (role === UserRole.Member)
      return <SVG.IconUser fill={isActive ? colors.text : colors.subtext} />;
    if (role === UserRole.Admin)
      return (
        <SVG.IconShieldStar fill={isActive ? colors.text : colors.subtext} />
      );
    return <SVG.IconCrow fill={isActive ? colors.text : colors.subtext} />;
  }, [colors.subtext, colors.text, isActive, role]);
  return (
    <Touchable
      useReactNative
      style={[
        styles.tabItem,
        isActive && {
          backgroundColor: colors.activeBackground,
        },
      ]}
      onPress={handlePress}>
      <Icon />
      <Text
        style={[
          AppStyles.TextMed15,
          {
            marginLeft: 5,
            color: isActive ? colors.text : colors.subtext,
            textTransform: 'capitalize',
          },
        ]}>
        {role}
      </Text>
    </Touchable>
  );
});

type CommunityDetailHeaderProps = {
  activeRole: UserRoleType;
  setActiveRole: React.Dispatch<React.SetStateAction<UserRoleType>>;
};

const CommunityDetailHeader = ({
  activeRole,
  setActiveRole,
}: CommunityDetailHeaderProps) => {
  const {colors} = useThemeColor();
  const teamUserData = useTeamUserData();
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
  return (
    <View>
      <View style={[styles.communityCover, {backgroundColor: colors.border}]}>
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
            {communityVerified && <SVG.IconVerifyBadge fill={colors.text} />}
          </View>
        )}
        <View
          style={[styles.communityLogo, {backgroundColor: colors.background}]}>
          <CommunityLogo community={community} size={80} borderRadius={15} />
        </View>
      </View>
      <Text
        style={[
          AppStyles.TextBold22,
          styles.communityName,
          {color: colors.text},
        ]}>
        {community.team_display_name}
      </Text>
      <View style={styles.totalMember}>
        <View style={[styles.rowMemberWrap]}>
          <View style={[styles.dot, {backgroundColor: colors.lightText}]} />
          <Text style={[AppStyles.TextSemi15, {color: colors.lightText}]}>
            All members:{' '}
            {numeral(teamUserData.filter(el => !el.is_deleted).length).format(
              '0[.][0]a',
            )}
          </Text>
        </View>
        <View style={[styles.rowMemberWrap]}>
          <View style={[styles.dot, {backgroundColor: colors.success}]} />
          <Text style={[AppStyles.TextSemi15, {color: colors.lightText}]}>
            Online: {teamUserData.filter(el => el.status === 'online').length}
          </Text>
        </View>
      </View>
      <View
        style={[
          styles.communityMemberTab,
          {backgroundColor: colors.activeBackgroundLight},
        ]}>
        <TabItem
          role={UserRole.Member}
          activeRole={activeRole}
          onPress={setActiveRole}
        />
        <View
          style={[
            styles.tabSeparate,
            {
              backgroundColor:
                activeRole === UserRole.Owner
                  ? colors.activeBackground
                  : colors.background,
            },
          ]}
        />
        <TabItem
          role={UserRole.Admin}
          activeRole={activeRole}
          onPress={setActiveRole}
        />
        <View
          style={[
            styles.tabSeparate,
            {
              backgroundColor:
                activeRole === UserRole.Member
                  ? colors.activeBackground
                  : colors.background,
            },
          ]}
        />
        <TabItem
          role={UserRole.Owner}
          activeRole={activeRole}
          onPress={setActiveRole}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  communityCover: {
    height: 160,
    borderRadius: 5,
    margin: 10,
  },
  badgeCommunity: {
    position: 'absolute',
    top: 15,
    right: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#191919B2',
    borderRadius: 5,
    paddingHorizontal: 10,
    height: 30,
  },
  communityLogo: {
    width: 90,
    height: 90,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: 15,
    top: 115,
  },
  communityName: {
    marginTop: 50,
    marginHorizontal: 20,
  },
  totalMember: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 10,
  },
  rowMemberWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  communityMemberTab: {
    marginVertical: 25,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    marginHorizontal: 20,
    borderRadius: 6,
  },
  tabItem: {
    flex: 1,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    height: 34,
  },
  tabSeparate: {
    width: 1,
    height: 16,
    borderRadius: 0.5,
  },
});

export default memo(CommunityDetailHeader);
