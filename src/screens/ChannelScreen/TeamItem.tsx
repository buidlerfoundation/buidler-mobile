import {setCurrentTeam} from 'actions/UserActions';
import ScreenID from 'common/ScreenID';
import SVG from 'common/SVG';
import Touchable from 'components/Touchable';
import ImageHelper from 'helpers/ImageHelper';
import useAppDispatch from 'hook/useAppDispatch';
import useThemeColor from 'hook/useThemeColor';
import {Community} from 'models';
import React, {useCallback} from 'react';
import {StyleSheet, View} from 'react-native';
import FastImage from 'react-native-fast-image';
import NavigationServices from 'services/NavigationServices';

type TeamItemProps = {
  item: Community;
  isActive: boolean;
};

const TeamItem = ({item, isActive}: TeamItemProps) => {
  const dispatch = useAppDispatch();
  const {colors} = useThemeColor();
  const onPress = useCallback(async () => {
    dispatch(setCurrentTeam(item));
    NavigationServices.pushToScreen(ScreenID.ConversationScreen);
  }, [dispatch, item]);
  return (
    <Touchable
      style={[
        {padding: 10},
        isActive && {backgroundColor: colors.backgroundHeader},
      ]}
      onPress={onPress}>
      {item.team_icon ? (
        <FastImage
          style={styles.logoTeam}
          source={{
            uri: ImageHelper.normalizeImage(item.team_icon, item.team_id, {
              w: 50,
              h: 50,
            }),
          }}
        />
      ) : (
        <View style={styles.logoTeam}>
          <SVG.LogoDarkSquare width={50} height={50} />
        </View>
      )}
    </Touchable>
  );
};

const styles = StyleSheet.create({
  logoTeam: {
    width: 50,
    height: 50,
    borderRadius: 12.5,
    overflow: 'hidden',
  },
});

export default TeamItem;
