import {useNavigation} from '@react-navigation/native';
import {getMemberData} from 'actions/UserActions';
import {UserRole} from 'common/AppConfig';
import AppDimension from 'common/AppDimension';
import AppStyles from 'common/AppStyles';
import SVG from 'common/SVG';
import CommunityDetailHeader from 'components/CommunityDetailHeader';
import MemberItem from 'components/MemberItem';
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
  const onBack = useCallback(() => navigation.goBack(), [navigation]);
  const onSettingPress = useCallback(() => {}, []);
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
        <Touchable onPress={onSettingPress}>
          <SVG.IconSetting fill={colors.text} />
        </Touchable>
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
