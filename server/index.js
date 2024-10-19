import express from 'express'
import cors from 'cors';
import { fetchAllRssFeeds, worker} from './utils.js'
import {isAddress} from 'ethers'
import { getClient } from './db.js';
import { sendMail } from './utils.js';

const app = express();
const port = 3001;


app.use(express.json());

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.get('/', async (req, res) => {
    let feeds = await fetchAllRssFeeds()
    res.json(feeds);
})

app.post('/subscribe', async (req, res) => {
    const {user, protectedData, newsletter} = req.body
    if(!isAddress(user)) return res.status(500).json({success:false, error: "user is not a valid address"})
    if(!protectedData) return res.status(500).json({success:false, error: "No protectedData provided"})
    if(!newsletter) return res.status(500).json({success:false, error: "No newsletter provided"})
    const db = await getClient()

    // Check if collection exists, create if it doesn't
    const collections = await db.listCollections({name: 'subscriptions'}).toArray()
    if (collections.length === 0) {
        await db.createCollection('subscriptions')
    }

    const collection = db.collection('subscriptions');
    await collection.updateOne({user},{ $addToSet: { subscriptions: newsletter }, $set: { protectedData }}, {upsert:true});
    
    // Send newsletter subscription confirmation email
    try {
      const task =  await sendMail(
        'Subscription confirmation', 
        `Thank you for signing up for the ${newsletter} Newsletter. You will soon receive the newest newsletter from us`, 
        protectedData
      );
      console.log(task);
    } catch (e) {
      console.error(e);
    }

    return res.json({success:true})
})

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
})

// setInterval(()=>{
    worker()
// }, 1000*60 )
