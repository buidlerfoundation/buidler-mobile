import React, {Component} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import styles from './style';
import ActionSheet from 'react-native-actionsheet';

export default class BottomActionSheet extends Component {
  static propTypes = {};
  static defaultProps = {};
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      options: [],
    };
  }
  show = options => {
    this.setState({title: '', options}, () => {
      this.ActionSheet.show();
    });
  };

  showWithTitle = (title, options) => {
    this.setState({title, options}, () => {
      this.ActionSheet.show();
    });
  };

  render() {
    const {options} = this.state;
    return (
      <View style={styles.container}>
        <ActionSheet
          ref={o => (this.ActionSheet = o)}
          title={
            this.state.title !== '' ? this.state.title : 'Select an option'
          }
          options={options.map(opt => opt.title)}
          cancelButtonIndex={options.length - 1}
          onPress={index => {
            options[index].onPress();
          }}
        />
      </View>
    );
  }
}
