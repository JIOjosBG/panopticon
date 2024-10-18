import { IExecWeb3mail } from '@iexec/web3mail';
import { JsonRpcProvider, Wallet, Interface } from 'ethers';

import dotenv from 'dotenv'

dotenv.config()

const iface = new Interface([
    'function createDatasetWithSchema(address,string,string,bytes,bytes32) returns (address)',
    'function registry() view returns (address)'
])

const provider = new JsonRpcProvider('https://bellecour.iex.ec');
const wallet = new Wallet(process.env.PRIVATE_KEY, provider);
const user = new Wallet(process.env.USER_PK, provider);
const web3mail = new IExecWeb3mail(wallet);
let lastChecked = new Date(new Date().getTime() - 1000 * 60 * 60 * 2);

async function main() {

    const allContent
    for(let feed of rssFeeds){
        const res = await fetchRssFeed(feed)
        console.log(res.length)
    }

}
export async function sendMail(mailObject, mailContent, protectedData, contentType, senderName) {
    const sendEmail = await web3mail.sendEmail({
        protectedData: '0x4129f2fc8fe4df4d236ae4e34192ae9d170afe37',
        emailSubject: 'New mail attempt',
        emailContent: '<h1>asd<h2>',
        contentType: 'text/html',
        // workerpoolAddressOrEns: 'prod-v8-learn.main.pools.iexec.eth',
        // senderName
    });
    console.log(sendEmail)

    return taskId;
}
main();
