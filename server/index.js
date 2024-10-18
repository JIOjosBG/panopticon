import express from 'express'
import { fetchAllRssFeeds } from './utils.js'
const app = express();
const port = 3001;

app.get('/', async (req, res) => {
    let feeds = await fetchAllRssFeeds()
    res.json(feeds);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});