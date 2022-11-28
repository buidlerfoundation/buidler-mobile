import AppDimension from 'common/AppDimension';
import AppStyles from 'common/AppStyles';
import useAppSelector from 'hook/useAppSelector';
import useThemeColor from 'hook/useThemeColor';
import {Channel} from 'models';
import React, {memo, useCallback} from 'react';
import {FlatList, StyleSheet, Text, View} from 'react-native';
import DirectChannelItem from './DirectChannelItem';

const DirectChannelScreen = () => {
  const {colors} = useThemeColor();
  const directChannels = useAppSelector(state => state.user.directChannel);
  const renderItem = useCallback(
    ({item}: {item: Channel}) => <DirectChannelItem channel={item} />,
    [],
  );
  return (
    <View
      style={[styles.container, {backgroundColor: colors.backgroundHeader}]}>
      <Text
        style={[
          AppStyles.TextBold20,
          {color: colors.text, marginVertical: 18, marginLeft: 15},
        ]}>
        Direct Message
      </Text>
      <FlatList
        data={directChannels}
        keyExtractor={item => item.channel_id}
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, paddingTop: AppDimension.extraTop},
});

export default memo(DirectChannelScreen);
