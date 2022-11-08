import {useFocusEffect} from '@react-navigation/native';
import {actionTypes} from 'actions/actionTypes';
import {
  deleteNotification,
  getNotifications,
  markAsReadNotification,
} from 'actions/NotificationActions';
import AppStyles from 'common/AppStyles';
import MenuNotification from 'components/MenuNotification';
import ModalBottom from 'components/ModalBottom';
import NotificationItem from 'components/NotificationItem';
import {normalizeNotificationData} from 'helpers/NotificationDataHelper';
import useAppDispatch from 'hook/useAppDispatch';
import useAppSelector from 'hook/useAppSelector';
import useThemeColor from 'hook/useThemeColor';
import {NotificationData, NotificationFilterType} from 'models';
import React, {memo, useCallback, useMemo, useState} from 'react';
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
  const [isOpenMenu, setOpenMenu] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<NotificationData | null>(null);
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
  const onCloseMenu = useCallback(() => setOpenMenu(false), []);
  const onLongPress = useCallback((item: NotificationData) => {
    setSelectedNotification(item);
    setOpenMenu(true);
  }, []);
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
      return <NotificationItem item={item} onLongPress={onLongPress} />;
    },
    [colors.border, colors.subtext, onLongPress],
  );
  const onEndReached = useCallback(() => {
    if (loadMore || !canMore) return;
    const last = notifications?.[notifications.length - 1];
    if (!last) return;
    fetchNotification(last.createdAt);
  }, [canMore, fetchNotification, loadMore, notifications]);
  const onMarkRead = useCallback(() => {
    if (!selectedNotification?.notification_id) return;
    dispatch(markAsReadNotification(selectedNotification?.notification_id));
    onCloseMenu();
  }, [dispatch, onCloseMenu, selectedNotification?.notification_id]);
  const onRemove = useCallback(() => {
    if (!selectedNotification?.notification_id) return;
    dispatch(deleteNotification(selectedNotification?.notification_id));
    onCloseMenu();
  }, [dispatch, onCloseMenu, selectedNotification?.notification_id]);
  const onTurnOffNotification = useCallback(() => {}, []);
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
      <ModalBottom
        isVisible={isOpenMenu}
        onSwipeComplete={onCloseMenu}
        onBackdropPress={onCloseMenu}>
        <MenuNotification
          onMarkRead={onMarkRead}
          onRemove={onRemove}
          onTurnOffNotification={onTurnOffNotification}
        />
      </ModalBottom>
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
