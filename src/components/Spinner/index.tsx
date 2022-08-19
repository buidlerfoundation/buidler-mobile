import React, {Component} from 'react';
import {View, StyleSheet, ActivityIndicator, ViewStyle} from 'react-native';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

type SpinnerProps = {
  style?: ViewStyle;
  visible?: boolean;
  size?: 'small' | 'large';
  backgroundColor?: string;
};

type SpinnerState = {
  visible?: boolean;
};

export default class Spinner extends Component<SpinnerProps, SpinnerState> {
  static defaultProps = {
    visible: true,
    size: 'large',
  };

  constructor(props: SpinnerProps) {
    super(props);
    this.state = {
      visible: props.visible,
    };
  }

  _show = () => {
    this.setState({
      visible: true,
    });
  };

  _hide = () => {
    this.setState({
      visible: false,
    });
  };

  render() {
    const {style, size, backgroundColor} = this.props;
    const {visible} = this.state;
    if (!visible) {
      return <View key="invisible" />;
    }
    return (
      <View
        key="visible"
        style={[
          styles.container,
          {backgroundColor: backgroundColor || '#1111110D'},
          style,
        ]}>
        <ActivityIndicator size={size} />
      </View>
    );
  }
}
