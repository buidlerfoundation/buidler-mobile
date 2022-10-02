import React, {Component} from 'react';
import {
  Modal,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import ImgViewer from 'react-native-image-zoom-viewer';
import {View} from 'react-native-animatable';
import {connect} from 'react-redux';
import AppDimension from 'common/AppDimension';
import Fonts from 'common/Fonts';
import {ThemeType} from 'models';

type ImageViewerState = {
  images: Array<any>;
  visible: boolean;
  index: number;
};

type ImageViewerProps = {
  themeType: ThemeType;
};

class ImageViewer extends Component<ImageViewerProps, ImageViewerState> {
  static propTypes = {};
  static defaultProps = {};
  constructor(props: ImageViewerProps) {
    super(props);
    this.state = {
      images: [],
      visible: false,
      index: 0,
    };
  }

  show = (images: Array<any>, index: number) => {
    this.setState({
      visible: true,
      images,
      index,
    });
  };

  close = () => {
    this.setState({visible: false});
  };

  isShow = () => this.state.visible;

  render() {
    const {images, visible, index} = this.state;
    if (!visible || images.length === 0) {
      return null;
    }
    return (
      <Modal
        visible={visible}
        presentationStyle="fullScreen"
        onRequestClose={() => {
          this.close();
        }}>
        <View style={styles.container}>
          <ImgViewer
            loadingRender={() => <ActivityIndicator />}
            enableSwipeDown
            imageUrls={images}
            index={index}
            saveToLocalByLongPress={false}
            onCancel={this.close}
            swipeDownThreshold={10}
          />

          <TouchableOpacity style={styles.button} onPress={this.close}>
            <Text style={styles.textColor}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#191919',
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },

  button: {
    borderColor: 'white',
    position: 'absolute',
    borderWidth: 1,
    borderRadius: 6,
    top: AppDimension.extraTop + 24,
    right: 30,
    width: 70,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },

  textColor: {
    color: 'white',
    fontFamily: Fonts.Medium,
  },

  textToClose: {
    bottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default connect(
  (state: any) => ({themeType: state.configs.theme}),
  null,
  null,
  {forwardRef: true},
)(ImageViewer);
