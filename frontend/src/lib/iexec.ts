import { IExecDataProtector, type ProtectDataParams } from '@iexec/dataprotector';
import { checkCurrentChain } from '@/lib/utils';

const { ethereum } = window as any;
const web3Provider = ethereum;
// Instantiate using the umbrella module for full functionality
const dataProtector = new IExecDataProtector(web3Provider);

const dataProtectorCore = dataProtector.core;

const protectData = async () => {
    await checkCurrentChain();
    const protectedData = await dataProtectorCore.protectData({
        data: {
          email: process.env.SECRET_EMAIL || '',
        },
      });
    console.log('protected Data', protectedData);
    return protectedData;
}

const grantAccess = async (protectedData: string) => {
    const grantedAccess = await dataProtectorCore.grantAccess({
        protectedData,
        authorizedApp: '0x781482C39CcE25546583EaC4957Fb7Bf04C277D2',
        authorizedUser: '0x5Ed02CF700D92d64776e11c6E85D2D7d11e9bcf8',
      });
    console.log('Granted Access', grantedAccess);
    return grantAccess;
}

export { protectData, grantAccess};