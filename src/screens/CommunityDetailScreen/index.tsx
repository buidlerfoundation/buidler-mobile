import {useNavigation} from '@react-navigation/native';
import {getMemberData, leaveTeam} from 'actions/UserActions';
import AppConfig, {UserRole} from 'common/AppConfig';
import AppDimension from 'common/AppDimension';
import AppStyles from 'common/AppStyles';
import SVG from 'common/SVG';
import CommunityDetailHeader from 'components/CommunityDetailHeader';
import MemberItem from 'components/MemberItem';
import MenuCommunity from 'components/MenuCommunity';
import MenuConfirmLeaveCommunity from 'components/MenuConfirmLeaveCommunity';
import ModalBottom from 'components/ModalBottom';
import Touchable from 'components/Touchable';
import useAppDispatch from 'hook/useAppDispatch';
import useAppSelector from 'hook/useAppSelector';
import useCurrentCommunity from 'hook/useCurrentCommunity';
import useThemeColor from 'hook/useThemeColor';
import {UserRoleType} from 'models';
import React, {memo, useCallback, useEffect, useMemo, useState} from 'react';
import {View, StyleSheet, Text, FlatList} from 'react-native';

const CommunityDetailScreen = () => {
  const dispatch = useAppDispatch();
  const memberData = useAppSelector(state => state.user.memberData);
  const [activeRole, setActiveRole] = useState<UserRoleType>(UserRole.Member);
  const navigation = useNavigation();
  const {colors} = useThemeColor();
  const community = useCurrentCommunity();
  const [isOpenMenu, setOpenMenu] = useState(false);
  const [isOpenMenuConfirmLeave, setOpenMenuConfirmLeave] = useState(false);
  const isOwner = useMemo(() => community.role === 'Owner', [community.role]);
  const onCloseMenuConfirmLeave = useCallback(
    () => setOpenMenuConfirmLeave(false),
    [],
  );
  const onCloseMenu = useCallback(() => setOpenMenu(false), []);
  const onBack = useCallback(() => navigation.goBack(), [navigation]);
  const onSettingPress = useCallback(() => {}, []);
  const onMorePress = useCallback(() => {
    setOpenMenu(true);
  }, []);
  const fetchAllMemberData = useCallback(() => {
    dispatch(getMemberData(community.team_id, UserRole.Member, 1));
    dispatch(getMemberData(community.team_id, UserRole.Admin, 1));
    dispatch(getMemberData(community.team_id, UserRole.Owner, 1));
  }, [community.team_id, dispatch]);
  const onMoreMemberData = useCallback(() => {
    if (!memberData[activeRole].canMore) return;
    dispatch(
      getMemberData(
        community.team_id,
        activeRole,
        memberData[activeRole].currentPage + 1,
      ),
    );
  }, [activeRole, community.team_id, dispatch, memberData]);
  useEffect(() => {
    fetchAllMemberData();
  }, [fetchAllMemberData]);
  const members = useMemo(
    () => memberData[activeRole].data,
    [activeRole, memberData],
  );
  const renderItem = useCallback(
    ({item, index}) => <MemberItem item={item} index={index} />,
    [],
  );
  const onLeaveCommunity = useCallback(() => {
    onCloseMenu();
    setTimeout(() => {
      setOpenMenuConfirmLeave(true);
    }, AppConfig.timeoutCloseBottomSheet);
  }, [onCloseMenu]);
  const onConfirmLeave = useCallback(async () => {
    const success = await dispatch(leaveTeam?.(community?.team_id));
    if (success) {
      onCloseMenuConfirmLeave();
    }
  }, [dispatch, onCloseMenuConfirmLeave, community?.team_id]);
  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <View style={styles.header}>
        <Touchable onPress={onBack}>
          <SVG.IconArrowBack fill={colors.text} />
        </Touchable>
        <Text
          style={[styles.title, AppStyles.TextBold17, {color: colors.text}]}>
          Community Detail
        </Text>
        {isOwner ? (
          <Touchable onPress={onSettingPress}>
            <SVG.IconSetting fill={colors.text} />
          </Touchable>
        ) : (
          <Touchable onPress={onMorePress}>
            <SVG.IconMore fill={colors.text} />
          </Touchable>
        )}
      </View>
      <FlatList
        data={members}
        ListHeaderComponent={
          <CommunityDetailHeader
            activeRole={activeRole}
            setActiveRole={setActiveRole}
          />
        }
        keyExtractor={item => item.user_id}
        numColumns={3}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{height: 10}} />}
        ListFooterComponent={
          <View style={{height: 10 + AppDimension.extraBottom}} />
        }
        onEndReachedThreshold={0.5}
        onEndReached={onMoreMemberData}
      />
      <ModalBottom
        isVisible={isOpenMenu}
        onSwipeComplete={onCloseMenu}
        onBackdropPress={onCloseMenu}>
        <MenuCommunity
          onClose={onCloseMenu}
          community={community}
          onLeaveCommunity={onLeaveCommunity}
          communityDetail
        />
      </ModalBottom>
      <ModalBottom
        isVisible={isOpenMenuConfirmLeave}
        onSwipeComplete={onCloseMenuConfirmLeave}
        onBackdropPress={onCloseMenuConfirmLeave}>
        <MenuConfirmLeaveCommunity
          community={community}
          onClose={onCloseMenuConfirmLeave}
          onConfirm={onConfirmLeave}
        />
      </ModalBottom>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: AppDimension.extraTop,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: AppDimension.headerHeight,
  },
  title: {
    marginLeft: 20,
    flex: 1,
  },
});

export default memo(CommunityDetailScreen);
