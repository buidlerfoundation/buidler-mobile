import ModalBottom from 'components/ModalBottom';
import React, {createContext, useCallback, useContext, useState} from 'react';

export interface IModalContext {
  toggle: (component?: React.ReactElement) => void;
}

export const ModalContext = createContext<IModalContext>({
  toggle: () => {},
});

export function useModal(): IModalContext {
  return useContext(ModalContext);
}

interface IModalProps {
  children?: React.ReactElement;
}

const ModalProvider = ({children}: IModalProps) => {
  const [componentModal, setComponentModal] = useState<
    undefined | React.ReactElement
  >();
  const [openModal, setOpenModal] = useState(false);
  const toggle = useCallback((component?: React.ReactElement) => {
    setComponentModal(component);
    setOpenModal(current => !current);
  }, []);
  const closeModal = useCallback(() => setOpenModal(false), []);
  return (
    <ModalContext.Provider
      value={{
        toggle,
      }}>
      {children}
      {componentModal && (
        <ModalBottom
          isVisible={openModal}
          onSwipeComplete={closeModal}
          onBackdropPress={closeModal}>
          {componentModal}
        </ModalBottom>
      )}
    </ModalContext.Provider>
  );
};

export default ModalProvider;
