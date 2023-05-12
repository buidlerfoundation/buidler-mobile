import {useNavigation, useRoute} from '@react-navigation/native';
import AppDimension from 'common/AppDimension';
import AppStyles from 'common/AppStyles';
import SVG from 'common/SVG';
import Touchable from 'components/Touchable';
import useThemeColor from 'hook/useThemeColor';
import React, {memo, useCallback, useEffect, useMemo, useState} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {PROFILE_BASE_URL} from 'react-native-dotenv';
import WebView, {WebViewMessageEvent} from 'react-native-webview';
import api from 'services/api';
import Toast from 'react-native-toast-message';
import Spinner from 'components/Spinner';
import useAppDispatch from 'hook/useAppDispatch';
import {acceptInvitation} from 'actions/UserActions';

const CommunityProfileScreen = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const {colors} = useThemeColor();
  const route = useRoute();
  const [params, setParams] = useState('');
  const [loaded, setLoaded] = useState(false);
  const communityId = useMemo(
    () => route.params?.communityId,
    [route.params?.communityId],
  );
  const initial = useCallback(async () => {
    if (communityId) {
      const res = await api.requestOTT();
      if (res.data) {
        setParams(`&community_view=true&ott=${res.data}`);
      }
    }
  }, [communityId]);
  useEffect(() => {
    initial();
    return () => {
      setParams('');
    };
  }, [initial]);
  const onBack = useCallback(() => navigation.goBack(), [navigation]);
  const onWVLoadEnd = useCallback(() => {
    setTimeout(() => {
      setLoaded(true);
    }, 200);
  }, []);
  const communityHref = useMemo(
    () =>
      `${PROFILE_BASE_URL}/${communityId}${params}&bottom=${AppDimension.extraBottom}`,
    [communityId, params],
  );
  const handleError = useCallback(() => {
    navigation.goBack();
    Toast.show({
      type: 'customError',
      props: {message: 'Something went wrong, please try again later.'},
    });
  }, [navigation]);
  const handleJoinCommunity = useCallback(async () => {
    dispatch(acceptInvitation(communityHref));
  }, [communityHref, dispatch]);
  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'join_community') {
        handleJoinCommunity();
      }
    },
    [handleJoinCommunity],
  );
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Touchable onPress={onBack}>
          <SVG.IconArrowBack fill={colors.text} />
        </Touchable>
        <Text
          style={[styles.title, AppStyles.TextBold17, {color: colors.text}]}>
          Community Detail
        </Text>
      </View>
      {params && (
        <WebView
          source={{
            uri: communityHref,
          }}
          style={{backgroundColor: colors.background}}
          onMessage={handleMessage}
          onLoadEnd={onWVLoadEnd}
          showsVerticalScrollIndicator={false}
          decelerationRate={1}
          onError={handleError}
        />
      )}
      {!loaded && (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: colors.background,
              top: AppDimension.headerHeight + AppDimension.extraTop,
            },
          ]}>
          <Spinner />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: AppDimension.extraTop,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: AppDimension.headerHeight,
  },
  title: {
    marginLeft: 20,
    flex: 1,
  },
});

export default memo(CommunityProfileScreen);
