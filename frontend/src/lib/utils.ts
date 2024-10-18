import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

const IEXEC_CHAIN_ID = '0x86'; // 134

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function checkCurrentChain() {
  if (window !== undefined) {
    const { ethereum } = window as any;

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
}

export async function fetchRSSFeeds() {
  const result = await fetch('http://localhost:3001');
  console.log('Result', result);
}

export async function postNewsletterName(user: string, newsletterName: string) {
  try {
    const response = await fetch('http://localhost:3001/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user, newsletter: newsletterName }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error('Error posting newsletter name:', error);
    throw error;
  }
};
