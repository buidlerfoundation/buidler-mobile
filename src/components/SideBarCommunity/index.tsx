import {useNavigation} from '@react-navigation/native';
import {setCurrentTeam} from 'actions/UserActions';
import AppDimension from 'common/AppDimension';
import AppStyles from 'common/AppStyles';
import {StackID} from 'common/ScreenID';
import CommunityItem from 'components/CommunityItem';
import MenuCommunity from 'components/MenuCommunity';
import ModalBottom from 'components/ModalBottom';
import useAppDispatch from 'hook/useAppDispatch';
import useAppSelector from 'hook/useAppSelector';
import useThemeColor from 'hook/useThemeColor';
import {Community} from 'models';
import React, {memo, useCallback, useState} from 'react';
import {StyleSheet, Text, View, FlatList} from 'react-native';

const SideBarCommunity = () => {
  const {colors} = useThemeColor();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const [isOpenMenu, setOpenMenu] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(
    null,
  );
  const team = useAppSelector(state => state.user.team || []);
  const handlePress = useCallback(
    async (item: Community) => {
      navigation.navigate(StackID.ConversationStack);
      dispatch(setCurrentTeam(item));
    },
    [dispatch, navigation],
  );
  const onCloseMenu = useCallback(() => setOpenMenu(false), []);
  const handleMenuPress = useCallback(async (item: Community) => {
    setSelectedCommunity(item);
    setOpenMenu(true);
  }, []);
  const renderCommunityItem = useCallback(
    ({item}: {item: Community; index: number}) => {
      return (
        <CommunityItem
          community={item}
          onPress={handlePress}
          onPressMenu={handleMenuPress}
        />
      );
    },
    [handleMenuPress, handlePress],
  );
  const onCreateCommunity = useCallback(() => {}, []);
  const onEditCommunity = useCallback(() => {}, []);
  const onInviteMember = useCallback(() => {}, []);
  const onLeaveCommunity = useCallback(() => {}, []);
  return (
    <View
      style={[styles.container, {backgroundColor: colors.backgroundHeader}]}>
      <Text style={[styles.title, AppStyles.TextBold20, {color: colors.text}]}>
        Community
      </Text>
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
      <ModalBottom
        isVisible={isOpenMenu}
        onSwipeComplete={onCloseMenu}
        onBackdropPress={onCloseMenu}>
        <MenuCommunity
          onClose={onCloseMenu}
          community={selectedCommunity}
          onCreateCommunity={onCreateCommunity}
          onEditCommunity={onEditCommunity}
          onInviteMember={onInviteMember}
          onLeaveCommunity={onLeaveCommunity}
        />
      </ModalBottom>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: AppDimension.extraTop,
    flex: 1,
  },
  title: {
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
});

export default memo(SideBarCommunity);
