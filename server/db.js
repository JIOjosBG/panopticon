import { MongoClient } from 'mongodb';

const MONGO_URI = 'mongodb://localhost:27017'
const client = new MongoClient(MONGO_URI);
let db

export const getClient = async ()=>{
    if(!db){
        await client.connect()
        db = client.db('panopticon')
    }
    return db    
}
