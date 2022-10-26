import {GridLayoutProvider} from 'recyclerlistview-gridlayoutprovider';
import {Dimensions} from 'react-native';
const MAX_SPAN = 3;
export default class CollectibleLayoutProvider extends GridLayoutProvider {
  constructor(props) {
    super(
      MAX_SPAN,
      index => {
        return props.getDataForIndex(index).type;
      },
      index => {
        const type = props.getDataForIndex(index).type;
        switch (type) {
          case 'collection':
            return MAX_SPAN;
          case 'collection-item':
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
          case 'collection':
            return 55;
          case 'collection-item':
            return itemHeight;
          default:
            return itemHeight;
        }
      },
    );
  }
}
