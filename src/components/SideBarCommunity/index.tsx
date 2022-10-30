import {useNavigation} from '@react-navigation/native';
import {leaveTeam, setCurrentTeam} from 'actions/UserActions';
import AppConfig from 'common/AppConfig';
import AppDimension from 'common/AppDimension';
import AppStyles from 'common/AppStyles';
import {StackID} from 'common/ScreenID';
import SVG from 'common/SVG';
import CommunityItem from 'components/CommunityItem';
import MenuCommunity from 'components/MenuCommunity';
import MenuConfirmLeaveCommunity from 'components/MenuConfirmLeaveCommunity';
import ModalBottom from 'components/ModalBottom';
import Touchable from 'components/Touchable';
import useAppDispatch from 'hook/useAppDispatch';
import useAppSelector from 'hook/useAppSelector';
import useThemeColor from 'hook/useThemeColor';
import useUserRole from 'hook/useUserRole';
import {Community} from 'models';
import React, {memo, useCallback, useState} from 'react';
import {StyleSheet, Text, View, FlatList, Alert} from 'react-native';
import api from 'services/api';
import Clipboard from '@react-native-clipboard/clipboard';
import Toast from 'react-native-toast-message';

const SideBarCommunity = () => {
  const {colors} = useThemeColor();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const [inviteLink, setInviteLink] = useState('');
  const [isOpenMenu, setOpenMenu] = useState(false);
  const [isOpenMenuConfirmLeave, setOpenMenuConfirmLeave] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(
    null,
  );
  const userRole = useUserRole();
  const team = useAppSelector(state => state.user.team || []);
  const handlePress = useCallback(
    async (item: Community) => {
      navigation.navigate(StackID.ConversationStack);
      dispatch(setCurrentTeam(item));
    },
    [dispatch, navigation],
  );
  const onCloseMenuConfirmLeave = useCallback(
    () => setOpenMenuConfirmLeave(false),
    [],
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
  const onCopyInviteLink = useCallback(async () => {
    await Clipboard.setString(inviteLink);
    Toast.show({type: 'customSuccess', props: {message: 'Copied'}});
  }, [inviteLink]);
  const onCreateCommunity = useCallback(() => {}, []);
  const onEditCommunity = useCallback(() => {}, []);
  const onInviteMember = useCallback(async () => {
    const res = await api.invitation(selectedCommunity?.team_id);
    const link = res?.data?.invitation_url;
    setInviteLink(link);
    onCloseMenu();
    Alert.alert('Invite Member', link, [
      {text: 'Copy link', onPress: onCopyInviteLink},
    ]);
  }, [onCloseMenu, onCopyInviteLink, selectedCommunity?.team_id]);
  const onLeaveCommunity = useCallback(() => {
    onCloseMenu();
    setTimeout(() => {
      setOpenMenuConfirmLeave(true);
    }, AppConfig.timeoutCloseBottomSheet);
  }, [onCloseMenu]);
  const onConfirmLeave = useCallback(async () => {
    if (!selectedCommunity?.team_id) return;
    const success = await dispatch(leaveTeam?.(selectedCommunity?.team_id));
    if (success) {
      onCloseMenuConfirmLeave();
    }
  }, [dispatch, onCloseMenuConfirmLeave, selectedCommunity?.team_id]);
  const renderFooter = useCallback(() => {
    if (userRole === 'Owner') {
      return (
        <Touchable
          style={[styles.createButton, {backgroundColor: colors.background}]}
          onPress={onCreateCommunity}>
          <SVG.IconPlus fill={colors.subtext} />
          <Text
            style={[
              AppStyles.TextSemi15,
              {color: colors.subtext, marginLeft: 28},
            ]}>
            New community
          </Text>
        </Touchable>
      );
    }
    return <View style={{height: 10}} />;
  }, [colors.background, colors.subtext, onCreateCommunity, userRole]);
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
        ListFooterComponent={renderFooter}
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
          canCreate={selectedCommunity?.role === 'Owner'}
          canEdit={selectedCommunity?.role === 'Owner'}
        />
      </ModalBottom>
      <ModalBottom
        isVisible={isOpenMenuConfirmLeave}
        onSwipeComplete={onCloseMenuConfirmLeave}
        onBackdropPress={onCloseMenuConfirmLeave}>
        <MenuConfirmLeaveCommunity
          community={selectedCommunity}
          onClose={onCloseMenuConfirmLeave}
          onConfirm={onConfirmLeave}
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
  createButton: {
    margin: 10,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 23,
    borderRadius: 5,
  },
});

export default memo(SideBarCommunity);
