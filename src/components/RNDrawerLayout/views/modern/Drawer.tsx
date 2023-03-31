import * as React from 'react';
import {
  I18nManager,
  InteractionManager,
  Keyboard,
  Platform,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import useLatestCallback from 'use-latest-callback';

import {
  DEFAULT_DRAWER_WIDTH,
  SWIPE_MIN_DISTANCE,
  SWIPE_MIN_OFFSET,
  SWIPE_MIN_VELOCITY,
} from '../../constants';
import type {DrawerProps} from '../../types';
import {DrawerProgressContext} from '../../utils/DrawerProgressContext';
import {
  GestureState,
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from '../GestureHandler';
import {Overlay} from './Overlay';

const minmax = (value: number, start: number, end: number) => {
  'worklet';

  return Math.min(Math.max(value, start), end);
};

type Props = DrawerProps & {
  layout: {width: number};
};

export function Drawer({
  layout,
  drawerPosition,
  drawerStyle,
  drawerType,
  gestureHandlerProps,
  hideStatusBarOnOpen,
  keyboardDismissMode,
  onClose,
  onOpen,
  onCloseRight,
  onOpenRight,
  onGestureStart,
  onGestureCancel,
  onGestureEnd,
  onTransitionStart,
  onTransitionEnd,
  onTransitionRightStart,
  onTransitionRightEnd,
  open,
  openRight,
  overlayStyle,
  overlayAccessibilityLabel,
  statusBarAnimation,
  swipeEnabled,
  swipeEdgeWidth,
  swipeMinDistance = SWIPE_MIN_DISTANCE,
  swipeMinVelocity = SWIPE_MIN_VELOCITY,
  renderDrawerContent,
  renderDrawerContentRight,
  children,
}: Props) {
  const getDrawerWidth = (): number => {
    const {width = DEFAULT_DRAWER_WIDTH} =
      StyleSheet.flatten(drawerStyle) || {};

    if (typeof width === 'string' && width.endsWith('%')) {
      // Try to calculate width if a percentage is given
      const percentage = Number(width.replace(/%$/, ''));

      if (Number.isFinite(percentage)) {
        return layout.width * (percentage / 100);
      }
    }

    return typeof width === 'number' ? width : 0;
  };

  const getDrawerRightWidth = (): number => {
    return layout.width;
  };

  const drawerWidth = getDrawerWidth();
  const drawerRightWidth = getDrawerRightWidth();

  const isOpen = drawerType === 'permanent' ? true : open;

  const getDrawerTranslationX = React.useCallback(
    (open: boolean, openRight: boolean) => {
      'worklet';
      return open
        ? 0
        : openRight
        ? -drawerWidth - drawerRightWidth
        : -drawerWidth;
    },
    [drawerPosition, drawerWidth, drawerRightWidth],
  );

  const hideStatusBar = React.useCallback(
    (hide: boolean) => {
      if (hideStatusBarOnOpen) {
        StatusBar.setHidden(hide, statusBarAnimation);
      }
    },
    [hideStatusBarOnOpen, statusBarAnimation],
  );

  React.useEffect(() => {
    hideStatusBar(isOpen);

    return () => hideStatusBar(false);
  }, [isOpen, hideStatusBarOnOpen, statusBarAnimation, hideStatusBar]);

  const interactionHandleRef = React.useRef<number | null>(null);

  const startInteraction = () => {
    interactionHandleRef.current = InteractionManager.createInteractionHandle();
  };

  const endInteraction = () => {
    if (interactionHandleRef.current != null) {
      InteractionManager.clearInteractionHandle(interactionHandleRef.current);
      interactionHandleRef.current = null;
    }
  };

  const hideKeyboard = () => {
    if (keyboardDismissMode === 'on-drag') {
      Keyboard.dismiss();
    }
  };

  const onGestureBegin = () => {
    onGestureStart?.();
    startInteraction();
    hideKeyboard();
    hideStatusBar(true);
  };

  const onGestureFinish = () => {
    onGestureEnd?.();
    endInteraction();
  };

  // FIXME: Currently hitSlop is broken when on Android when drawer is on right
  // https://github.com/software-mansion/react-native-gesture-handler/issues/569
  const hitSlop =
    // Extend hitSlop to the side of the screen when drawer is closed
    // This lets the user drag the drawer from the side of the screen
    {left: 0, width: isOpen ? undefined : swipeEdgeWidth};

  const touchStartX = useSharedValue(0);
  const touchX = useSharedValue(0);
  const translationX = useSharedValue(getDrawerTranslationX(open, openRight));
  const gestureState = useSharedValue<GestureState>(GestureState.UNDETERMINED);

  const handleAnimationStart = useLatestCallback(
    (open: boolean, openRight: boolean) => {
      onTransitionStart?.(!open);
      onTransitionRightStart?.(!openRight);
    },
  );

  const handleAnimationEnd = useLatestCallback(
    (open: boolean, openRight: boolean, finished?: boolean) => {
      if (!finished) return;
      onTransitionEnd?.(!open);
      onTransitionRightEnd?.(!openRight);
    },
  );

  const toggleDrawer = React.useCallback(
    (open: boolean, openRight: boolean, velocity?: number) => {
      'worklet';

      const translateX = getDrawerTranslationX(open, openRight);

      if (velocity === undefined) {
        runOnJS(handleAnimationStart)(open, openRight);
      }

      touchStartX.value = 0;
      touchX.value = 0;
      translationX.value = withSpring(
        translateX,
        {
          velocity,
          stiffness: 1000,
          damping: 500,
          mass: 3,
          overshootClamping: true,
          restDisplacementThreshold: 0.01,
          restSpeedThreshold: 0.01,
        },
        finished => runOnJS(handleAnimationEnd)(open, openRight, finished),
      );

      if (open) {
        runOnJS(onOpen)();
      } else {
        runOnJS(onClose)();
      }
      if (openRight) {
        runOnJS(onOpenRight)?.();
      } else {
        runOnJS(onCloseRight)?.();
      }
    },
    [
      getDrawerTranslationX,
      handleAnimationEnd,
      handleAnimationStart,
      onClose,
      onOpen,
      touchStartX,
      touchX,
      translationX,
    ],
  );

  React.useEffect(
    () => toggleDrawer(open, openRight),
    [open, openRight, toggleDrawer],
  );

  const onGestureEvent = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    {startX: number; hasCalledOnStart: boolean}
  >({
    onStart: (event, ctx) => {
      ctx.hasCalledOnStart = false;
      ctx.startX = translationX.value;
      gestureState.value = event.state;
      touchStartX.value = event.x;
    },
    onCancel: () => {
      runOnJS(() => onGestureCancel?.())();
    },
    onActive: (event, ctx) => {
      touchX.value = event.x;
      translationX.value = ctx.startX + event.translationX;
      gestureState.value = event.state;

      // onStart will _always_ be called, even when the activation
      // criteria isn't met yet. This makes sure onGestureBegin is only
      // called when the criteria is really met.
      if (!ctx.hasCalledOnStart) {
        ctx.hasCalledOnStart = true;
        runOnJS(onGestureBegin)();
      }
    },
    onEnd: (event, ctx) => {
      gestureState.value = event.state;
      const nextOpen =
        Math.round(ctx.startX) === -drawerWidth - drawerRightWidth
          ? false
          : (Math.abs(event.translationX) > SWIPE_MIN_OFFSET &&
              Math.abs(event.translationX) > swipeMinVelocity) ||
            Math.abs(event.translationX) > swipeMinDistance
          ? // If swiped to right, open the drawer, otherwise close it
            (event.velocityX === 0 ? event.translationX : event.velocityX) > 0
          : open;
      const nextOpenRight =
        Math.round(ctx.startX) === 0
          ? false
          : (Math.abs(event.translationX) > SWIPE_MIN_OFFSET &&
              Math.abs(event.translationX) > swipeMinVelocity) ||
            Math.abs(event.translationX) > swipeMinDistance
          ? // If swiped to left, open the drawer, otherwise close it
            (event.velocityX === 0 ? event.translationX : event.velocityX) < 0
          : openRight;
      toggleDrawer(nextOpen, nextOpenRight, event.velocityX);
    },
    onFinish: () => {
      runOnJS(onGestureFinish)();
    },
  });

  const translateX = useDerivedValue(() => {
    const startValue = !!renderDrawerContentRight
      ? -drawerWidth - drawerRightWidth
      : -drawerWidth;
    return minmax(translationX.value, startValue, 0);
  });

  const translateRightX = useDerivedValue(() => {
    const distanceFromEdge = layout.width - drawerRightWidth;
    return minmax(
      translationX.value + layout.width,
      distanceFromEdge,
      drawerRightWidth,
    );
  });

  const drawerAnimatedRightStyle = useAnimatedStyle(() => {
    const distanceFromEdge = layout.width - drawerRightWidth;

    return {
      transform:
        drawerType === 'permanent'
          ? // Reanimated needs the property to be present, but it results in Browser bug
            // https://bugs.chromium.org/p/chromium/issues/detail?id=20574
            []
          : [
              {
                translateX:
                  // The drawer stays in place when `drawerType` is `back`
                  translateRightX.value,
              },
            ],
    };
  });
  const drawerAnimatedStyle = useAnimatedStyle(() => {
    const distanceFromEdge = layout.width - drawerWidth;

    return {
      transform:
        drawerType === 'permanent'
          ? // Reanimated needs the property to be present, but it results in Browser bug
            // https://bugs.chromium.org/p/chromium/issues/detail?id=20574
            []
          : [
              {
                translateX:
                  // The drawer stays in place when `drawerType` is `back`
                  drawerType === 'back' ? 0 : translateX.value,
              },
            ],
    };
  });

  const contentAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform:
        drawerType === 'permanent'
          ? // Reanimated needs the property to be present, but it results in Browser bug
            // https://bugs.chromium.org/p/chromium/issues/detail?id=20574
            []
          : [
              {
                translateX:
                  // The screen content stays in place when `drawerType` is `front`
                  drawerType === 'front'
                    ? 0
                    : translateX.value +
                      drawerWidth * (drawerPosition === 'left' ? 1 : -1),
              },
            ],
    };
  });

  const progress = useDerivedValue(() => {
    return drawerType === 'permanent'
      ? 1
      : interpolate(
          translateX.value,
          [
            getDrawerTranslationX(false, true),
            getDrawerTranslationX(false, false),
            getDrawerTranslationX(true, false),
          ],
          [1, 0, 1],
        );
  });

  return (
    <DrawerProgressContext.Provider value={progress}>
      <PanGestureHandler
        activeOffsetX={[-SWIPE_MIN_OFFSET, SWIPE_MIN_OFFSET]}
        failOffsetY={[-SWIPE_MIN_OFFSET, SWIPE_MIN_OFFSET]}
        hitSlop={hitSlop}
        enabled={drawerType !== 'permanent' && swipeEnabled}
        onGestureEvent={onGestureEvent}
        {...gestureHandlerProps}>
        {/* Immediate child of gesture handler needs to be an Animated.View */}
        <Animated.View
          style={[
            styles.main,
            {
              flexDirection: 'row',
            },
          ]}>
          <Animated.View style={[styles.content, contentAnimatedStyle]}>
            <View
              accessibilityElementsHidden={isOpen && drawerType !== 'permanent'}
              importantForAccessibility={
                isOpen && drawerType !== 'permanent'
                  ? 'no-hide-descendants'
                  : 'auto'
              }
              style={styles.content}>
              {children}
            </View>
            {drawerType !== 'permanent' ? (
              <Overlay
                progress={progress}
                onPress={() => toggleDrawer(false, false)}
                style={overlayStyle}
                accessibilityLabel={overlayAccessibilityLabel}
              />
            ) : null}
          </Animated.View>
          <Animated.View
            removeClippedSubviews={Platform.OS !== 'ios'}
            style={[
              styles.container,
              {
                position: drawerType === 'permanent' ? 'relative' : 'absolute',
                zIndex: drawerType === 'back' ? -1 : 0,
              },
              drawerAnimatedStyle,
              drawerStyle as any,
            ]}>
            {renderDrawerContent()}
          </Animated.View>
          {!!renderDrawerContentRight && (
            <Animated.View
              removeClippedSubviews={Platform.OS !== 'ios'}
              style={[
                styles.container,
                {
                  position:
                    drawerType === 'permanent' ? 'relative' : 'absolute',
                  zIndex: drawerType === 'back' ? -1 : 0,
                  width: '100%',
                },
                drawerAnimatedRightStyle,
              ]}>
              {renderDrawerContentRight()}
            </Animated.View>
          )}
        </Animated.View>
      </PanGestureHandler>
    </DrawerProgressContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    top: 0,
    bottom: 0,
    maxWidth: '100%',
    width: DEFAULT_DRAWER_WIDTH,
  },
  content: {
    flex: 1,
  },
  main: {
    flex: 1,
    ...Platform.select({
      // FIXME: We need to hide `overflowX` on Web so the translated content doesn't show offscreen.
      // But adding `overflowX: 'hidden'` prevents content from collapsing the URL bar.
      web: null,
      default: {overflow: 'hidden'},
    }),
  },
});
