
import express from 'express'
import cors from 'cors';
import { config } from 'dotenv';

const app = express();
app.use(express.json());
app.use(cors()); 

config()


export default app