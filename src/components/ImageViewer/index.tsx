import React, {Component} from 'react';
import {
  Modal,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import ImgViewer from '../react-native-zoom-viewer';
import {View} from 'react-native-animatable';
import {connect} from 'react-redux';
import AppDimension from 'common/AppDimension';
import Fonts from 'common/Fonts';
import {ThemeType} from 'models';
import FastImage from 'react-native-fast-image';
import ImageHelper from 'helpers/ImageHelper';
import VideoPlayer from 'components/VideoPlayer';

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
  private videoRefs: any[] = [];
  constructor(props: ImageViewerProps) {
    super(props);
    this.state = {
      images: [],
      visible: false,
      index: 0,
      currentIndex: 0,
    };
  }

  show = (images: Array<any>, index: number) => {
    this.setState({
      visible: true,
      images,
      index,
      currentIndex: index,
    });
  };

  onChange = idx => {
    this.videoRefs?.[idx]?.play?.();
    this.videoRefs?.[this.state.currentIndex]?.pause?.();
    this.setState({currentIndex: idx});
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
            onChange={this.onChange}
            renderIndicator={() => null}
            loadingRender={() => <ActivityIndicator />}
            enableSwipeDown
            imageUrls={images}
            index={index}
            saveToLocalByLongPress={false}
            onCancel={this.close}
            swipeDownThreshold={10}
            renderImage={props => {
              if (ImageHelper.isVideo(props.source.uri)) {
                return (
                  <View
                    style={{
                      width: '100%',
                      height: '100%',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <VideoPlayer
                      uri={props.source.uri}
                      style={{width: '100%', aspectRatio: 1.667}}
                      paused={false}
                      ref={ref => (this.videoRefs[index] = ref)}
                    />
                  </View>
                );
              }
              return <FastImage {...props} />;
            }}
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
