import Parser from 'rss-parser';
import { getClient } from './db.js';
import { IExecWeb3mail } from '@iexec/web3mail';
import {Wallet,JsonRpcProvider} from 'ethers'
import dotenv from 'dotenv'

dotenv.config()


const parser = new Parser();
const RSS_FEEDS = [
    // 'https://feed.podbean.com/web3onfire/feed.xml',
    'https://decrypt.co/feed',
    // 'https://www.coindesk.com/arc/outboundfeeds/rss/?_gl=1*byjpx3*_up*MQ..*_ga*MTg1ODczMTQ3MC4xNzI5MjQ2MTc1*_ga_VM3STRYVN8*MTcyOTI0NjE3NC4xLjAuMTcyOTI0NjE3NC4wLjAuODQzMTk5OTI3',
    'https://cointelegraph.com/rss',
    // 'https://bitcoinmagazine.com/.rss/full/',
    // 'https://cryptoslate.com/feed/',
    // 'https://www.vitoshacademy.com/feed/'
];



export async function sendMail(emailSubject,emailContent, protectedData) {
    const provider = new JsonRpcProvider('https://bellecour.iex.ec');

    const wallet = new Wallet(process.env.PRIVATE_KEY, provider);
    
    // const user = new Wallet(process.env.USER_PK, provider);
    
    const web3mail = new IExecWeb3mail(wallet);




    return web3mail.sendEmail({
        protectedData,
        emailSubject,
        emailContent,
        contentType: 'text/html',
        // workerpoolAddressOrEns: 'prod-v8-learn.main.pools.iexec.eth',
        senderName: "Panopticon mail"
    });
}



export async function fetchAllRssFeeds() {
    const result = await Promise.all(RSS_FEEDS.map(feed=>{
        return parser.parseURL(feed);
    }))
    return Object.fromEntries(result.map(i=>([i.title,i])))
}

function getHtmlFromArticles(articles){
    const articleComponents= articles.map(article =>
        `
            <div class="article">
            <img src="${article.image}" alt="Article Image">
            <div class="article-title">
                <a href="${article.articleLink}">${article.articleTitle}</a>
            </div>
            <div class="author-name">
                by <a href="${article.newsletterLink}">${article.newsletterTitle}</a>
            </div>
            <div class="date-published">
                Published on: ${article.articlePubDate}
            </div>
            </div>
        `
    )
    
    const template = `
<!DOCTYPE html>
<html>
  <head>
    <style>
      body {
        font-family: Arial, sans-serif;
      }
      .article {
        border: 1px solid #ddd;
        margin-bottom: 20px;
        padding: 10px;
      }
      .article img {
        max-width: 100%;
        height: auto;
      }
      .article-title {
        font-size: 18px;
        font-weight: bold;
        margin: 10px 0;
      }
      .author-name, .date-published {
        font-size: 14px;
        color: #555;
      }
      .author-name a, .article-title a {
        text-decoration: none;
        color: #007bff;
      }
    </style>
  </head>
  <body>
    <h2>Latest Articles</h2>
    
    ${articleComponents.reduce((a,b)=>a+b,'')}
  </body>
</html>`
return template

}


export async function worker(){
    const allContent = await fetchAllRssFeeds().catch(console.log)
    const db = await getClient().catch(console.log)
    const subscriptionCollection = db.collection('subscriptions');
    const records = await subscriptionCollection.find({}).toArray()
    const emails = []
    for(let {subscriptions, lastUpdated, protectedData} of records){
        const articlesToSend = []
        for(let newsletterName of subscriptions){
            const newsletter = allContent[newsletterName]
            for(let article of newsletter?.items || []){
                if(new Date(article.isoDate).getTime() > new Date(lastUpdated || 0).getTime()){
                    articlesToSend.push({
                        newsletterTitle: newsletter.title, 
                        newsletterLink: newsletter.link, 
                        newsletterDescription: newsletter.description,
                        articleTitle: article.title,
                        articleLink: article.link,
                        articlePubDate:article.pubDate,
                        guid:article.guid,
                        image: article.enclosure?.url
                    })
                }
            }
        }
        if(articlesToSend.length)
            emails.push({articlesToSend,protectedData})
    }
    for(let email of emails){
        const task = await sendMail(
            `${email.articlesToSend.length} new articles for you`, 
            getHtmlFromArticles(email.articlesToSend),
            email.protectedData
        )
        console.log(task)
    }
    subscriptionCollection.updateMany({}, { $set: { lastUpdated: new Date() } }); 
}