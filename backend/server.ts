import express from 'express';

import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { connectDB } from './config';

dotenv.config();

const port = process.env.PORT || 5002;

connectDB();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (req, res) => {
  res.json({ message: 'API is running ....' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port} 🚀`);
});

export default app;
