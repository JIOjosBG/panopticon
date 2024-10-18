import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

const { ethereum } = window as any;
const IEXEC_CHAIN_ID = '0x86'; // 134

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function checkCurrentChain() {
  const currentChainId = await ethereum.request({
    method: 'eth_chainId',
    params: [],
  });
  if (currentChainId !== IEXEC_CHAIN_ID) {
    console.log('Please switch to iExec chain');
    try {
      await ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: '0x86',
            chainName: 'iExec Sidechain',
            nativeCurrency: {
              name: 'xRLC',
              symbol: 'xRLC',
              decimals: 18,
            },
            rpcUrls: ['https://bellecour.iex.ec'],
            blockExplorerUrls: ['https://blockscout-bellecour.iex.ec'],
          },
        ],
      });
      console.log('Switched to iExec chain');
    } catch (err) {
      console.error('Failed to switch to iExec chain:', err);
      throw err;
    }
  }
}

export async function fetchRSSFeeds() {
  const result = await fetch('http://localhost:3001');
  console.log('Result', result);
}