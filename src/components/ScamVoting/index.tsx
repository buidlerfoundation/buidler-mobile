import Touchable from 'components/Touchable';
import useThemeColor from 'hook/useThemeColor';
import React, {memo, useCallback} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import Toast from 'react-native-toast-message';
import api from 'services/api';
import HapticUtils from 'utils/HapticUtils';

type ScamVotingProps = {
  id?: string;
};

const ScamVoting = ({id}: ScamVotingProps) => {
  const {colors} = useThemeColor();
  const onUpVote = useCallback(() => {
    api.upVoteScamMessage(id).then(res => {
      HapticUtils.trigger();
      if (res.success) {
        Toast.show({
          type: 'customSuccess',
          props: {message: 'Up vote successfully'},
        });
      }
    });
  }, [id]);
  const onDownVote = useCallback(() => {
    api.downVoteScamMessage(id).then(res => {
      HapticUtils.trigger();
      if (res.success) {
        Toast.show({
          type: 'customSuccess',
          props: {message: 'Down vote successfully'},
        });
      }
    });
  }, [id]);
  if (!id) return null;
  return (
    <View style={styles.container}>
      <Touchable
        style={[
          styles.btnVote,
          {backgroundColor: colors.activeBackgroundLight},
        ]}
        onPress={onUpVote}>
        <Text>👍</Text>
      </Touchable>
      <Touchable
        style={[
          styles.btnVote,
          {marginLeft: 8, backgroundColor: colors.activeBackgroundLight},
        ]}
        onPress={onDownVote}>
        <Text>👎</Text>
      </Touchable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  btnVote: {
    borderRadius: 5,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default memo(ScamVoting);
