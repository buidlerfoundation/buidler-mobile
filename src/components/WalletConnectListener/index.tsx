import '@walletconnect/react-native-compat';
import {actionTypes} from 'actions/actionTypes';
import {logout} from 'actions/UserActions';
import useAppDispatch from 'hook/useAppDispatch';
import '@walletconnect/react-native-compat';
import useInitialization from 'hook/useInitialization';
import {memo, useCallback, useEffect} from 'react';
import {
  universalProvider,
  universalProviderSession,
} from 'services/connectors/WalletConnect/UniversalProvider';

const WalletConnectListener = () => {
  const dispatch = useAppDispatch();
  const initialized = useInitialization();
  const onSessionDelete = useCallback(
    async ({topic}: {topic: string}) => {
      if (topic === universalProviderSession?.topic) {
        dispatch(logout());
      }
    },
    [dispatch],
  );
  const subscribeToEvents = useCallback(async () => {
    if (universalProvider) {
      universalProvider.on('display_uri', (uri: string) => {
        dispatch({type: actionTypes.UPDATE_WC_URI, payload: uri});
      });

      // Subscribe to session ping
      universalProvider.on('session_ping', ({id, topic}) => {
        console.log('session_ping', id, topic);
      });

      // Subscribe to session event
      universalProvider.on('session_event', ({event, chainId}) => {
        console.log('session_event', event, chainId);
      });

      // Subscribe to session update
      universalProvider.on('session_update', ({topic, params}) => {
        console.log('session_update', topic, params);
      });

      // Subscribe to session delete
      universalProvider.on('session_delete', onSessionDelete);
    }
  }, [dispatch, onSessionDelete]);
  useEffect(() => {
    if (initialized) {
      subscribeToEvents();
    }
  }, [initialized, subscribeToEvents]);
  return null;
};

export default memo(WalletConnectListener);
