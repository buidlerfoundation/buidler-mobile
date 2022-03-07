import {StackActions, CommonActions} from '@react-navigation/native';

function getCurrentRoute(navigationState) {
  if (!navigationState) {
    return null;
  }
  const route = navigationState?.routes?.[navigationState.index];
  // dive into nested navigators
  if (route?.state?.routes) {
    return getCurrentRoute(route.state);
  }
  return route;
}

class NavigationServices {
  navigator = null;
  currentRouteName = '';
  loading = null;
  bottomActionSheet = null;
  imageViewer = null;

  reset(name, params = {}) {
    this.navigator &&
      this.navigator.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{name, params: {...params, isReset: true}}],
        }),
      );
  }

  goBack(n = 1) {
    if (this.navigator?.canGoBack && this.navigator?.canGoBack()) {
      this.navigator.dispatch(StackActions.pop(n));
    }
  }

  pushToScreen(name, params = null) {
    this.navigator &&
      this.navigator.dispatch(
        CommonActions.navigate({
          name,
          params,
        }),
      );
  }

  replace = (name, params = null) => {
    this.navigator &&
      this.navigator.dispatch(StackActions.replace(name, params));
  };

  onNavigationStateChange = currentState => {
    const currentScreen = getCurrentRoute(currentState);
    this.currentRouteName = currentScreen?.name;
  };

  showLoading = () => {
    this.loading && this.loading._show();
  };

  hideLoading = () => {
    this.loading && this.loading._hide();
  };

  showActionSheet = options => {
    this.bottomActionSheet && this.bottomActionSheet.show(options);
  };

  isShowImageViewer = () => {
    return this.imageViewer && this.imageViewer.isShow();
  };

  showImageViewer = (images, index) => {
    this.imageViewer && this.imageViewer.show(images, index);
  };

  closeImageViewer = () => {
    this.imageViewer && this.imageViewer.close();
  };
}

export default new NavigationServices();
