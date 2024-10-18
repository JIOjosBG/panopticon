import express from 'express'
import cors from 'cors';
import { fetchAllRssFeeds, } from './utils.js'
import { MongoClient } from 'mongodb';
import {isAddress} from 'ethers'

const MONGO_URI = 'mongodb://localhost:27017'
const client = new MongoClient(MONGO_URI);

const getClient = async ()=>{
    await client.connect()
    return client.db('panopticon');

}

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
    const {user,newsletter} = req.body
    if(!isAddress(user)) return res.status(500).json({success:false, error: "user is not a valid address"})
    if(!newsletter) return res.status(500).json({success:false, error: "No newsletter provided"})
    const db = await getClient()
    const collection = db.collection('subscriptions');
    await collection.updateOne({user}, { $addToSet: { subscriptions: newsletter }}, {upsert:true});
    return res.json({success:true})
})

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
})

// setInterval(()=>{
    // Worker()
// }, 1000**60)
