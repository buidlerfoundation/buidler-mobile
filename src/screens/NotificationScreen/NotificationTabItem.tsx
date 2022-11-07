import {useFocusEffect} from '@react-navigation/native';
import {actionTypes} from 'actions/actionTypes';
import {getNotifications} from 'actions/NotificationActions';
import AppStyles from 'common/AppStyles';
import NotificationItem from 'components/NotificationItem';
import {normalizeNotificationData} from 'helpers/NotificationDataHelper';
import useAppDispatch from 'hook/useAppDispatch';
import useAppSelector from 'hook/useAppSelector';
import useThemeColor from 'hook/useThemeColor';
import {NotificationData, NotificationFilterType} from 'models';
import React, {memo, useCallback, useMemo} from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {createLoadMoreSelector} from 'reducers/selectors';

type NotificationTabItemProps = {
  type: NotificationFilterType;
};

const loadMoreSelector = createLoadMoreSelector([
  actionTypes.NOTIFICATION_PREFIX,
]);

const NotificationTabItem = ({type}: NotificationTabItemProps) => {
  const dispatch = useAppDispatch();
  const {colors} = useThemeColor();
  const {data, canMore} = useAppSelector(state => state.notification);
  const loadMore = useAppSelector(state => loadMoreSelector(state));
  const fetchNotification = useCallback(
    async (before?: string) => {
      dispatch(getNotifications(type, before));
    },
    [dispatch, type],
  );
  useFocusEffect(
    useCallback(() => {
      dispatch({
        type: actionTypes.UPDATE_ACTIVE_NOTIFICATION_FILTER,
        payload: type,
      });
      fetchNotification();
    }, [dispatch, fetchNotification, type]),
  );
  const notifications = useMemo(() => data[type], [type, data]);
  const notificationData = useMemo(
    () => normalizeNotificationData(notifications),
    [notifications],
  );
  const renderItem = useCallback(
    ({item}: {item: NotificationData}) => {
      if (item.itemType === 'Separate') {
        return (
          <View style={styles.separate}>
            <View
              style={[styles.separateLine, {backgroundColor: colors.border}]}
            />
            <Text
              style={[
                AppStyles.TextMed13,
                {color: colors.subtext, marginHorizontal: 9},
              ]}>
              {item.content}
            </Text>
            <View
              style={[styles.separateLine, {backgroundColor: colors.border}]}
            />
          </View>
        );
      }
      return <NotificationItem item={item} />;
    },
    [colors.border, colors.subtext],
  );
  const onEndReached = useCallback(() => {
    if (loadMore || !canMore) return;
    const last = notifications?.[notifications.length - 1];
    if (!last) return;
    fetchNotification(last.createdAt);
  }, [canMore, fetchNotification, loadMore, notifications]);
  return (
    <View style={styles.container}>
      <FlatList
        data={notificationData}
        keyExtractor={item => item.notification_id}
        renderItem={renderItem}
        initialNumToRender={20}
        onEndReachedThreshold={0.5}
        onEndReached={onEndReached}
        ListFooterComponent={
          loadMore ? (
            <View style={styles.loadMore}>
              <ActivityIndicator />
            </View>
          ) : undefined
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  separate: {
    marginHorizontal: 24,
    marginVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  separateLine: {
    height: 1,
    flex: 1,
  },
  loadMore: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    width: '100%',
  },
});

export default memo(NotificationTabItem);
