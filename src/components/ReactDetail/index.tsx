import AppDimension from 'common/AppDimension';
import AppStyles from 'common/AppStyles';
import Emoji from 'components/Emoji';
import Touchable from 'components/Touchable';
import useThemeColor from 'hook/useThemeColor';
import {ReactReducerData, ReactUserApiData} from 'models';
import React, {memo, useCallback, useEffect, useMemo, useState} from 'react';
import {View, StyleSheet, FlatList, Text} from 'react-native';
import api from 'services/api';
import useTeamUserData from 'hook/useTeamUserData';
import AvatarView from 'components/AvatarView';
import useUserData from 'hook/useUserData';
import useAppDispatch from 'hook/useAppDispatch';
import {removeReact} from 'actions/ReactActions';

type ReactUserItemProps = {
  item: ReactUserApiData;
  direct?: boolean;
  onPress?: (item: ReactUserApiData) => void;
};

const ReactUserItem = memo(({item, direct, onPress}: ReactUserItemProps) => {
  const teamUserData = useTeamUserData(direct);
  const {colors} = useThemeColor();
  const userData = useUserData();
  const user = useMemo(
    () => teamUserData.find(el => el.user_id === item.user_id),
    [item.user_id, teamUserData],
  );
  const isMine = useMemo(
    () => userData.user_id === item.user_id,
    [item.user_id, userData.user_id],
  );
  const handlePress = useCallback(() => {
    if (!isMine) return;
    onPress(item);
  }, [isMine, item, onPress]);
  if (!user) return null;
  return (
    <Touchable
      style={styles.userItemContainer}
      useWithoutFeedBack
      onPress={handlePress}>
      <AvatarView user={user} size={30} />
      <View style={{flex: 1, marginHorizontal: 10}}>
        <Text style={[AppStyles.TextSemi15, {color: colors.text}]}>
          {user.user_name}
        </Text>
        {isMine && (
          <Text
            style={[
              AppStyles.TextMed11,
              {color: colors.subtext, marginTop: 5},
            ]}>
            Tap to remove
          </Text>
        )}
      </View>
      <Emoji name={item.emoji_id} style={styles.emojiUserItem} />
    </Touchable>
  );
});

type ReactHeadItemProps = {
  item: ReactReducerData;
  isSelected: boolean;
  onPress: (id: string) => void;
};

const ReactHeadItem = memo(
  ({item, isSelected, onPress}: ReactHeadItemProps) => {
    const {colors} = useThemeColor();
    const handlePress = useCallback(() => {
      onPress(item.reactName);
    }, [item.reactName, onPress]);
    return (
      <Touchable
        style={[
          styles.headItemContainer,
          isSelected && {backgroundColor: colors.activeBackground},
        ]}
        useReactNative
        onPress={handlePress}>
        <Emoji name={item.reactName} style={styles.emojiHeadItem} />
        <Text
          style={[AppStyles.TextSemi15, {color: colors.text, marginLeft: 5}]}>
          {item.count}
        </Text>
      </Touchable>
    );
  },
);

type ReactDetailProps = {
  initialReactId?: string;
  reacts: ReactReducerData[];
  parentId: string;
};

const ReactDetail = ({initialReactId, reacts, parentId}: ReactDetailProps) => {
  const dispatch = useAppDispatch();
  const [selectedReactId, setSelectedReactId] = useState<undefined | string>();
  const [reactDataMap, setReactDataMap] = useState<{
    [key: string]: ReactUserApiData[];
  }>({});
  const {colors} = useThemeColor();
  useEffect(() => {
    if (initialReactId) {
      setSelectedReactId(initialReactId);
    }
  }, [initialReactId]);
  useEffect(() => {
    if (selectedReactId) {
      api.getReactionDetail(parentId, selectedReactId).then(res => {
        if (res.statusCode === 200) {
          setReactDataMap(current => ({
            ...current,
            [selectedReactId]: res.data,
          }));
        }
      });
    }
  }, [parentId, selectedReactId]);
  const reactData = useMemo(
    () => reactDataMap?.[selectedReactId] || [],
    [reactDataMap, selectedReactId],
  );
  const handleHeadPress = useCallback((id: string) => {
    setSelectedReactId(id);
  }, []);
  const renderHeadItem = useCallback(
    ({item}: {item: ReactReducerData}) => {
      const selected = selectedReactId === item.reactName;
      return (
        <ReactHeadItem
          item={item}
          isSelected={selected}
          onPress={handleHeadPress}
        />
      );
    },
    [handleHeadPress, selectedReactId],
  );
  const handleRemoveReact = useCallback(
    (item: ReactUserApiData) => {
      dispatch(removeReact(parentId, item.emoji_id, item.user_id));
      setReactDataMap(current => ({
        ...current,
        [item.emoji_id]: current[item.emoji_id].filter(
          el => el.user_id !== item.user_id,
        ),
      }));
    },
    [dispatch, parentId],
  );
  const renderUserItem = useCallback(
    ({item}: {item: ReactUserApiData}) => {
      return <ReactUserItem item={item} onPress={handleRemoveReact} />;
    },
    [handleRemoveReact],
  );
  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <FlatList
        style={{flex: 0, flexGrow: 0, flexShrink: 0, marginBottom: 20}}
        data={reacts}
        keyExtractor={item => item.reactName}
        renderItem={renderHeadItem}
        horizontal
        ItemSeparatorComponent={() => <View style={{width: 10}} />}
        ListHeaderComponent={<View style={{width: 20}} />}
        ListFooterComponent={<View style={{width: 20}} />}
      />
      <FlatList
        data={reactData}
        keyExtractor={item => `${item.user_id}-${item.emoji_id}`}
        renderItem={renderUserItem}
        ListFooterComponent={<View style={{height: 20}} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 15,
    paddingTop: 20,
    paddingBottom: AppDimension.extraBottom + 12,
    height: '80%',
  },
  headItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 35,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  emojiHeadItem: {
    fontSize: 15,
    lineHeight: 20,
  },
  userItemContainer: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emojiUserItem: {
    fontSize: 20,
    lineHeight: 25,
  },
});

export default memo(ReactDetail);
