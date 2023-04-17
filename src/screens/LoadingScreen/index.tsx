import {accessToHome} from 'actions/UserActions';
import ScreenID from 'common/ScreenID';
import useAppDispatch from 'hook/useAppDispatch';
import React, {memo, useCallback, useEffect} from 'react';
import {View, StyleSheet, ActivityIndicator} from 'react-native';
import NavigationServices from 'services/NavigationServices';

const LoadingScreen = () => {
  const dispatch = useAppDispatch();
  const goToHome = useCallback(async () => {
    try {
      await dispatch(accessToHome());
    } catch (e) {
      alert('Something went wrong, please try again later.');
      NavigationServices.reset(ScreenID.SplashScreen);
    }
  }, [dispatch]);
  useEffect(() => {
    goToHome();
  }, [goToHome]);
  return (
    <View style={styles.container}>
      <ActivityIndicator />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, alignItems: 'center', justifyContent: 'center'},
});

export default memo(LoadingScreen);
