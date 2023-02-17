import {useDrawerStatus} from '@react-navigation/drawer';
import {fetchDirectChannel} from 'actions/UserActions';
import AppDimension from 'common/AppDimension';
import AppStyles from 'common/AppStyles';
import {sortChannel} from 'helpers/ChannelHelper';
import useAppDispatch from 'hook/useAppDispatch';
import useAppSelector from 'hook/useAppSelector';
import useThemeColor from 'hook/useThemeColor';
import {Channel} from 'models';
import React, {memo, useCallback, useEffect} from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import DirectChannelItem from './DirectChannelItem';

const DirectChannelScreen = () => {
  const dispatch = useAppDispatch();
  const drawerStatus = useDrawerStatus();
  const {colors} = useThemeColor();
  const directChannels = useAppSelector(state => state.user.directChannel);
  const socketReconnect = useAppSelector(state => state.socket.directChannel);
  const renderItem = useCallback(
    ({item}: {item: Channel}) => <DirectChannelItem channel={item} />,
    [],
  );
  useEffect(() => {
    if (drawerStatus === 'open' && socketReconnect) {
      dispatch(fetchDirectChannel());
    }
  }, [dispatch, drawerStatus, socketReconnect]);
  return (
    <View
      style={[styles.container, {backgroundColor: colors.backgroundHeader}]}>
      <Text
        style={[
          AppStyles.TextBold20,
          {color: colors.text, marginVertical: 18, marginLeft: 15},
        ]}>
        Direct Messages
      </Text>
      <FlatList
        data={directChannels.sort(sortChannel)}
        keyExtractor={item => item.channel_id}
        renderItem={renderItem}
        ListHeaderComponent={
          socketReconnect ? <ActivityIndicator /> : undefined
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, paddingTop: AppDimension.extraTop},
});

export default memo(DirectChannelScreen);
