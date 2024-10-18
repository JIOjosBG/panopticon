import Parser from 'rss-parser';
const parser = new Parser();
const RSS_FEEDS = [
    // 'https://feed.podbean.com/web3onfire/feed.xml',
    'https://decrypt.co/feed',
    // 'https://www.coindesk.com/arc/outboundfeeds/rss/?_gl=1*byjpx3*_up*MQ..*_ga*MTg1ODczMTQ3MC4xNzI5MjQ2MTc1*_ga_VM3STRYVN8*MTcyOTI0NjE3NC4xLjAuMTcyOTI0NjE3NC4wLjAuODQzMTk5OTI3',
    // 'https://cointelegraph.com/rss',
    'https://bitcoinmagazine.com/.rss/full/',
    // 'https://cryptoslate.com/feed/',
    'https://www.vitoshacademy.com/feed/'
];


export async function fetchAllRssFeeds() {
    return Promise.all(RSS_FEEDS.map(feed=>{
        return parser.parseURL(feed);
    }))
}


// export async function worker(){
//     const allContent = await fetchAllRssFeeds()
//     const emailsToSendToday
// }