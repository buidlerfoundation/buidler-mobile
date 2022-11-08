import {useNavigation, useRoute} from '@react-navigation/native';
import AppDimension from 'common/AppDimension';
import AppStyles from 'common/AppStyles';
import ScreenID from 'common/ScreenID';
import SVG from 'common/SVG';
import AvatarView from 'components/AvatarView';
import Spinner from 'components/Spinner';
import Touchable from 'components/Touchable';
import useThemeColor from 'hook/useThemeColor';
import {Space, SpaceCollectionData, UserData} from 'models';
import React, {memo, useCallback, useEffect, useMemo, useState} from 'react';
import {View, StyleSheet, Text, FlatList} from 'react-native';
import api from 'services/api';
import SpaceDetailHeader from './SpaceDetailHeader';

type MemberItemProps = {
  item: UserData;
  index: number;
};

const MemberItem = memo(({item, index}: MemberItemProps) => {
  const navigation = useNavigation();
  const {colors} = useThemeColor();
  const onUserPress = useCallback(() => {
    navigation.navigate(ScreenID.UserScreen, {userId: item.user_id});
  }, [item.user_id, navigation]);
  return (
    <Touchable
      style={[
        styles.memberItem,
        {
          marginLeft: index % 3 === 0 ? 12.5 : 0,
          marginRight: (index + 1) % 3 === 0 ? 12.5 : 0,
        },
      ]}
      useReactNative
      onPress={onUserPress}>
      <AvatarView user={item} size={30} />
      <Text
        numberOfLines={1}
        ellipsizeMode="tail"
        style={[AppStyles.TextMed14, {color: colors.text, marginTop: 8}]}>
        {item.user_name}
      </Text>
    </Touchable>
  );
});

const SpaceDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const space = useMemo<Space>(() => route.params.space, [route.params.space]);
  const [loading, setLoading] = useState(false);
  const [spaceMembers, setSpaceMembers] = useState<UserData[]>([]);
  const [totalMember, setTotalMember] = useState('');
  const [spaceConditions, setSpaceConditions] = useState<SpaceCollectionData[]>(
    [],
  );
  const {colors} = useThemeColor();
  const onBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);
  const fetchData = useCallback(async () => {
    setLoading(true);
    const [spaceConditionRes, spaceMembersRes] = await Promise.all([
      api.getSpaceCondition(space.space_id),
      api.getSpaceMembers(space?.space_id),
    ]);
    setSpaceConditions(spaceConditionRes?.data || []);
    setSpaceMembers(spaceMembersRes.data || []);
    setTotalMember(spaceMembersRes.total?.toString() || '');
    setLoading(false);
  }, [space.space_id]);
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  const renderItem = useCallback(
    ({item, index}: {item: UserData; index: number}) => {
      return <MemberItem item={item} index={index} />;
    },
    [],
  );
  const renderSeparate = useCallback(() => <View style={{height: 25}} />, []);
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Touchable onPress={onBack}>
          <SVG.IconArrowBack fill={colors.text} />
        </Touchable>
        <Text
          style={[styles.title, AppStyles.TextBold17, {color: colors.text}]}>
          {space.space_name}
        </Text>
      </View>
      {loading ? (
        <Spinner />
      ) : (
        <FlatList
          data={spaceMembers}
          keyExtractor={item => item.user_id}
          renderItem={renderItem}
          numColumns={3}
          ListHeaderComponent={
            <SpaceDetailHeader
              space={space}
              totalMember={totalMember}
              spaceConditions={spaceConditions}
            />
          }
          ItemSeparatorComponent={renderSeparate}
          ListFooterComponent={renderSeparate}
        />
      )}
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
  memberItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 7.5,
  },
});

export default memo(SpaceDetailScreen);
