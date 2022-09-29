import {setCurrentTeam} from 'actions/UserActions';
import AppDimension from 'common/AppDimension';
import Fonts from 'common/Fonts';
import CommunityItem from 'components/CommunityItem';
import useAppDispatch from 'hook/useAppDispatch';
import useAppSelector from 'hook/useAppSelector';
import useThemeColor from 'hook/useThemeColor';
import {Community} from 'models';
import React, {memo, useCallback} from 'react';
import {StyleSheet, Text, View, FlatList} from 'react-native';

const SideBarCommunity = ({navigation}: any) => {
  const {colors} = useThemeColor();
  const dispatch = useAppDispatch();
  const team = useAppSelector(state => state.user.team || []);
  const handlePress = useCallback(
    (item: Community) => {
      dispatch(setCurrentTeam(item));
      navigation.closeDrawer();
    },
    [dispatch, navigation],
  );
  const renderCommunityItem = useCallback(
    ({item}: {item: Community; index: number}) => {
      return <CommunityItem community={item} onPress={handlePress} />;
    },
    [handlePress],
  );
  return (
    <View style={[styles.container]}>
      <Text style={[styles.title, {color: colors.text}]}>Community</Text>
      <FlatList
        style={{flex: 1}}
        data={team}
        keyExtractor={item => item.team_id}
        renderItem={renderCommunityItem}
        ListHeaderComponent={<View style={{height: 10}} />}
        ListFooterComponent={<View style={{height: 10}} />}
        ItemSeparatorComponent={() => <View style={{height: 10}} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: AppDimension.extraTop,
    flex: 1,
  },
  title: {
    fontFamily: Fonts.Bold,
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 20,
    lineHeight: 24,
  },
});

export default memo(SideBarCommunity);
