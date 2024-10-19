import { IExecDataProtector, type ProtectDataParams } from '@iexec/dataprotector';
import { checkCurrentChain } from '@/lib/utils';

function getDataProtectorCore(ethereum: any) {
  const web3Provider = ethereum;
  // Instantiate using the umbrella module for full functionality
  const dataProtector = new IExecDataProtector(web3Provider);
  
  const dataProtectorCore = dataProtector.core;
  return dataProtectorCore;
}

const protectData = async (ethereum: any) => {
  const dataProtectorCore = getDataProtectorCore(ethereum);
  await checkCurrentChain();
  const protectedData = await dataProtectorCore.protectData({
      data: {
        email: process.env.SECRET_EMAIL || '',
      },
    });
  return protectedData;
}

const grantAccess = async (protectedData: string, ethereum: any) => {
  const dataProtectorCore = getDataProtectorCore(ethereum);
  const grantedAccess = await dataProtectorCore.grantAccess({
      protectedData,
      authorizedApp: '0x781482C39CcE25546583EaC4957Fb7Bf04C277D2',
      authorizedUser: '0xe8236e5A4456f411b3928507C0179Ca685A938Fa',
    });
  console.log('Granted Access', grantedAccess);
  return grantAccess;
}

export { protectData, grantAccess};