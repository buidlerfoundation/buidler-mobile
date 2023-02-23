import React, {memo, useCallback} from 'react';
import {View, StyleSheet, Linking} from 'react-native';
import SVG from 'common/SVG';
import Fonts from 'common/Fonts';
import useThemeColor from 'hook/useThemeColor';
import AppDimension from 'common/AppDimension';
import MenuItem from 'components/MenuItem';
import {NFTDetailDataApi} from 'models';
import {ethers} from 'ethers';
import {OpenSeaUrl} from 'helpers/LinkHelper';

type MenuNFTDetailProps = {
  nft?: NFTDetailDataApi;
  onClose: () => void;
};

const MenuNFTDetail = ({nft, onClose}: MenuNFTDetailProps) => {
  const {colors} = useThemeColor();
  const onViewNFT = useCallback(() => {
    const id = ethers.BigNumber.from(nft.token_id).toString();
    Linking.openURL(
      `${OpenSeaUrl}/assets/${nft.network}/${nft.contract_address}/${id}`,
    );
    onClose();
  }, [nft, onClose]);
  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <View style={[styles.groupMenu, {backgroundColor: colors.border}]}>
        <MenuItem
          onPress={onViewNFT}
          Icon={SVG.IconOpenSea}
          label="View on OpenSea"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: AppDimension.extraBottom + 12,
    minHeight: 350,
  },
  groupMenu: {
    borderRadius: 5,
  },
  menuLabel: {
    marginLeft: 15,
    fontSize: 16,
    lineHeight: 26,
    fontFamily: Fonts.SemiBold,
  },
});

export default memo(MenuNFTDetail);
