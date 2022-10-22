import useThemeColor from 'hook/useThemeColor';
import React, {memo, useCallback} from 'react';
import {StyleSheet} from 'react-native';
import Modal, {ModalProps} from 'react-native-modal';

const ModalBottom = (props: ModalProps) => {
  const {colors} = useThemeColor();
  const onMoveShouldSetResponderCapture = useCallback(() => false, []);
  return (
    <Modal
      style={styles.container}
      avoidKeyboard
      onMoveShouldSetResponderCapture={onMoveShouldSetResponderCapture}
      backdropColor={colors.black}
      backdropOpacity={0.75}
      swipeDirection={['down']}
      backdropTransitionOutTiming={0}
      hideModalContentWhileAnimating
      {...props}>
      {props.children}
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-end',
    margin: 0,
  },
});

export default memo(ModalBottom);
