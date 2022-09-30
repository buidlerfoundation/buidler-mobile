import {useMemo} from 'react';
import useAppSelector from './useAppSelector';

function useWalletBalance() {
  const walletBalance = useAppSelector(state => state.user.walletBalance);
  return useMemo(() => walletBalance, [walletBalance]);
}

export default useWalletBalance;
