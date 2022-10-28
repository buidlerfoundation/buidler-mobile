import Touchable from 'components/Touchable';
import useThemeColor from 'hook/useThemeColor';
import React, {
  createContext,
  memo,
  useCallback,
  useContext,
  useState,
} from 'react';
import {View, StyleSheet, Text} from 'react-native';

type GlobalModalContext = {
  showModal: (modalType: string, modalProps?: any) => void;
  hideModal: () => void;
  store: any;
};

const initialState: GlobalModalContext = {
  showModal: () => {},
  hideModal: () => {},
  store: {},
};

const GlobalModalContext = createContext(initialState);
export const useGlobalModalContext = () => useContext(GlobalModalContext);

const ModalContainer = ({children}: any) => {
  const [store, setStore] = useState<{modalType: any; modalProps: any}>();
  const {colors} = useThemeColor();
  const showModal = useCallback((modalType: string, modalProps: any = {}) => {
    setStore({
      modalType,
      modalProps,
    });
  }, []);

  const hideModal = useCallback(() => {
    setStore({
      modalType: null,
      modalProps: {},
    });
  }, []);

  const renderModalComponent = useCallback(() => {
    if (!store?.modalType) return null;
    return (
      <Touchable
        style={[
          styles.container,
          {backgroundColor: colors.backdropWithOpacity},
        ]}
        onPress={hideModal}
        activeOpacity={1}>
        <View style={styles.bodyContainer}>
          <Text>Modal Body</Text>
        </View>
      </Touchable>
    );
  }, [colors.backdropWithOpacity, hideModal, store?.modalType]);

  return (
    <GlobalModalContext.Provider value={{store, showModal, hideModal}}>
      {children}
      {renderModalComponent()}
    </GlobalModalContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bodyContainer: {
    width: 100,
    height: 100,
    backgroundColor: 'red',
  },
});

export default memo(ModalContainer);
