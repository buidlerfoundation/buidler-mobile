import AppDimension from 'common/AppDimension';
import AppStyles from 'common/AppStyles';
import SVG from 'common/SVG';
import ButtonClose from 'components/ButtonClose';
import CommunityLogo from 'components/CommunityLogo';
import MenuItem from 'components/MenuItem';
import useThemeColor from 'hook/useThemeColor';
import {Community} from 'models';
import React, {memo} from 'react';
import {View, StyleSheet, Text} from 'react-native';

type MenuCommunityProps = {
  community?: Community;
  onClose: () => void;
  onInviteMember?: () => void;
  onCreateCommunity?: () => void;
  onEditCommunity?: () => void;
  onLeaveCommunity: () => void;
  canEdit?: boolean;
  canCreate?: boolean;
  communityDetail?: boolean;
};

const MenuCommunity = ({
  community,
  onClose,
  onInviteMember,
  onCreateCommunity,
  onEditCommunity,
  onLeaveCommunity,
  canEdit,
  canCreate,
  communityDetail,
}: MenuCommunityProps) => {
  const {colors} = useThemeColor();
  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <View style={styles.header}>
        {community && <CommunityLogo community={community} size={45} />}
        {community && (
          <Text
            style={[
              AppStyles.TextBold17,
              {marginHorizontal: 15, flex: 1, color: colors.text},
            ]}
            numberOfLines={1}
            ellipsizeMode="tail">
            {community.team_display_name}
          </Text>
        )}
        <ButtonClose onPress={onClose} />
      </View>
      {!communityDetail && (
        <View style={[styles.menu, {backgroundColor: colors.border}]}>
          <MenuItem
            Icon={SVG.IconMenuInvite}
            label="Invite member"
            onPress={onInviteMember}
          />
          {canCreate && (
            <MenuItem
              Icon={SVG.IconMenuCreate}
              label="Create community"
              onPress={onCreateCommunity}
            />
          )}
          {canEdit && (
            <MenuItem
              Icon={SVG.IconMenuSetting}
              label="Edit community"
              onPress={onEditCommunity}
            />
          )}
        </View>
      )}
      <MenuItem
        Icon={SVG.IconMenuLogout}
        label="Leave community"
        onPress={onLeaveCommunity}
        style={{marginTop: 15, marginHorizontal: 20}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 15,
    minHeight: 380,
    paddingBottom: 12 + AppDimension.extraBottom,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 10,
    paddingBottom: 12,
    paddingTop: 20,
  },
  menu: {
    marginTop: 10,
    borderRadius: 5,
    marginHorizontal: 20,
  },
});

export default memo(MenuCommunity);
