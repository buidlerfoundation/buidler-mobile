import {GridLayoutProvider} from 'recyclerlistview-gridlayoutprovider';
import {Dimensions} from 'react-native';
const MAX_SPAN = 8;
export default class AppGridLayoutProvider extends GridLayoutProvider {
  constructor(props) {
    super(
      MAX_SPAN,
      index => {
        return props.getDataForIndex(index).type;
      },
      index => {
        const type = props.getDataForIndex(index).type;
        switch (type) {
          case 'category':
            return MAX_SPAN;
          case 'emoji':
            return 1;
          default:
            return 1;
        }
      },
      index => {
        const type = props.getDataForIndex(index).type;
        const itemHeight = Math.floor(
          Dimensions.get('screen').width / MAX_SPAN,
        );
        switch (type) {
          case 'error':
            return 0;
          case 'category':
            return 30;
          case 'emoji':
            return itemHeight;
          default:
            return itemHeight;
        }
      },
    );
  }
}
