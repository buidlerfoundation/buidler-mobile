import {ActionCreator, Dispatch} from 'redux';
import api from 'services/api';
import {actionTypes} from './actionTypes';

export const getCollectibles: ActionCreator<any> =
  () => async (dispatch: Dispatch) => {
    dispatch({type: actionTypes.COLLECTIBLE_REQUEST});
    const res = await api.fetchNFTCollection();
    if (res.statusCode === 200) {
      dispatch({
        type: actionTypes.COLLECTIBLE_SUCCESS,
        payload: {
          data: res.data?.map(el => {
            return {
              ...el,
              nft: el.nft.map(nftItem => ({
                ...nftItem,
                nft_collection: {
                  ...nftItem.nft_collection,
                  slug: el.slug,
                  name: el.name,
                  image_url: el.image_url,
                  symbol: el.symbol,
                  contract_address: el.contract_address,
                },
              })),
            };
          }),
        },
      });
    } else {
      dispatch({
        type: actionTypes.COLLECTIBLE_FAIL,
        payload: res,
      });
    }
  };
