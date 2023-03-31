import { createContext, useContext } from "react";

export interface IDrawerContext {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const DrawerContext = createContext<IDrawerContext>({
  open: false,
  onOpen: () => {},
  onClose: () => {},
});

export function useDrawer(): IDrawerContext {
  return useContext(DrawerContext);
}
